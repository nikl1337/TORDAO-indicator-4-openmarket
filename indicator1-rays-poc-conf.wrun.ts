//@lang=wrun-ts
// TORDAO indicator 1 (core): auction zones, TL RAYS, break/retest SQUARES, wide POC zone,
// neon confluence rectangles on close-confirmed reactions, VWAP + EMA ribbon + score.

input("close", ohlcv.close);
input("profile", volume_profile.cells, { max_cells: 8192, missing: "empty", description: "This bar's volume by price level (follows the chart timeframe)" });

page("Display");
param.bool("show_zones", true, { label: "Show auction zones" });
param.bool("show_tl", true, { label: "Show trendline rays + break/retest squares" });
param.bool("show_poc", true, { label: "Show POC zone + mid level" });
param.bool("show_sig", true, { label: "Show neon confluence rectangles + score labels" });
param.bool("show_vd", true, { label: "Show daily VWAP" });
param.bool("show_vw", true, { label: "Show weekly VWAP" });
param.bool("show_vm", true, { label: "Show monthly VWAP" });
param.bool("show_e1", true, { label: "Show EMA 1 (21)" });
param.bool("show_e2", true, { label: "Show EMA 2 (50)" });
param.bool("show_e3", true, { label: "Show EMA 3 (144)" });
param.bool("show_e4", true, { label: "Show EMA 4 (360)" });
param.bool("show_e5", true, { label: "Show EMA 5 (667)" });
param.bool("show_e6", true, { label: "Show EMA 6 (800)" });

page("Logic");
param("swing_len", 5, { min: 2, max: 30, description: "Swing length (bars each side)" });
param("zone_atr", 0.6, { min: 0.1, max: 3, description: "Zone depth in ATR" });
param("near_atr", 1.5, { min: 0.3, max: 6, description: "Revisit-likely distance in ATR" });
param("max_touch", 3, { min: 1, max: 10, description: "Touches before a zone counts as worn out" });
param("allow_sfp", 1, { min: 0, max: 1, description: "Sweep and reclaim keeps the zone (1) or kills it (0)" });
param("tl_tol", 0.35, { min: 0.05, max: 2, description: "Trendline 3rd-touch tolerance in ATR" });
param("brk_buf", 0.1, { min: 0, max: 1, description: "Break buffer in ATR" });
param("retest_bars", 20, { min: 3, max: 100, description: "Bars to wait for a retest" });
param("fake_bars", 5, { min: 1, max: 30, description: "Close back inside within N bars = fake break" });
param("poc_lookback", 24, { min: 2, max: 200, description: "Bars used for the developing POC level" });
param("react_wick", 0.3, { min: 0, max: 0.9, description: "Min rejection wick as share of the bar range" });
param("conf_tol", 0.4, { min: 0.05, max: 3, description: "A level is in confluence when within this many ATR of the zone" });
param.number("min_score", 35, { min: 1, max: 100, label: "Only mark reactions with score at or above this", when: "show_sig" });
param("keep_score", 60, { min: 1, max: 100, description: "Number labels stay only for scores at or above this" });
param("keep_n", 4, { min: 1, max: 12, description: "How many of the latest buy and sell number labels stay on screen" });

page("Weights");
note("Defaults add up to 100 when everything lines up.");
param("w_base", 25, { min: 0, max: 100, description: "Weight: zone reaction itself" });
param.number("w_poc", 10, { min: 0, max: 100, label: "Weight: POC inside the zone", when: "show_poc" });
param.number("w_vd", 5, { min: 0, max: 100, label: "Weight: daily VWAP", when: "show_vd" });
param.number("w_vw", 7, { min: 0, max: 100, label: "Weight: weekly VWAP", when: "show_vw" });
param.number("w_vm", 8, { min: 0, max: 100, label: "Weight: monthly VWAP", when: "show_vm" });
param("w_e1", 2, { min: 0, max: 100, description: "Weight: EMA 1" });
param("w_e2", 3, { min: 0, max: 100, description: "Weight: EMA 2" });
param("w_e3", 4, { min: 0, max: 100, description: "Weight: EMA 3" });
param("w_e4", 5, { min: 0, max: 100, description: "Weight: EMA 4" });
param("w_e5", 5, { min: 0, max: 100, description: "Weight: EMA 5" });
param("w_e6", 6, { min: 0, max: 100, description: "Weight: EMA 6" });
param.number("w_tl", 12, { min: 0, max: 100, label: "Weight: trendline at the zone", when: "show_tl" });
param.number("w_tlb", 8, { min: 0, max: 100, label: "Weight: TL break/retest bonus", when: "show_tl" });

page("EMAs");
param("ema1", 21, { min: 2, max: 2000, description: "EMA 1 length" });
param("ema2", 50, { min: 2, max: 2000, description: "EMA 2 length" });
param("ema3", 144, { min: 2, max: 2000, description: "EMA 3 length" });
param("ema4", 360, { min: 2, max: 2000, description: "EMA 4 length" });
param("ema5", 667, { min: 2, max: 2000, description: "EMA 5 length" });
param("ema6", 800, { min: 2, max: 2000, description: "EMA 6 length" });

const dTop = output("d_top", none), dBot = output("d_bot", none), dLive = output("d_live", none), dState = output("d_state", none);
const sTop = output("s_top", none), sBot = output("s_bot", none), sLive = output("s_live", none), sState = output("s_state", none);
box("demand_zone", { top: dTop, bottom: dBot, when: dLive, colorBy: dState, borderWidth: 1, borderStyle: "solid", opacity: 0.22,
  colors: ["#22c55e", "#facc15", "#38bdf8", "#f97316", "#64748b"], borderColors: ["#22c55e", "#facc15", "#38bdf8", "#f97316", "#64748b"], borderColorBy: dState });
box("supply_zone", { top: sTop, bottom: sBot, when: sLive, colorBy: sState, borderWidth: 1, borderStyle: "solid", opacity: 0.22,
  colors: ["#ef4444", "#facc15", "#38bdf8", "#f97316", "#64748b"], borderColors: ["#ef4444", "#facc15", "#38bdf8", "#f97316", "#64748b"], borderColorBy: sState });

const gBuy = output("g_buy", none), gSell = output("g_sell", none);
box("neon_buy", { top: dTop, bottom: dBot, when: gBuy, color: "#00ffd5", opacity: 0.55, borderColor: "#00ffd5", borderWidth: 2, z: 5 });
box("neon_sell", { top: sTop, bottom: sBot, when: gSell, color: "#ff2bd6", opacity: 0.55, borderColor: "#ff2bd6", borderWidth: 2, z: 5 });
plot.spans({ name: "conf", slots: 2, colors: ["#00ffd5", "#ff2bd6"], opacity: 0.35, border: { width: 2, opacity: 0.95 },
  words: ["BUY conf", "SELL conf"], tooltip: "{{word}}", panel: "overlay" });
output("sig_buy", shape, overlay, { color: "#00ffd5", shape_where: "g_buy", shape: "triangle_up", location: "below_bar", glow: 10, description: "Buy reaction (neon teal)" });
output("sig_sell", shape, overlay, { color: "#ff2bd6", shape_where: "g_sell", shape: "triangle_down", location: "above_bar", glow: 10, description: "Sell reaction (neon pink)" });
output("conf_buy", histogram, lower, { color: "#00ffd5", description: "Buy confluence score 1-100", format: "int" });
output("conf_sell", histogram, lower, { color: "#ff2bd6", description: "Sell confluence score 1-100", format: "int" });

const pocTop = output("poc_top", none);
const pocBot = output("poc_bot", none);
const pocLive = output("poc_live", none);
box("poc_zone", { top: pocTop, bottom: pocBot, when: pocLive, color: "#f59e0b", opacity: 0.18, borderColor: "#fbbf24", borderWidth: 2, borderStyle: "solid", z: 3 });
output("poc_bar", scatter, overlay, { color: "#fbbf24", description: "POC of each bar" });
output("poc_lvl", line, overlay, { color: "#fbbf24", width: 2, step: true, line_style: "solid", description: "POC mid level" });
param.number("poc_half_atr", 0.35, { min: 0.05, max: 2, step: 0.05, label: "POC zone half-height in ATR", when: "show_poc" });

plot.rays({ name: "tl", slots: 2, colors: ["#ef4444", "#22c55e"], width: 2, line_style: "dashed", opacity: 0.95,
  words: ["Resistance ray", "Support ray"], tooltip: "{{word}}", panel: "overlay" });
const gBU = output("g_brk_up", none), gBD = output("g_brk_dn", none), gRU = output("g_ret_up", none), gRD = output("g_ret_dn", none);
const gLost = output("g_zone_lost", none);
output("brk_up", shape, overlay, { color: "#00ffd5", shape_where: "g_brk_up", shape: "square", location: "below_bar", glow: 12, description: "Breakout of resistance (square)" });
output("brk_dn", shape, overlay, { color: "#ff2bd6", shape_where: "g_brk_dn", shape: "square", location: "above_bar", glow: 12, description: "Breakdown of support (square)" });
output("ret_up", shape, overlay, { color: "#0ea5e9", shape_where: "g_ret_up", shape: "square", location: "below_bar", glow: 10, description: "Retest of broken resistance (square)" });
output("ret_dn", shape, overlay, { color: "#f59e0b", shape_where: "g_ret_dn", shape: "square", location: "above_bar", glow: 10, description: "Retest of broken support (square)" });
output("brk_price", none, overlay, { description: "Exact break price", format: "price" });
output("fake_rate", none, lower, { description: "Fake-break rate", format: "%" });

output("vwap_d", line, overlay, { color: "#38bdf8", width: 1, description: "Daily VWAP (UTC)" });
output("vwap_w", line, overlay, { color: "#f5a623", width: 2, description: "Weekly VWAP (UTC)" });
output("vwap_m", line, overlay, { color: "#c084fc", width: 2, description: "Monthly VWAP (UTC)" });
output("ema_1", line, overlay, { color: "#fde047", width: 1, description: "EMA 21" });
output("ema_2", line, overlay, { color: "#fb923c", width: 1, description: "EMA 50" });
output("ema_3", line, overlay, { color: "#f43f5e", width: 2, description: "EMA 144" });
output("ema_4", line, overlay, { color: "#a855f7", width: 2, description: "EMA 360" });
output("ema_5", line, overlay, { color: "#3b82f6", width: 2, description: "EMA 667" });
output("ema_6", line, overlay, { color: "#e2e8f0", width: 3, description: "EMA 800" });

alert("breakout", { when: gBU, message: "{{symbol}}: breakout above resistance at {{close}}", description: "Breakout" });
alert("breakdown", { when: gBD, message: "{{symbol}}: breakdown below support at {{close}}", description: "Breakdown" });
alert("retest_up", { when: gRU, message: "{{symbol}}: retest of broken resistance at {{close}}", description: "Retest (long)" });
alert("retest_dn", { when: gRD, message: "{{symbol}}: retest of broken support at {{close}}", description: "Retest (short)" });
alert("buy_reaction", { when: gBuy, message: "{{symbol}}: BUY reaction in demand zone at {{close}}", description: "Neon teal buy reaction" });
alert("sell_reaction", { when: gSell, message: "{{symbol}}: SELL reaction in supply zone at {{close}}", description: "Neon pink sell reaction" });

string("tag", { max_bytes: 16 });
handles.label({ size: 12 });
const MAX_TAGS = 12;
const TEAL: i32 = rgba(0, 255, 213, 255);
const PINK: i32 = rgba(255, 43, 214, 255);
function makeLabels(first: i32, count: i32): LabelHandle[] {
  const out: LabelHandle[] = [];
  for (let i = 0; i < count; i += 1) out.push(draw.label(first + i));
  return out;
}
const buyTags = makeLabels(0, MAX_TAGS);
const sellTags = makeLabels(MAX_TAGS, MAX_TAGS);
const pocTag = draw.label(24);
let nBuy: i32 = 0;
let nSell: i32 = 0;
let keepN: i32 = 4;
let keepScore: f64 = 60.0;

function inBand(level: f64, lo: f64, hi: f64, tol: f64): bool {
  return !isNaN(level) && !isNaN(lo) && !isNaN(hi) && level >= lo - tol && level <= hi + tol;
}

const MAXP = 200;
const pocRing = new StaticArray<f64>(MAXP);
const pocVolRing = new StaticArray<f64>(MAXP);
let pcur: i32 = 0;
let pcount: i32 = 0;
let pN: i32 = 24;
let pocLvl: f64 = NaN;

let wBase: f64 = 25.0; let wPoc: f64 = 10.0; let wVd: f64 = 5.0; let wVw: f64 = 7.0; let wVm: f64 = 8.0;
let wE1: f64 = 2.0; let wE2: f64 = 3.0; let wE3: f64 = 4.0; let wE4: f64 = 5.0; let wE5: f64 = 5.0; let wE6: f64 = 6.0;
let wTl: f64 = 12.0; let wTlb: f64 = 8.0;

let sw = new Swings(5, 5);
let vD = new Vwap("day", "hlc3");
let vW = new Vwap("week", "hlc3");
let vM = new Vwap("month", "hlc3");
let e1 = new Ema(21);
let e2 = new Ema(50);
let e3 = new Ema(144);
let e4 = new Ema(360);
let e5 = new Ema(667);
let e6 = new Ema(800);
let right: i32 = 5;
let idx: i32 = 0;
let atr: f64 = NaN;
let pClose: f64 = NaN;

let dT: f64 = NaN; let dB: f64 = NaN; let dL: f64 = 0.0; let dS: f64 = 0.0; let dTouches: i32 = 0;
let sT: f64 = NaN; let sB: f64 = NaN; let sL: f64 = 0.0; let sS: f64 = 0.0; let sTouches: i32 = 0;

let hp1: f64 = NaN; let hp2: f64 = NaN; let hp3: f64 = NaN;
let hi1: i32 = 0; let hi2: i32 = 0; let hi3: i32 = 0;
let lp1: f64 = NaN; let lp2: f64 = NaN; let lp3: f64 = NaN;
let li1: i32 = 0; let li2: i32 = 0; let li3: i32 = 0;

let rOn = false; let rBase: f64 = 0; let rSlope: f64 = 0; let rX0: i32 = 0; let rT0: f64 = NaN; let rP0: f64 = NaN;
let uOn = false; let uBase: f64 = 0; let uSlope: f64 = 0; let uX0: i32 = 0; let uT0: f64 = NaN; let uP0: f64 = NaN;
let rBrokeAt: i32 = -1; let rBrokeLvl: f64 = NaN; let rRetested = false;
let uBrokeAt: i32 = -1; let uBrokeLvl: f64 = NaN; let uRetested = false;
let breaks: i32 = 0; let fakes: i32 = 0;

let shZones = true; let shTl = true; let shPoc = true; let shSig = true;
let shVd = true; let shVw = true; let shVm = true;
let shE1 = true; let shE2 = true; let shE3 = true; let shE4 = true; let shE5 = true; let shE6 = true;

function onStart(): void {
  right = i32(p_swing_len());
  sw = new Swings(right, right);
  pN = i32(p_poc_lookback());
  keepN = i32(p_keep_n());
  keepScore = p_keep_score();
  wBase = p_w_base(); wPoc = p_w_poc(); wVd = p_w_vd(); wVw = p_w_vw(); wVm = p_w_vm();
  wE1 = p_w_e1(); wE2 = p_w_e2(); wE3 = p_w_e3(); wE4 = p_w_e4(); wE5 = p_w_e5(); wE6 = p_w_e6();
  wTl = p_w_tl(); wTlb = p_w_tlb();
  e1 = new Ema(i32(p_ema1())); e2 = new Ema(i32(p_ema2())); e3 = new Ema(i32(p_ema3()));
  e4 = new Ema(i32(p_ema4())); e5 = new Ema(i32(p_ema5())); e6 = new Ema(i32(p_ema6()));
  shZones = pb_show_zones(); shTl = pb_show_tl(); shPoc = pb_show_poc(); shSig = pb_show_sig();
  shVd = pb_show_vd(); shVw = pb_show_vw(); shVm = pb_show_vm();
  shE1 = pb_show_e1(); shE2 = pb_show_e2(); shE3 = pb_show_e3(); shE4 = pb_show_e4(); shE5 = pb_show_e5(); shE6 = pb_show_e6();
}

function onBar(): void {
  const o = bar.open();
  const h = bar.high();
  const l = bar.low();
  const c = bar.close();
  const tr = isNaN(pClose) ? h - l : Math.max(h - l, Math.max(Math.abs(h - pClose), Math.abs(l - pClose)));
  atr = isNaN(atr) ? tr : (atr * 13.0 + tr) / 14.0;

  // ---- Zones from swings
  sw.update(h, l);
  const zDepth = p_zone_atr() * atr;
  const near = p_near_atr() * atr;
  const maxT = i32(p_max_touch());
  const allowSfp = i32(p_allow_sfp()) == 1;
  let lost = 0.0;

  if (sw.newLow()) {
    const px = sw.lastLow();
    dB = px;
    dT = px + zDepth;
    dL = 1.0; dS = 0.0; dTouches = 0;
  }
  if (sw.newHigh()) {
    const px = sw.lastHigh();
    sT = px;
    sB = px - zDepth;
    sL = 1.0; sS = 0.0; sTouches = 0;
  }

  if (dL == 1.0 && !isNaN(dB)) {
    if (l <= dT && h >= dB) {
      dTouches += 1;
      if (dS < 2.0) dS = 2.0;
      if (dTouches >= maxT) { dS = 4.0; dL = 0.0; lost = 1.0; }
    } else if (c < dB - near) {
      if (allowSfp && h >= dB && c > dB) { dS = 3.0; }
      else { dS = 4.0; dL = 0.0; lost = 1.0; }
    } else if (Math.abs(l - dB) <= near || Math.abs(h - dT) <= near) {
      if (dS < 1.0) dS = 1.0;
    }
  }
  if (sL == 1.0 && !isNaN(sT)) {
    if (h >= sB && l <= sT) {
      sTouches += 1;
      if (sS < 2.0) sS = 2.0;
      if (sTouches >= maxT) { sS = 4.0; sL = 0.0; lost = 1.0; }
    } else if (c > sT + near) {
      if (allowSfp && l <= sT && c < sT) { sS = 3.0; }
      else { sS = 4.0; sL = 0.0; lost = 1.0; }
    } else if (Math.abs(h - sT) <= near || Math.abs(l - sB) <= near) {
      if (sS < 1.0) sS = 1.0;
    }
  }

  // ---- 3-touch trendlines
  const tol = p_tl_tol() * atr;
  if (sw.newHigh()) {
    hp3 = hp2; hi3 = hi2; hp2 = hp1; hi2 = hi1; hp1 = sw.lastHigh(); hi1 = idx - right;
    if (!isNaN(hp3) && hp1 < hp2 && hp2 < hp3 && hi1 > hi3) {
      const slope = (hp1 - hp3) / f64(hi1 - hi3);
      const mid = hp3 + slope * f64(hi2 - hi3);
      if (Math.abs(mid - hp2) <= tol) { rOn = true; rBase = hp1; rSlope = slope; rX0 = hi1; rBrokeAt = -1; rRetested = false; rT0 = bar.time(); rP0 = hp1; }
    }
  }
  if (sw.newLow()) {
    lp3 = lp2; li3 = li2; lp2 = lp1; li2 = li1; lp1 = sw.lastLow(); li1 = idx - right;
    if (!isNaN(lp3) && lp3 < lp2 && lp2 < lp1 && li1 > li3) {
      const slope = (lp1 - lp3) / f64(li1 - li3);
      const mid = lp3 + slope * f64(li2 - li3);
      if (Math.abs(mid - lp2) <= tol) { uOn = true; uBase = lp1; uSlope = slope; uX0 = li1; uBrokeAt = -1; uRetested = false; uT0 = bar.time(); uP0 = lp1; }
    }
  }
  const buf = p_brk_buf() * atr;
  const fb = i32(p_fake_bars());
  const rb = i32(p_retest_bars());
  let rv = NaN; let uv = NaN;
  let bu = 0.0; let bd = 0.0; let ru = 0.0; let rd = 0.0; let bp = NaN;

  if (rOn) {
    rv = rBase + rSlope * f64(idx - rX0);
    if (rBrokeAt < 0 && c > rv + buf) { rBrokeAt = idx; rBrokeLvl = rv; bu = 1.0; bp = rv; breaks += 1; }
    else if (rBrokeAt >= 0) {
      if (idx - rBrokeAt <= fb && c < rv) { fakes += 1; rOn = false; }
      else if (!rRetested && idx - rBrokeAt <= rb && idx > rBrokeAt && l <= rv + buf && c > rv) { rRetested = true; ru = 1.0; }
      else if (idx - rBrokeAt > rb) rOn = false;
    }
  }
  if (uOn) {
    uv = uBase + uSlope * f64(idx - uX0);
    if (uBrokeAt < 0 && c < uv - buf) { uBrokeAt = idx; uBrokeLvl = uv; bd = 1.0; bp = uv; breaks += 1; }
    else if (uBrokeAt >= 0) {
      if (idx - uBrokeAt <= fb && c > uv) { fakes += 1; uOn = false; }
      else if (!uRetested && idx - uBrokeAt <= rb && idx > uBrokeAt && h >= uv - buf && c < uv) { uRetested = true; rd = 1.0; }
      else if (idx - uBrokeAt > rb) uOn = false;
    }
  }

  const vol = bar.volume();
  const t = bar.time();
  const vdv = vD.update(o, h, l, c, vol, t);
  const vwv = vW.update(o, h, l, c, vol, t);
  const vmv = vM.update(o, h, l, c, vol, t);
  const v1 = e1.update(c); const v2 = e2.update(c); const v3 = e3.update(c);
  const v4 = e4.update(c); const v5 = e5.update(c); const v6 = e6.update(c);

  let barPoc: f64 = NaN;
  let barPocVol: f64 = NaN;
  const pn = in_profile_cells();
  if (pn >= 4) {
    const cells = in_profile_view();
    barPoc = vpPoc(cells, pn);
    barPocVol = vpPocVolume(cells, pn);
  }
  pcur = (pcur + 1) % MAXP;
  pocRing[pcur] = barPoc;
  pocVolRing[pcur] = barPocVol;
  if (pcount < MAXP) pcount += 1;
  let best = -1.0;
  const span = pcount < pN ? pcount : pN;
  for (let k = 1; k <= span; k += 1) {
    const j = (pcur - k + 1 + MAXP) % MAXP;
    const pv = pocVolRing[j];
    if (!isNaN(pv) && pv > best) { best = pv; pocLvl = pocRing[j]; }
  }
  if (best < 0.0) pocLvl = NaN;

  // Close-confirmed reactions (wick rejection + directional close)
  const range = h - l;
  const upWick = h - Math.max(o, c);
  const loWick = Math.min(o, c) - l;
  const wickMin = p_react_wick();
  const buyReact = dL == 1.0 && dS < 4.0 && !isNaN(dT) && l <= dT && c > dB && c > o && range > 0.0 && loWick / range >= wickMin;
  const sellReact = sL == 1.0 && sS < 4.0 && !isNaN(sB) && h >= sB && c < sT && c < o && range > 0.0 && upWick / range >= wickMin;

  const ct = p_conf_tol() * atr;
  let scoreBuy: f64 = 0.0;
  let scoreSell: f64 = 0.0;
  if (buyReact) {
    let s = wBase;
    if (shPoc && (inBand(pocLvl, dB, dT, ct) || inBand(barPoc, dB, dT, ct))) s += wPoc;
    if (shVd && inBand(vdv, dB, dT, ct)) s += wVd;
    if (shVw && inBand(vwv, dB, dT, ct)) s += wVw;
    if (shVm && inBand(vmv, dB, dT, ct)) s += wVm;
    if (shE1 && inBand(v1, dB, dT, ct)) s += wE1;
    if (shE2 && inBand(v2, dB, dT, ct)) s += wE2;
    if (shE3 && inBand(v3, dB, dT, ct)) s += wE3;
    if (shE4 && inBand(v4, dB, dT, ct)) s += wE4;
    if (shE5 && inBand(v5, dB, dT, ct)) s += wE5;
    if (shE6 && inBand(v6, dB, dT, ct)) s += wE6;
    if (shTl && uOn && inBand(uv, dB, dT, ct)) { s += wTl; if (ru == 1.0 || bu == 1.0) s += wTlb; }
    scoreBuy = Math.max(1.0, Math.min(100.0, Math.round(s)));
  }
  if (sellReact) {
    let s = wBase;
    if (shPoc && (inBand(pocLvl, sB, sT, ct) || inBand(barPoc, sB, sT, ct))) s += wPoc;
    if (shVd && inBand(vdv, sB, sT, ct)) s += wVd;
    if (shVw && inBand(vwv, sB, sT, ct)) s += wVw;
    if (shVm && inBand(vmv, sB, sT, ct)) s += wVm;
    if (shE1 && inBand(v1, sB, sT, ct)) s += wE1;
    if (shE2 && inBand(v2, sB, sT, ct)) s += wE2;
    if (shE3 && inBand(v3, sB, sT, ct)) s += wE3;
    if (shE4 && inBand(v4, sB, sT, ct)) s += wE4;
    if (shE5 && inBand(v5, sB, sT, ct)) s += wE5;
    if (shE6 && inBand(v6, sB, sT, ct)) s += wE6;
    if (shTl && rOn && inBand(rv, sB, sT, ct)) { s += wTl; if (rd == 1.0 || bd == 1.0) s += wTlb; }
    scoreSell = Math.max(1.0, Math.min(100.0, Math.round(s)));
  }
  const minS = p_min_score();
  const fireBuy = shSig && scoreBuy >= minS && scoreBuy > 0.0;
  const fireSell = shSig && scoreSell >= minS && scoreSell > 0.0;

  if (fireBuy && scoreBuy >= keepScore) {
    const tag = buyTags[nBuy % keepN];
    nBuy += 1;
    sb_clear(); sb_int(i32(scoreBuy));
    tag.set(f64(t), l - 0.3 * atr).text(str_tag_sb).color(TEAL);
  }
  if (fireSell && scoreSell >= keepScore) {
    const tag = sellTags[nSell % keepN];
    nSell += 1;
    sb_clear(); sb_int(i32(scoreSell));
    tag.set(f64(t), h + 0.3 * atr).text(str_tag_sb).color(PINK);
  }

  out_vwap_d(shVd ? vdv : NaN);
  out_vwap_w(shVw ? vwv : NaN);
  out_vwap_m(shVm ? vmv : NaN);
  out_ema_1(shE1 ? v1 : NaN);
  out_ema_2(shE2 ? v2 : NaN);
  out_ema_3(shE3 ? v3 : NaN);
  out_ema_4(shE4 ? v4 : NaN);
  out_ema_5(shE5 ? v5 : NaN);
  out_ema_6(shE6 ? v6 : NaN);
  out_poc_bar(shPoc ? barPoc : NaN);
  out_poc_lvl(shPoc ? pocLvl : NaN);

  out_g_buy(fireBuy ? 1.0 : 0.0);
  out_g_sell(fireSell ? 1.0 : 0.0);
  out_sig_buy(fireBuy ? l : NaN);
  out_sig_sell(fireSell ? h : NaN);
  out_conf_buy(fireBuy ? scoreBuy : NaN);
  out_conf_sell(fireSell ? scoreSell : NaN);

  out_d_top(dT); out_d_bot(dB); out_d_live(shZones ? dL : 0.0); out_d_state(dS);
  out_s_top(sT); out_s_bot(sB); out_s_live(shZones ? sL : 0.0); out_s_state(sS);

  if (shTl && rOn && !isNaN(rT0) && !isNaN(rv)) {
    const tEnd = t + Math.max(1.0, t - rT0);
    const pEnd = rv + rSlope * f64(Math.max(1, idx - rX0));
    out_tl_ray_at(0, rP0, pEnd, rT0, tEnd, 0, 0, 1);
  }
  if (shTl && uOn && !isNaN(uT0) && !isNaN(uv)) {
    const tEnd = t + Math.max(1.0, t - uT0);
    const pEnd = uv + uSlope * f64(Math.max(1, idx - uX0));
    out_tl_ray_at(1, uP0, pEnd, uT0, tEnd, 1, 1, 1);
  }

  out_g_brk_up(shTl ? bu : 0.0); out_g_brk_dn(shTl ? bd : 0.0);
  out_g_ret_up(shTl ? ru : 0.0); out_g_ret_dn(shTl ? rd : 0.0);
  out_brk_up((shTl && bu > 0.0) ? l : NaN);
  out_brk_dn((shTl && bd > 0.0) ? h : NaN);
  out_ret_up((shTl && ru > 0.0) ? l : NaN);
  out_ret_dn((shTl && rd > 0.0) ? h : NaN);
  out_g_zone_lost(shZones ? lost : 0.0);
  out_brk_price(shTl ? bp : NaN);
  out_fake_rate(shTl && breaks > 0 ? 100.0 * f64(fakes) / f64(breaks) : NaN);

  if (shPoc && !isNaN(pocLvl) && !isNaN(atr) && atr > 0.0) {
    const half = p_poc_half_atr() * atr;
    out_poc_top(pocLvl + half);
    out_poc_bot(pocLvl - half);
    out_poc_live(1.0);
    sb_clear(); sb_text("POC");
    pocTag.set(f64(t), pocLvl).text(str_tag_sb).color(rgba(251, 191, 36, 255));
  } else {
    out_poc_top(NaN); out_poc_bot(NaN); out_poc_live(0.0);
  }

  if (fireBuy && !isNaN(dT) && !isNaN(dB)) {
    const t0 = t - 900.0;
    out_conf_span_at(0, dT, dB, t0, t, 0, 0, 0);
  }
  if (fireSell && !isNaN(sT) && !isNaN(sB)) {
    const t0 = t - 900.0;
    out_conf_span_at(1, sT, sB, t0, t, 1, 1, 0);
  }

  pClose = c;
  idx += 1;
}
