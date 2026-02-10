// character.js
const DATA_URL = "characters.json";

const detailEl = document.getElementById("detail");
const notFoundEl = document.getElementById("notFound");
const subtitleEl = document.getElementById("subtitle");

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getIdFromUrl() {
  const params = new URLSearchParams(location.search);
  return params.get("id");
}

function renderDetail(c) {
  document.title = `${c.name} - 角色详情`;
  subtitleEl.textContent = `${c.id} · ${c.camp}`;

  detailEl.innerHTML = `
    <div class="detail__grid">
      <div>
        <div class="detail__title">${escapeHtml(c.name)}</div>
        <div class="detail__subtitle">
          <span class="mono">${escapeHtml(c.id)}</span>
          <span class="muted"> · </span>
          <span>${escapeHtml(c.rarity)} · ${escapeHtml(c.job)}</span>
        </div>

        <div class="kv">
          <span class="tag">阵营：${escapeHtml(c.camp)}</span>
          <span class="tag">种族：${escapeHtml(c.race)}</span>
          <span class="tag">职业：${escapeHtml(c.job)}</span>
          <span class="tag">稀有度：${escapeHtml(c.rarity)}</span>
        </div>

        <div class="detail__desc">
          ${escapeHtml(c.desc)}
        </div>
      </div>

      <div class="panel">
        <div class="panel__title">角色图像</div>
        ${
  c.image
    ? `<img src="${c.image}" 
           style="width:100%;border-radius:12px;margin-top:10px;" />`
    : `<div class="muted">暂无角色图像</div>`
}
        <div class="muted" style="font-size:12px; line-height:1.6;">
          你可以把下面的 prompt 复制到任意绘图模型里生成角色立绘。
        </div>
        <div style="height:10px"></div>
        <div class="mono" style="white-space:pre-wrap; line-height:1.55;">
${escapeHtml(c.image_prompt || "（暂无 image_prompt）")}
        </div>
      </div>
    </div>
  `;

  detailEl.hidden = false;
  notFoundEl.hidden = true;
}

async function init() {
  const id = getIdFromUrl();

  if (!id) {
    subtitleEl.textContent = "缺少 id 参数";
    detailEl.hidden = true;
    notFoundEl.hidden = false;
    return;
  }

  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`加载失败：${res.status}`);
    const data = await res.json();

    const c = Array.isArray(data) ? data.find(x => x.id === id) : null;

    if (!c) {
      subtitleEl.textContent = `未找到：${id}`;
      detailEl.hidden = true;
      notFoundEl.hidden = false;
      return;
    }

    renderDetail(c);
  } catch (err) {
    console.error(err);
    subtitleEl.textContent = "加载失败";
    detailEl.hidden = true;
    notFoundEl.hidden = false;
  }
}

init();
