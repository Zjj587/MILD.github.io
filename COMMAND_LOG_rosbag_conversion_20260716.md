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
