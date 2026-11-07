# {{ page.content | summary: 160 }} → the start of a post's own words, as
# plain text, for the description search engines and link previews show.
# Headings, epigraphs and other quotes, photos and sidenotes are skipped,
# so a post that opens with a quote is described by its first real sentences.

require "cgi"

module SummaryFilter
  def summary(html, length = 160)
    text = html.to_s
      .gsub(%r{<(blockquote|figure|figcaption|script|style|label|h[1-6])\b.*?</\1>}m, " ")
      .gsub(%r{<span class="(sidenote|marginnote)".*?</span>}m, " ")
      .gsub(%r{<sup\b.*?</sup>}m, " ")
      .gsub(/<[^>]+>/, " ")
      .gsub(/\s+/, " ").gsub(/ ([,.;:!?)])/, "\\1").strip
    text = CGI.unescapeHTML(text)
    return text if text.length <= length
    text[0, length].sub(/\s+\S*\z/, "") + "…"
  end
end

Liquid::Template.register_filter(SummaryFilter)
