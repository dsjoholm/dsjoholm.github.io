# Posts in more than one language, with a switch under the title.
#
#   ---
#   title: "My post"
#   title_fr: "Mon article"        ← optional: the title in each other language
#   ---
#   {% lang en %}
#   The English version… (Markdown as usual)
#   {% endlang %}
#
#   {% lang fr %}
#   La version française…
#   {% endlang %}
#
# Each {% lang %} section becomes <div class="lang-block" lang="xx">, and
# assets/js/languages.js shows one language at a time.

module Jekyll
  class LanguageBlock < Liquid::Block
    def initialize(tag_name, markup, tokens)
      super
      @lang = markup.strip.downcase
      raise SyntaxError, "{% lang %} needs a language code, e.g. {% lang fr %}" if @lang.empty?
    end

    # markdown="1" lets the Markdown inside the section be converted as usual
    def render(context)
      %(<div class="lang-block" lang="#{@lang}" markdown="1">\n\n#{super.strip}\n\n</div>)
    end
  end
end

Liquid::Template.register_tag("lang", Jekyll::LanguageBlock)

# Collect title_fr, title_zh, … into page.titles for the post layout
Jekyll::Hooks.register :posts, :pre_render do |post|
  titles = post.data.select { |key, _| key.start_with?("title_") }
                    .map { |key, value| [key.delete_prefix("title_"), value] }
  post.data["titles"] = titles.to_h unless titles.empty?
end
