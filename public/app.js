/* The Captain - front-end. Vanilla JS, geen build-stap. */
(() => {
  "use strict";

  // ---------- State ----------
  const KEY = "captain.v1";
  const defaultState = {
    name: "",
    stats: { decodes: 0, reframes: 0, anchors: 0, exits: 0, simTurns: 0, simFrameSum: 0, silenceDays: 0, lastCheckin: null },
    log: [],
  };
  let state = load();
  let knowledge = null;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return structuredClone(defaultState);
      const parsed = JSON.parse(raw);
      return { ...structuredClone(defaultState), ...parsed, stats: { ...defaultState.stats, ...(parsed.stats || {}) } };
    } catch { return structuredClone(defaultState); }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
  function addLog(type, title, body) {
    state.log.unshift({ type, title, body, at: Date.now() });
    state.log = state.log.slice(0, 60);
    save();
  }

  // ---------- Helpers ----------
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const haptic = (ms = 10) => { try { navigator.vibrate && navigator.vibrate(ms); } catch {} };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)));
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 2200);
  }
  async function api(path, body) {
    const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Er ging iets mis.");
    return data;
  }
  function setLoading(btn, on) { btn.classList.toggle("loading", on); btn.disabled = on; }

  // ---------- Navigation ----------
  function go(view) {
    haptic(6);
    $$(".view").forEach((v) => v.classList.toggle("active", v.dataset.view === view));
    $$(".nav").forEach((n) => n.classList.toggle("active", n.dataset.go === view));
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (view === "dashboard") renderDashboard();
    if (view === "library") renderLibrary(currentTab);
  }
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-go]");
    if (t) go(t.dataset.go);
  });

  // ---------- Frame score ----------
  function frameScore() {
    const s = state.stats;
    const simAvg = s.simTurns ? s.simFrameSum / s.simTurns : null;
    let score = 42;
    score += Math.min(14, s.silenceDays * 2);
    score += Math.min(12, s.reframes * 1.5);
    score += Math.min(12, s.anchors * 3);
    score += Math.min(6, s.exits * 2);
    score += Math.min(6, s.decodes * 1);
    if (simAvg !== null) score += (simAvg - 60) * 0.25;
    return clamp(score, 5, 99);
  }
  function frameLabel(v) {
    if (v >= 80) return "Grounded Captain";
    if (v >= 65) return "Op koers";
    if (v >= 45) return "Aftastend";
    if (v >= 30) return "Onrustig";
    return "Stormy";
  }

  // ---------- Compass ----------
  const START = 135, SWEEP = 270; // degrees, 0 = top
  function polar(cx, cy, r, deg) { const a = ((deg - 90) * Math.PI) / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
  function arcPath(cx, cy, r, from, to) {
    const [x1, y1] = polar(cx, cy, r, from); const [x2, y2] = polar(cx, cy, r, to);
    const large = to - from > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  }
  function initCompass() {
    $("#ring-track").setAttribute("d", arcPath(120, 120, 96, START, START + SWEEP));
    const ticks = $("#ticks");
    let html = "";
    for (let i = 0; i <= 18; i++) {
      const deg = START + (SWEEP * i) / 18;
      const [x1, y1] = polar(120, 120, 82, deg); const [x2, y2] = polar(120, 120, i % 3 === 0 ? 74 : 78, deg);
      html += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
    }
    ticks.innerHTML = html;
  }
  function setCompass(v) {
    const end = START + (SWEEP * v) / 100;
    const fill = $("#ring-fill");
    fill.setAttribute("d", arcPath(120, 120, 96, START, Math.max(START + 0.5, end)));
    const len = fill.getTotalLength();
    fill.style.strokeDasharray = `${len} ${len + 10}`;
    const [mx, my] = polar(120, 120, 96, end);
    $("#marker").setAttribute("cx", mx.toFixed(1)); $("#marker").setAttribute("cy", my.toFixed(1));
    animateNumber($("#frame-score"), v);
    $("#frame-state").textContent = frameLabel(v);
  }
  function animateNumber(el, to) {
    const from = Number(el.textContent) || 0; const t0 = performance.now();
    const step = (t) => { const p = Math.min(1, (t - t0) / 1100); const e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(from + (to - from) * e); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  // ---------- Dashboard ----------
  function renderDashboard() {
    const h = new Date().getHours();
    const part = h < 6 ? "Goedenacht" : h < 12 ? "Goedemorgen" : h < 18 ? "Goedemiddag" : "Goedenavond";
    $("#greet-name").textContent = `${part}, ${state.name || "Kapitein"}.`;
    $("#greet-date").textContent = new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
    $("#m-silence").textContent = state.stats.silenceDays;
    $("#m-reframes").textContent = state.stats.reframes;
    $("#m-anchors").textContent = state.stats.anchors;
    const lessons = knowledge?.lessons || ["Rust is aantrekkelijker dan alles wat je kunt zeggen."];
    const day = Math.floor(Date.now() / 86400000);
    $("#lesson-text").textContent = lessons[day % lessons.length];
    const today = new Date().toDateString();
    const btn = $("#checkin-btn");
    btn.disabled = state.stats.lastCheckin === today;
    btn.textContent = btn.disabled ? "Check-in gedaan. Morgen weer." : "Vandaag niets gestuurd uit onrust";
    requestAnimationFrame(() => setCompass(frameScore()));
  }
  $("#checkin-btn").addEventListener("click", () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (state.stats.lastCheckin === today) return;
    state.stats.silenceDays = state.stats.lastCheckin === yesterday ? state.stats.silenceDays + 1 : 1;
    state.stats.lastCheckin = today;
    addLog("checkin", "Stilte-dag", `Dag ${state.stats.silenceDays} op rij zonder bericht uit onrust.`);
    save(); haptic(20); toast("Goed. De taart groeit.");
    renderDashboard();
  });

  // ---------- Gauge helper ----------
  function gauge(value, label, sub) {
    const r = 40, c = 2 * Math.PI * r;
    return `<div class="gauge-row"><div class="gauge"><svg viewBox="0 0 92 92"><circle class="g-track" cx="46" cy="46" r="${r}"/><circle class="g-fill" cx="46" cy="46" r="${r}" data-dash="${(c * value) / 100} ${c}"/></svg><div class="g-val">${value}</div></div><div><div class="state-name">${esc(label)}</div><div class="state-sub">${esc(sub)}</div></div></div>`;
  }
  function animateBars(root) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      $$("[data-dash]", root).forEach((el) => (el.style.strokeDasharray = el.dataset.dash));
      $$("[data-w]", root).forEach((el) => (el.style.width = el.dataset.w + "%"));
    }));
  }

  // ---------- 1. Decoder ----------
  const DECODE_EXAMPLE = "Na de borrel bleef ze langer hangen terwijl de rest naar huis ging en liep ze mee naar mijn fiets. Toen ze lachte raakte ze even mijn onderarm aan. Ze vertelde over haar vader die vroeger nooit thuis was, iets wat ze zei nooit aan iemand te vertellen. Bij het afscheid zei ze: we moeten dat Italiaanse restaurant echt eens proberen.";
  $("#decode-example").addEventListener("click", () => { $("#decode-input").value = DECODE_EXAMPLE; haptic(); });
  $("#decode-btn").addEventListener("click", async () => {
    const text = $("#decode-input").value.trim();
    if (text.length < 8) return toast("Beschrijf iets uitgebreider wat ze deed of zei.");
    const btn = $("#decode-btn"); setLoading(btn, true); haptic();
    try {
      const r = await api("/api/decode", { text });
      renderDecode(r);
      state.stats.decodes++; addLog("decode", `Decoder: ${r.stateLabel}`, r.move); save();
    } catch (e) { toast(e.message); } finally { setLoading(btn, false); }
  });
  function renderDecode(r) {
    const root = $("#decode-result");
    const stateName = { parasympathisch: "Parasympathisch", overgang: "Overgang", sympathisch: "Sympathisch" }[r.state] || r.state;
    const sorted = [...r.signals].sort((a, b) => b.score - a.score);
    root.innerHTML = `
      <div class="glass"><div class="card-title">Zenuwstelsel</div>${gauge(r.comfort, stateName, r.stateLabel)}</div>
      <div class="glass"><div class="card-title">De zes signalen</div>
        ${sorted.map((s) => `<div class="signal ${s.score ? "" : "off"}"><div><div class="signal-name">${esc(s.name)}</div><div class="signal-sub">${esc(s.subtitle)}</div></div><div class="signal-score">${s.score ? s.score + "%" : "—"}</div><div class="bar"><i data-w="${s.score}"></i></div>${s.evidence ? `<div class="evidence">"${esc(s.evidence)}"</div>` : ""}</div>`).join("")}
      </div>
      ${r.negatives?.length ? `<div class="glass"><div class="card-title">Tegensignalen</div><div class="chips">${r.negatives.map((n) => `<span class="chip warn">${esc(n.label)}</span>`).join("")}</div></div>` : ""}
      <div class="glass"><div class="card-title">Lezing</div><p class="body-text">${esc(r.interpretation)}</p></div>
      <div class="glass move"><div class="card-title">Jouw zet</div><p>${esc(r.move)}</p></div>
      <p class="muted" style="text-align:center">${r.source === "ai" ? "Analyse door AI" : "Analyse door de offline engine"}</p>`;
    root.classList.remove("hidden");
    animateBars(root);
  }

  // ---------- 2. Reframer ----------
  const REFRAME_EXAMPLE = "Hey! Sorry dat ik weer stuur haha, ik vroeg me af of je misschien zin hebt om een keer wat te drinken? Ik vond het echt heel gezellig laatst en ik hoop dat jij dat ook zo voelde. Geen druk hoor, als je het druk hebt is het ook prima. Laat maar weten!";
  $("#reframe-example").addEventListener("click", () => { $("#reframe-input").value = REFRAME_EXAMPLE; haptic(); });
  $("#reframe-btn").addEventListener("click", async () => {
    const text = $("#reframe-input").value.trim();
    if (text.length < 3) return toast("Plak eerst je bericht.");
    const btn = $("#reframe-btn"); setLoading(btn, true); haptic();
    try {
      const r = await api("/api/reframe", { text });
      renderReframe(r);
      state.stats.reframes++; addLog("reframe", `Reframer: ${r.style}`, r.reframed || r.groundedExit.text); save();
    } catch (e) { toast(e.message); } finally { setLoading(btn, false); }
  });
  function renderReframe(r) {
    const root = $("#reframe-result");
    root.innerHTML = `
      <div class="glass"><div class="card-title">Drukmeting</div>
        <div class="meter"><i data-w="${r.pressure}"></i></div>
        <div class="meter-labels"><span>Rustig</span><span>${r.pressure}% onrust</span><span>Campagne</span></div>
        ${r.diagnosis?.length ? `<div class="diag" style="margin-top:14px">${r.diagnosis.map((d) => `<div class="diag-item"><div class="diag-label">${esc(d.label)}</div><div class="diag-detail">${esc(d.detail)}</div></div>`).join("")}</div>` : `<p class="muted" style="margin-top:12px">Weinig onrust gevonden. Goed bezig.</p>`}
      </div>
      <div class="glass move"><div class="card-title">Kapiteinsversie · ${esc(r.style)}</div>
        <div class="reframed ${r.reframed ? "" : "empty"}">${r.reframed ? esc(r.reframed) : "Geen bericht. Zie hieronder."}</div>
        ${(r.notes || []).map((n) => `<p class="muted">${esc(n)}</p>`).join("")}
        ${r.reframed ? `<div class="row"><button class="btn ghost small" id="copy-reframe">Kopieer</button></div>` : ""}
      </div>
      <div class="glass exit"><div class="card-title">Grounded Exit</div>
        <div class="reframed">${esc(r.groundedExit.text)}</div>
        <p class="muted">${esc(r.groundedExit.why)}</p>
        <div class="row"><button class="btn ghost small" id="choose-exit">Ik kies stilte</button></div>
      </div>
      <p class="muted" style="text-align:center">${r.source === "ai" ? "Herschreven door AI" : "Herschreven door de offline engine"}</p>`;
    root.classList.remove("hidden");
    animateBars(root);
    $("#copy-reframe")?.addEventListener("click", async () => { try { await navigator.clipboard.writeText(r.reframed); toast("Gekopieerd."); haptic(); } catch { toast("Kopiëren lukte niet."); } });
    $("#choose-exit")?.addEventListener("click", () => { state.stats.exits++; addLog("exit", "Grounded Exit", "Bewust niets gestuurd."); save(); haptic(20); toast("Sterk. Stilte is ook een bericht."); });
  }

  // ---------- 3. Simulator ----------
  let sim = null;
  function renderScenarios() {
    const root = $("#sim-scenarios");
    root.innerHTML = (knowledge?.scenarios || []).map((s) => `<button class="glass scenario" data-scenario="${s.id}"><strong>${esc(s.name)}</strong><span>${esc(s.desc)}</span></button>`).join("");
    $$(".scenario", root).forEach((b) => b.addEventListener("click", () => startSim(b.dataset.scenario)));
  }
  function startSim(id) {
    const s = knowledge.scenarios.find((x) => x.id === id);
    sim = { id, persona: s.persona, name: s.name, history: [{ role: "assistant", content: s.opening }], frames: [] };
    $("#sim-scenarios").classList.add("hidden"); $("#sim-summary").classList.add("hidden");
    $("#sim-chat").classList.remove("hidden");
    $("#sim-scenario-name").textContent = s.name; $("#sim-persona").textContent = s.persona;
    $("#chat-log").innerHTML = ""; addMsg("her", s.opening);
    haptic(); $("#sim-input").focus();
  }
  function addMsg(who, text) {
    const el = document.createElement("div"); el.className = `msg ${who}`; el.textContent = text;
    $("#chat-log").appendChild(el); el.scrollIntoView({ behavior: "smooth", block: "end" });
    return el;
  }
  async function sendSim() {
    if (!sim) return;
    const input = $("#sim-input"); const message = input.value.trim();
    if (!message) return;
    input.value = ""; addMsg("me", message); haptic();
    const typing = document.createElement("div"); typing.className = "typing"; typing.innerHTML = "<i></i><i></i><i></i>"; $("#chat-log").appendChild(typing);
    const btn = $("#sim-send"); setLoading(btn, true);
    try {
      const r = await api("/api/simulate", { scenarioId: sim.id, history: sim.history, message });
      typing.remove();
      const a = document.createElement("div"); a.className = "analytics";
      a.innerHTML = `<span>[Frame: <b>${r.analytics.frame}%</b>]</span><span>[Onrust: <b>${esc(r.analytics.anxiety)}</b>]</span>${(r.analytics.flags || []).slice(0, 3).map((f) => `<span>· ${esc(f)}</span>`).join("")}`;
      $("#chat-log").appendChild(a);
      const c = document.createElement("div"); c.className = "coach"; c.textContent = r.note; $("#chat-log").appendChild(c);
      await new Promise((res) => setTimeout(res, 500));
      addMsg("her", r.reply);
      sim.history.push({ role: "user", content: message }, { role: "assistant", content: r.reply });
      sim.frames.push(r.analytics.frame);
      state.stats.simTurns++; state.stats.simFrameSum += r.analytics.frame; save();
    } catch (e) { typing.remove(); toast(e.message); } finally { setLoading(btn, false); input.focus(); }
  }
  $("#sim-send").addEventListener("click", sendSim);
  $("#sim-input").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendSim(); } });
  $("#sim-end").addEventListener("click", () => {
    if (!sim) return;
    const avg = sim.frames.length ? Math.round(sim.frames.reduce((a, b) => a + b, 0) / sim.frames.length) : null;
    const best = sim.frames.length ? Math.max(...sim.frames) : null;
    const verdict = avg === null ? "Je hebt nog niets gestuurd." : avg >= 75 ? "Je hield je as vast. Zo voelt een kapitein." : avg >= 50 ? "Wisselend. Je weet wat rust is, maar de onrust sluipt er nog in." : "Veel campagne. Oefen dit scenario morgen opnieuw, korter en stiller.";
    $("#sim-summary").innerHTML = `<div class="glass"><div class="card-title">Sessie afgerond · ${esc(sim.name)}</div>${avg !== null ? gauge(avg, `Gemiddeld frame ${avg}%`, `Beste beurt ${best}% · ${sim.frames.length} beurten`) : ""}<p class="body-text" style="margin-top:14px">${verdict}</p><div class="row"><button class="btn primary" id="sim-again">Nog een scenario</button></div></div>`;
    $("#sim-summary").classList.remove("hidden"); animateBars($("#sim-summary"));
    if (avg !== null) addLog("sim", `Simulator: ${sim.name}`, `Gemiddeld frame ${avg}% over ${sim.frames.length} beurten.`);
    $("#sim-chat").classList.add("hidden"); sim = null; haptic(15);
    $("#sim-again").addEventListener("click", () => { $("#sim-summary").classList.add("hidden"); $("#sim-scenarios").classList.remove("hidden"); });
  });

  // ---------- 4. Emergency Anchor ----------
  const ANCHOR_TEXTS = [
    "Wat je nu voelt is een golf. Golven gaan voorbij. Jij blijft.",
    "Je hoeft niets te sturen. Je hoeft niets te weten. Alleen ademen.",
    "Haar stilte is informatie, geen noodgeval.",
    "Jouw leven is de taart. Wat ga je vanavond doen dat van jou is?",
    "Een bericht uit onrust kost je meer dan een dag stilte ooit zal kosten.",
    "Voeten op de grond. Schouders laag. Je bent hier, en dat is genoeg.",
  ];
  let anchor = null;
  function openAnchor() {
    haptic(30);
    const ov = $("#anchor-overlay"); ov.hidden = false; document.body.style.overflow = "hidden";
    const total = 180; let left = total; let textIdx = 0;
    $("#anchor-done").disabled = true; $("#anchor-title").textContent = "Berichten vergrendeld.";
    $("#anchor-timer").textContent = "3:00"; $("#anchor-text").textContent = ANCHOR_TEXTS[0];
    const phases = [["in", "Adem in", 4000], ["hold", "Vasthouden", 7000], ["out", "Adem uit", 8000]];
    let pi = 0;
    const circle = $("#breath-circle");
    const runPhase = () => {
      const [cls, label, ms] = phases[pi % 3];
      circle.className = `breath-circle ${cls}`; $("#breath-phase").textContent = label; haptic(cls === "hold" ? 8 : 15);
      pi++; anchor.phase = setTimeout(runPhase, ms);
    };
    anchor = { phase: null, tick: null };
    circle.className = "breath-circle"; anchor.phase = setTimeout(runPhase, 250);
    anchor.tick = setInterval(() => {
      left--;
      $("#anchor-timer").textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
      if (left % 20 === 0) { textIdx = (textIdx + 1) % ANCHOR_TEXTS.length; const t = $("#anchor-text"); t.style.opacity = 0; setTimeout(() => { t.textContent = ANCHOR_TEXTS[textIdx]; t.style.opacity = 1; }, 600); }
      if (left === total - 60) { $("#anchor-done").disabled = false; $("#anchor-title").textContent = "Je mag blijven, of gaan."; }
      if (left <= 0) { $("#anchor-title").textContent = "Drie minuten. Je hebt het gedaan."; clearInterval(anchor.tick); }
    }, 1000);
  }
  function closeAnchor(completed) {
    if (anchor) { clearTimeout(anchor.phase); clearInterval(anchor.tick); anchor = null; }
    $("#anchor-overlay").hidden = true; document.body.style.overflow = "";
    if (completed) { state.stats.anchors++; addLog("anchor", "Anker-moment", "Adem gehaald in plaats van gestuurd."); save(); toast("Terug op je as."); renderDashboard(); }
  }
  $("#anchor-fab").addEventListener("click", openAnchor);
  $("#anchor-done").addEventListener("click", () => closeAnchor(true));
  $("#anchor-abort").addEventListener("click", () => closeAnchor(false));

  // ---------- Library ----------
  let currentTab = "pillars";
  $$("#lib-tabs .tab").forEach((t) => t.addEventListener("click", () => { currentTab = t.dataset.tab; $$("#lib-tabs .tab").forEach((x) => x.classList.toggle("active", x === t)); renderLibrary(currentTab); haptic(5); }));
  function renderLibrary(tab) {
    const root = $("#lib-content"); const k = knowledge; if (!k) return;
    const item = (h, sub, body, extra = "") => `<div class="glass lib-item">${sub ? `<div class="sub">${esc(sub)}</div>` : ""}<h3>${esc(h)}</h3><p style="margin-top:8px">${esc(body)}</p>${extra}</div>`;
    let html = "";
    if (tab === "pillars") html = k.pillars.map((p) => item(p.title, p.short, p.body)).join("");
    if (tab === "signals") html = k.signals.map((s) => item(s.name, s.subtitle, s.body, `<div class="science">${esc(s.science)}</div>`)).join("");
    if (tab === "touch") html = `<div class="glass lib-item"><h3>Voor je begint</h3><p style="margin-top:8px">Aanraking is taal. Je spreekt haar alleen als zij al terugpraat: eerdere aanraking beantwoord, lichaam naar je toe, ontspannen. Elke stap is licht en direct omkeerbaar. Twijfel je? Dan is het antwoord nee.</p></div>` + k.touch.map((t) => item(t.name, "", t.body, `<div class="consent">${esc(t.consent)}</div>`)).join("");
    if (tab === "language") html = item(k.noticed.title, "Gezien worden", k.noticed.body)
      + `<div class="glass lib-item"><div class="sub">Vier observaties die blijven hangen</div>${k.compliments.map((c) => `<p class="quote" style="margin-top:12px">"${esc(c.text)}"</p><p class="muted">${esc(c.why)}</p>`).join("")}</div>`
      + `<div class="glass lib-item"><div class="sub">De twee testvragen</div>${k.testQuestions.map((t) => `<h3 style="margin-top:12px">"${esc(t.q)}"</h3><p class="muted">${esc(t.test)}</p><p class="quote" style="margin-top:6px;font-size:0.98rem">${esc(t.answer)}</p>`).join("")}</div>`;
    if (tab === "history") {
      html = state.log.length
        ? state.log.map((l) => `<div class="glass log-item"><div class="log-meta">${esc(l.title)} · ${new Date(l.at).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</div><div class="log-body">${esc(l.body)}</div></div>`).join("")
          + `<div class="row"><button class="btn ghost small" id="reset-data">Alles wissen</button></div>`
        : `<div class="glass empty">Nog geen geschiedenis. Alles wat je decodeert, herschrijft of oefent, komt hier.</div>`;
    }
    root.innerHTML = `<div class="lib-list">${html}</div>`;
    $("#reset-data")?.addEventListener("click", () => { if (confirm("Alle gegevens op dit apparaat wissen?")) { state = structuredClone(defaultState); save(); renderLibrary("history"); toast("Gewist."); } });
  }

  // ---------- Intro / beginpagina ----------
  const introSteps = $$(".intro-step");
  const LAST_STEP = introSteps.length - 1;
  let introIdx = 0;
  function showIntroStep(i) {
    introIdx = Math.max(0, Math.min(LAST_STEP, i));
    introSteps.forEach((s) => s.classList.toggle("active", Number(s.dataset.step) === introIdx));
    $("#intro-dots").innerHTML = introSteps.map((_, k) => `<i class="${k === introIdx ? "active" : ""}"></i>`).join("");
    const last = introIdx === LAST_STEP;
    $("#intro-next").textContent = last ? "Aan boord" : "Volgende";
    $("#intro-skip").hidden = last;
    if (last) setTimeout(() => $("#onboard-name").focus(), 250);
    $("#intro").scrollTo({ top: 0 });
  }
  function openIntro(startAt = 0) {
    $("#intro").hidden = false; document.body.style.overflow = "hidden";
    if (state.name) $("#onboard-name").value = state.name;
    showIntroStep(startAt);
  }
  function closeIntro() {
    const name = $("#onboard-name").value.trim().slice(0, 24);
    state.name = name || state.name || "Kapitein"; state.introSeen = true; save();
    $("#intro").hidden = true; document.body.style.overflow = "";
    renderDashboard(); haptic(15);
  }
  $("#intro-next").addEventListener("click", () => { haptic(6); introIdx === LAST_STEP ? closeIntro() : showIntroStep(introIdx + 1); });
  $("#intro-skip").addEventListener("click", () => showIntroStep(LAST_STEP));
  $("#onboard-name").addEventListener("keydown", (e) => { if (e.key === "Enter") closeIntro(); });
  $("#help-btn").addEventListener("click", () => openIntro(0));
  function onboarding() {
    if (state.name && state.introSeen) return;
    openIntro(0);
  }

  // ---------- Init ----------
  async function init() {
    initCompass();
    renderDashboard();
    onboarding();
    try {
      knowledge = await (await fetch("/api/knowledge")).json();
      const b = $("#ai-badge"); b.textContent = knowledge.ai ? (knowledge.aiProvider === "openai" ? "OPENAI" : "CLAUDE") : "ENGINE"; b.classList.toggle("ai", !!knowledge.ai);
      renderScenarios(); renderDashboard(); renderLibrary(currentTab);
    } catch { toast("Kon de kennisbank niet laden."); }
    if ("serviceWorker" in navigator) { navigator.serviceWorker.register("/sw.js").catch(() => {}); }
  }
  init();
})();
