// character.js - 角色详情页（暗黑奇幻风格）
const DATA_URL = "characters.json";

const detailEl = document.getElementById("detail");
const detailNav = document.getElementById("detailNav");
const notFoundEl = document.getElementById("notFound");
const subtitleEl = document.getElementById("subtitle");
const detailArt = document.getElementById("detailArt");
const detailTitle = document.getElementById("detailTitle");
const detailSubtitle = document.getElementById("detailSubtitle");
const detailAttrs = document.getElementById("detailAttrs");
const detailSkills = document.getElementById("detailSkills");
const detailDesc = document.getElementById("detailDesc");
const relatedGrid = document.getElementById("relatedGrid");

// 职业对应示例技能（无 JSON 时使用）
const DEFAULT_SKILLS = {
  "骑士": [
    { name: "破晓冲锋", desc: "向目标发起冲锋，造成物理伤害并短暂击退。", icon: "⚔️" },
    { name: "铁壁", desc: "架起盾牌，大幅提升防御并反弹部分伤害。" }
  ],
  "法师": [
    { name: "星辉术", desc: "召唤星辉对范围内敌人造成法术伤害。" },
    { name: "护盾术", desc: "为友方施加魔法护盾，吸收一定伤害。" }
  ],
  "刺客": [
    { name: "暗影打击", desc: "传送到敌人身后进行致命一击。" },
    { name: "沉默之刃", desc: "投掷淬毒匕首，造成流血效果。" }
  ],
  "战士": [
    { name: "裂地斩", desc: "重击地面，对前方敌人造成范围伤害。" },
    { name: "战吼", desc: "提升自身与附近友军的攻击力。" }
  ],
  "牧师": [
    { name: "圣疗", desc: "恢复目标生命值并驱散部分负面效果。" },
    { name: "祝福", desc: "为友方施加增益，提升抗性。" }
  ],
  "术士": [
    { name: "暗影箭", desc: "发射暗影能量，对目标造成持续伤害。" },
    { name: "契约召唤", desc: "召唤契约生物协助作战。" }
  ]
};

const JOB_ICONS = { "骑士": "⚔️", "法师": "🔮", "刺客": "🗡️", "战士": "🪓", "牧师": "✝️", "术士": "📜" };

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getIdFromUrl() {
  return new URLSearchParams(location.search).get("id");
}

function getSkills(c) {
  if (Array.isArray(c.skills) && c.skills.length) return c.skills;
  const def = DEFAULT_SKILLS[c.job];
  if (def) return def.map(s => ({ name: s.name, desc: s.desc, icon: s.icon || JOB_ICONS[c.job] || "◆" }));
  return [
    { name: "技能一", desc: "角色专属技能描述。", icon: "◆" },
    { name: "技能二", desc: "可在 characters.json 中为角色添加 skills 数组。", icon: "◆" }
  ];
}

function getSubtitle(c) {
  if (c.subtitle) return c.subtitle;
  return [c.rarity, c.job].filter(Boolean).join(" · ");
}

function getRelated(all, current, limit) {
  const others = all.filter(x => x.id !== current.id);
  const byCamp = others.filter(x => x.camp === current.camp);
  const byJob = others.filter(x => x.job === current.job);
  const pool = [...byCamp, ...byJob];
  const seen = new Set();
  const out = [];
  for (const c of pool) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    out.push(c);
    if (out.length >= limit) break;
  }
  while (out.length < limit && others.length) {
    const r = others[Math.floor(Math.random() * others.length)];
    if (!seen.has(r.id)) { seen.add(r.id); out.push(r); }
  }
  return out.slice(0, limit);
}

const DEFAULT_PORTRAIT = "images/default.png";

function portraitContent(c) {
  const src = c.image || DEFAULT_PORTRAIT;
  return `<img src="${escapeHtml(src)}" alt="" />`;
}

function renderDetail(c, allCharacters) {
  document.title = `${c.name} - 角色详情`;
  subtitleEl.textContent = `${c.id} · ${escapeHtml(c.camp)}`;

  detailArt.innerHTML = portraitContent(c);
  detailTitle.textContent = c.name;
  detailSubtitle.textContent = getSubtitle(c);

  const isSSR = String(c.rarity || "").toUpperCase() === "SSR";
  detailAttrs.innerHTML = `
    <div class="detail__attr">
      <span class="detail__attr-label">Race</span>
      <span class="detail__attr-value">${escapeHtml(c.race)}</span>
    </div>
    <div class="detail__attr">
      <span class="detail__attr-label">Faction</span>
      <span class="detail__attr-value">${escapeHtml(c.camp)}</span>
    </div>
    <div class="detail__attr">
      <span class="detail__attr-label">Class</span>
      <span class="detail__attr-value">${escapeHtml(c.job)}</span>
    </div>
    <div class="detail__attr">
      <span class="detail__attr-label">Rarity</span>
      <span class="detail__attr-value ${isSSR ? "rarity-ssr" : ""}">${escapeHtml(c.rarity)}</span>
    </div>
  `;

  const skills = getSkills(c);
  detailSkills.innerHTML = skills.map(s => `
    <div class="skill-card">
      <div class="skill-card__icon" aria-hidden="true">${escapeHtml(s.icon || "◆")}</div>
      <div>
        <div class="skill-card__name">${escapeHtml(s.name)}</div>
        <div class="skill-card__desc">${escapeHtml(s.desc)}</div>
      </div>
    </div>
  `).join("");

  detailDesc.textContent = c.desc || "（暂无背景描述）";

  const related = getRelated(allCharacters, c, 3);
  relatedGrid.innerHTML = related.map(r => {
    const name = escapeHtml(r.name);
    const portraitSrc = r.image || DEFAULT_PORTRAIT;
    const portrait = `<img src="${escapeHtml(portraitSrc)}" alt="" loading="lazy" />`;
    return `
      <a class="related-card" href="character.html?id=${encodeURIComponent(r.id)}">
        <div class="related-card__portrait">${portrait}</div>
        <div class="related-card__name">${name}</div>
      </a>
    `;
  }).join("");

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
    let all = [];
    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        all = Array.isArray(data) ? data : [];
      }
    } catch (_) {}
    if (!all.length && typeof window.CHARACTERS_DATA !== "undefined" && Array.isArray(window.CHARACTERS_DATA))
      all = window.CHARACTERS_DATA;
    const c = all.find(x => x.id === id);

    if (!c) {
      subtitleEl.textContent = all.length ? `未找到：${id}` : "数据加载失败";
      detailEl.hidden = true;
      notFoundEl.hidden = false;
      if (!all.length) {
        notFoundEl.querySelector(".empty__title").textContent = "数据加载失败";
        notFoundEl.querySelector(".empty__desc").textContent = "请通过本地服务器打开（如 npx serve）或部署到 GitHub Pages 后访问。";
      }
      return;
    }

    renderDetail(c, all);
  } catch (err) {
    console.error(err);
    subtitleEl.textContent = "加载失败";
    detailEl.hidden = true;
    notFoundEl.hidden = false;
  }
}

init();
