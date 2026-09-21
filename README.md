# RopeFormer project website

Public project page: https://ropeformer.github.io/

A static GitHub Pages site using HTML, CSS and browser JavaScript. There is no
package installation or application build step.

## Local preview

From this repository:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/`. Refresh after editing a file. Stop the server with
Ctrl+C when finished.

## Where to edit

| File | Responsibility |
| --- | --- |
| `index.html` | Page content, section order and inline architecture SVG |
| `static/css/style.css` | Shared styles, section layouts and grouped responsive rules |
| `static/js/main.js` | Hero transitions, navigation, section reveals and video playback |
| `static/js/figs.js` | Architecture animation and SVG result-chart renderers |
| `data/figures.json` | Reviewable source snapshot for the three animated result charts |
| `static/js/figdata.js` | Generated browser bundle; do not edit directly |
| `static/images/` / `static/videos/` | Current page media |
| `static/images/archive/` | Unused historical PNGs retained as reference/fallback assets |
| `docs/ASSETS.md` | Asset mapping, recorded provenance and update procedure |
| `docs/PUBLISHING_TODO.md` | Unavailable resources and the steps to enable them |

Keep the three simulation `.task` blocks as siblings. In desktop figure/text
rows, captions count toward the left column's total height. Keep both columns'
top and bottom edges aligned. Mobile layouts stack naturally.

The inline architecture SVG has named layers referenced by `figs.js`. Preserve
those IDs when updating the figure. Do not replace the SVG with an `<img>` if
its animation is to remain active.

## Update chart data

Edit `data/figures.json` only from verified source results, then regenerate:

```sh
python3 scripts/generate_figdata.py
```

Commit the JSON source and generated JavaScript together. Figure numbers in the
data keys are historical website identifiers; see `docs/ASSETS.md` for mappings.

## Check before publishing

```sh
python3 scripts/check_site.py
node --check static/js/main.js
node --check static/js/figs.js
node --check static/js/figdata.js
git diff --check
```

The Python checker uses only the standard library and verifies balanced HTML,
sibling task sections, duplicate IDs, local asset paths, section links and the
chart bundle. Node is needed only for the optional JavaScript syntax checks.

Browser checks are also required for layout/interaction changes:

- Open `/` and enter/leave the hero normally.
- Open `/#method`, `/#sim` and `/#real` directly; hero text must not overlay them.
- Try an unknown or malformed fragment; the page should remain usable.
- Check desktop and mobile widths, figure/text alignment and all animations.
- Check the browser console for script errors.

## Publish

GitHub Pages publishes `main` from this repository. Work on a focused branch,
review the diff, run the checks, then push the approved change to `main` without
force-pushing. Wait for the **pages build and deployment** workflow to succeed.

When CSS or JavaScript changes, increment that asset's `?v=` in `index.html` to
refresh cached resources. Also refresh the browser after deployment; a cached
HTML response can still reference the previous asset version.

Keep credentials out of source files, remote URLs and commands saved in shell
history. Use the operating system's credential manager (macOS Keychain on the
maintainer's machine). The clean remote is:

`https://github.com/RopeFormer/ropeformer.github.io.git`
