//@lang=wrun-ts
// TORDAO indicator 1: no draw.label — shapes/lines/histograms only (history-safe)

input("close", ohlcv.close);
input("profile", volume_profile.cells, { max_cells: 8192, missing: "empty", description: "Bar volume by price" });
input("buy_vol", trades.volume, { side: "BUY", description: "Taker buy volume" });
input("sell_vol", trades.volume, { side: "SELL", description: "Taker sell volume" });

page("Display");
param.bool("show_zones", true, { label: "Auction zones" });
param.bool("show_tl", true, { label: "Confluence channels (max 3/side)" });
param.bool("show_patterns", true, { label: "Megaphone / wedge" });
param.bool("show_opens", true, { label: "Session opens + prev EQ" });
param.bool("show_targets", true, { label: "Spike targets min 2%" });
param.bool("show_poc", true, { label: "POC zone" });
param.bool("show_sig", true, { label: "Peak / near / LIQ marks" });
param.bool("show_vd", true, { label: "Daily VWAP" });
param.bool("show_vw", true, { label: "Weekly VWAP" });
param.bool("show_vm", true, { label: "Monthly VWAP" });
param.bool("show_e1", true, { label: "EMA 21" });
param.bool("show_e2", true, { label: "EMA 50" });
param.bool("show_e3", true, { label: "EMA 144" });
param.bool("show_e4", true, { label: "EMA 360" });
param.bool("show_e5", true, { label: "EMA 667" });
param.bool("show_e6", true, { label: "EMA 800" });

page("Logic");
param("swing_len", 3, { min: 2, max: 30, description: "Swing length" });
param("zone_atr", 0.6, { min: 0.1, max: 3, description: "Zone depth ATR" });
param("near_atr", 1.5, { min: 0.3, max: 6, description: "Revisit ATR" });
param("max_touch", 3, { min: 1, max: 10, description: "Max zone touches" });
param("allow_sfp", 1, { min: 0, max: 1, description: "Allow SFP" });
param.number("ch_atr", 0.6, { min: 0.15, max: 3, step: 0.05, label: "Channel half ATR", when: "show_tl" });
param("poc_lookback", 24, { min: 2, max: 200, description: "POC lookback" });
param("react_wick", 0.25, { min: 0, max: 0.9, description: "Min wick share" });
param("conf_tol", 0.5, { min: 0.05, max: 3, description: "Conf tol ATR" });
param.number("min_score", 20, { min: 1, max: 100, label: "Min reaction score", when: "show_sig" });
param.number("peak_score", 45, { min: 25, max: 100, label: "Peak neon threshold", when: "show_sig" });
param.number("near_score", 40, { min: 20, max: 80, label: "Near-peak threshold", when: "show_sig" });
param.number("tgt_min_pct", 2.0, { min: 1.0, max: 5.0, step: 0.25, label: "Min target %", when: "show_targets" });
param.number("tgt_max_pct", 7.0, { min: 3.0, max: 15.0, step: 0.5, label: "Max target %", when: "show_targets" });

page("Weights");
param("w_base", 25, { min: 0, max: 100, description: "Weight base" });
param.number("w_poc", 10, { min: 0, max: 100, label: "Weight POC", when: "show_poc" });
param.number("w_vd", 5, { min: 0, max: 100, label: "Weight dVWAP", when: "show_vd" });
param.number("w_vw", 7, { min: 0, max: 100, label: "Weight wVWAP", when: "show_vw" });
param.number("w_vm", 8, { min: 0, max: 100, label: "Weight mVWAP", when: "show_vm" });
param.number("w_e1", 2, { min: 0, max: 100, label: "Weight EMA1", when: "show_e1" });
param.number("w_e2", 3, { min: 0, max: 100, label: "Weight EMA2", when: "show_e2" });
param.number("w_e3", 4, { min: 0, max: 100, label: "Weight EMA3", when: "show_e3" });
param.number("w_e4", 5, { min: 0, max: 100, label: "Weight EMA4", when: "show_e4" });
param.number("w_e5", 5, { min: 0, max: 100, label: "Weight EMA5", when: "show_e5" });
param.number("w_e6", 6, { min: 0, max: 100, label: "Weight EMA6", when: "show_e6" });
param.number("w_tl", 12, { min: 0, max: 100, label: "Weight channel", when: "show_tl" });

page("EMAs");
param("ema1", 21, { min: 2, max: 2000, description: "EMA1" });
param("ema2", 50, { min: 2, max: 2000, description: "EMA2" });
param("ema3", 144, { min: 2, max: 2000, description: "EMA3" });
param("ema4", 360, { min: 2, max: 2000, description: "EMA4" });
param("ema5", 667, { min: 2, max: 2000, description: "EMA5" });
param("ema6", 800, { min: 2, max: 2000, description: "EMA6" });

const dTop = output("d_top", none);
const dBot = output("d_bot", none);
const dLive = output("d_live", none);
const dState = output("d_state", none);
const sTop = output("s_top", none);
const sBot = output("s_bot", none);
const sLive = output("s_live", none);
const sState = output("s_state", none);
box("demand_zone", { top: dTop, bottom: dBot, when: dLive, colorBy: dState, borderWidth: 1, borderStyle: "solid", opacity: 0.22,
  colors: ["#22c55e", "#facc15", "#38bdf8", "#f97316", "#64748b"], borderColors: ["#22c55e", "#facc15", "#38bdf8", "#f97316", "#64748b"], borderColorBy: dState });
box("supply_zone", { top: sTop, bottom: sBot, when: sLive, colorBy: sState, borderWidth: 1, borderStyle: "solid", opacity: 0.22,
  colors: ["#ef4444", "#facc15", "#38bdf8", "#f97316", "#64748b"], borderColors: ["#ef4444", "#facc15", "#38bdf8", "#f97316", "#64748b"], borderColorBy: sState });

const gBuy = output("g_buy", none);
const gSell = output("g_sell", none);
const gPeakBuy = output("g_peak_buy", none);
const gPeakSell = output("g_peak_sell", none);
const gNearBuy = output("g_near_buy", none);
const gNearSell = output("g_near_sell", none);
const gLiqBuy = output("g_liq_buy", none);
const gLiqSell = output("g_liq_sell", none);
const gTorus = output("g_torus", none);
box("neon_buy", { top: dTop, bottom: dBot, when: gBuy, color: "#00ffd5", opacity: 0.5, borderColor: "#00ffd5", borderWidth: 2, z: 5 });
box("neon_sell", { top: sTop, bottom: sBot, when: gSell, color: "#ff2bd6", opacity: 0.5, borderColor: "#ff2bd6", borderWidth: 2, z: 5 });
output("sig_buy", shape, overlay, { color: "#00ffd5", shape_where: "g_buy", shape: "triangle_up", location: "below_bar", glow: 10, description: "Buy reaction" });
output("sig_sell", shape, overlay, { color: "#ff2bd6", shape_where: "g_sell", shape: "triangle_down", location: "above_bar", glow: 10, description: "Sell reaction" });
output("mk_peak_buy", shape, overlay, { color: "#00ffd5", shape_where: "g_peak_buy", shape: "diamond", location: "below_bar", glow: 20, description: "PEAK BUY" });
output("mk_peak_sell", shape, overlay, { color: "#ff2bd6", shape_where: "g_peak_sell", shape: "diamond", location: "above_bar", glow: 20, description: "PEAK SELL" });
output("near_buy", shape, overlay, { color: "#5eead4", shape_where: "g_near_buy", shape: "circle", location: "below_bar", glow: 6, description: "Near-peak buy" });
output("near_sell", shape, overlay, { color: "#f472b6", shape_where: "g_near_sell", shape: "circle", location: "above_bar", glow: 6, description: "Near-peak sell" });
output("liq_buy", shape, overlay, { color: "#ffffff", shape_where: "g_liq_buy", shape: "diamond", location: "below_bar", glow: 8, description: "LIQ buy" });
output("liq_sell", shape, overlay, { color: "#ffffff", shape_where: "g_liq_sell", shape: "diamond", location: "above_bar", glow: 8, description: "LIQ sell" });
output("torus_sig", shape, overlay, { color: "#ffffff", shape_where: "g_torus", shape: "circle", location: "above_bar", glow: 12, description: "TORus Signal" });

output("conf_buy", histogram, lower, { color: "#00ffd5", description: "Buy confluence", format: "int" });
output("conf_sell", histogram, lower, { color: "#ff2bd6", description: "Sell confluence", format: "int" });
output("peak_bar_buy", histogram, lower, { color: "#00ffd5", description: "PEAK BUY mega bar", format: "int" });
output("peak_bar_sell", histogram, lower, { color: "#ff2bd6", description: "PEAK SELL mega bar", format: "int" });

const pocTop = output("poc_top", none);
const pocBot = output("poc_bot", none);
const pocLive = output("poc_live", none);
box("poc_zone", { top: pocTop, bottom: pocBot, when: pocLive, color: "#f59e0b", opacity: 0.18, borderColor: "#fbbf24", borderWidth: 2, borderStyle: "solid", z: 3 });
output("poc_bar", scatter, overlay, { color: "#fbbf24", description: "Bar POC" });
output("poc_lvl", line, overlay, { color: "#fbbf24", width: 2, step: true, line_style: "solid", description: "POC mid" });
param.number("poc_half_atr", 0.35, { min: 0.05, max: 2, step: 0.05, label: "POC half ATR", when: "show_poc" });

output("pk_res1", line, overlay, { color: "#f87171", width: 2, line_style: "solid", description: "Res1 upper" });
output("pk_res1m", line, overlay, { color: "#fca5a5", width: 1, line_style: "dotted", description: "Res1 mid" });
output("pk_res1lo", line, overlay, { color: "#f87171", width: 1, line_style: "solid", description: "Res1 lower" });
output("pk_res2", line, overlay, { color: "#dc2626", width: 2, line_style: "solid", description: "Res2 upper" });
output("pk_res2m", line, overlay, { color: "#fca5a5", width: 1, line_style: "dotted", description: "Res2 mid" });
output("pk_res2lo", line, overlay, { color: "#dc2626", width: 1, line_style: "solid", description: "Res2 lower" });
output("pk_res3", line, overlay, { color: "#991b1b", width: 2, line_style: "solid", description: "Res3 upper" });
output("pk_res3m", line, overlay, { color: "#fca5a5", width: 1, line_style: "dotted", description: "Res3 mid" });
output("pk_res3lo", line, overlay, { color: "#991b1b", width: 1, line_style: "solid", description: "Res3 lower" });
output("pk_sup1", line, overlay, { color: "#4ade80", width: 1, line_style: "solid", description: "Sup1 lower" });
output("pk_sup1m", line, overlay, { color: "#86efac", width: 1, line_style: "dotted", description: "Sup1 mid" });
output("pk_sup1hi", line, overlay, { color: "#4ade80", width: 2, line_style: "solid", description: "Sup1 upper" });
output("pk_sup2", line, overlay, { color: "#16a34a", width: 1, line_style: "solid", description: "Sup2 lower" });
output("pk_sup2m", line, overlay, { color: "#86efac", width: 1, line_style: "dotted", description: "Sup2 mid" });
output("pk_sup2hi", line, overlay, { color: "#16a34a", width: 2, line_style: "solid", description: "Sup2 upper" });
output("pk_sup3", line, overlay, { color: "#14532d", width: 1, line_style: "solid", description: "Sup3 lower" });
output("pk_sup3m", line, overlay, { color: "#86efac", width: 1, line_style: "dotted", description: "Sup3 mid" });
output("pk_sup3hi", line, overlay, { color: "#14532d", width: 2, line_style: "solid", description: "Sup3 upper" });

output("pat_hi", line, overlay, { color: "#ffffff", width: 2, line_style: "dashed", description: "Pattern upper" });
output("pat_lo", line, overlay, { color: "#ffffff", width: 2, line_style: "dashed", description: "Pattern lower" });
output("open_d", line, overlay, { color: "#ffffff", width: 2, line_style: "solid", description: "Daily open" });
output("open_w", line, overlay, { color: "#f8fafc", width: 2, line_style: "dashed", description: "Weekly open" });
output("open_m", line, overlay, { color: "#cbd5e1", width: 2, line_style: "dotted", description: "Monthly open" });
output("eq_pd", line, overlay, { color: "#94a3b8", width: 2, line_style: "dashed", description: "Prev day EQ" });
output("tgt_b1", line, overlay, { color: "#00ffd5", width: 2, line_style: "dotted", description: "Bull T1" });
output("tgt_b2", line, overlay, { color: "#00ffd5", width: 2, line_style: "solid", description: "Bull T2" });
output("tgt_s1", line, overlay, { color: "#ff2bd6", width: 2, line_style: "dotted", description: "Bear T1" });
output("tgt_s2", line, overlay, { color: "#ff2bd6", width: 2, line_style: "solid", description: "Bear T2" });

output("vwap_d", line, overlay, { color: "#38bdf8", width: 1, description: "dVWAP" });
output("vwap_w", line, overlay, { color: "#f5a623", width: 2, description: "wVWAP" });
output("vwap_m", line, overlay, { color: "#c084fc", width: 2, description: "mVWAP" });
output("ema_1", line, overlay, { color: "#fde047", width: 1, description: "EMA21" });
output("ema_2", line, overlay, { color: "#fb923c", width: 1, description: "EMA50" });
output("ema_3", line, overlay, { color: "#f43f5e", width: 2, description: "EMA144" });
output("ema_4", line, overlay, { color: "#a855f7", width: 2, description: "EMA360" });
output("ema_5", line, overlay, { color: "#3b82f6", width: 2, description: "EMA667" });
output("ema_6", line, overlay, { color: "#e2e8f0", width: 3, description: "EMA800" });

alert("buy_reaction", { when: gBuy, message: "{{symbol}}: BUY {{close}}", description: "Buy" });
alert("sell_reaction", { when: gSell, message: "{{symbol}}: SELL {{close}}", description: "Sell" });
alert("peak_buy_al", { when: gPeakBuy, message: "{{symbol}}: PEAK BUY {{close}}", description: "Peak buy" });
alert("peak_sell_al", { when: gPeakSell, message: "{{symbol}}: PEAK SELL {{close}}", description: "Peak sell" });

function vpPocIndex(cells: StaticArray<f64>, n: i32): i32 {
  let best: i32 = -1; let bestVolume: f64 = -1.0;
  for (let i = 0; i + 3 < n; i += 4) {
    const volume = cells[i + 2] + cells[i + 3];
    if (volume > bestVolume) { bestVolume = volume; best = i; }
  }
  return best;
}
function vpPoc(cells: StaticArray<f64>, n: i32): f64 {
  const i = vpPocIndex(cells, n);
  return i < 0 ? NaN : (cells[i] + cells[i + 1]) / 2.0;
}
function inBand(level: f64, lo: f64, hi: f64, tol: f64): bool {
  return !isNaN(level) && !isNaN(lo) && !isNaN(hi) && level >= lo - tol && level <= hi + tol;
}

const MAXP = 200;
const pocRing = new StaticArray<f64>(MAXP);
const pocVolRing = new StaticArray<f64>(MAXP);
let pcur: i32 = 0; let pcount: i32 = 0; let pN: i32 = 24; let pocLvl: f64 = NaN;
let wBase: f64 = 25.0; let wPoc: f64 = 10.0; let wVd: f64 = 5.0; let wVw: f64 = 7.0; let wVm: f64 = 8.0;
let wE1: f64 = 2.0; let wE2: f64 = 3.0; let wE3: f64 = 4.0; let wE4: f64 = 5.0; let wE5: f64 = 5.0; let wE6: f64 = 6.0;
let wTl: f64 = 12.0;
let sw = new Swings(3, 3);
let vD = new Vwap("day", "hlc3"); let vW = new Vwap("week", "hlc3"); let vM = new Vwap("month", "hlc3");
let e1 = new Ema(21); let e2 = new Ema(50); let e3 = new Ema(144); let e4 = new Ema(360); let e5 = new Ema(667); let e6 = new Ema(800);
let right: i32 = 3; let idx: i32 = 0; let atr: f64 = NaN; let pClose: f64 = NaN;
let dT: f64 = NaN; let dB: f64 = NaN; let dL: f64 = 0.0; let dS: f64 = 0.0; let dTouches: i32 = 0;
let sT: f64 = NaN; let sB: f64 = NaN; let sL: f64 = 0.0; let sS: f64 = 0.0; let sTouches: i32 = 0;
let hp1: f64 = NaN; let hp2: f64 = NaN; let hi1: i32 = 0; let hi2: i32 = 0;
let lp1: f64 = NaN; let lp2: f64 = NaN; let li1: i32 = 0; let li2: i32 = 0;
let dayKey: i32 = -1; let weekKey: i32 = -1; let monKey: i32 = -1;
let dayOpen: f64 = NaN; let weekOpen: f64 = NaN; let monOpen: f64 = NaN;
let dayHi: f64 = NaN; let dayLo: f64 = NaN; let pdHi: f64 = NaN; let pdLo: f64 = NaN;
let nearBuyLeft: i32 = 0; let nearSellLeft: i32 = 0;
let nearScore: f64 = 40.0; let volAvg: f64 = NaN;
const PKN = 96;
const pkHi = new StaticArray<f64>(PKN);
const pkLo = new StaticArray<f64>(PKN);
let pkHiN: i32 = 0; let pkLoN: i32 = 0; let pkHiC: i32 = 0; let pkLoC: i32 = 0;
let shPatterns = true; let shOpens = true; let shTargets = true;
let chAtr: f64 = 0.6; let peakScore: f64 = 45.0; let tgtMin: f64 = 2.0; let tgtMax: f64 = 7.0;
let shZones = true; let shTl = true; let shPoc = true; let shSig = true;
let shVd = true; let shVw = true; let shVm = true;
let shE1 = true; let shE2 = true; let shE3 = true; let shE4 = true; let shE5 = true; let shE6 = true;
let lastRes1: f64 = NaN; let lastRes2: f64 = NaN; let lastRes3: f64 = NaN;
let lastSup1: f64 = NaN; let lastSup2: f64 = NaN; let lastSup3: f64 = NaN;

function onStart(): void {
  right = i32(p_swing_len()); sw = new Swings(right, right);
  pN = i32(p_poc_lookback());
  wBase = p_w_base(); wPoc = p_w_poc(); wVd = p_w_vd(); wVw = p_w_vw(); wVm = p_w_vm();
  wE1 = p_w_e1(); wE2 = p_w_e2(); wE3 = p_w_e3(); wE4 = p_w_e4(); wE5 = p_w_e5(); wE6 = p_w_e6();
  wTl = p_w_tl();
  e1 = new Ema(i32(p_ema1())); e2 = new Ema(i32(p_ema2())); e3 = new Ema(i32(p_ema3()));
  e4 = new Ema(i32(p_ema4())); e5 = new Ema(i32(p_ema5())); e6 = new Ema(i32(p_ema6()));
  shZones = pb_show_zones(); shTl = pb_show_tl(); shPoc = pb_show_poc(); shSig = pb_show_sig();
  shVd = pb_show_vd(); shVw = pb_show_vw(); shVm = pb_show_vm();
  shE1 = pb_show_e1(); shE2 = pb_show_e2(); shE3 = pb_show_e3(); shE4 = pb_show_e4(); shE5 = pb_show_e5(); shE6 = pb_show_e6();
  shPatterns = pb_show_patterns(); shOpens = pb_show_opens(); shTargets = pb_show_targets();
  chAtr = p_ch_atr(); peakScore = p_peak_score(); nearScore = p_near_score();
  tgtMin = p_tgt_min_pct(); tgtMax = p_tgt_max_pct();
}

function onBar(): void {
  const o = bar.open(); const h = bar.high(); const l = bar.low(); const c = bar.close();
  const tr = isNaN(pClose) ? h - l : Math.max(h - l, Math.max(Math.abs(h - pClose), Math.abs(l - pClose)));
  atr = isNaN(atr) ? tr : (atr * 13.0 + tr) / 14.0;
  if (atr <= 0.0) atr = Math.abs(c) * 0.01;
  sw.update(h, l);
  const zDepth = p_zone_atr() * atr; const near = p_near_atr() * atr;
  const maxT = i32(p_max_touch()); const allowSfp = i32(p_allow_sfp()) == 1; let lost = 0.0;
  if (sw.newLow()) { const px = sw.lastLow(); dB = px; dT = px + zDepth; dL = 1.0; dS = 0.0; dTouches = 0; }
  if (sw.newHigh()) { const px = sw.lastHigh(); sT = px; sB = px - zDepth; sL = 1.0; sS = 0.0; sTouches = 0; }
  if (dL == 1.0 && !isNaN(dB)) {
    if (l <= dT && h >= dB) { dTouches += 1; if (dS < 2.0) dS = 2.0; if (dTouches >= maxT) { dS = 4.0; dL = 0.0; lost = 1.0; } }
    else if (c < dB - near) { if (allowSfp && h >= dB && c > dB) dS = 3.0; else { dS = 4.0; dL = 0.0; lost = 1.0; } }
    else if (Math.abs(l - dB) <= near || Math.abs(h - dT) <= near) { if (dS < 1.0) dS = 1.0; }
  }
  if (sL == 1.0 && !isNaN(sT)) {
    if (h >= sB && l <= sT) { sTouches += 1; if (sS < 2.0) sS = 2.0; if (sTouches >= maxT) { sS = 4.0; sL = 0.0; lost = 1.0; } }
    else if (c > sT + near) { if (allowSfp && l <= sT && c < sT) sS = 3.0; else { sS = 4.0; sL = 0.0; lost = 1.0; } }
    else if (Math.abs(h - sT) <= near || Math.abs(l - sB) <= near) { if (sS < 1.0) sS = 1.0; }
  }
  if (sw.newHigh()) {
    hp2 = hp1; hi2 = hi1; hp1 = sw.lastHigh(); hi1 = idx - right;
    pkHi[pkHiC % PKN] = hp1; pkHiC += 1; if (pkHiN < PKN) pkHiN += 1;
  }
  if (sw.newLow()) {
    lp2 = lp1; li2 = li1; lp1 = sw.lastLow(); li1 = idx - right;
    pkLo[pkLoC % PKN] = lp1; pkLoC += 1; if (pkLoN < PKN) pkLoN += 1;
  }
  const vol = bar.volume(); const t = bar.time();
  const bVol = in_buy_vol(); const sVol = in_sell_vol();
  volAvg = isNaN(volAvg) ? vol : (volAvg * 19.0 + vol) / 20.0;
  const hiVol = !isNaN(volAvg) && volAvg > 0.0 && vol >= volAvg * 1.8;
  const flow = bVol + sVol;
  const buyShare = flow > 0.0 ? bVol / flow : 0.5;
  const sellShare = flow > 0.0 ? sVol / flow : 0.5;
  const tSec = t > 100000000000.0 ? t / 1000.0 : t;
  const dKey = i32(Math.floor(tSec / 86400.0));
  const wKey = i32(Math.floor((tSec - 345600.0) / 604800.0));
  const mKey = i32(Math.floor(tSec / 2629800.0));
  if (dKey != dayKey) { pdHi = dayHi; pdLo = dayLo; dayHi = h; dayLo = l; dayOpen = o; dayKey = dKey; }
  else { if (isNaN(dayHi) || h > dayHi) dayHi = h; if (isNaN(dayLo) || l < dayLo) dayLo = l; if (isNaN(dayOpen)) dayOpen = o; }
  if (wKey != weekKey) { weekOpen = o; weekKey = wKey; }
  if (mKey != monKey) { monOpen = o; monKey = mKey; }
  if (isNaN(dayOpen)) dayOpen = o; if (isNaN(weekOpen)) weekOpen = o; if (isNaN(monOpen)) monOpen = o;
  const vdv = vD.update(o, h, l, c, vol, t); const vwv = vW.update(o, h, l, c, vol, t); const vmv = vM.update(o, h, l, c, vol, t);
  const v1 = e1.update(c); const v2 = e2.update(c); const v3 = e3.update(c); const v4 = e4.update(c); const v5 = e5.update(c); const v6 = e6.update(c);
  let barPoc: f64 = NaN; const pn = in_profile_cells();
  if (pn >= 4) { const cells = in_profile_view(); barPoc = vpPoc(cells, pn); }
  pcur = (pcur + 1) % MAXP; pocRing[pcur] = barPoc; pocVolRing[pcur] = isNaN(barPoc) ? 0.0 : 1.0; if (pcount < MAXP) pcount += 1;
  let best = -1.0; const span = pcount < pN ? pcount : pN;
  for (let k = 1; k <= span; k += 1) { const j = (pcur - k + 1 + MAXP) % MAXP; const pv = pocVolRing[j]; if (!isNaN(pv) && pv > best) { best = pv; pocLvl = pocRing[j]; } }
  if (best < 0.0) pocLvl = NaN;
  const range = h - l; const upWick = h - Math.max(o, c); const loWick = Math.min(o, c) - l; const wickMin = p_react_wick();
  const buyReact = dL == 1.0 && dS < 4.0 && !isNaN(dT) && l <= dT && c > dB && c > o && range > 0.0 && loWick / range >= wickMin;
  const sellReact = sL == 1.0 && sS < 4.0 && !isNaN(sB) && h >= sB && c < sT && c < o && range > 0.0 && upWick / range >= wickMin;
  const ct = p_conf_tol() * atr; let scoreBuy: f64 = 0.0; let scoreSell: f64 = 0.0;
  if (buyReact) {
    let s = wBase;
    if (shPoc && (inBand(pocLvl, dB, dT, ct) || inBand(barPoc, dB, dT, ct))) s += wPoc;
    if (shVd && inBand(vdv, dB, dT, ct)) s += wVd; if (shVw && inBand(vwv, dB, dT, ct)) s += wVw; if (shVm && inBand(vmv, dB, dT, ct)) s += wVm;
    if (shE1 && inBand(v1, dB, dT, ct)) s += wE1; if (shE2 && inBand(v2, dB, dT, ct)) s += wE2; if (shE3 && inBand(v3, dB, dT, ct)) s += wE3;
    if (shE4 && inBand(v4, dB, dT, ct)) s += wE4; if (shE5 && inBand(v5, dB, dT, ct)) s += wE5; if (shE6 && inBand(v6, dB, dT, ct)) s += wE6;
    if (shTl && !isNaN(lp1) && inBand(lp1, dB, dT, ct)) s += wTl;
    scoreBuy = Math.max(1.0, Math.min(100.0, Math.round(s)));
  }
  if (sellReact) {
    let s = wBase;
    if (shPoc && (inBand(pocLvl, sB, sT, ct) || inBand(barPoc, sB, sT, ct))) s += wPoc;
    if (shVd && inBand(vdv, sB, sT, ct)) s += wVd; if (shVw && inBand(vwv, sB, sT, ct)) s += wVw; if (shVm && inBand(vmv, sB, sT, ct)) s += wVm;
    if (shE1 && inBand(v1, sB, sT, ct)) s += wE1; if (shE2 && inBand(v2, sB, sT, ct)) s += wE2; if (shE3 && inBand(v3, sB, sT, ct)) s += wE3;
    if (shE4 && inBand(v4, sB, sT, ct)) s += wE4; if (shE5 && inBand(v5, sB, sT, ct)) s += wE5; if (shE6 && inBand(v6, sB, sT, ct)) s += wE6;
    if (shTl && !isNaN(hp1) && inBand(hp1, sB, sT, ct)) s += wTl;
    scoreSell = Math.max(1.0, Math.min(100.0, Math.round(s)));
  }
  const minS = p_min_score();
  const fireBuy = shSig && scoreBuy >= minS && scoreBuy > 0.0;
  const fireSell = shSig && scoreSell >= minS && scoreSell > 0.0;
  const peakBuy = (fireBuy && scoreBuy >= peakScore) || (buyReact && scoreBuy >= nearScore) || (buyReact && buyShare >= 0.55 && scoreBuy >= minS) || (buyReact && hiVol);
  const peakSell = (fireSell && scoreSell >= peakScore) || (sellReact && hiVol && scoreSell >= nearScore);
  if (peakBuy || (fireBuy && scoreBuy >= nearScore)) nearBuyLeft = 3;
  if (peakSell || (fireSell && scoreSell >= nearScore)) nearSellLeft = 3;
  const nearBuyOn = nearBuyLeft > 0 && !peakBuy;
  const nearSellOn = nearSellLeft > 0 && !peakSell;
  if (nearBuyLeft > 0) nearBuyLeft -= 1;
  if (nearSellLeft > 0) nearSellLeft -= 1;

  out_vwap_d(shVd ? vdv : NaN); out_vwap_w(shVw ? vwv : NaN); out_vwap_m(shVm ? vmv : NaN);
  out_ema_1(shE1 ? v1 : NaN); out_ema_2(shE2 ? v2 : NaN); out_ema_3(shE3 ? v3 : NaN);
  out_ema_4(shE4 ? v4 : NaN); out_ema_5(shE5 ? v5 : NaN); out_ema_6(shE6 ? v6 : NaN);
  out_poc_bar(shPoc ? barPoc : NaN); out_poc_lvl(shPoc ? pocLvl : NaN);
  out_g_buy(fireBuy ? 1.0 : 0.0); out_g_sell(fireSell ? 1.0 : 0.0);
  out_g_peak_buy(peakBuy ? 1.0 : 0.0); out_g_peak_sell(peakSell ? 1.0 : 0.0);
  out_g_near_buy(nearBuyOn ? 1.0 : 0.0); out_g_near_sell(nearSellOn ? 1.0 : 0.0);
  out_sig_buy(fireBuy ? l : NaN); out_sig_sell(fireSell ? h : NaN);
  out_mk_peak_buy(peakBuy ? l : NaN); out_mk_peak_sell(peakSell ? h : NaN);
  out_near_buy(nearBuyOn ? l : NaN); out_near_sell(nearSellOn ? h : NaN);
  const liqBuy = (fireBuy || buyReact) && hiVol && dL == 1.0;
  const liqSell = (fireSell || sellReact) && hiVol && sL == 1.0;
  out_g_liq_buy(liqBuy ? 1.0 : 0.0); out_g_liq_sell(liqSell ? 1.0 : 0.0);
  out_liq_buy(liqBuy ? l : NaN); out_liq_sell(liqSell ? h : NaN);
  out_conf_buy(fireBuy ? scoreBuy : NaN); out_conf_sell(fireSell ? scoreSell : NaN);
  out_d_top(dT); out_d_bot(dB); out_d_live(shZones ? dL : 0.0); out_d_state(dS);
  out_s_top(sT); out_s_bot(sB); out_s_live(shZones ? sL : 0.0); out_s_state(sS);

  if (shTl && pkHiN >= 1) {
    const half = chAtr * atr; const tolP = atr * 0.25;
    let best1 = NaN; let best2 = NaN; let best3 = NaN;
    let sc1 = -1.0; let sc2 = -1.0; let sc3 = -1.0;
    for (let i = 0; i < pkHiN; i += 1) {
      const v = pkHi[i]; if (isNaN(v)) continue;
      let sc = 0.0;
      for (let j = 0; j < pkHiN; j += 1) { const w = pkHi[j]; if (!isNaN(w) && Math.abs(w - v) <= tolP) sc += 1.0; }
      if (sc > sc1 || (sc == sc1 && (isNaN(best1) || v > best1))) { sc3 = sc2; best3 = best2; sc2 = sc1; best2 = best1; sc1 = sc; best1 = v; }
      else if ((sc > sc2 || (sc == sc2 && (isNaN(best2) || v > best2))) && (isNaN(best1) || Math.abs(v - best1) > tolP)) { sc3 = sc2; best3 = best2; sc2 = sc; best2 = v; }
      else if ((sc > sc3 || (sc == sc3 && (isNaN(best3) || v > best3))) && (isNaN(best1) || Math.abs(v - best1) > tolP) && (isNaN(best2) || Math.abs(v - best2) > tolP)) { sc3 = sc; best3 = v; }
    }
    lastRes1 = best1; lastRes2 = best2; lastRes3 = best3;
    if (!isNaN(best1)) { out_pk_res1(best1); out_pk_res1lo(best1 - half); out_pk_res1m(best1 - 0.5 * half); } else { out_pk_res1(NaN); out_pk_res1lo(NaN); out_pk_res1m(NaN); }
    if (!isNaN(best2)) { out_pk_res2(best2); out_pk_res2lo(best2 - half); out_pk_res2m(best2 - 0.5 * half); } else { out_pk_res2(NaN); out_pk_res2lo(NaN); out_pk_res2m(NaN); }
    if (!isNaN(best3)) { out_pk_res3(best3); out_pk_res3lo(best3 - half); out_pk_res3m(best3 - 0.5 * half); } else { out_pk_res3(NaN); out_pk_res3lo(NaN); out_pk_res3m(NaN); }
  } else {
    out_pk_res1(NaN); out_pk_res1lo(NaN); out_pk_res1m(NaN); out_pk_res2(NaN); out_pk_res2lo(NaN); out_pk_res2m(NaN); out_pk_res3(NaN); out_pk_res3lo(NaN); out_pk_res3m(NaN);
  }
  if (shTl && pkLoN >= 1) {
    const half = chAtr * atr; const tolP = atr * 0.25;
    let best1 = NaN; let best2 = NaN; let best3 = NaN;
    let sc1 = -1.0; let sc2 = -1.0; let sc3 = -1.0;
    for (let i = 0; i < pkLoN; i += 1) {
      const v = pkLo[i]; if (isNaN(v)) continue;
      let sc = 0.0;
      for (let j = 0; j < pkLoN; j += 1) { const w = pkLo[j]; if (!isNaN(w) && Math.abs(w - v) <= tolP) sc += 1.0; }
      if (sc > sc1 || (sc == sc1 && (isNaN(best1) || v < best1))) { sc3 = sc2; best3 = best2; sc2 = sc1; best2 = best1; sc1 = sc; best1 = v; }
      else if ((sc > sc2 || (sc == sc2 && (isNaN(best2) || v < best2))) && (isNaN(best1) || Math.abs(v - best1) > tolP)) { sc3 = sc2; best3 = best2; sc2 = sc; best2 = v; }
      else if ((sc > sc3 || (sc == sc3 && (isNaN(best3) || v < best3))) && (isNaN(best1) || Math.abs(v - best1) > tolP) && (isNaN(best2) || Math.abs(v - best2) > tolP)) { sc3 = sc; best3 = v; }
    }
    lastSup1 = best1; lastSup2 = best2; lastSup3 = best3;
    if (!isNaN(best1)) { out_pk_sup1(best1); out_pk_sup1hi(best1 + half); out_pk_sup1m(best1 + 0.5 * half); } else { out_pk_sup1(NaN); out_pk_sup1hi(NaN); out_pk_sup1m(NaN); }
    if (!isNaN(best2)) { out_pk_sup2(best2); out_pk_sup2hi(best2 + half); out_pk_sup2m(best2 + 0.5 * half); } else { out_pk_sup2(NaN); out_pk_sup2hi(NaN); out_pk_sup2m(NaN); }
    if (!isNaN(best3)) { out_pk_sup3(best3); out_pk_sup3hi(best3 + half); out_pk_sup3m(best3 + 0.5 * half); } else { out_pk_sup3(NaN); out_pk_sup3hi(NaN); out_pk_sup3m(NaN); }
  } else {
    out_pk_sup1(NaN); out_pk_sup1hi(NaN); out_pk_sup1m(NaN); out_pk_sup2(NaN); out_pk_sup2hi(NaN); out_pk_sup2m(NaN); out_pk_sup3(NaN); out_pk_sup3hi(NaN); out_pk_sup3m(NaN);
  }

  if (shPoc && !isNaN(pocLvl)) {
    const half = p_poc_half_atr() * atr; out_poc_top(pocLvl + half); out_poc_bot(pocLvl - half); out_poc_live(1.0);
  } else { out_poc_top(NaN); out_poc_bot(NaN); out_poc_live(0.0); }
  if (shOpens) {
    out_open_d(dayOpen); out_open_w(weekOpen); out_open_m(monOpen);
    out_eq_pd((!isNaN(pdHi) && !isNaN(pdLo)) ? (pdHi + pdLo) * 0.5 : NaN);
  } else { out_open_d(NaN); out_open_w(NaN); out_open_m(NaN); out_eq_pd(NaN); }
  if (shPatterns && !isNaN(hp1) && !isNaN(hp2) && !isNaN(lp1) && !isNaN(lp2) && hi1 != hi2 && li1 != li2) {
    const hs2 = (hp1 - hp2) / f64(hi1 - hi2); const ls2 = (lp1 - lp2) / f64(li1 - li2);
    out_pat_hi(hp1 + hs2 * f64(idx - hi1)); out_pat_lo(lp1 + ls2 * f64(idx - li1));
  } else { out_pat_hi(NaN); out_pat_lo(NaN); }
  if (shTargets) {
    const loPct = tgtMin / 100.0; const hiPct = tgtMax / 100.0;
    out_tgt_b1(c * (1.0 + loPct)); out_tgt_b2(c * (1.0 + hiPct * 0.85));
    out_tgt_s1(c * (1.0 - loPct)); out_tgt_s2(c * (1.0 - hiPct * 0.85));
  } else { out_tgt_b1(NaN); out_tgt_b2(NaN); out_tgt_s1(NaN); out_tgt_s2(NaN); }

  if (peakBuy) { out_peak_bar_buy(100.0); out_peak_bar_sell(0.0); }
  else if (peakSell) { out_peak_bar_buy(0.0); out_peak_bar_sell(100.0); }
  else if (fireBuy) { out_peak_bar_buy(Math.max(40.0, scoreBuy)); out_peak_bar_sell(0.0); }
  else if (fireSell) { out_peak_bar_buy(0.0); out_peak_bar_sell(Math.max(40.0, scoreSell)); }
  else { out_peak_bar_buy(0.0); out_peak_bar_sell(0.0); }

  {
    let torus = false;
    if (!isNaN(vdv) && l <= vdv && h >= vdv) torus = true;
    if (!isNaN(v2) && l <= v2 && h >= v2) torus = true;
    if (!isNaN(lastRes1) && l <= lastRes1 && h >= lastRes1) torus = true;
    if (!isNaN(lastRes2) && l <= lastRes2 && h >= lastRes2) torus = true;
    if (!isNaN(lastRes3) && l <= lastRes3 && h >= lastRes3) torus = true;
    if (!isNaN(lastSup1) && l <= lastSup1 && h >= lastSup1) torus = true;
    if (!isNaN(lastSup2) && l <= lastSup2 && h >= lastSup2) torus = true;
    if (!isNaN(lastSup3) && l <= lastSup3 && h >= lastSup3) torus = true;
    out_g_torus(torus ? 1.0 : 0.0);
    out_torus_sig(torus ? h : NaN);
  }
  pClose = c; idx += 1;
}
