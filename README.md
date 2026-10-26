# dsjoholm.github.io

Daniel Sjoholm's personal website, built with [Jekyll](https://jekyllrb.com)
and published by GitHub Pages whenever `master` is pushed. It started from the
[Tufte-Jekyll](https://github.com/clayh53/tufte-jekyll) theme.

## Where things are

| To change | Edit |
|---|---|
| A post | `_posts/` (photos in `assets/img/posts/<post-name>/`) — see `WRITING.md` |
| Step-by-step commands | `UPDATING.md` |
| The bookshelf | `_data/books.yml` (no `finished:` date = reading now) |
| The CV | `_data/cv.yml` |
| A list | `_lists/` (one Markdown file per list) |
| The home page text | `index.html` |
| Site colors | `color_scheme:` in `_config.yml` (options in `_data/themes.yml`, preview at `/colors/`) |
| Name, email, location | `_config.yml` |
| Navigation links | `_data/navigation.yml` |

## Preview and publish

```
bundle exec jekyll serve      # preview at http://localhost:4000
git add -A && git commit -m "…" && git push
```
