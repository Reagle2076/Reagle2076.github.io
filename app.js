// app.js
const DATA_URL = "characters.json";

const gridEl = document.getElementById("grid");
const emptyEl = document.getElementById("emptyState");
const resultPill = document.getElementById("resultPill");

const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");

const campFilter = document.getElementById("campFilter");
const jobFilter = document.getElementById("jobFilter");
const rarityFilter = document.getElementById("rarityFilter");

let allCharacters = [];
let filtered = [];

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function rarityClass(r) {
  const v = String(r || "").toLowerCase();
  if (v === "ssr") return "badge--ssr";
  if (v === "sr") return "badge--sr";
  if (v === "r") return "badge--r";
  return "badge--n";
}

function buildOptions(selectEl, values) {
  const unique = [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "zh-Hans-CN"));
  for (const v of unique) {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    selectEl.appendChild(opt);
  }
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
    const camp = escapeHtml(c.camp);
    const race = escapeHtml(c.race);
    const job = escapeHtml(c.job);
    const rarity = escapeHtml(c.rarity);
    const desc = escapeHtml(c.desc);

    a.innerHTML = `
      <div class="card__top">
        <div>
          <div class="card__name">${name}</div>
          <div class="brand__subtitle mono">${escapeHtml(c.id)}</div>
        </div>
        <div class="badge ${rarityClass(c.rarity)}">${rarity}</div>
      </div>

      <div class="card__meta">
        <span class="tag">${camp}</span>
        <span class="tag">${race}</span>
        <span class="tag">${job}</span>
      </div>

      <div class="card__desc">${desc}</div>

      <div class="card__hint">
        <span>查看详情</span>
        <span>→</span>
      </div>
    `;

    frag.appendChild(a);
  }

  gridEl.appendChild(frag);
}

function textHaystack(c) {
  return [
    c.id,
    c.name,
    c.camp,
    c.race,
    c.job,
    c.rarity,
    c.desc
  ].join(" ").toLowerCase();
}

function applyFilters() {
  const q = (searchInput.value || "").trim().toLowerCase();
  const camp = campFilter.value;
  const job = jobFilter.value;
  const rarity = rarityFilter.value;

  filtered = allCharacters.filter(c => {
    if (camp && c.camp !== camp) return false;
    if (job && c.job !== job) return false;
    if (rarity && c.rarity !== rarity) return false;
    if (q) return textHaystack(c).includes(q);
    return true;
  });

  render(filtered);
}

async function init() {
  try {
    resultPill.textContent = "加载中…";

    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`加载失败：${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data)) throw new Error("characters.json 不是数组");

    // 基础校验：确保 id 唯一
    const ids = new Set();
    for (const c of data) {
      if (!c.id) throw new Error("存在缺少 id 的角色");
      if (ids.has(c.id)) throw new Error(`重复 id：${c.id}`);
      ids.add(c.id);
    }

    allCharacters = data;

    // 生成筛选项
    buildOptions(campFilter, allCharacters.map(x => x.camp));
    buildOptions(jobFilter, allCharacters.map(x => x.job));
    buildOptions(rarityFilter, allCharacters.map(x => x.rarity));

    // 默认按 id 排序（你也可以按 rarity / name）
    allCharacters.sort((a, b) => String(a.id).localeCompare(String(b.id)));

    applyFilters();

    // 事件
    searchInput.addEventListener("input", applyFilters);
    campFilter.addEventListener("change", applyFilters);
    jobFilter.addEventListener("change", applyFilters);
    rarityFilter.addEventListener("change", applyFilters);

    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      campFilter.value = "";
      jobFilter.value = "";
      rarityFilter.value = "";
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
