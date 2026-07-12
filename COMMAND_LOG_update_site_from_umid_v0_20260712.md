# MILD website update from UMID v0 command log

Timestamp: 2026-07-12, Asia/Shanghai
Member: nova
Working directory: `/home/zjj` unless stated otherwise

## Scope

Update the MILD website at `/media/zjj/Elements/CQU_ZJJ/MILD` using the currently
collected UMID dataset under `/media/zjj/Elements/CQU_ZJJ/UMID/data/v0`.

Safety boundary: no robot control, no collection, no Docker replay, no batch
rosbag conversion, and no critical UMID pipeline writes.

## Commands

### 1. Team preflight and delivery-rule reads

```bash
/home/zjj/.cache/agibot/live_shared_memory/team_deep_preflight.sh nova
sed -n '1,220p' /home/zjj/.cache/agibot/live_shared_memory/CODE_DELIVERY_RULES.md
sed -n '1,220p' /home/zjj/.cache/agibot/live_shared_memory/COMMAND_LOG_RULES.md
```

Status: success. The preflight output was long and truncated in the terminal,
but completed successfully. Code-delivery and command-log rules were read before
website edits.

### 2. Repository and dataset inspection

```bash
pwd
git status --short
rg --files -g '!node_modules' -g '!dist' -g '!build'
find /media/zjj/Elements/CQU_ZJJ/UMID/data/v0 -maxdepth 4 -type d | sed 's#/media/zjj/Elements/CQU_ZJJ/UMID/data/v0/##' | sort | sed -n '1,220p'
sed -n '1,260p' index.html
sed -n '1,340p' static/js/site.js
sed -n '1,360p' static/css/site.css
find /media/zjj/Elements/CQU_ZJJ/UMID/data/v0 -maxdepth 6 -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' \) | sort | sed -n '1,220p'
sed -n '260,620p' index.html
sed -n '340,760p' static/css/site.css
sed -n '760,1040p' static/css/site.css
sed -n '1,220p' README.md
sed -n '1,260p' COMMAND_LOG_mild_site.md
git branch --show-current
git log -1 --oneline
```

Status: success.

Key evidence:

- Repository root: `/media/zjj/Elements/CQU_ZJJ/MILD`.
- Current branch: `main`.
- Base commit before this update: `6b49400 update`.
- Site is static HTML/CSS/JS: `index.html`, `static/js/site.js`,
  `static/css/site.css`.
- The website already used generated/illustrative task images.
- The UMID v0 folder contains real task-scene directories plus large Insight9
  frame dumps; raw images were not copied into the website repository.

### 3. Current v0 sequence inventory scan

```bash
python3 - <<'PY'
from pathlib import Path
from collections import Counter, defaultdict
import json
base = Path('/media/zjj/Elements/CQU_ZJJ/UMID/data/v0')
tasks = [p for p in sorted(base.iterdir()) if p.is_dir() and not p.name.startswith('.')]
rows=[]
variant_counts=Counter()
sensor_counts=Counter()
converted=0
x5_total=0
for task in tasks:
    variant_dirs=[]
    for p in task.rglob('instan360x5'):
        if p.is_dir():
            x5_total += 1
            rel = p.parent.relative_to(task).as_posix()
            variant_dirs.append(rel)
            if list(p.glob('*_x5_camera_imu_tum_aligned.bag')) and list(p.glob('*_x5_camera_imu_tum_aligned_summary.txt')) and list(p.glob('*_robot_gt_camera_aligned.tum')):
                converted += 1
    for p in task.rglob('insight9'):
        if p.is_dir() and (p / 'insight9').is_dir() or p.is_dir() and p.name == 'insight9':
            pass
    top_variants=[]
    if (task/'orin').is_dir(): top_variants.append('orin')
    if (task/'tablecloth').is_dir(): top_variants.append('tablecloth')
    for t in ['aruco','apriltag']:
        root=task/t
        if root.is_dir():
            leaves=[]
            for d in root.rglob('*'):
                if d.is_dir() and (d/'instan360x5').is_dir():
                    leaves.append(str(d.relative_to(root)))
            if leaves:
                top_variants.append(f'{t}: ' + ', '.join(sorted(leaves)))
    has_i9 = any(p.is_dir() for p in task.rglob('insight9'))
    has_pico = any(p.is_dir() for p in task.rglob('pico_left_controller'))
    sensors=['X5'] if variant_dirs else []
    if has_i9: sensors.append('Insight9')
    if has_pico: sensors.append('PICO')
    for s in sensors: sensor_counts[s]+=1
    rows.append((task.name, len(set(variant_dirs)), ', '.join(top_variants), ', '.join(sensors)))
for name, n, variants, sensors in rows:
    print(f'{name}\tvariants={n}\tsensors={sensors}\t{variants}')
print('SUMMARY')
print('tasks', len(rows))
print('x5_sequences', x5_total)
print('converted_bags', converted)
print('pending_bags', x5_total-converted)
print('tasks_with_insight9', sensor_counts['Insight9'])
print('tasks_with_pico', sensor_counts['PICO'])
PY
```

Status: success.

Key result used for the public page:

```text
15 selected scene folders
67 X5 sequence bundles
15 aligned rosbag bundles
52 pending X5 conversions
8 tablecloth scenes among the selected scene folders
```

Auxiliary folders such as `pic`, `pico`, `pico_long_tests`,
`pico_smoke_tests`, and `pico_sync_tests` were not treated as v0 website scene
entries.

### 4. Website edits

Tool: `apply_patch`

Status: success.

Changed files:

- `index.html`
  - Added `v0 Snapshot` navigation and section.
  - Updated overview metrics from planned placeholders to current v0 counts.
  - Clarified that current collected scenes and benchmark task taxonomy are
    separate layers.
  - Updated sequence-variant text to match current `orin`, `aruco`,
    `apriltag/custom48h12`, and `tablecloth` organization.
- `static/js/site.js`
  - Added `collectedScenes` data for 15 selected scene folders.
  - Added `renderCollectedInventory()` to render the scene inventory table.
  - Changed task-card generated download panel label from `v0.1 release` to
    `release plan`.
- `static/css/site.css`
  - Added responsive styling for v0 snapshot cards, inventory table, sensor
    chips, and status badges.
- `README.md`
  - Documented the current website content and clarified that large raw data,
    rosbag files, frame dumps, and calibration artifacts are not stored in this
    website repository.

### 5. Validation

```bash
node --check static/js/site.js
python3 - <<'PY'
from html.parser import HTMLParser
from pathlib import Path
p=HTMLParser()
p.feed(Path('index.html').read_text(encoding='utf-8'))
print('html_parse_ok')
PY
rg -n "/home/|/media/|/mnt/|Elements|新加卷" index.html static README.md
git diff --check
git diff --stat
git status --short
rg -n "v0 Snapshot|Collected Scene Inventory|Benchmark task taxonomy|const collectedScenes|renderCollectedInventory|snapshot-grid|Current website content" index.html static/js/site.js static/css/site.css README.md
```

Status: success.

Validation results:

- `node --check static/js/site.js`: success, no syntax output.
- HTML parser check: `html_parse_ok`.
- Public-entry absolute path scan on `index.html static README.md`: no matches
  for `/home`, `/media`, `/mnt`, `Elements`, or `新加卷`.
- `git diff --check`: success, no whitespace errors.
- `git diff --stat`: `README.md`, `index.html`, `static/css/site.css`, and
  `static/js/site.js` changed.
- `git status --short`: four modified public files plus this new command log.

