# MILD Rosbag Conversion Command Log

## 1. Convert valid Insight9 sequences to lightweight synchronized rosbags

Date: 2026-07-17T00:22:46+08:00

Operator/session:

- Team member: `nova`
- Rule 16 visual permission: `NO_VIEW_IMAGE`
- User request: start Insight9 rosbag conversion using only
  `gray_left + gray_right + imu/vio/robot`.

Scope:

- Source manifest:
  `/media/zjj/Elements/CQU_ZJJ/MILD_video_previews/v0_sync_combined/insight9_rosbag_sync_manifest.json`
- Conversion script:
  `/media/zjj/Elements/CQU_ZJJ/insight9/tool/insight9_sync_rosbag/prepare_insight9_replay_bag.py`
- Output bags: each valid Insight9 run directory under
  `/media/zjj/Elements/CQU_ZJJ/UMID/data/v0/**/insight9/insight9/`
- Batch manifest:
  `/media/zjj/Elements/CQU_ZJJ/MILD_rosbags/insight9_gray_lr_imu_vio_robot_conversion_manifest.json`
- Runtime log:
  `/tmp/mild_insight9_gray_lr_rosbag_conversion.log`

Preflight:

```text
external disk free before conversion: 136891813888 bytes, about 127.49 GiB
valid Insight9 sequences: 19
invalid Insight9 sequences skipped:
  box02__table__insight9
  box02__aruco_4__insight9
ros imports: ok
all 19 run/TUM/replay JSON paths existed
all 19 target bag paths did not exist before conversion
```

Script fixes applied before conversion:

- Skip image/IMU/VIO CSV rows missing `host_unix_ns` or `device_timestamp`.
  Dry-run had failed on `analemma_2_t__aruco_4` because one IMU row had an
  empty `device_timestamp`.
- Make generated summary `topics:` lines reflect the selected stream set rather
  than always listing rgb/depth topics.

Conversion configuration:

```text
streams: gray_left,gray_right,imu,vio,robot
time_window: tum
stamp_source: device
offset_source: image
output filename: insight9_gray_lr_imu_vio_robot_tum_aligned.bag
temporary filename during conversion: *.bag.partial
space guard: stop before each sequence if external disk free < 15 GiB
```

Batch result:

```text
planned: 19
converted: 19
failed: 0
skipped: 0
total_size_bytes: 12881504140
total_size_gib: 11.997
external disk free after conversion: 124007604224 bytes, about 115.49 GiB
```

Generated output summary:

```text
smallest bag: 227639812 bytes
largest bag: 1308987937 bytes
du total: 12G
partial files remaining: 0
```

Rosbag topic validation:

```text
bags_checked: 19
topic_failures: 0
message_total: 708671
expected topics:
  /left_insight9/gray_left/image_raw
  /left_insight9/gray_right/image_raw
  /left_insight9/imu
  /left_insight9/vio/pose
  /robot/end_effector_pose
```

Commands run:

```bash
git status --short --branch
df -h /media/zjj/Elements /tmp /home/zjj
df -B1 /media/zjj/Elements
python3 -S - <<'PY'
# Inspect valid/invalid Insight9 entries in insight9_rosbag_sync_manifest.json.
PY
python3 - <<'PY'
# Verify rosbag/rospy/sensor_msgs/geometry_msgs imports.
PY
python3 -S - <<'PY'
# Confirm all target run/TUM/replay JSON paths and target output paths.
PY
python3 -u -S - <<'PY'
# Dry-run all 19 Insight9 sequences with selected streams.
PY
python3 -u - <<'PY' 2>&1 | tee /tmp/mild_insight9_gray_lr_rosbag_conversion.log
# Convert all 19 valid Insight9 sequences sequentially using *.partial outputs
# and atomic rename after each successful bag.
PY
python3 -S - <<'PY'
# Validate batch manifest, output existence, total size, and missing outputs.
PY
find /media/zjj/Elements/CQU_ZJJ/UMID/data/v0 -type f -name 'insight9_gray_lr_imu_vio_robot_tum_aligned.bag' -printf '%s %p\n' | sort -n
find /media/zjj/Elements/CQU_ZJJ/UMID/data/v0 -type f \( -name '*.partial' -o -name '*.bag.partial' -o -name '*gray_lr*partial' \) -printf '%p\n' | sort | head -50
python3 - <<'PY'
# Open all 19 bags with rosbag and verify exact topic set.
PY
python3 -S - <<'PY'
# Correct existing summary topic lines to match selected streams.
PY
df -h /media/zjj/Elements
df -B1 /media/zjj/Elements
du -ch $(find /media/zjj/Elements/CQU_ZJJ/UMID/data/v0 -type f -name 'insight9_gray_lr_imu_vio_robot_tum_aligned.bag' | sort) 2>/dev/null | tail -5
```

Safety boundary:

- No `view_image` calls.
- No screenshots, source images, video frames, or visual payloads were loaded
  into chat context.
- No robot control, Docker replay, data collection, or X5 conversion was run.
- No large rosbag files were added to the MILD git repository.

## 2026-07-18 X5 external batch crash/progress check

Context:

- User reported that the previous X5 rosbag conversion appeared to freeze the
  computer and asked nova to check progress.
- Rule 16 boundary remained active: no `view_image`, no screenshots/images/video
  frames loaded into chat context.
- No new conversion was started during this check.

Observed state:

```text
running prepare_replay_bag.py / x5_external_batch1 processes: none
external disk free: about 55G available, 95% used
/tmp/mild_x5_external_batch1_conversion.log: missing after restart/tmp cleanup
x5_external_batch1_conversion_manifest.json: exists, but only records 22 converted entries
current total X5 final bags: 38
new final X5 bags from 2026-07-17 batch: 23
new summary files from 2026-07-17 batch: 23
new aligned TUM files from 2026-07-17 batch: 23
remaining X5 partials found: 1
```

Crash/interruption point:

```text
completed final outputs through:
  /media/zjj/Elements/CQU_ZJJ/UMID/data/v0/Grab_Place01_t/tablecloth/instan360x5/Grab_Place01_x5_camera_imu_tum_aligned.bag

stale/incomplete partial:
  /media/zjj/Elements/CQU_ZJJ/UMID/data/v0/Box01/orin/instan360x5/Box01_x5_camera_imu_tum_aligned.bag.partial
  size: 3468137150 bytes
  mtime: 2026-07-17 20:36:02 +0800

missing companion outputs for that partial:
  Box01_x5_camera_imu_tum_aligned_summary.txt
  Box01_robot_gt_camera_aligned.tum
```

Interpretation:

- The external batch is no longer running.
- The durable manifest is stale because it was last flushed after 22 converted
  entries, but filesystem outputs show 23 complete new X5 rosbags plus matching
  summary/TUM files.
- The computer likely froze/restarted during `box01__table__insta360_x5`, before
  summary/TUM and final rename completed.
- The `Box01/orin` `.partial` must not be treated as a complete deliverable.

Lightweight validation:

```text
Opened first 12 new final X5 rosbags with rosbag without reading image frames:
  failures: 0 before the check was manually interrupted to avoid extra I/O load
  topics per checked bag: 3
  expected topics observed:
    /cam0/image_raw/compressed
    /cam1/image_raw/compressed
    /imu0
```

Commands run:

```bash
pgrep -af 'x5_external_batch1|prepare_replay_bag.py'
df -h /media/zjj/Elements /media/zjj/Elements/CQU_ZJJ/MILD_rosbags
tail -n 80 /tmp/mild_x5_external_batch1_conversion.log
find /media/zjj/Elements/CQU_ZJJ/UMID/data/v0 -path '*instan360x5*' -name '*.partial' -printf '%TY-%Tm-%Td %TH:%TM:%TS %s %p\n' | sort
python3 - <<'PY'
# Read x5_external_batch1_conversion_manifest.json and print summary/last records.
PY
find /media/zjj/Elements/CQU_ZJJ/UMID/data/v0 -path '*instan360x5*' -name '*_x5_camera_imu_tum_aligned.bag' -printf '%s %p\n' | wc -l
python3 - <<'PY'
# Check final/partial/summary/TUM existence around the interruption point.
PY
find /media/zjj/Elements/CQU_ZJJ/UMID/data/v0 -path '*instan360x5*' -name '*_x5_camera_imu_tum_aligned.bag' -printf '%TY-%Tm-%Td %TH:%TM:%TS %s %p\n' | sort
find /media/zjj/Elements/CQU_ZJJ/UMID/data/v0 -path '*instan360x5*' -name '*_x5_camera_imu_tum_aligned_summary.txt' -printf '%TY-%Tm-%Td %TH:%TM:%TS %s %p\n' | sort | tail -n 40
stat -c '%n %s bytes %y' /media/zjj/Elements/CQU_ZJJ/UMID/data/v0/Box01/orin/instan360x5/Box01_x5_camera_imu_tum_aligned.bag.partial
python3 - <<'PY'
# Open new final X5 rosbags with rosbag for topic metadata only; manually
# interrupted after 12 OK bags to reduce I/O load.
PY
sed -n '1,80p' /media/zjj/Elements/CQU_ZJJ/UMID/data/v0/Grab_Place01_t/tablecloth/instan360x5/Grab_Place01_x5_camera_imu_tum_aligned_summary.txt
find /media/zjj/Elements/CQU_ZJJ/UMID/data/v0 -path '*instan360x5*' -name '*_x5_camera_imu_tum_aligned_summary.txt' -newermt '2026-07-17 00:00:00' -printf '%p\n' | wc -l
find /media/zjj/Elements/CQU_ZJJ/UMID/data/v0 -path '*instan360x5*' -name '*_robot_gt_camera_aligned.tum' -newermt '2026-07-17 00:00:00' -printf '%p\n' | wc -l
```

## 2026-07-18 X5 remaining conversion to new volume

Plan before starting:

```text
destination root: /media/zjj/新加卷/UMID
destination filesystem: /dev/nvme1n1p2, fuseblk
destination free before conversion: about 203G
rename test on destination: passed
remaining valid X5 rosbags without final output: 29
remaining predicted total: about 155.656 GiB
remaining predicted total with 15% margin: about 179.005 GiB
minimum destination free reserve for batch script: 35 GiB
source stale partial left in place:
  /media/zjj/Elements/CQU_ZJJ/UMID/data/v0/Box01/orin/instan360x5/Box01_x5_camera_imu_tum_aligned.bag.partial
```

Execution policy:

- Output new rosbags under `/media/zjj/新加卷/UMID/data/v0/...`, mirroring the
  original UMID data layout.
- Do not delete the stale source `.partial` without explicit user approval.
- Run one conversion process at a time with lower CPU/I/O priority via
  `nice`/`ionice`.
- Use destination-side `.partial` files and `os.replace` after a successful
  conversion.
- Stop before starting a sequence if predicted size with 15% margin would leave
  less than 35 GiB free.
- Do not load screenshots, source images, video frames, or other visual payloads
  into chat context.

Completion result:

```text
batch manifest: /media/zjj/新加卷/UMID/x5_remaining_conversion_manifest.json
planned: 29
converted: 29
failed: 0
skipped: 0
new-volume X5 bag count: 29
new-volume X5 total size: 169744639921 bytes, about 158.087 GiB
new-volume summary files: 29
new-volume aligned TUM files: 29
new-volume partial files remaining: 0
destination free after conversion: about 45G
```

Full X5 completion count after this batch:

```text
X5 total valid sequences: 67
source-volume final X5 rosbags: 38
new-volume final X5 rosbags: 29
overlap between source and new-volume final outputs: 0
union final X5 rosbags: 67
missing X5 rosbags: 0
```

Remaining source-volume stale partial:

```text
/media/zjj/Elements/CQU_ZJJ/UMID/data/v0/Box01/orin/instan360x5/Box01_x5_camera_imu_tum_aligned.bag.partial
size: 3468137150 bytes
```

Notes:

- The stale source partial was intentionally left in place.
- The replacement complete `box01__table__insta360_x5` bag exists on the new
  volume under `/media/zjj/新加卷/UMID/data/v0/Box01/orin/instan360x5/`.
- New-volume summary files report X5 topics:
  `/cam0/image_raw/compressed`, `/cam1/image_raw/compressed`, `/imu0`.
- No screenshots, images, video frames, or visual payloads were loaded into chat
  context.

Additional commands run:

```bash
df -h /media/zjj/新加卷 /media/zjj/新加卷/UMID
findmnt -T /media/zjj/新加卷/UMID -o TARGET,SOURCE,FSTYPE,SIZE,USED,AVAIL,USE%
python3 - <<'PY'
# Estimate remaining X5 rosbags and predicted size.
PY
python3 - <<'PY'
# Test destination .partial -> final rename support.
PY
find /media/zjj/新加卷/UMID -name '*_x5_camera_imu_tum_aligned.bag' -o -name '*_x5_camera_imu_tum_aligned.bag.partial' | sort | head -100
python3 -u - <<'PY'
# Dry-run all 29 remaining X5 sequences.
PY
python3 -u - <<'PY' 2>&1 | tee -a '/media/zjj/新加卷/UMID/x5_remaining_conversion.log'
# Convert all 29 remaining X5 sequences to /media/zjj/新加卷/UMID/data/v0
# with nice/ionice, destination .partial files, per-sequence free-space checks,
# and os.replace finalization.
PY
python3 - <<'PY'
# Validate x5_remaining_conversion_manifest.json summary.
PY
find /media/zjj/新加卷/UMID/data/v0 -path '*instan360x5*' -name '*_x5_camera_imu_tum_aligned.bag' -printf '%s %p\n' | tee /tmp/mild_new_volume_x5_bags.txt | awk '{s+=$1; n++} END {printf "bags %d\ntotal_bytes %.0f\ntotal_gib %.3f\n", n, s, s/1024/1024/1024}'
find /media/zjj/新加卷/UMID/data/v0 -path '*instan360x5*' -name '*_x5_camera_imu_tum_aligned_summary.txt' -printf '.' | wc -c
find /media/zjj/新加卷/UMID/data/v0 -path '*instan360x5*' -name '*_robot_gt_camera_aligned.tum' -printf '.' | wc -c
find /media/zjj/新加卷/UMID/data/v0 -path '*instan360x5*' -name '*.partial' -printf '%p\n' | wc -l
df -h /media/zjj/新加卷/UMID /media/zjj/Elements
python3 - <<'PY'
# Check source/new-volume union coverage for all 67 X5 sequences.
PY
find /media/zjj/Elements/CQU_ZJJ/UMID/data/v0 -path '*instan360x5*' -name '*.partial' -printf '%s %p\n' | sort -n
```

## 2026-07-18 rosbag metadata and TUM time-sync audit

Scope:

```text
X5 rosbags checked: 67
Insight9 rosbags checked: 19
total rosbags checked: 86
audit JSON: /media/zjj/Elements/CQU_ZJJ/MILD_rosbags/rosbag_time_sync_audit_20260718.json
audit Markdown: /media/zjj/Elements/CQU_ZJJ/MILD_rosbags/rosbag_time_sync_audit_20260718.md
```

Checks:

- Open final rosbag metadata with `rosbag.Bag` without reading image payloads.
- Verify topic sets and topic message counts against conversion summaries.
- Parse aligned TUM text files, checking row count, 8-column format, monotonic
  timestamps, and first/last timestamp against the conversion window.
- Compare bag start/end against summary sensor timestamps.
- Compare TUM start/end against actual sensor coverage; threshold for a hard
  time coverage issue was 0.1 seconds.

Result:

```text
records checked: 86
records with hard errors: 3
records with warning-only metadata issues: 40
```

Hard errors:

```text
1. bookshelf02_2__tablecloth__insta360_x5
   bag: /media/zjj/新加卷/UMID/data/v0/Bookshelf02_2/tablecloth/instan360x5/Bookshelf02_x5_camera_imu_tum_aligned.bag
   TUM: /media/zjj/新加卷/UMID/data/v0/Bookshelf02_2/tablecloth/instan360x5/Bookshelf02_robot_gt_camera_aligned.tum
   issue: TUM extends 28.742112 seconds past last image/IMU timestamp.
   details:
     window_start_s: 5.778941971
     window_end_s: 176.943354643
     first_image_s: 5.782242131
     last_image_s: 148.192242131
     first_imu_s: 5.779242003
     last_imu_s: 148.201242131

2. grab_place01_t__tablecloth__insta360_x5
   bag: /media/zjj/Elements/CQU_ZJJ/UMID/data/v0/Grab_Place01_t/tablecloth/instan360x5/Grab_Place01_x5_camera_imu_tum_aligned.bag
   issue: ROSBagUnindexedException; `rosbag info` reports the bag is unindexed.
   TUM/summary boundary check itself is aligned:
     TUM last - sensor end: about 0.000506 s

3. grab_place01_t__aruco_4__insta360_x5
   bag: /media/zjj/Elements/CQU_ZJJ/UMID/data/v0/Grab_Place01_t/aruco/4/instan360x5/Grab_Place01_x5_camera_imu_tum_aligned.bag
   issue: ROSBagUnindexedException; `rosbag info` reports the bag is unindexed.
   TUM/summary boundary check itself is aligned:
     TUM last - sensor end: about 0.001900 s
```

Warning-only issue:

```text
40 summary text files still contain `.partial` in the `bag:` and/or
`aligned_tum:` fields, even though the final bag/TUM files exist. This is a
metadata text path issue, not a topic/count/time-sync failure.
```

Commands run:

```bash
python3 -u - <<'PY'
# Build X5 and Insight9 record list, open rosbag metadata, parse summaries and
# aligned TUM files, compare topics/counts/time ranges, and write
# rosbag_time_sync_audit_20260718.json/md.
PY
sed -n '1,220p' /media/zjj/Elements/CQU_ZJJ/MILD_rosbags/rosbag_time_sync_audit_20260718.md
python3 - <<'PY'
# Print error records from rosbag_time_sync_audit_20260718.json.
PY
rosbag info /media/zjj/Elements/CQU_ZJJ/UMID/data/v0/Grab_Place01_t/tablecloth/instan360x5/Grab_Place01_x5_camera_imu_tum_aligned.bag
rosbag info /media/zjj/Elements/CQU_ZJJ/UMID/data/v0/Grab_Place01_t/aruco/4/instan360x5/Grab_Place01_x5_camera_imu_tum_aligned.bag
rosbag reindex --help
python3 - <<'PY'
# Text-only TUM/summary boundary check for the two unindexed bags.
PY
```

Safety boundary:

- No `view_image`.
- No screenshots, source images, video frames, or visual payloads were loaded
  into chat context.
- No rosbag/TUM data files were modified during this audit.

## 2026-07-19 repair three rosbag/TUM hard errors

Scope:

- Repair the three hard errors found by the 2026-07-18 metadata/time-sync audit:
  `bookshelf02_2__tablecloth__insta360_x5`,
  `grab_place01_t__tablecloth__insta360_x5`, and
  `grab_place01_t__aruco_4__insta360_x5`.
- Rule 16 boundary held: no `view_image`; no screenshots, source images, video
  frames, or image payloads were loaded into chat context.

Actions:

- Tried `rosbag reindex --output-dir` for the
  `grab_place01_t__tablecloth__insta360_x5` source bag. It failed during the
  copy phase with `OSError: [Errno 5] Input/output error`, so the source bag was
  not trusted as repair input.
- Rebuilt the two unindexed `Grab_Place01_t` X5 bags from original
  `stream_0.h264`, `video_packets.csv`, `imu.csv`, replay JSON, and replay TUM
  using `/media/zjj/Elements/CQU_ZJJ/UMID/scripts/prepare_replay_bag.py` with
  the existing synchronized settings:
  `--compressed-format jpeg --jpeg-quality 95 --image-stamp-source video-sdk
  --imu-stamp-source sdk --time-window tum`.
- Wrote rebuilt outputs to `/media/zjj/新加卷/UMID/data/v0/...` using
  `.partial` files, then atomically replaced final `.bag`, `.tum`, and
  summary paths after successful completion.
- For `bookshelf02_2__tablecloth__insta360_x5`, did not rewrite the 6.5 GB bag.
  The aligned TUM was trimmed from 637 rows to 385 rows, keeping the final TUM
  sample at `147.751430035s`, the last TUM sample not exceeding the sensor
  coverage end `148.201242131s`. Backups were written beside the repaired files:
  `Bookshelf02_robot_gt_camera_aligned.tum.pre_repair_20260719` and
  `Bookshelf02_x5_camera_imu_tum_aligned_summary.txt.pre_repair_20260719`.

Repaired outputs:

```text
bookshelf02_2__tablecloth__insta360_x5
  bag: /media/zjj/新加卷/UMID/data/v0/Bookshelf02_2/tablecloth/instan360x5/Bookshelf02_x5_camera_imu_tum_aligned.bag
  TUM: /media/zjj/新加卷/UMID/data/v0/Bookshelf02_2/tablecloth/instan360x5/Bookshelf02_robot_gt_camera_aligned.tum
  summary: /media/zjj/新加卷/UMID/data/v0/Bookshelf02_2/tablecloth/instan360x5/Bookshelf02_x5_camera_imu_tum_aligned_summary.txt

grab_place01_t__tablecloth__insta360_x5
  bag: /media/zjj/新加卷/UMID/data/v0/Grab_Place01_t/tablecloth/instan360x5/Grab_Place01_x5_camera_imu_tum_aligned.bag
  TUM: /media/zjj/新加卷/UMID/data/v0/Grab_Place01_t/tablecloth/instan360x5/Grab_Place01_robot_gt_camera_aligned.tum
  summary: /media/zjj/新加卷/UMID/data/v0/Grab_Place01_t/tablecloth/instan360x5/Grab_Place01_x5_camera_imu_tum_aligned_summary.txt

grab_place01_t__aruco_4__insta360_x5
  bag: /media/zjj/新加卷/UMID/data/v0/Grab_Place01_t/aruco/4/instan360x5/Grab_Place01_x5_camera_imu_tum_aligned.bag
  TUM: /media/zjj/新加卷/UMID/data/v0/Grab_Place01_t/aruco/4/instan360x5/Grab_Place01_robot_gt_camera_aligned.tum
  summary: /media/zjj/新加卷/UMID/data/v0/Grab_Place01_t/aruco/4/instan360x5/Grab_Place01_x5_camera_imu_tum_aligned_summary.txt
```

Validation:

```text
repair report JSON: /media/zjj/Elements/CQU_ZJJ/MILD_rosbags/rosbag_repair_20260719.json
repair report Markdown: /media/zjj/Elements/CQU_ZJJ/MILD_rosbags/rosbag_repair_20260719.md
records checked: 3
records ok: 3
records with issues: 0
```

Topic/count checks:

```text
bookshelf02_2__tablecloth__insta360_x5:
  /cam0/image_raw/compressed 4269
  /cam1/image_raw/compressed 4269
  /imu0 71525
  TUM rows 385
  TUM last - sensor end: -0.449812096s

grab_place01_t__tablecloth__insta360_x5:
  /cam0/image_raw/compressed 2593
  /cam1/image_raw/compressed 2593
  /imu0 43444
  TUM rows 978
  TUM last - sensor end: 0.000506463s

grab_place01_t__aruco_4__insta360_x5:
  /cam0/image_raw/compressed 2593
  /cam1/image_raw/compressed 2593
  /imu0 43389
  TUM rows 978
  TUM last - sensor end: 0.001899950s
```

Known leftovers:

- Source-volume old `Grab_Place01_t` final bags were not overwritten. They
  remain unindexed and should be superseded by the repaired new-volume copies
  above.
- Counting both storage roots now finds `69` X5 final bag files but `67` unique
  relative dataset paths. The only duplicate relative paths are the two
  `Grab_Place01_t` repairs, where the source-volume old final bag is unindexed
  and the new-volume mirror is the valid replacement.
- The failed in-place reindex attempt left a partial backup file:
  `/media/zjj/Elements/CQU_ZJJ/UMID/data/v0/Grab_Place01_t/tablecloth/instan360x5/Grab_Place01_x5_camera_imu_tum_aligned.orig.bag`
  at `2459660288` bytes. It was not deleted.
- After repair, free space was about `52G` on `/media/zjj/Elements` and `34G`
  on `/media/zjj/新加卷/UMID`.

Commands run:

```bash
git status --short
df -h /media/zjj/Elements /media/zjj/新加卷/UMID
rosbag reindex --help
rosbag reindex --output-dir /media/zjj/新加卷/UMID/data/v0/Grab_Place01_t/tablecloth/instan360x5 /media/zjj/Elements/CQU_ZJJ/UMID/data/v0/Grab_Place01_t/tablecloth/instan360x5/Grab_Place01_x5_camera_imu_tum_aligned.bag
python3 /media/zjj/Elements/CQU_ZJJ/UMID/scripts/prepare_replay_bag.py --dry-run ...
ionice -c2 -n7 nice -n 10 python3 -u /media/zjj/Elements/CQU_ZJJ/UMID/scripts/prepare_replay_bag.py ...
rosbag info /media/zjj/新加卷/UMID/data/v0/Grab_Place01_t/tablecloth/instan360x5/Grab_Place01_x5_camera_imu_tum_aligned.bag
rosbag info /media/zjj/新加卷/UMID/data/v0/Grab_Place01_t/aruco/4/instan360x5/Grab_Place01_x5_camera_imu_tum_aligned.bag
rosbag info /media/zjj/新加卷/UMID/data/v0/Bookshelf02_2/tablecloth/instan360x5/Bookshelf02_x5_camera_imu_tum_aligned.bag
python3 - <<'PY'
# Backup and trim Bookshelf02 aligned TUM; update summary repair fields.
PY
python3 - <<'PY'
# Targeted metadata/TUM repair audit for all three records; write
# rosbag_repair_20260719.json/md.
PY
find /media/zjj/新加卷/UMID/data/v0/Grab_Place01_t -path '*instan360x5*' -name '*.partial' -printf '%s %p\n' | sort
find /media/zjj/Elements/CQU_ZJJ/UMID/data/v0/Grab_Place01_t -path '*instan360x5*' \( -name '*.orig.bag' -o -name '*.partial' \) -printf '%s %p\n' | sort
rosbag info /media/zjj/Elements/CQU_ZJJ/UMID/data/v0/Grab_Place01_t/tablecloth/instan360x5/Grab_Place01_x5_camera_imu_tum_aligned.bag
rosbag info /media/zjj/Elements/CQU_ZJJ/UMID/data/v0/Grab_Place01_t/aruco/4/instan360x5/Grab_Place01_x5_camera_imu_tum_aligned.bag
python3 - <<'PY'
# Count final X5 bag files across source and new-volume roots, keyed by
# relative dataset path, to identify duplicate old-source/new-repair paths.
PY
```

## 2026-07-19 successful rosbag path inventory

Scope:

- Answer whether all valid rosbags are now successfully converted and produce a
  complete path list.
- Rule 16 boundary held: no `view_image`; no image/video frame payloads were
  loaded.

Result:

```text
successful rosbag path list TXT: /media/zjj/Elements/CQU_ZJJ/MILD_rosbags/successful_rosbag_paths_20260719.txt
successful rosbag path list Markdown: /media/zjj/Elements/CQU_ZJJ/MILD_rosbags/successful_rosbag_paths_20260719.md
successful rosbag path list JSON: /media/zjj/Elements/CQU_ZJJ/MILD_rosbags/successful_rosbag_paths_20260719.json
total successful rosbags: 86
Insta360 X5 successful: 67
Insight9 successful: 19
repaired records used: 3
```

Method:

- Used `/media/zjj/Elements/CQU_ZJJ/MILD_rosbags/rosbag_time_sync_audit_20260718.json`
  as the 86-record base inventory.
- Overlaid the three fixed records from
  `/media/zjj/Elements/CQU_ZJJ/MILD_rosbags/rosbag_repair_20260719.json`, so the
  two `Grab_Place01_t` source-volume unindexed bags are not counted as
  successful paths; their new-volume repaired mirrors are used instead.
- Did not rerun conversion.

Commands run:

```bash
python3 - <<'PY'
# Read rosbag_time_sync_audit_20260718.json and rosbag_repair_20260719.json,
# overlay repaired records, and write successful_rosbag_paths_20260719
# txt/md/json.
PY
```

## 2026-07-19 OneDrive rclone connectivity check

Scope:

- Verify that the newly configured `rclone` OneDrive remote can see the target
  upload folder before uploading large rosbag files.
- Read-only directory listing only. No upload, deletion, or data modification.

Result:

```text
rclone remote: onedrive:
target folder found: onedrive:MILD
note: onedrive:Documents does not exist in this remote view; the MILD folder is
at the OneDrive root.
MILD subdirectories visible:
Analemma, Bookshelf01, Bookshelf02, Box01, Box02, Circular, Grab_Place01,
Grab_Place02, Grab_Place03, Grab_Place04, Grab_Place05, Grab_Place06,
Wiping01, Wiping02, Zigzag
```

Commands run:

```bash
rclone lsd onedrive:
rclone lsd onedrive:Documents
rclone lsf --dirs-only onedrive:Documents | rg '^MILD/?$|MILD' || true
rclone lsd onedrive:MILD
```

## 2026-07-19 OneDrive test rosbag upload and website link

Scope:

- Upload one small successful rosbag to OneDrive as an end-to-end release-link
  test before starting the 286 GiB batch upload.
- Add that single rosbag link to the MILD website for user-side validation.
- Rule 16 boundary held: no `view_image`; no screenshots, source images, video
  frames, or rosbag message payloads were loaded.

Selected test rosbag:

```text
key: circular_2_t__tablecloth__insight9
local path: /media/zjj/Elements/CQU_ZJJ/UMID/data/v0/Circular_2_t/tablecloth/insight9/insight9/insight9_gray_lr_imu_vio_robot_tum_aligned.bag
local size: 227639812 bytes, 217.094 MiB
remote path: onedrive:MILD/Circular/tablecloth/insight9/insight9_gray_lr_imu_vio_robot_tum_aligned.bag
remote size: 227639812 bytes, 217.094 MiB
upload elapsed: about 9m10s
share link: https://1drv.ms/u/c/7625f90385490ff5/IQAmV_QL-rU1SqQzdBpodCS7AUDkH_74OnBbEEG8W8FUMv4
```

Website edits:

- `static/js/site.js`: added a one-record `rosbagDownloadLinks` map for
  `circular_2_t__tablecloth__insight9`; allowed `createDownloadPill` to accept
  absolute URLs; rendered a `Rosbag` row in the task detail `Data links` area
  when a matching OneDrive rosbag link exists.
- `index.html`: bumped the JS cache-bust query to
  `20260719-onedrive-rosbag-test`.

Validation:

```text
node --check static/js/site.js: pass
git diff --check: pass
Chrome headless DOM load: exit 0, stderr 0 bytes
static key assertion: Circular/tablecloth/Insight9 -> circular_2_t__tablecloth__insight9
remote size check: 227639812 bytes
```

Note:

- `rclone link` created a OneDrive share link, but command-line anonymous
  `curl` checks returned `403` for the OneDrive redirect page and `401` for the
  `/shares/.../content` API form. The website therefore exposes the OneDrive
  share-page URL for browser validation first.

Commands run:

```bash
python3 - <<'PY'
# Select the smallest successful rosbag from successful_rosbag_paths_20260719.
PY
rclone copyto '/media/zjj/Elements/CQU_ZJJ/UMID/data/v0/Circular_2_t/tablecloth/insight9/insight9/insight9_gray_lr_imu_vio_robot_tum_aligned.bag' 'onedrive:MILD/Circular/tablecloth/insight9/insight9_gray_lr_imu_vio_robot_tum_aligned.bag' --transfers 1 --checkers 4 --progress --stats 10s --log-file /tmp/mild_onedrive_test_rosbag_upload.log --log-level INFO
rclone lsjson 'onedrive:MILD/Circular/tablecloth/insight9/insight9_gray_lr_imu_vio_robot_tum_aligned.bag'
stat -c '%s %n' '/media/zjj/Elements/CQU_ZJJ/UMID/data/v0/Circular_2_t/tablecloth/insight9/insight9/insight9_gray_lr_imu_vio_robot_tum_aligned.bag'
rclone link 'onedrive:MILD/Circular/tablecloth/insight9/insight9_gray_lr_imu_vio_robot_tum_aligned.bag'
curl -I -L --max-time 30 'https://1drv.ms/u/c/7625f90385490ff5/IQAmV_QL-rU1SqQzdBpodCS7AUDkH_74OnBbEEG8W8FUMv4'
node --check static/js/site.js
rclone size 'onedrive:MILD/Circular/tablecloth/insight9/insight9_gray_lr_imu_vio_robot_tum_aligned.bag'
python3 -m http.server 8123
google-chrome --headless=new --disable-gpu --no-sandbox --dump-dom http://127.0.0.1:8123/
python3 - <<'PY'
# Static assertion for task/scene/sensor key and OneDrive rosbag link mapping.
PY
git diff --check
```
