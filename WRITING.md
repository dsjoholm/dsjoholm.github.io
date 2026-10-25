# Writing a post

A quick reference. Copy `_drafts/post-template.md` to start.

## 1. Make the files

- **The post:** `_posts/2026-11-02-my-post.md`
  (date, then a short name with dashes; the short name becomes the address:
  `/articles/26/my-post`)
- **Its photos:** put them in `assets/img/posts/my-post/`
  (the folder has the same short name as the post)

Photos straight from your phone are fine; the site shrinks them when it
publishes. Use JPEG or PNG (on iPhone: Settings → Camera → Formats →
"Most Compatible", or export as JPEG). HEIC photos won't show in most browsers.

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

## 4. Publish

```
git add -A
git commit -m "Add my post"
git push
```

Preview first with `bundle exec jekyll serve` and http://localhost:4000.

The older tags (`{% sidenote %}`, `{% maincolumn %}`, `{% epigraph %}`,
`{% newthought %}`) still work in older posts.
