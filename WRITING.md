# Writing a post

A quick reference. Copy `_drafts/post-template.md` to start.

## 1. Make the files

In Terminal (from any folder), run:

    newpost "My post"

That creates both:

- **The post:** `_posts/<today>-my-post.md`, from the template, with the
  title and date filled in. The short name (`my-post`) becomes the address:
  `/articles/26/my-post`
- **Its photo folder:** `assets/img/posts/my-post/`, opened in Finder so you
  can drag photos in.

For a title without Latin letters, add a short name:
`newpost "台北之旅" taipei-trip`.

Photos straight from your phone are fine; the site shrinks them when it
publishes. Use JPEG or PNG (on iPhone: Settings → Camera → Formats →
"Most Compatible", or export as JPEG). HEIC photos won't show in most browsers.

**Photos from other websites** can be used by their address,
`![The caption](https://somewhere.com/picture.jpg)`. When you commit, each one
is downloaded into the post's photo folder automatically and the line is
switched to the saved copy, so it keeps working even if the other site
removes it. (Where each came from is noted in the folder's `sources.txt`.)
Credit the source in the caption. Right-click → "Open Image in New Tab"
first, to make sure you're using the full-size picture, not a small preview.

## 2. The top of the post

```
---
layout: post
title: "My post"
date: 2026-11-02
tags:
  - travel
---
```

Tags `book-review`, `travel` and `urban-planning` count toward the footer
stats. Any tag becomes a filter button on the posts page.

## 3. Writing

| You want | Write |
|---|---|
| A new paragraph | leave an empty line |
| *Italics* / **bold** | `*italics*` / `**bold**` |
| A link | `[the words](https://example.com)` |
| A section heading (a station on the reading line) | `## Heading` |
| A photo with a caption | `![The caption](photo.jpg)` on its own line |
| A wide photo | `![The caption](photo.jpg){: .fullwidth}` |
| A sidenote | `text.[^1]` and anywhere below: `[^1]: The note.` |
| A photo in the margin | `text.[^cat]` and below: `[^cat]: ![Caption](cat.jpg)` |
| An epigraph | see below |
| A quote | `> The quoted text` |
| A list | lines starting with `- ` (or `1. `) |

**Sidenote names** can be numbers or words (`[^1]`, `[^cat]`); they just have to
match. The site numbers them 1, 2, 3 in order, and they can contain links,
*italics*, or a photo.

**Epigraph** (a quote with who said it, usually at the top):

```
> The market can remain irrational longer than you can remain solvent.
>
> — John Maynard Keynes
```

The last line starting with a dash (—, – or --) is what makes it an epigraph.
Without it, it's an ordinary quote.

**A map of places.** List the places at the top of the post, next to `title:`:

```
map:
  - name: 23 rue Bezout
    coords: [48.828864, 2.330995]
    text: A short note, shown when the place is tapped
    main: true
  - name: 17 rue du Renard
    coords: [48.858657, 2.351925]
```

then put this line where the map should go (with an empty line above and below):

```
{% include map.html %}
```

- **Coordinates:** in Google Maps, right-click the place (long-press on a
  phone) and click the numbers at the top of the menu. That copies them;
  paste them between the `[ ]`.
- `text:` and `main: true` (a bigger square) are optional.
- For a caption: `{% include map.html caption="Where they all are" %}`.
- The map takes the site's colors. On phones, one finger scrolls the page and
  two fingers move the map.

## 3b. A post in more than one language

Put each language in its own section; a switch like `[english] [français]`
appears under the title by itself:

```
{% lang en %}
The whole post in English…[^en1]

[^en1]: An English sidenote.
{% endlang %}

{% lang fr %}
Tout l'article en français…[^fr1]

[^fr1]: Une note en français.
{% endlang %}
```

- Titles in other languages go at the top: `title_fr: "Le titre"`, `title_zh: "标题"`.
- Give sidenotes different names per language (`[^en1]`, `[^fr1]`).
- Visitors get their browser's language if the post has it; their choice is
  remembered. Link to one language with `?lang=fr` at the end of the address.
- The template (`_drafts/post-template.md`) has these notes too.

## 4. Publish

```
git add -A
git commit -m "Add my post"
git push
```

Preview first with `bundle exec jekyll serve` and http://localhost:4000.

The older tags (`{% sidenote %}`, `{% maincolumn %}`, `{% epigraph %}`,
`{% newthought %}`) still work in older posts.
