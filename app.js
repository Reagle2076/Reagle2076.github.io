// app.js - 角色列表页（暗黑奇幻风格）
const DATA_URL = "characters.json";

const gridEl = document.getElementById("grid");
const emptyEl = document.getElementById("emptyState");
const resultPill = document.getElementById("resultPill");
const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");
const filterRowJob = document.getElementById("filterRowJob");
const filterRowCamp = document.getElementById("filterRowCamp");

let allCharacters = [];
let filtered = [];
let activeJob = "";
let activeCamp = "";

const JOB_ICONS = {
  "骑士": "⚔️",
  "法师": "🔮",
  "刺客": "🗡️",
  "战士": "🪓",
  "牧师": "✝️",
  "术士": "📜"
};

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function rarityClass(r) {
  const v = String(r || "").toUpperCase();
  if (v === "SSR") return "badge--ssr";
  if (v === "SR") return "badge--sr";
  if (v === "R") return "badge--r";
  return "badge--n";
}

function getJobIcon(job) {
  return JOB_ICONS[job] || "◆";
}

function buildFilterPills() {
  const jobs = [...new Set(allCharacters.map(c => c.job).filter(Boolean))].sort((a, b) => String(a).localeCompare(b, "zh-Hans-CN"));
  const camps = [...new Set(allCharacters.map(c => c.camp).filter(Boolean))].sort((a, b) => String(a).localeCompare(b, "zh-Hans-CN"));

  filterRowJob.innerHTML = "";
  const allJob = document.createElement("button");
  allJob.type = "button";
  allJob.className = "filter-pill" + (activeJob ? "" : " active");
  allJob.textContent = "All";
  allJob.dataset.type = "job";
  allJob.dataset.value = "";
  allJob.addEventListener("click", () => { activeJob = ""; buildFilterPills(); applyFilters(); });
  filterRowJob.appendChild(allJob);
  jobs.forEach(job => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "filter-pill" + (activeJob === job ? " active" : "");
    btn.innerHTML = `<span class="filter-pill__icon">${getJobIcon(job)}</span>${escapeHtml(job)}`;
    btn.dataset.type = "job";
    btn.dataset.value = job;
    btn.addEventListener("click", () => { activeJob = job; buildFilterPills(); applyFilters(); });
    filterRowJob.appendChild(btn);
  });

  filterRowCamp.innerHTML = "";
  const allCamp = document.createElement("button");
  allCamp.type = "button";
  allCamp.className = "filter-pill" + (activeCamp ? "" : " active");
  allCamp.textContent = "All";
  allCamp.dataset.type = "camp";
  allCamp.dataset.value = "";
  allCamp.addEventListener("click", () => { activeCamp = ""; buildFilterPills(); applyFilters(); });
  filterRowCamp.appendChild(allCamp);
  camps.forEach(camp => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "filter-pill" + (activeCamp === camp ? " active" : "");
    btn.textContent = camp;
    btn.dataset.type = "camp";
    btn.dataset.value = camp;
    btn.addEventListener("click", () => { activeCamp = camp; buildFilterPills(); applyFilters(); });
    filterRowCamp.appendChild(btn);
  });
}

const DEFAULT_PORTRAIT = "images/default.png";

function portraitContent(c) {
  const src = c.image || DEFAULT_PORTRAIT;
  return `<img src="${escapeHtml(src)}" alt="" loading="lazy" />`;
}

function render(list) {
  gridEl.innerHTML = "";

  if (!list.length) {
    emptyEl.hidden = false;
    resultPill.textContent = "0 个结果";
    return;
  }

  emptyEl.hidden = true;
  resultPill.textContent = `共 ${list.length} 个角色`;

  const frag = document.createDocumentFragment();
  for (const c of list) {
    const a = document.createElement("a");
    a.className = "card";
    a.href = `character.html?id=${encodeURIComponent(c.id)}`;

    const name = escapeHtml(c.name);
    const job = escapeHtml(c.job);
    const jobIcon = getJobIcon(c.job);
    const rarity = escapeHtml(c.rarity);

    a.innerHTML = `
      <div class="card__portrait">${portraitContent(c)}</div>
      <div class="card__body">
        <div class="card__name">${name}</div>
        <div class="card__job">
          <span class="card__job-icon" aria-hidden="true">${jobIcon}</span>
          <span>${job}</span>
          <span class="badge ${rarityClass(c.rarity)}" style="margin-left:auto">${rarity}</span>
        </div>
      </div>
    `;
    frag.appendChild(a);
  }
  gridEl.appendChild(frag);
}

function textHaystack(c) {
  return [c.id, c.name, c.camp, c.race, c.job, c.rarity, c.desc].join(" ").toLowerCase();
}

function applyFilters() {
  const q = (searchInput.value || "").trim().toLowerCase();
  filtered = allCharacters.filter(c => {
    if (activeCamp && c.camp !== activeCamp) return false;
    if (activeJob && c.job !== activeJob) return false;
    if (q && !textHaystack(c).includes(q)) return false;
    return true;
  });
  render(filtered);
}

async function loadData() {
  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch (e) {
    if (typeof window.CHARACTERS_DATA !== "undefined" && Array.isArray(window.CHARACTERS_DATA))
      return window.CHARACTERS_DATA;
    throw e;
  }
}

async function init() {
  try {
    resultPill.textContent = "加载中…";

    const data = await loadData();
    if (!data) throw new Error("characters.json 不是数组");

    const ids = new Set();
    for (const c of data) {
      if (!c.id) throw new Error("存在缺少 id 的角色");
      if (ids.has(c.id)) throw new Error(`重复 id：${c.id}`);
      ids.add(c.id);
    }

    allCharacters = data;
    allCharacters.sort((a, b) => String(a.id).localeCompare(String(b.id)));

    buildFilterPills();
    applyFilters();

    searchInput.addEventListener("input", applyFilters);
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      activeJob = "";
      activeCamp = "";
      buildFilterPills();
      applyFilters();
      searchInput.focus();
    });
  } catch (err) {
    console.error(err);
    resultPill.textContent = "加载失败";
    emptyEl.hidden = false;
    emptyEl.querySelector(".empty__title").textContent = "数据加载失败";
    emptyEl.querySelector(".empty__desc").textContent = String(err?.message || err);
  }
}

init();
