---
layout: post
title: "Title of the post"
date: 2026-11-02
tags:
  - travel
---
{% comment %}{% raw %}
  ───────────────────────────────────────────────────────────────────────
  Everything between "comment" and "endcomment" is notes for you: it never
  shows on the site. Delete it once you're used to the format.

  WRITING IN MORE THAN ONE LANGUAGE
  Put each language in its own section, and a switch like
  [english] [français] [中文] appears under the title by itself:

      {% lang en %}
      The whole post in English…
      {% endlang %}

      {% lang fr %}
      Tout l'article en français…
      {% endlang %}

  - Language codes: en, fr, zh (Chinese), es, de, ja, …
  - The title in other languages goes at the top, next to `title:`:
        title_fr: "Le titre en français"
        title_zh: "中文标题"
  - Everything works inside a section: photos, ## headings, epigraphs.
  - Sidenotes need different names in each language, e.g. [^en1] in the
    English section and [^fr1] in the French one. They're numbered 1, 2, 3
    separately for each language.
  - Visitors see their browser's language if the post has it (otherwise
    the first section), and their choice is remembered. To share one
    language, add ?lang=fr to the post's address.
  - A post with no {% lang %} sections works as before, with no switch.
  ───────────────────────────────────────────────────────────────────────
{% endraw %}{% endcomment %}
> An optional opening quote.
>
> — Who said it

First paragraph. Here's a [link](https://example.com) and a sidenote.[^1]

![A caption for the photo](photo.jpg)

![Another photo, from another website](https://example.com/photo.jpg)

## A section heading

More writing, with a photo in the margin.[^cat]

[^1]: The sidenote's text.
[^cat]: ![A caption for the margin photo](cat.jpg)
