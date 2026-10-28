# Updating the site: the exact commands

Open the **Terminal** app (Cmd+Space, type "Terminal", press Enter).
Type each command, then press Enter.

---

## Before you change anything

**1. Go to the site folder**

    cd ~/personal-website

**2. Get the latest version** (in case anything was changed on GitHub's website)

    git pull

---

## Starting a new post? One command does the setup

    newpost "My trip to Lyon"

(`newpost` works from any folder. If it says "command not found", open a
new Terminal window, or use `bin/new-post` from the site folder instead.)

This creates the post (dated today, title filled in) **and** its photo folder,
then opens the folder in Finder so you can drag your photos in, and opens the
post in your text editor. In the post, use photos by file name:
`![A caption](photo.jpg)`. (For a title in Chinese, add a short name:
`newpost "台北之旅" taipei-trip`.)

## Make your change

Open the file in any text editor, edit it, and save. For example:

| To… | Open this file |
|---|---|
| Add a film or other list item | `_lists/films.md` (or another file in `_lists/`) |
| Add or finish a book | `_data/books.yml` |
| Write a post | `newpost "Title"` (see above and `WRITING.md`) |
| Change the CV | `_data/cv.yml` |

**Example: adding a film you just watched.** In `_lists/films.md`, move or add
a line under `## Recently watched`:

    - Drive (2011)

and, if you like, change `updated:` at the top to today's date.

---

## (Optional) Look at it before it goes live

    bundle exec jekyll serve

Then open http://localhost:4000 in your browser.
When you're done looking, go back to Terminal and press **Ctrl+C**.

---

## After your change: publish it

**3. Select all your changes**

    git add -A

**4. Save them with a short note** (write anything between the quotes)

    git commit -m "Add Drive to films"

**5. Send them to GitHub, which publishes the site**

    git push

The site updates in 1–3 minutes. Refresh it to check.

---

## If something goes wrong

- **`git push` says "rejected" or "fetch first"** → something changed on
  GitHub first. Run this, then `git push` again:

      git pull --rebase

- **Not sure what you've changed?**

      git status

- **The site didn't update** → on github.com, open the repository and click
  the **Actions** tab. A red ✗ usually means a typo (most often wrong
  indentation in a `.yml` file). The live site stays as it was until it's fixed.
