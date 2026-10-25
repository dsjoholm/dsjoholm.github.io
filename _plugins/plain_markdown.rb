# Lets posts be written in plain, standard Markdown. After a post is turned
# into HTML, this rewrites a few things into the site's Tufte-style pieces:
#
#   Photos      ![A caption](photo.jpg)
#               → a figure with the caption underneath. A bare filename is
#                 looked for in the post's own folder:
#                 assets/img/posts/<post-name>/photo.jpg
#               ![A caption](photo.jpg){: .fullwidth}  → wider than the text
#
#   Sidenotes   Some text.[^1]   …and anywhere below:   [^1]: The note.
#               → a numbered note in the margin (tap to open on phones).
#               A note that is only a photo, [^2]: ![Caption](cat.jpg),
#               → that photo in the margin, with its caption.
#
#   Epigraphs   > The quote itself.
#               >
#               > — Who said it, *Where*
#               → a quote with its attribution, styled as an epigraph.
#
# The older {% sidenote %} / {% maincolumn %} / {% epigraph %} tags still work.

module PlainMarkdown
  module_function

  # "photo.jpg" → "/assets/img/posts/<post-name>/photo.jpg"; full paths and
  # web addresses are left alone.
  def resolve_images(html, folder)
    html.gsub(/<img([^>]*?)src="([^"]+)"/) do
      attrs, src = Regexp.last_match(1), Regexp.last_match(2)
      src = "#{folder}/#{src}" unless src.include?("/") || src.start_with?("data:")
      %(<img#{attrs}src="#{src}")
    end
  end

  def alt_of(img)
    img[/alt="([^"]*)"/, 1].to_s
  end

  # A paragraph holding just one image becomes a figure with a caption
  def figures(html)
    html.gsub(%r{<p>\s*(<img[^>]*>)\s*</p>}) do
      img = Regexp.last_match(1)
      caption = alt_of(img)
      wide = img.include?("fullwidth")
      img = img.sub(/\s*class="fullwidth"/, "")
      fig = wide ? %(<figure class="fullwidth">) : "<figure>"
      %(#{fig}#{img}#{caption.empty? ? '' : "<figcaption>#{caption}</figcaption>"}</figure>)
    end
  end

  # Kramdown's footnotes → Tufte sidenotes (or margin photos)
  def sidenotes(html)
    block = html[%r{<div class="footnotes"[^>]*>.*?</div>}m]
    return html unless block

    notes = {}
    block.scan(%r{<li id="fn:([^"]+)"[^>]*>(.*?)</li>}m) do |id, body|
      body = body.gsub(%r{(?:\s| |&nbsp;|&#160;)*<a href="#fnref:[^"]+"[^>]*class="reversefootnote"[^>]*>.*?</a>}m, "")
      paragraphs = body.scan(%r{<p>(.*?)</p>}m).flatten.map(&:strip)
      paragraphs = [body.strip] if paragraphs.empty?
      notes[id] = paragraphs
    end

    html = html.sub(block, "")
    html.gsub(%r{<sup id="fnref:([^"]+)"[^>]*>\s*<a [^>]*class="footnote"[^>]*>.*?</a>\s*</sup>}m) do
      id = Regexp.last_match(1)
      paragraphs = notes[id] || []
      key = "fn-#{id.gsub(/[^a-zA-Z0-9_-]/, '')}"
      only_image = paragraphs.length == 1 && paragraphs.first =~ /\A<img[^>]*>\z/
      if only_image
        img = paragraphs.first
        caption = alt_of(img)
        %(<label for="#{key}" class="margin-toggle">&#8853;</label>) +
          %(<input type="checkbox" id="#{key}" class="margin-toggle"/>) +
          %(<span class="marginnote">#{img}#{caption.empty? ? '' : "<br>#{caption}"}</span>)
      else
        %(<label for="#{key}" class="margin-toggle sidenote-number"></label>) +
          %(<input type="checkbox" id="#{key}" class="margin-toggle"/>) +
          %(<span class="sidenote">#{paragraphs.join('<br><br>')} </span>)
      end
    end
  end

  # A quote whose last paragraph starts with a dash is an epigraph
  def epigraphs(html)
    html.gsub(%r{<blockquote>\s*(.*?)\s*</blockquote>}m) do
      original = Regexp.last_match(0)
      inner = Regexp.last_match(1)
      paragraphs = inner.scan(%r{<p>(.*?)</p>}m).flatten
      last = paragraphs.last.to_s.strip
      dash = last.match(/\A(?:—|–|&mdash;|&ndash;|--)\s*(.+)\z/m)
      next original unless dash && paragraphs.length > 1

      quote = paragraphs[0..-2].map { |p| "<p>#{p}</p>" }.join
      %(<div class="epigraph"><blockquote>#{quote}<footer>#{dash[1].strip}</footer></blockquote></div>)
    end
  end
end

Jekyll::Hooks.register :posts, :post_convert do |post|
  folder = "#{post.site.baseurl}/assets/img/posts/#{post.data['slug']}"
  html = post.content
  html = PlainMarkdown.resolve_images(html, folder)
  html = PlainMarkdown.figures(html)
  html = PlainMarkdown.sidenotes(html)
  html = PlainMarkdown.epigraphs(html)
  post.content = html
end
