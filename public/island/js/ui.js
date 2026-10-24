// DOM 介面：清單、卡片、HUD、導覽說明、影片、手機底部抽屜
import { TAGS, SOURCES } from "./data.js";
import { escapeHTML as h, store } from "./util.js";
import { RAINBOW } from "./models.js";
import { ROLE_LABEL, CARRY_LABEL } from "./people.js";

const CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩";
export const circled = (i) => CIRCLED[i] || String(i + 1);
const srcText = (ids) => (Array.isArray(ids) ? ids : [ids]).map((s) => SOURCES[s] || s).join("、");
export const pinColor = (isl, i) => (isl.rainbow ? "#" + RAINBOW[i % RAINBOW.length].toString(16).padStart(6, "0") : isl.color);

export function createUI(app, D, { isMobile, onePanel }) {
  const $ = (id) => document.getElementById(id);
  const body = document.body;
  const card = $("card"), cardContent = $("card-content");
  const sidebar = $("sidebar"), tree = $("tree"), search = $("search");
  const islands = D.islands;
  const byId = new Map(islands.map((i) => [i.id, i]));
  const itemIndex = new Map();
  islands.forEach((isl) => isl.items.forEach((it, i) => itemIndex.set(it.id, { isl, it, i })));
  const flowsOf = (id) => D.flows.filter((f) => f.from === id || (Array.isArray(f.to) ? f.to.includes(id) : f.to === id));
  const nameOf = (id) => byId.get(id)?.short || id;
  let tab = "policies";
  let selected = { island: null, item: null, flow: null };

  const totalItems = islands.reduce((s, i) => s + i.items.length, 0);
  $("side-sub").innerHTML = `6 大政策 ／ ${totalItems} 個細項 ／ ${D.flows.length} 條串聯<br>選一座島，走進它的城市風景。`;

  // ---------- 清單 ----------
  function hl(text, q) {
    const t = h(text);
    if (!q) return t;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return t;
    return h(text.slice(0, i)) + "<mark>" + h(text.slice(i, i + q.length)) + "</mark>" + h(text.slice(i + q.length));
  }
  const matches = (q, ...fields) => !q || fields.some((f) => (Array.isArray(f) ? f.join(" ") : String(f || "")).toLowerCase().includes(q.toLowerCase()));

  function renderTree() {
    const q = search.value.trim();
    if (tab === "flows") {
      const list = D.flows.filter((f) => matches(q, f.text, f.quote, nameOf(f.from), Array.isArray(f.to) ? f.to.map(nameOf) : nameOf(f.to)));
      tree.innerHTML = list.length
        ? list.map((f) => {
            const tos = Array.isArray(f.to) ? f.to : [f.to];
            const fromI = byId.get(f.from);
            return `<button class="t-flow" type="button" data-flow="${f.id}" style="--c:${fromI.color}">
              <div class="route"><span class="chip" style="--c:${fromI.color}"><i></i>${h(fromI.short)}</span>${f.both ? "⇄" : "→"}${tos.map((t) => `<span class="chip" style="--c:${byId.get(t).color}"><i></i>${h(byId.get(t).short)}</span>`).join("")}</div>
              <p>${hl(f.text, q)}</p></button>`;
          }).join("")
        : `<div class="t-empty">找不到相關的串聯關係</div>`;
      return;
    }
    const html = [];
    for (const isl of islands) {
      const items = isl.items.map((it, i) => ({ it, i })).filter(({ it }) => matches(q, it.name, it.facts, it.body, it.list || []));
      const islHit = matches(q, isl.title, isl.policy, isl.short, isl.lead);
      if (q && !items.length && !islHit) continue;
      const open = q ? true : selected.island === isl.id;
      html.push(`<details class="t-isl${selected.island === isl.id ? " sel" : ""}" data-island="${isl.id}" style="--c:${isl.color};--t:${isl.tint}" ${open ? "open" : ""}>
        <summary data-pick="${isl.id}"><span class="t-num">${isl.num || isl.badge}</span><span class="t-name"><b>${hl(isl.policy, q)}</b><small>${hl(isl.title, q)}</small></span><span class="t-count">${isl.items.length} 項 ↗</span></summary>
        <ul class="t-items">${(q ? items : isl.items.map((it, i) => ({ it, i }))).map(({ it, i }) => `<li><button type="button" data-item="${it.id}" class="${selected.item === it.id ? "sel" : ""}" style="--c:${pinColor(isl, i)}"><i>${i + 1}</i><span>${hl(it.name, q)}</span></button></li>`).join("")}</ul>
      </details>`);
    }
    tree.innerHTML = html.join("") || `<div class="t-empty">找不到「${h(q)}」，換個關鍵字試試</div>`;
  }
  tree.addEventListener("click", (e) => {
    const flow = e.target.closest("[data-flow]");
    if (flow) return app.selectFlow(flow.dataset.flow);
    const item = e.target.closest("[data-item]");
    if (item) return app.selectItem(item.dataset.item);
    const pick = e.target.closest("summary[data-pick]");
    if (pick) {
      e.preventDefault();
      app.selectIsland(pick.dataset.pick);
    }
  });
  search.addEventListener("input", renderTree);
  $("tab-policies").onclick = () => setTab("policies");
  $("tab-flows").onclick = () => setTab("flows");
  function setTab(t) {
    tab = t;
    $("tab-policies").classList.toggle("active", t === "policies");
    $("tab-flows").classList.toggle("active", t === "flows");
    $("tab-policies").setAttribute("aria-selected", t === "policies");
    $("tab-flows").setAttribute("aria-selected", t === "flows");
    renderTree();
  }

  // ---------- 卡片 ----------
  function open(html, style) {
    cardContent.innerHTML = html;
    card.setAttribute("style", style || "");
    card.hidden = false;
    card.classList.remove("full");
    body.classList.add("has-card");
    cardContent.scrollTop = 0;
    if (onePanel()) closeList(true);
    app.layoutChanged();
  }
  function hideCard() {
    if (card.hidden) return;
    card.hidden = true;
    body.classList.remove("has-card");
    app.layoutChanged();
  }
  $("card-close").onclick = () => app.closeCard();

  const tagHTML = (key) => {
    const t = TAGS[key];
    return t ? `<span class="tag ${t.tone}">${h(t.label)}</span>` : "";
  };
  const videoHTML = (isl) => {
    if (isl.video) {
      return `<button class="video-card" type="button" data-video="${isl.id}" aria-label="播放 ${h(isl.title)} 政策影片">
        <img src="${h(isl.video.poster)}" alt="" loading="lazy"><span class="play"><span>▶ 看政策影片</span></span></button>`;
    }
    return isl.id === "tainan" ? "" : `<div class="video-soon">🎬 ${h(isl.title)}的政策影片即將上線</div>`;
  };
  const flowChips = (isl) => {
    const fl = flowsOf(isl.id);
    if (!fl.length) return "";
    return `<div class="c-sec">和誰一起串聯</div><div class="chips">${fl.map((f) => {
      const other = f.from === isl.id ? (Array.isArray(f.to) ? "6 大政策" : nameOf(f.to)) : nameOf(f.from);
      const arrow = f.both ? "⇄" : f.from === isl.id ? "→" : "←";
      return `<button class="chip" type="button" data-flow="${f.id}" style="--c:${isl.color}"><i></i>${arrow} ${h(other)}｜${h(f.text)}</button>`;
    }).join("")}</div>`;
  };

  function showIsland(isl) {
    selected = { island: isl.id, item: null, flow: null };
    const n = isl.items.length;
    const fl = flowsOf(isl.id).length;
    const facets = isl.facets ? `<div class="chips">${isl.facets.map((f) => `<span class="chip" style="--c:${isl.color}"><i></i>${h(f)}</span>`).join("")}</div>` : "";
    open(`
      <div class="c-head"><div class="c-badge" style="--c:${isl.color};--t:${isl.tint}">${isl.num || isl.badge}</div>
        <div><div class="eyebrow">${isl.num ? "POLICY " + isl.num : "ONE TAINAN"} · ${h(isl.policy)}</div><h2 class="c-title">${h(isl.title)}</h2></div></div>
      <p class="c-lead">${h(isl.lead)}</p>
      ${isl.sub ? `<p class="c-sub">${h(isl.sub)}</p>` : ""}
      ${facets}
      <blockquote class="c-quote">「${h(isl.quote)}」<cite>— ${h(SOURCES[isl.source] || "")}</cite></blockquote>
      <div class="chips"><span class="chip">${n} 個細項</span><span class="chip">${fl} 條串聯</span></div>
      ${isl.note ? `<p class="c-note">${h(isl.note)}</p>` : ""}
      ${videoHTML(isl)}
      <div class="c-sec">政策細項</div>
      <ul class="c-items">${isl.items.map((it, i) => `<li><button type="button" data-item="${it.id}" style="--pc:${pinColor(isl, i)}"><span class="n">${i + 1}</span><span class="nm">${h(it.name)}</span>${it.tag ? tagHTML(it.tag) : ""}</button></li>`).join("")}</ul>
      ${flowChips(isl)}
      <p class="c-src">依據：${h(srcText([...new Set(isl.items.flatMap((it) => it.src))]))}</p>
    `, `--c:${isl.color};--t:${isl.tint}`);
    renderTree();
  }

  function showItem(id) {
    const ref = itemIndex.get(id);
    if (!ref) return;
    const { isl, it, i } = ref;
    selected = { island: isl.id, item: it.id, flow: null };
    const pc = pinColor(isl, i);
    const prev = isl.items[i - 1], next = isl.items[i + 1];
    open(`
      <div class="c-head"><div class="c-badge round" style="--c:${pc}">${i + 1}</div>
        <div><div class="eyebrow">${isl.num ? isl.num + " " : ""}${h(isl.short)} · 細項 ${circled(i)}</div><h2 class="c-title">${h(it.name)}</h2></div></div>
      ${it.tag ? `<div class="chips">${tagHTML(it.tag)}</div>` : ""}
      <div class="facts">${it.facts.map((f, k) => `<div class="fact" style="--c:${pc};--t:${isl.tint}"><b>${k + 1}</b><span>${h(f)}</span></div>`).join("")}</div>
      <p class="c-body">${h(it.body)}</p>
      ${it.list ? `<div class="c-list"><h4>${h(it.listTitle || "清單")}</h4><ol>${it.list.map((x) => `<li>${h(x)}</li>`).join("")}</ol></div>` : ""}
      <p class="c-src">依據：${h(srcText(it.src))}</p>
      <div class="c-nav">
        <button type="button" data-item="${prev ? prev.id : ""}" ${prev ? "" : "disabled"}>← 上一項</button>
        <button type="button" data-pick="${isl.id}">${h(isl.short)}島</button>
        <button type="button" data-item="${next ? next.id : ""}" ${next ? "" : "disabled"}>下一項 →</button>
      </div>
    `, `--c:${isl.color};--t:${isl.tint}`);
    renderTree();
  }

  function showFlow(f) {
    selected = { island: null, item: null, flow: f.id };
    const fromI = byId.get(f.from);
    const tos = Array.isArray(f.to) ? f.to : [f.to];
    open(`
      <div class="c-head"><div class="c-badge" style="--c:${fromI.color};--t:${fromI.tint}">${f.id}</div>
        <div><div class="eyebrow">串聯線 · ${f.basis === "explicit" ? "新聞稿原文" : "政策主題串聯"}</div><h2 class="c-title">${h(f.text)}</h2></div></div>
      <div class="route-row"><button class="chip" type="button" data-pick="${fromI.id}" style="--c:${fromI.color}"><i></i>${h(fromI.short)}</button>${f.both ? "⇄" : "→"}${tos.map((t) => `<button class="chip" type="button" data-pick="${t}" style="--c:${byId.get(t).color}"><i></i>${h(byId.get(t).short)}</button>`).join("")}</div>
      <blockquote class="c-quote">${h(f.quote)}<cite>— ${h(SOURCES[f.src] || "")}</cite></blockquote>
      <div class="chips"><span class="chip">走在線上：${h(ROLE_LABEL[f.walker] || "市民")}</span><span class="chip">搬運：${h(CARRY_LABEL[f.carry] || "—")}</span></div>
      <p class="c-src">實線＝新聞稿原文直接寫到的串聯；虛線＝依政策主題整理的串聯。</p>
    `, `--c:${fromI.color};--t:${fromI.tint}`);
    renderTree();
  }

  function showCharacter(kind) {
    selected = { island: null, item: null, flow: null };
    if (kind === "sister") {
      const isl = byId.get("sister");
      open(`
        <img class="c-fig" src="./img/sister-main.jpg" alt="抱著小熊的 Q 版姐姐妃妃" width="96">
        <div class="eyebrow">CHARACTER · 06 姐姐</div><h2 class="c-title">姐姐妃妃市長</h2>
        <p class="c-lead" style="--c:${isl.color}">${h(isl.lead)}</p>
        <p class="c-sub">${h(isl.sub)}</p>
        <div class="c-nav"><button type="button" data-pick="sister">走進姐姐島 →</button></div>
      `, `--c:${isl.color};--t:${isl.tint}`);
    } else {
      open(`
        <img class="c-fig" src="./img/feifei-bike.jpg" alt="騎單車的 Q 版妃妃市長" width="96">
        <div class="eyebrow">CHARACTER · 妃妃市長</div><h2 class="c-title">騎單車巡島的妃妃市長</h2>
        <p class="c-lead" style="--c:#176b38">綠色・陽光・行動力・台南的未來・一起騎出來！</p>
        <p class="c-sub">她正沿著步道與跨溪大橋，一座一座騎過 7 座政策島，就像持續走遍台南 37 區。</p>
        <div class="c-nav"><button type="button" data-pick="tainan">從大台南出發 →</button></div>
        <p class="c-src"><a href="/">回到 6 大政策影片 →</a></p>
      `, "--c:#176b38;--t:#eaf3ec");
    }
  }

  function showWalker(w) {
    if (!w.flow) return;
    const f = w.flow;
    open(`
      <div class="eyebrow">CITIZEN · ${h(ROLE_LABEL[w.role] || "市民")}</div>
      <h2 class="c-title">正在搬運：${h(CARRY_LABEL[w.carry] || "—")}</h2>
      <p class="c-lead" style="--c:${byId.get(f.from).color}">${h(f.text)}</p>
      <div class="c-nav"><button type="button" data-flow="${f.id}">看這條串聯線 →</button></div>
    `, `--c:${byId.get(f.from).color};--t:${byId.get(f.from).tint}`);
  }

  cardContent.addEventListener("click", (e) => {
    const v = e.target.closest("[data-video]");
    if (v) return openVideo(byId.get(v.dataset.video));
    const it = e.target.closest("[data-item]");
    if (it && it.dataset.item) return app.selectItem(it.dataset.item);
    const fl = e.target.closest("[data-flow]");
    if (fl) return app.selectFlow(fl.dataset.flow);
    const pk = e.target.closest("[data-pick]");
    if (pk) return app.selectIsland(pk.dataset.pick);
  });

  // ---------- 影片 ----------
  const video = $("video"), frame = $("video-frame");
  function openVideo(isl) {
    if (!isl?.video) return;
    $("video-title").textContent = `${isl.title}｜${isl.policy}`;
    const id = encodeURIComponent(isl.video.youtubeId);
    frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1&modestbranding=1" title="${h(isl.title)} 政策影片" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    $("video-link").href = `https://www.youtube.com/watch?v=${id}`;
    video.hidden = false;
    app.pauseForModal(true);
  }
  function closeVideo() {
    if (video.hidden) return;
    frame.innerHTML = "";
    video.hidden = true;
    app.pauseForModal(false);
  }
  $("video-close").onclick = closeVideo;
  video.addEventListener("click", (e) => { if (e.target === video) closeVideo(); });

  // ---------- 側欄開合 ----------
  function openList() {
    body.classList.remove("side-closed");
    $("btn-list").setAttribute("aria-pressed", "true");
    if (onePanel()) hideCard();
    if (isMobile()) setTime(false);
    app.layoutChanged();
  }
  function closeList(silent) {
    body.classList.add("side-closed");
    sidebar.classList.remove("full");
    $("btn-list").setAttribute("aria-pressed", "false");
    if (!silent) app.layoutChanged();
  }
  $("btn-list").onclick = () => (body.classList.contains("side-closed") ? openList() : closeList());
  $("side-close").onclick = () => closeList();

  // ---------- 手機：時間面板 ----------
  function setTime(on) {
    body.classList.toggle("m-time", on);
    $("btn-time").setAttribute("aria-pressed", on ? "true" : "false");
    if (on && isMobile()) { hideCard(); closeList(true); }
    app.layoutChanged();
  }
  $("btn-time").onclick = () => setTime(!body.classList.contains("m-time"));

  // ---------- 底部抽屜拖曳 ----------
  function dragSheet(handle, sheet, onDown) {
    let y0 = 0, moved = 0, dragging = false;
    handle.addEventListener("pointerdown", (e) => {
      dragging = true; y0 = e.clientY; moved = 0;
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      moved = e.clientY - y0;
    });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      if (Math.abs(moved) < 8) sheet.classList.toggle("full");
      else if (moved < -30) sheet.classList.add("full");
      else if (moved > 30) {
        if (sheet.classList.contains("full")) sheet.classList.remove("full");
        else onDown();
      }
      app.layoutChanged();
    };
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  }
  dragSheet($("card-handle"), card, () => app.closeCard());
  dragSheet($("sheet-handle"), sidebar, () => closeList());

  // ---------- HUD ----------
  const hud = $("hud");
  hud.addEventListener("click", (e) => {
    const t = e.target.closest("[data-time]");
    if (t) return app.setTime(Number(t.dataset.time));
    const g = e.target.closest("[data-toggle]");
    if (g) app.toggle(g.dataset.toggle);
  });
  function setToggle(name, on) {
    const b = hud.querySelector(`[data-toggle="${name}"]`);
    if (b) b.setAttribute("aria-pressed", on ? "true" : "false");
  }
  function setTimeButtons(min) {
    const segs = [[300, 600, 360], [600, 1020, 720], [1020, 1170, 1080]];
    let on = 1260;
    for (const [a, b, v] of segs) if (min >= a && min < b) on = v;
    hud.querySelectorAll("[data-time]").forEach((b) => b.classList.toggle("on", Number(b.dataset.time) === on));
  }
  function setDay(clock, label) {
    $("clock").textContent = clock;
    $("day-label").textContent = label;
  }

  // ---------- 導覽說明（第一次進入） ----------
  const STEPS = [
    { title: "每座島是一項政策", text: "中央是「一個大台南」，周圍 6 座島是科技、農漁、觀光、福利、交通與姐姐市長。曾文溪把島群分成溪北與溪南。", fig: "./img/feifei-stand.jpg" },
    { title: "點一座島，看細項", text: "點島或用右側清單，就能看到每項政策的細項、依據與政策影片；①②③ 是島上的細項。", fig: "./img/feifei-bike.jpg" },
    { title: "看見政策怎麼串聯", text: "打開「串聯線」，小人會沿著線搬運，告訴你交通怎麼帶動觀光、科技怎麼帶動農業。", fig: "./img/sister-main.jpg" },
  ];
  let step = 0;
  const intro = $("intro");
  function renderStep() {
    const s = STEPS[step];
    $("intro-count").textContent = `HELLO, TAINAN / 0${step + 1}`;
    $("intro-title").textContent = s.title;
    $("intro-text").textContent = s.text;
    $("intro-fig").src = s.fig;
    $("intro-next").textContent = step < STEPS.length - 1 ? "下一步 →" : "開始探索";
  }
  function showIntro() {
    step = 0;
    renderStep();
    intro.hidden = false;
    $("intro-next").focus({ preventScroll: true });
  }
  function closeIntro() {
    intro.hidden = true;
    store.set("feifei-island:intro:v1", true);
  }
  $("intro-next").onclick = () => {
    if (step < STEPS.length - 1) { step++; renderStep(); } else closeIntro();
  };
  $("intro-skip").onclick = closeIntro;
  $("btn-help").onclick = showIntro;

  // ---------- 導覽 ----------
  function setTour(on, text, count) {
    $("tour-caption").hidden = !on;
    body.classList.toggle("touring", on);
    $("btn-tour").setAttribute("aria-pressed", on ? "true" : "false");
    if (on) {
      $("tour-text").textContent = text || "";
      $("tour-count").textContent = count || "";
    }
  }
  $("btn-tour").onclick = () => app.toggleTour();
  $("tour-stop").onclick = () => app.toggleTour(false);
  $("btn-home").onclick = () => app.home();
  $("btn-zoom-in").onclick = () => app.zoom(0.78);
  $("btn-zoom-out").onclick = () => app.zoom(1.28);
  $("mascot").onclick = () => app.selectCharacter("feifei");

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!video.hidden) return closeVideo();
      if (!intro.hidden) return closeIntro();
      app.closeCard();
    }
  });

  if (onePanel()) body.classList.add("side-closed");
  renderTree();

  return {
    showIsland, showItem, showFlow, showCharacter, showWalker, hideCard,
    openList, closeList, setToggle, setTimeButtons, setDay, setTour, showIntro,
    get introSeen() { return store.get("feifei-island:intro:v1", false); },
    get modalOpen() { return !video.hidden || !intro.hidden; },
    clearSelection() { selected = { island: null, item: null, flow: null }; renderTree(); },
    panelRects() {
      const rects = [];
      for (const el of [card, sidebar, $("hud"), $("tour-caption"), document.querySelector(".toolbar"), document.querySelector(".zoom"), document.querySelector(".brand"), $("mascot"), $("legend")]) {
        if (!el || el.hidden) continue;
        if (el === sidebar && body.classList.contains("side-closed")) continue;
        if (el.id === "hud" && isMobile() && !body.classList.contains("m-time")) continue;
        if (getComputedStyle(el).opacity === "0" || getComputedStyle(el).display === "none") continue;
        const r = el.getBoundingClientRect();
        if (r.width && r.height) rects.push(r);
      }
      return rects;
    },
  };
}
