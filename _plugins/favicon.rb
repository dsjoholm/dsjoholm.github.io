# Draws the site's pixel-cat favicon in the colors of the current scheme
# (color_scheme in _config.yml, colors in _data/themes.yml), so the icon
# always matches the site, even for schemes added later.
#
# Writes these files into the built site:
#   /favicon.svg           sharp at any size (most browsers)
#   /favicon-32.png        for browsers that don't use SVG icons
#   /apple-touch-icon.png  180×180, for "Add to Home Screen" on phones
#   /cursor-arrow.svg      pixel mouse pointer
#   /cursor-hand.svg       pixel pointing hand, for links and buttons
#   /schemes/<name>/...    the SVGs above for every scheme (footer color picker)

require "zlib"
require "fileutils"

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

  # Mouse pointers: "o" = outline (background color), "w" = fill (text color)
  ARROW = [
    "o...........",
    "oo..........",
    "owo.........",
    "owwo........",
    "owwwo.......",
    "owwwwo......",
    "owwwwwo.....",
    "owwwwwwo....",
    "owwwwwwwo...",
    "owwwwwwwwo..",
    "owwwwwwwwwo.",
    "owwwwwwoooo.",
    "owwwowwo....",
    "owwoowwo....",
    "owo..owwo...",
    "oo...owwo...",
    "o.....owwo..",
    "......owwo..",
    ".......oo...",
  ].freeze

  HAND = [
    ".....oo.........",
    "....owwo........",
    "....owwo........",
    "....owwo........",
    "....owwooo......",
    "....owwowwooo...",
    "....owwowwowwoo.",
    ".oo.owwowwowwowo",
    "owwoowwwwwwwwowo",
    "owwwowwwwwwwwwwo",
    ".owwowwwwwwwwwwo",
    "..owwwwwwwwwwwwo",
    "..owwwwwwwwwwwo.",
    "...owwwwwwwwwwo.",
    "...owwwwwwwwwo..",
    "....owwwwwwwwo..",
    "....owwwwwwwwo..",
    "....oooooooooo..",
  ].freeze

  module_function

  # An SVG drawn from one of the pixel grids above, 1 CSS pixel per cell
  def pointer_svg(grid, outline, fill)
    paths = { "o" => [], "w" => [] }
    grid.each_with_index do |line, y|
      line.each_char.with_index { |c, x| paths[c] << "M#{x} #{y}h1v1h-1z" if paths[c] }
    end
    w = grid.first.length
    h = grid.length
    <<~SVG
      <svg xmlns="http://www.w3.org/2000/svg" width="#{w}" height="#{h}" viewBox="0 0 #{w} #{h}" shape-rendering="crispEdges">
      <path fill="#{outline}" d="#{paths['o'].join}"/>
      <path fill="#{fill}" d="#{paths['w'].join}"/>
      </svg>
    SVG
  end

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
  File.write(File.join(site.dest, "cursor-arrow.svg"), PixelCatFavicon.pointer_svg(PixelCatFavicon::ARROW, bg, fg))
  File.write(File.join(site.dest, "cursor-hand.svg"), PixelCatFavicon.pointer_svg(PixelCatFavicon::HAND, bg, fg))

  # The same icon and pointers for every scheme, for the color picker in the
  # footer: /schemes/<name>/favicon.svg, cursor-arrow.svg, cursor-hand.svg
  themes.each do |name, scheme|
    dir = File.join(site.dest, "schemes", name)
    FileUtils.mkdir_p(dir)
    File.write(File.join(dir, "favicon.svg"), PixelCatFavicon.svg(scheme["bg"], scheme["fg"]))
    File.write(File.join(dir, "cursor-arrow.svg"), PixelCatFavicon.pointer_svg(PixelCatFavicon::ARROW, scheme["bg"], scheme["fg"]))
    File.write(File.join(dir, "cursor-hand.svg"), PixelCatFavicon.pointer_svg(PixelCatFavicon::HAND, scheme["bg"], scheme["fg"]))
  end
end
