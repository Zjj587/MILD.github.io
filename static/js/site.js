const filterButtons = Array.from(document.querySelectorAll(".filter-chip"));
const cards = Array.from(document.querySelectorAll(".task-card"));
const searchInput = document.querySelector("#taskSearch");
const taskCount = document.querySelector("#taskCount");
const releaseBaseUrl = "https://github.com/Zjj587/MILD/releases/download/v0.1/";

const taskSlugs = {
  "01": "task_01_overhead_wave",
  "02": "task_02_cup_auxiliary",
  "03": "task_03_cup_clean_table",
  "04": "task_04_transparent_cup",
  "05": "task_05_same_color_lighting",
  "06": "task_06_pen_pick_place",
  "07": "task_07_box_retrieval",
  "08": "task_08_wardrobe_clothes",
  "09": "task_09_wipe_auxiliary",
  "10": "task_10_wipe_empty_table",
  "11": "task_11_throwing",
  "12": "task_12_desktop_organization",
  "13": "task_13_rack_organization",
  "14": "task_14_box_organization",
};

const collectedScenes = [
  {
    name: "Analemma_2_t",
    bundles: 6,
    variants: "orin, tablecloth, ArUco 2/4, AprilTag Custom48h12 2/4",
    sensors: ["X5", "Insight9", "PICO"],
    status: "1 aligned bag, 5 pending",
  },
  {
    name: "Bookshelf01_2",
    bundles: 5,
    variants: "orin, ArUco 2/4, AprilTag Custom48h12 2/4",
    sensors: ["X5", "Insight9", "PICO"],
    status: "1 aligned bag, 4 pending",
  },
  {
    name: "Bookshelf02_2",
    bundles: 6,
    variants: "orin, tablecloth, ArUco 2/4, AprilTag Custom48h12 2/4",
    sensors: ["X5", "Insight9", "PICO"],
    status: "1 aligned bag, 5 pending",
  },
  {
    name: "Box01",
    bundles: 3,
    variants: "orin, ArUco 4, AprilTag Custom48h12 4",
    sensors: ["X5", "Insight9", "PICO"],
    status: "1 aligned bag, 2 pending",
  },
  {
    name: "Box02",
    bundles: 3,
    variants: "orin, ArUco 4, AprilTag Custom48h12 4",
    sensors: ["X5", "Insight9", "PICO"],
    status: "1 aligned bag, 2 pending",
  },
  {
    name: "Circular_2_t",
    bundles: 6,
    variants: "orin, tablecloth, ArUco 2/4, AprilTag Custom48h12 2/4",
    sensors: ["X5", "Insight9", "PICO"],
    status: "1 aligned bag, 5 pending",
  },
  {
    name: "Grab_Place01_t",
    bundles: 4,
    variants: "orin, tablecloth, ArUco 4, AprilTag Custom48h12 4",
    sensors: ["X5", "Insight9", "PICO"],
    status: "1 aligned bag, 3 pending",
  },
  {
    name: "Grab_Place02_t",
    bundles: 4,
    variants: "orin, tablecloth, ArUco 4, AprilTag Custom48h12 4",
    sensors: ["X5", "Insight9", "PICO"],
    status: "1 aligned bag, 3 pending",
  },
  {
    name: "Grab_Place03_t",
    bundles: 4,
    variants: "orin, tablecloth, ArUco 4, AprilTag Custom48h12 4",
    sensors: ["X5", "Insight9", "PICO"],
    status: "1 aligned bag, 3 pending",
  },
  {
    name: "Grab_Place04",
    bundles: 3,
    variants: "orin, ArUco 4, AprilTag Custom48h12 4",
    sensors: ["X5", "Insight9", "PICO"],
    status: "1 aligned bag, 2 pending",
  },
  {
    name: "Grab_Place05",
    bundles: 3,
    variants: "orin, ArUco 4, AprilTag Custom48h12 4",
    sensors: ["X5", "Insight9", "PICO"],
    status: "1 aligned bag, 2 pending",
  },
  {
    name: "Grab_Place06_t",
    bundles: 4,
    variants: "orin, tablecloth, ArUco 4, AprilTag Custom48h12 4",
    sensors: ["X5", "Insight9", "PICO"],
    status: "1 aligned bag, 3 pending",
  },
  {
    name: "Wiping01",
    bundles: 3,
    variants: "orin, ArUco 4, AprilTag Custom48h12 4",
    sensors: ["X5", "Insight9", "PICO"],
    status: "1 aligned bag, 2 pending",
  },
  {
    name: "Wiping02_1",
    bundles: 7,
    variants: "orin, ArUco 1/2/4, AprilTag Custom48h12 1/2/4",
    sensors: ["X5", "Insight9", "PICO"],
    status: "1 aligned bag, 6 pending",
  },
  {
    name: "Zigzag_2_t",
    bundles: 6,
    variants: "orin, tablecloth, ArUco 2/4, AprilTag Custom48h12 2/4",
    sensors: ["X5", "Insight9", "PICO"],
    status: "1 aligned bag, 5 pending",
  },
];

let activeFilter = "all";

function normalize(value) {
  return value.trim().toLowerCase();
}

function updateTasks() {
  const query = searchInput ? normalize(searchInput.value) : "";
  let visibleCount = 0;

  cards.forEach((card) => {
    const category = card.dataset.category || "";
    const searchText = normalize(`${card.textContent} ${card.dataset.search || ""}`);
    const categoryMatch = activeFilter === "all" || category === activeFilter;
    const searchMatch = !query || searchText.includes(query);
    const visible = categoryMatch && searchMatch;

    card.classList.toggle("is-hidden", !visible);
    if (visible) visibleCount += 1;
  });

  if (taskCount) {
    taskCount.textContent = `Showing ${visibleCount} task group${visibleCount === 1 ? "" : "s"}`;
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter || "all";
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    updateTasks();
  });
});

if (searchInput) {
  searchInput.addEventListener("input", updateTasks);
}

function createDownloadPill(label, fileName) {
  const anchor = document.createElement("a");
  anchor.className = "download-pill";
  anchor.href = `${releaseBaseUrl}${fileName}`;
  anchor.target = "_blank";
  anchor.rel = "noopener";
  anchor.textContent = label;
  return anchor;
}

function createDownloadRow(label, links) {
  const row = document.createElement("div");
  row.className = "download-row";

  const rowLabel = document.createElement("span");
  rowLabel.textContent = label;

  const linkWrap = document.createElement("div");
  linkWrap.className = "download-links";
  links.forEach((link) => linkWrap.appendChild(link));

  row.append(rowLabel, linkWrap);
  return row;
}

function createTaskDownloads(card) {
  const taskNumber = card.querySelector(".task-topline span")?.textContent.trim();
  const slug = taskSlugs[taskNumber];
  if (!slug) return null;

  const panel = document.createElement("div");
  panel.className = "task-downloads";
  panel.setAttribute("aria-label", "Task dataset downloads");

  const heading = document.createElement("div");
  heading.className = "download-heading";

  const title = document.createElement("span");
  title.textContent = "Data Links";

  const release = document.createElement("small");
  release.textContent = "release plan";

  heading.append(title, release);
  panel.appendChild(heading);
  panel.appendChild(createDownloadRow("Original", [createDownloadPill("orin", `${slug}_orin.zip`)]));
  panel.appendChild(createDownloadRow("ArUco", [1, 2, 3, 4].map((count) => (
    createDownloadPill(`${count} tag${count > 1 ? "s" : ""}`, `${slug}_aruco_${count}tag.zip`)
  ))));
  panel.appendChild(createDownloadRow("AprilTag", [1, 2, 3, 4].map((count) => (
    createDownloadPill(`${count} tag${count > 1 ? "s" : ""}`, `${slug}_apriltag_${count}tag.zip`)
  ))));

  return panel;
}

function renderCollectedInventory() {
  const tableBody = document.querySelector("#collectedInventory");
  const inventoryCount = document.querySelector("#inventoryCount");
  if (!tableBody) return;

  tableBody.replaceChildren();

  collectedScenes.forEach((scene) => {
    const row = document.createElement("tr");

    const name = document.createElement("th");
    name.scope = "row";
    name.textContent = scene.name;

    const bundles = document.createElement("td");
    bundles.textContent = String(scene.bundles);

    const variants = document.createElement("td");
    variants.textContent = scene.variants;

    const sensors = document.createElement("td");
    const sensorWrap = document.createElement("div");
    sensorWrap.className = "sensor-chip-row";
    scene.sensors.forEach((sensor) => {
      const chip = document.createElement("span");
      chip.textContent = sensor;
      sensorWrap.appendChild(chip);
    });
    sensors.appendChild(sensorWrap);

    const status = document.createElement("td");
    const statusBadge = document.createElement("span");
    statusBadge.className = "status-badge";
    statusBadge.textContent = scene.status;
    status.appendChild(statusBadge);

    row.append(name, bundles, variants, sensors, status);
    tableBody.appendChild(row);
  });

  if (inventoryCount) {
    inventoryCount.textContent = `${collectedScenes.length} scenes`;
  }
}

document.querySelectorAll(".dataset-link.is-disabled").forEach((link) => {
  const card = link.closest(".task-card");
  const downloads = card ? createTaskDownloads(card) : null;
  if (downloads) {
    link.replaceWith(downloads);
  } else {
    link.addEventListener("click", (event) => event.preventDefault());
  }
});

renderCollectedInventory();
updateTasks();
