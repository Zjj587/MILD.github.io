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
  release.textContent = "v0.1 release";

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

document.querySelectorAll(".dataset-link.is-disabled").forEach((link) => {
  const card = link.closest(".task-card");
  const downloads = card ? createTaskDownloads(card) : null;
  if (downloads) {
    link.replaceWith(downloads);
  } else {
    link.addEventListener("click", (event) => event.preventDefault());
  }
});

updateTasks();
