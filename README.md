# https://zjj587.github.io/MILD/

MILD: A Manipulation Interface Localization Dataset for UMI-Style Robot Teaching

This repository hosts the static GitHub Pages website for the MILD benchmark.

## Current website content

- Static HTML/CSS/JS only; no build step is required.
- The overview and `v0 Snapshot` section summarize the current pre-release
  collected data inventory: 15 scene folders, 67 convertible Insta360 X5
  sequence bundles, 15 aligned rosbag bundles, and 52 pending X5 conversions.
- The task explorer remains the benchmark taxonomy and is intentionally kept
  separate from the current scene-folder inventory.
- Large raw data, rosbag files, frame dumps, and calibration artifacts are not
  stored in this website repository. They should be published as GitHub Release
  assets or external dataset downloads with a manifest.

## Local preview

Open `index.html` directly in a browser, or serve the repository root with any
static file server:

```bash
python3 -m http.server 8000
```

## Content to replace before release

- Replace `static/images/hero-mild-concept.png` with an approved project image if
  a real dataset photo is available.
- Replace the illustrative task images under `static/images/tasks/` with the
  corresponding real task photos when available.
- Upload the planned calibration release assets for Insta360 X5 and Insight9,
  including intrinsics, extrinsics, and manifest files.
- Add public sequence manifests for each collected scene folder, including
  original data, ArUco layouts, AprilTag Custom48h12 layouts, marker count,
  appearance variant, sensor availability, and sequence identifiers.
- Keep task-level release assets aligned with the broader benchmark taxonomy
  only after the scene-level v0 manifest is finalized.
- Update citation metadata after the paper and release URL are finalized.
