# Asset and data maintenance

## Current page assets

| Page element | Current source | How it is rendered |
| --- | --- | --- |
| Hero | `static/images/teaser.jpg` | Static image |
| Task overview | `static/images/fig2_task_overview.png` | Static image |
| Method pipeline | Inline SVG in `index.html` | Named layers animated by `buildArch` in `static/js/figs.js` |
| Swing results | `data/figures.json` → `fig3` | `buildSwing` |
| Twirl results | `data/figures.json` → `fig4` | `buildTwirl` |
| Whip results | `static/images/fig5_rope_whip.png` | Static image |
| Real-robot results | `data/figures.json` → `fig6` | `buildRobot` |
| Real-robot executions | `static/images/real_robot_frames.jpg` | Static image |
| Physical ropes | `static/images/Rope_showcase.png` | Static image |
| Simulation clips | `static/videos/sim_task1.mp4` through `sim_task3.mp4` | Video with matching `_poster.jpg` images |

`static/images/pipeline.svg` is retained as an architecture source/reference
export. The actual animation uses the inline SVG, which may include later
adjustments. Do not assume that replacing the standalone export updates the page.

`static/images/archive/` contains the former static pipeline, Swing, Twirl and
real-robot result PNGs. They are not loaded by the current page. Keep them as
historical reference/fallback assets; they are not automatically updated when
the animated figures change.

## Provenance and scope

This cleanup preserves the published chart values exactly. It reorganizes
existing website data; it does not recompute or independently validate the
underlying experiments.

- `fig3` and `fig4` were imported into the website in `c2681f8`. During cleanup,
  both objects were confirmed equal to the existing website preparation
  snapshots `fig3-source-data.json` and `fig4-source-data.json`.
- The Swing renderer follows `ropeformer-figures/src/ropefig/results.py::swing`,
  which reads `data/fig3/source-data.json`. The Twirl renderer follows the
  corresponding `twirl` recipe. `fig4` also retains its original source path,
  SHA-256 and metric description inside the JSON.
- `fig6` was added by website commit `282e66e`. The real-robot renderer and data
  are preserved from that commit. That commit records a port from the plotting
  repository; the upstream raw-data revision is not pinned in this website.
  Confirm and record it before replacing the hardware measurements.
- `fig3` retains additional historical `twirl` and `whip` fields from the imported
  source snapshot. The active Swing chart reads its `swing` and `success` fields;
  the active Twirl chart reads `fig4`. Do not confuse the older fields with the
  displayed results.
- The current simulation clips entered the website in `fd69301`, whose recorded
  media source is `ropeformer-media` web-clips-v2 at `f8c6f28`. Recorded examples:
  Swing stiffness 2.1/21.1; Twirl acquisition 3.57/2.37 s; Whip deviations
  7.8/4.9/3.8/3.1/2.9 cm. These are selected video examples, not aggregate data.
  Verify the media repository's provenance/selection files when replacing clips;
  older MEDIA_NOTES documents describe different videos and numbers.

## Updating a figure or video

1. Obtain the approved asset or data and its source commit, units, metric,
   trial protocol and selection rule. Record that provenance here.
2. For animated result charts, update `data/figures.json` and run
   `python3 scripts/generate_figdata.py`. Preserve full numeric precision.
3. Update the relevant caption and prose if their values or encodings change.
   Do not infer aggregate claims from an individual replay.
4. If replacing the method SVG, preserve all named IDs used by `buildArch`,
   update the inline version, and keep its reference export in sync.
5. Update browser cache versions for changed JS, CSS or videos, then run the
   checks in the README and inspect the affected desktop/mobile sections.
