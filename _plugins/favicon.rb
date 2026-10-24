# Draws the site's pixel-cat favicon in the colors of the current scheme
# (color_scheme in _config.yml, colors in _data/themes.yml), so the icon
# always matches the site, even for schemes added later.
#
# Writes three files into the built site:
#   /favicon.svg           sharp at any size (most browsers)
#   /favicon-32.png        for browsers that don't use SVG icons
#   /apple-touch-icon.png  180×180, for "Add to Home Screen" on phones

require "zlib"

module PixelCatFavicon
  # The cat, one character per pixel ("#" = cat, "." = background)
  CAT = [
    "................",
    "...#........#...",
    "...##......##...",
    "...###....###...",
    "...##########...",
    "..############..",
    "..##..####..##..",
    "..##..####..##..",
    "..############..",
    "..######.#####..",
    "..############..",
    "...##########...",
    "....########....",
    "................",
  ].freeze

  module_function

  def rgb(hex)
    hex.to_s.delete("#").scan(/../).map { |c| c.to_i(16) }
  end

  # Is pixel (x, y) of a size×size icon part of the cat? The 16×14 drawing
  # is scaled up by whole pixels and centered, so it always stays crisp.
  def cat_pixel?(x, y, size)
    scale = size / 16
    left = (size - 16 * scale) / 2
    top = (size - CAT.length * scale) / 2
    col = (x - left).div(scale)
    row = (y - top).div(scale)
    row.between?(0, CAT.length - 1) && col.between?(0, 15) && CAT[row][col] == "#"
  end

  # One single shape (rather than a square per pixel), so no faint seams
  # appear between pixels when the icon is shown large
  def svg(bg, fg)
    squares = []
    CAT.each_with_index do |line, y|
      line.each_char.with_index { |c, x| squares << "M#{x} #{y + 1}h1v1h-1z" if c == "#" }
    end
    <<~SVG
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">
      <rect width="16" height="16" fill="#{bg}"/>
      <path fill="#{fg}" d="#{squares.join}"/>
      </svg>
    SVG
  end

  # A minimal PNG writer (no extra gems needed)
  def png(size, bg, fg)
    bg_px = rgb(bg).pack("C3")
    fg_px = rgb(fg).pack("C3")
    raw = (0...size).map do |y|
      "\x00".b + (0...size).map { |x| cat_pixel?(x, y, size) ? fg_px : bg_px }.join
    end.join

    chunk = lambda do |type, data|
      [data.bytesize].pack("N") + type + data + [Zlib.crc32(type + data)].pack("N")
    end

    "\x89PNG\r\n\x1a\n".b +
      chunk.call("IHDR", [size, size, 8, 2, 0, 0, 0].pack("NNCCCCC")) +
      chunk.call("IDAT", Zlib::Deflate.deflate(raw)) +
      chunk.call("IEND", "")
  end
end

Jekyll::Hooks.register :site, :post_write do |site|
  themes = site.data["themes"] || {}
  colors = themes[site.config["color_scheme"].to_s] || themes["navy"]
  next unless colors

  bg = colors["bg"]
  fg = colors["fg"]

  File.write(File.join(site.dest, "favicon.svg"), PixelCatFavicon.svg(bg, fg))
  File.binwrite(File.join(site.dest, "favicon-32.png"), PixelCatFavicon.png(32, bg, fg))
  File.binwrite(File.join(site.dest, "apple-touch-icon.png"), PixelCatFavicon.png(180, bg, fg))
end
