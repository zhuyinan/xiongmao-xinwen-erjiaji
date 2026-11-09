/* 健健康康的新闻 · 画布布局 + 互动逻辑（全部离线运行） */
(function () {
  "use strict";
  var W = 1920, H = 1080;
  var LITE = document.documentElement.classList.contains("m-lite");
  var geo = {};
  function $(id) { return document.getElementById(id); }

  function place(id, x, y, rot, scale) {
    geo[id] = { x: x, y: y, rot: rot, scale: scale };
    var el = $(id);
    el.setAttribute("data-x", x.toFixed(4));
    el.setAttribute("data-y", y.toFixed(4));
    el.setAttribute("data-rotate", rot.toFixed(3));
    el.setAttribute("data-scale", scale.toPrecision(6));
  }

  // 扁平星座布局：总览远景，新闻站环绕
  place("overview", 0, -200, 0, 3.6);
  place("what", -2200, -900, -4, 1);
  place("journey", 0, -1100, 2, 1);
  place("plane", 2200, -900, 4, 1);
  place("knowledge", -2200, 200, -3, 1);
  place("friendship", 0, 100, 0, 1);
  place("daofa", 2200, 200, 3, 1);
  place("quiz", -2200, 1400, 4, 1);
  place("game", 2200, 1400, -4, 1);
  place("ending", 0, -200, 0, 3.6);

  // ---------- 星空 ----------
  var themeColor = { space: [140, 220, 255], pc: [150, 255, 170], mobile: [110, 180, 255], ai: [200, 140, 255], future: [255, 215, 130] };
  var curColor = [140, 220, 255], tgtColor = [140, 220, 255];
  var stars = [], sc = $("stars"), sctx = sc.getContext("2d"), warpUntil = 0, dpr = LITE ? 1 : Math.min(window.devicePixelRatio || 1, 2);
  var fxc = $("fx"), fctx = fxc.getContext("2d"), parts = [], fxDirty = true;
  function resize() {
    var w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
    if (sc.width !== w || sc.height !== h) { sc.width = w; sc.height = h; }
    if (fxc.width !== w || fxc.height !== h) { fxc.width = w; fxc.height = h; fxDirty = true; }
  }
  for (var i = 0; i < (LITE ? 150 : 420); i++) stars.push({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random(), tw: Math.random() * 6.28 });
  function drawStars(t) {
    var w = sc.width, h = sc.height, cx = w / 2, cy = h / 2;
    for (var k = 0; k < 3; k++) curColor[k] += (tgtColor[k] - curColor[k]) * 0.03;
    var warp = performance.now() < warpUntil;
    sctx.fillStyle = warp ? "rgba(2,3,10,0.35)" : "rgba(0,0,0,1)";
    if (warp) sctx.fillRect(0, 0, w, h); else sctx.clearRect(0, 0, w, h);
    var c = curColor.map(function (v) { return v | 0; }).join(",");
    for (var j = 0; j < stars.length; j++) {
      var s = stars[j];
      s.z -= warp ? 0.012 : 0.0006;
      if (s.z <= 0.02) { s.z = 1; s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; }
      var px = cx + s.x / s.z * cx * 0.6, py = cy + s.y / s.z * cy * 0.6;
      if (px < 0 || px > w || py < 0 || py > h) { s.z = 1; continue; }
      var r = (1 - s.z) * 2.2 * dpr + 0.3, a = (1 - s.z) * (0.55 + 0.45 * Math.sin(t / 600 + s.tw));
      sctx.fillStyle = "rgba(" + c + "," + a.toFixed(3) + ")";
      sctx.beginPath(); sctx.arc(px, py, r, 0, 6.283); sctx.fill();
    }
  }
  var PAL = ["#7fe9ff", "#ffd36b", "#c79bff", "#5dffb0", "#ff8fb1", "#ffffff"];
  function burst(x, y, n, spread) {
    x *= dpr; y *= dpr;
    for (var i = 0; i < n; i++) {
      var a = Math.random() * 6.283, v = (Math.random() * 9 + 3) * dpr * (spread || 1);
      parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 3 * dpr, life: 1, size: (Math.random() * 5 + 3) * dpr, c: PAL[i % PAL.length], rot: Math.random() * 6, conf: false });
    }
  }
  function confetti(n) {
    for (var i = 0; i < n; i++) {
      parts.push({ x: Math.random() * fxc.width, y: -Math.random() * fxc.height * 0.6, vx: (Math.random() - 0.5) * 3 * dpr, vy: (Math.random() * 3 + 2) * dpr,
        life: 1.6, size: (Math.random() * 8 + 6) * dpr, c: PAL[i % PAL.length], rot: Math.random() * 6, conf: true });
    }
  }
  function drawFx() {
    if (!parts.length && !fxDirty) return;
    fxDirty = parts.length > 0;
    fctx.clearRect(0, 0, fxc.width, fxc.height);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.conf) { p.vy += 0.03 * dpr; p.life -= 0.004; p.rot += 0.08; p.vx += Math.sin(p.y / 40) * 0.05; }
      else { p.vy += 0.25 * dpr; p.vx *= 0.98; p.life -= 0.018; }
      if (p.life <= 0 || p.y > fxc.height + 50) { parts.splice(i, 1); continue; }
      fctx.globalAlpha = Math.min(1, p.life);
      fctx.fillStyle = p.c;
      fctx.save(); fctx.translate(p.x, p.y); fctx.rotate(p.rot);
      if (p.conf) fctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      else { fctx.beginPath(); fctx.arc(0, 0, p.size / 2, 0, 6.283); fctx.fill(); }
      fctx.restore();
    }
    fctx.globalAlpha = 1;
  }
  var paused = false;
  function loop(t) { if (!paused) { drawStars(t); drawFx(); if (LITE) flyCull(); } requestAnimationFrame(loop); }
  var LIMIT = 8000, lastR = 0, rootEl = $("impress");
  function rootScale() {
    var m = getComputedStyle(rootEl).transform;
    if (!m || m === "none") return 0;
    var v = m.slice(m.indexOf("(") + 1, -1).split(",");
    return Math.sqrt(+v[0] * +v[0] + +v[1] * +v[1]);
  }
  function flyCull() {
    var R = rootScale(); if (!R || Math.abs(R - lastR) < 1e-9) return; lastR = R;
    var k = W * R * (window.devicePixelRatio || 1);
    for (var i = 0; i < allSteps.length; i++) {
      var st = allSteps[i];
      st.classList.toggle("big", k * geo[st.id].scale > LIMIT);
    }
  }
  document.addEventListener("visibilitychange", function () { paused = document.hidden; });
  function centerOf(el) { var r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
  function shake(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }

  // ---------- 提问闯关 ----------
  var QUIZ = [
    { q: "健健和康康是从哪里坐飞机去成都的？", o: ["美国", "澳门", "日本", "非洲"], a: 1, hint: "提示：它们在祖国的特别行政区出生、长大。" },
    { q: "它们大约在澳门生活了多少年？", o: ["1年", "3年", "大约10年", "20年"], a: 2, hint: "提示：2016年出生，2026年启程。" },
    { q: "它们为什么去成都？", o: ["去看电影", "步入成年，去学习成长", "去买竹子", "去旅游拍照"], a: 1, hint: "提示：它们满10岁了，要开始下一阶段成长。" },
    { q: "到成都后，它们会先住进哪里学习？", o: ["普通动物园随便逛", "先检疫，再入住星云馆", "立刻回澳门", "住进商场"], a: 1, hint: "提示：新家叫「星云馆」，像自然森林。" }
  ];
  var PRAISE = ["太棒了！", "爱心达人！", "答对啦！", "真仔细！"];
  var qi = 0, firstTry = true, score = 0, answered = false;
  function renderLocks() {
    var h = "";
    for (var i = 0; i < QUIZ.length; i++) h += '<span class="' + (i < qi || (i === qi && answered) ? "done" : (i === qi ? "cur" : "")) + '">' + (i + 1) + "</span>";
    $("q-locks").innerHTML = h;
  }
  function renderQ() {
    var Q = QUIZ[qi]; answered = false; firstTry = true;
    $("q-text").textContent = "第" + (qi + 1) + "关：" + Q.q;
    var box = $("q-opts"); box.innerHTML = "";
    Q.o.forEach(function (t, k) {
      var b = document.createElement("button");
      b.className = "opt"; b.tabIndex = -1;
      b.innerHTML = '<span class="k">' + "ABCD"[k] + "</span>" + t;
      b.addEventListener("click", function (e) { e.stopPropagation(); b.blur(); choose(k, b); });
      box.appendChild(b);
    });
    $("q-msg").className = "q-msg"; $("q-msg").textContent = "点击选项作答";
    $("q-next").classList.add("hidden");
    renderLocks();
  }
  function choose(k, b) {
    if (answered || b.classList.contains("wrong")) return;
    var Q = QUIZ[qi];
    if (k === Q.a) {
      answered = true; if (firstTry) score++;
      b.classList.add("right");
      var c = centerOf(b); burst(c[0], c[1], 90, 1);
      $("q-msg").className = "q-msg"; $("q-msg").textContent = PRAISE[qi % PRAISE.length];
      $("q-next").textContent = qi < QUIZ.length - 1 ? "解锁下一关 ▸" : "查看成绩 ▸";
      $("q-next").classList.remove("hidden");
      renderLocks();
    } else {
      firstTry = false;
      b.classList.add("wrong"); shake(b);
      $("q-msg").className = "q-msg bad"; $("q-msg").textContent = "再想想～ " + Q.hint;
    }
  }
  $("q-next").addEventListener("click", function (e) {
    e.stopPropagation(); this.blur();
    if (!answered) return;
    qi++;
    if (qi >= QUIZ.length) {
      $("quiz").classList.add("finished");
      $("q-score").textContent = "首次答对 " + score + " / " + QUIZ.length + " 关 · 爱心小卫士 ✓";
      $("q-msg").className = "q-msg"; $("q-msg").textContent = "按 → 进入小游戏";
      $("q-next").classList.add("hidden"); $("q-restart").classList.remove("hidden");
      qi = QUIZ.length - 1; answered = true; renderLocks();
      confetti(220); var c = centerOf($("q-score")); burst(c[0], c[1], 120, 1.4);
      return;
    }
    renderQ();
  });
  function goNext(e) { e.stopPropagation(); this.blur(); impress().next(); }
  $("q-go").addEventListener("click", goNext);
  $("g-go").addEventListener("click", goNext);
  $("q-restart").addEventListener("click", function (e) {
    e.stopPropagation(); this.blur();
    qi = 0; score = 0; $("quiz").classList.remove("finished"); this.classList.add("hidden"); renderQ();
  });

  // ---------- 分类小游戏 ----------
  var ERAS = [
    { id: "animal", name: "爱护动物", yr: "对国宝温柔", c: "#a8ff9a" },
    { id: "eco", name: "保护生态", yr: "爱护家园", c: "#7fe9ff" },
    { id: "kind", name: "友善祝福", yr: "对人友好", c: "#ffd36b" }
  ];
  var ITEMS = [
    ["看熊猫不惊吓", "animal"], ["不乱投食", "animal"],
    ["垃圾分类", "eco"], ["爱护竹林小树", "eco"],
    ["送上祝福", "kind"], ["对人说谢谢", "kind"]
  ];
  var ERA_NAME = {}; ERAS.forEach(function (e) { ERA_NAME[e.id] = e.name; });
  var placed = 0;
  function buildGame() {
    var s = $("g-slots"); s.innerHTML = "";
    ERAS.forEach(function (e) {
      var d = document.createElement("div");
      d.className = "slot"; d.dataset.era = e.id; d.style.setProperty("--sc", e.c);
      d.innerHTML = '<div class="sh"><b>' + e.name + "</b><span>" + e.yr + '</span></div><div class="sb"></div>';
      s.appendChild(d);
    });
    var pool = $("g-pool"); pool.innerHTML = "";
    var order = ITEMS.slice().sort(function () { return Math.random() - 0.5; });
    order.forEach(function (it) {
      var c = document.createElement("div");
      c.className = "chip"; c.textContent = it[0]; c.dataset.era = it[1];
      c.addEventListener("pointerdown", startDrag);
      pool.appendChild(c);
    });
    placed = 0; updStat();
    tip("把下面的做法，拖到正确的篮子里", "");
  }
  function updStat() { $("g-stat").textContent = placed + " / " + ITEMS.length; }
  function tip(t, cls) { var g = $("g-tip"); g.textContent = t; g.className = "g-tip " + (cls || ""); }
  var drag = null;
  function startDrag(e) {
    var chip = e.currentTarget;
    if (chip.classList.contains("placed") || drag) return;
    e.preventDefault(); e.stopPropagation();
    var r = chip.getBoundingClientRect(), k = r.width / chip.offsetWidth;
    var g = chip.cloneNode(true);
    g.classList.add("ghost");
    g.style.width = chip.offsetWidth + "px"; g.style.height = chip.offsetHeight + "px";
    g.style.boxSizing = "border-box"; g.style.transform = "scale(" + k + ")";
    g.style.left = r.left + "px"; g.style.top = r.top + "px";
    document.body.appendChild(g);
    chip.classList.add("lifted");
    drag = { chip: chip, ghost: g, ox: e.clientX - r.left, oy: e.clientY - r.top, x0: r.left, y0: r.top, over: null };
    window.addEventListener("pointermove", moveDrag, true);
    window.addEventListener("pointerup", endDrag, true);
    window.addEventListener("pointercancel", endDrag, true);
  }
  function slotAt(x, y) {
    drag.ghost.style.display = "none";
    var el = document.elementFromPoint(x, y);
    drag.ghost.style.display = "";
    return el && el.closest ? el.closest(".slot") : null;
  }
  function moveDrag(e) {
    if (!drag) return;
    e.preventDefault();
    drag.ghost.style.left = (e.clientX - drag.ox) + "px";
    drag.ghost.style.top = (e.clientY - drag.oy) + "px";
    var s = slotAt(e.clientX, e.clientY);
    if (s !== drag.over) { if (drag.over) drag.over.classList.remove("over"); if (s) s.classList.add("over"); drag.over = s; }
  }
  function endDrag(e) {
    if (!drag) return;
    window.removeEventListener("pointermove", moveDrag, true);
    window.removeEventListener("pointerup", endDrag, true);
    window.removeEventListener("pointercancel", endDrag, true);
    var d = drag, s = slotAt(e.clientX, e.clientY);
    if (d.over) d.over.classList.remove("over");
    if (s && s.dataset.era === d.chip.dataset.era) {
      d.ghost.remove(); d.chip.classList.remove("lifted"); d.chip.classList.add("placed");
      s.querySelector(".sb").appendChild(d.chip);
      placed++; updStat();
      var c = centerOf(d.chip); burst(c[0], c[1], 40, 0.7);
      var full = s.querySelectorAll(".chip").length === ITEMS.filter(function (it) { return it[1] === s.dataset.era; }).length;
      if (full) s.classList.add("full");
      tip("放对了！" + d.chip.textContent + " 属于「" + ERA_NAME[s.dataset.era] + "」", "good");
      drag = null;
      if (placed === ITEMS.length) setTimeout(celebrate, 450);
    } else {
      if (s) { s.classList.add("bad"); setTimeout(function () { s.classList.remove("bad"); }, 600); tip("不对哦～「" + d.chip.textContent + "」不属于「" + ERA_NAME[s.dataset.era] + "」，再想想！", "bad"); }
      var g = d.ghost;
      g.style.transition = "left .35s ease, top .35s ease";
      g.style.left = d.x0 + "px"; g.style.top = d.y0 + "px";
      setTimeout(function () { g.remove(); d.chip.classList.remove("lifted"); if (s) shake(d.chip); }, 370);
      drag = null;
    }
  }
  function celebrate() {
    var o = $("celebrate"); o.classList.add("on");
    confetti(320); burst(innerWidth / 2, innerHeight / 2, 200, 1.8);
    setTimeout(function () { burst(innerWidth * 0.25, innerHeight * 0.4, 120, 1.3); }, 500);
    setTimeout(function () { burst(innerWidth * 0.75, innerHeight * 0.4, 120, 1.3); }, 900);
    clearTimeout(o._t); o._t = setTimeout(function () { o.classList.remove("on"); }, 5500);
  }
  $("celebrate").addEventListener("click", function (e) { e.stopPropagation(); this.classList.remove("on"); });
  $("g-reset").addEventListener("click", function (e) { e.stopPropagation(); this.blur(); buildGame(); });

  Array.prototype.forEach.call(document.querySelectorAll(".interactive"), function (el) {
    ["click"].forEach(function (t) {
      el.addEventListener(t, function (e) { e.stopPropagation(); }, { passive: true });
    });
  });
  function guardKeys(e) {
    var act = document.querySelector("#impress .step.active");
    if (act && act.classList.contains("interactive") && (e.keyCode === 32 || e.keyCode === 9 || e.keyCode === 13)) {
      e.preventDefault(); e.stopImmediatePropagation();
    }
  }
  window.addEventListener("keydown", guardKeys, true);
  window.addEventListener("keyup", guardKeys, true);

  var allSteps = Array.prototype.slice.call(document.querySelectorAll("#impress .step"));
  document.addEventListener("impress:stepenter", function (e) {
    var st = e.target, idx = allSteps.indexOf(st);
    st.classList.add("entered");
    var th = st.getAttribute("data-theme") || "space";
    document.body.setAttribute("data-theme", th);
    tgtColor = themeColor[th] || themeColor.space;
    $("hud-num").textContent = (idx < 9 ? "0" : "") + (idx + 1) + " / " + allSteps.length;
    $("hud-lab").textContent = st.getAttribute("data-label") || "";
    $("hud-bar").style.width = ((idx + 1) / allSteps.length * 100) + "%";
  });
  var K_BIG = 40, K_SMALL = 250, K_BIG_REST = 40;
  if (LITE) { K_BIG = 6; K_SMALL = 60; K_BIG_REST = 3.8; }
  function cull(a, b) {
    var lo = Math.min(geo[a.id].scale, geo[b.id].scale), hi = Math.max(geo[a.id].scale, geo[b.id].scale);
    var kb = a === b ? K_BIG_REST : K_BIG;
    allSteps.forEach(function (st) {
      var s = geo[st.id].scale;
      var far = st !== a && st !== b && (s / lo > kb || hi / s > K_SMALL);
      st.classList.toggle("far", far);
    });
  }
  document.addEventListener("impress:stepleave", function (e) { cull(e.target, e.detail.next); });
  document.addEventListener("impress:stepenter", function (e) { cull(e.target, e.target); });
  document.addEventListener("impress:stepleave", function (e) {
    e.target.classList.remove("entered");
    warpUntil = performance.now() + 1300;
  });

  Array.prototype.forEach.call(document.images, function (im) {
    im.addEventListener("error", function () { im.classList.add("missing"); });
    if (im.complete && !im.naturalWidth) im.classList.add("missing");
  });

  var SKIP = "button,a,input,textarea,select,.opt,.chip,#celebrate,#m-nav,#m-portrait";
  var tch = null, lastNav = 0;
  function navGo(dir) {
    var now = Date.now(); if (now - lastNav < 350) return; lastNav = now;
    if (dir > 0) impress().next(); else impress().prev();
  }
  document.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) { tch = null; return; }
    var t = e.touches[0], el = e.target;
    tch = { x: t.clientX, y: t.clientY, t: Date.now(), skip: !!(el && el.closest && el.closest(SKIP)) || !!drag };
  }, { passive: true });
  document.addEventListener("touchmove", function (e) { e.preventDefault(); }, { passive: false });
  document.addEventListener("touchend", function (e) {
    var s = tch; tch = null;
    if (!s || s.skip || drag || e.touches.length) return;
    var t = e.changedTouches[0], dx = t.clientX - s.x, dy = t.clientY - s.y, adx = Math.abs(dx), ady = Math.abs(dy);
    if (Math.max(adx, ady) >= 40) {
      if (adx >= ady) navGo(dx < 0 ? 1 : -1); else navGo(dy < 0 ? 1 : -1);
      return;
    }
    if (adx < 12 && ady < 12 && Date.now() - s.t < 500) {
      var act = document.querySelector("#impress .step.active");
      if (act && act.classList.contains("interactive")) return;
      e.preventDefault();
      navGo(t.clientX > innerWidth * 0.4 ? 1 : -1);
    }
  }, { passive: false });
  document.addEventListener("touchcancel", function () { tch = null; });
  document.addEventListener("gesturestart", function (e) { e.preventDefault(); });
  $("m-prev").addEventListener("click", function (e) { e.stopPropagation(); this.blur(); navGo(-1); });
  $("m-next").addEventListener("click", function (e) { e.stopPropagation(); this.blur(); navGo(1); });
  $("mp-go").addEventListener("click", function (e) { e.stopPropagation(); document.documentElement.classList.add("portrait-ok"); });
  if (LITE) $("hud").querySelector(".hint").textContent = "左右/上下滑动 · 点屏幕右侧前进 · ◀ ▶";

  window.addEventListener("resize", resize);
  resize();
  buildGame();
  renderQ();
  requestAnimationFrame(loop);
  if (LITE) cull($("overview"), $("overview"));
  impress().init();
  window.__deck = { geo: geo, burst: burst, celebrate: celebrate };
})();
