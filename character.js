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

function renderImageBlock(c) {
  // 允许你在 JSON 里用 image 字段存 gif/png/jpg 路径
  if (!c.image) {
    return `<div class="muted">暂无角色图像（请在 characters.json 里为该角色添加 image 字段）</div>`;
  }

  const safeSrc = escapeHtml(c.image);

  // onerror: 图片加载失败时替换成提示文字
  return `
    <img
      src="${safeSrc}"
      alt="${escapeHtml(c.name)}"
      loading="lazy"
      style="width:100%;border-radius:12px;margin-top:10px;display:block;"
      onerror="this.outerHTML='<div class=&quot;muted&quot; style=&quot;margin-top:10px;&quot;>角色图像加载失败：请检查路径是否正确（当前：${safeSrc}）</div>'"
    />
  `;
}

function renderDetail(c) {
  document.title = `${c.name} - 角色详情`;
  subtitleEl.textContent = `${c.id} · ${c.camp}`;

  const imageBlock = renderImageBlock(c);
  const promptText = escapeHtml(c.image_prompt || "（暂无 image_prompt）");

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
        ${imageBlock}

        <div class="panel__title" style="margin-top:16px;">图像生成提示词</div>
        <div class="muted" style="font-size:12px; line-height:1.6;">
          你可以把下面的 prompt 复制到任意绘图模型里生成角色立绘。
        </div>

        <div style="height:10px"></div>
        <div class="mono" style="white-space:pre-wrap; line-height:1.55;">
${promptText}
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

    const c = Array.isArray(data) ? data.find((x) => x.id === id) : null;

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
