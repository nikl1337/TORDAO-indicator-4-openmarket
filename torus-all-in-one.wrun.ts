//@lang=wrun-ts
// TORDAO single indicator: zones + peak/LIQ/TORus + bat/butterfly harmonics
// + 3 red resistance + 3 green support regression channels (fat outer, dotted mid)
// + bull/bear flags (white, top 3 each) + osc (2 EMA + 2 SMA)
// + candle labels + teal/pink trendlines (max 16 of 30) + fib confluence zones (0.2%).

input("close", ohlcv.close);
input("profile", volume_profile.cells, { max_cells: 8192, missing: "empty", description: "Bar volume by price" });
input("buy_vol", trades.volume, { side: "BUY", description: "Taker buy volume" });
input("sell_vol", trades.volume, { side: "SELL", description: "Taker sell volume" });

page("Display");
param.bool("show_zones", true, { label: "Auction zones" });
param.bool("show_ch", true, { label: "Regression channels (3 red + 3 green)" });
param.bool("show_harm", true, { label: "Bat / Butterfly harmonics" });
param.bool("show_flags", true, { label: "Bull / Bear flags (white)" });
param.bool("show_tl", true, { label: "Trend lines (teal up / pink down, max 30)" });
param.bool("show_fibz", true, { label: "Fib confluence target zones (2 green / 2 red)" });
param.bool("show_osc", true, { label: "Confluence oscillator" });
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
param.number("ch_atr", 0.6, { min: 0.15, max: 3, step: 0.05, label: "Channel half ATR", when: "show_ch" });
param("poc_lookback", 24, { min: 2, max: 200, description: "POC lookback" });
param("react_wick", 0.25, { min: 0, max: 0.9, description: "Min wick share" });
param("conf_tol", 0.5, { min: 0.05, max: 3, description: "Conf tol ATR" });
param.number("min_score", 20, { min: 1, max: 100, label: "Min reaction score", when: "show_sig" });
param.number("peak_score", 45, { min: 25, max: 100, label: "Peak neon threshold", when: "show_sig" });
param.number("near_score", 40, { min: 20, max: 80, label: "Near-peak threshold", when: "show_sig" });
param.number("tgt_min_pct", 2.0, { min: 1.0, max: 5.0, step: 0.25, label: "Min target %", when: "show_targets" });
param.number("tgt_max_pct", 7.0, { min: 3.0, max: 15.0, step: 0.5, label: "Max target %", when: "show_targets" });

page("Channels");
param.int("ch_lb1", 34, { min: 10, max: 200, label: "Channel 1 lookback", when: "show_ch" });
param.int("ch_lb2", 89, { min: 20, max: 300, label: "Channel 2 lookback", when: "show_ch" });
param.int("ch_lb3", 200, { min: 50, max: 337, label: "Channel 3 lookback", when: "show_ch" });
param.number("fib_tol", 0.05, { min: 0.01, max: 0.15, step: 0.01, label: "Fib ratio tolerance", when: "show_harm" });
param.number("flag_pole_atr", 1.8, { min: 0.8, max: 6, step: 0.1, label: "Min flag pole size (ATR)", when: "show_flags" });
param.int("flag_max_bars", 400, { min: 100, max: 400, label: "Flag lookback bars", when: "show_flags" });

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
param.number("w_tl", 12, { min: 0, max: 100, label: "Weight channel", when: "show_ch" });

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
const gBat = output("g_bat", none);
const gFly = output("g_fly", none);
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
output("bat_mk", shape, overlay, { color: "#a78bfa", shape_where: "g_bat", shape: "diamond", location: "above_bar", glow: 14, description: "BAT pattern" });
output("fly_mk", shape, overlay, { color: "#fbbf24", shape_where: "g_fly", shape: "diamond", location: "above_bar", glow: 14, description: "BUTTERFLY pattern" });

const gHot = output("g_hot", none);
const gSfpB = output("g_sfp_b", none);
const gSfpS = output("g_sfp_s", none);
output("hot_mk", shape, overlay, { color: "#facc15", shape_where: "g_hot", shape: "circle", location: "below_bar", glow: 26, description: "Sharp-move candle" });
output("sfp_b_mk", shape, overlay, { color: "#00ffd5", shape_where: "g_sfp_b", shape: "circle", location: "below_bar", glow: 8, description: "SFP buy" });
output("sfp_s_mk", shape, overlay, { color: "#ff2bd6", shape_where: "g_sfp_s", shape: "circle", location: "above_bar", glow: 8, description: "SFP sell" });

const hotTop = output("hot_top", none);
const hotBot = output("hot_bot", none);
box("hot_candle", { top: hotTop, bottom: hotBot, when: gHot, color: "#facc15", opacity: 0.12, borderColor: "#facc15", borderWidth: 2, z: 6 });

// fib confluence target zones: 2 green below, 2 red above, width 0.2% of price
const fzB1T = output("fz_b1_t", none); const fzB1B = output("fz_b1_b", none); const fzB1L = output("fz_b1_l", none);
const fzB2T = output("fz_b2_t", none); const fzB2B = output("fz_b2_b", none); const fzB2L = output("fz_b2_l", none);
const fzS1T = output("fz_s1_t", none); const fzS1B = output("fz_s1_b", none); const fzS1L = output("fz_s1_l", none);
const fzS2T = output("fz_s2_t", none); const fzS2B = output("fz_s2_b", none); const fzS2L = output("fz_s2_l", none);
box("fib_buy_1", { top: fzB1T, bottom: fzB1B, when: fzB1L, color: "#22c55e", opacity: 0.22, borderColor: "#22c55e", borderWidth: 1, z: 2 });
box("fib_buy_2", { top: fzB2T, bottom: fzB2B, when: fzB2L, color: "#16a34a", opacity: 0.18, borderColor: "#4ade80", borderWidth: 1, z: 2 });
box("fib_sell_1", { top: fzS1T, bottom: fzS1B, when: fzS1L, color: "#ef4444", opacity: 0.22, borderColor: "#ef4444", borderWidth: 1, z: 2 });
box("fib_sell_2", { top: fzS2T, bottom: fzS2B, when: fzS2L, color: "#b91c1c", opacity: 0.18, borderColor: "#f87171", borderWidth: 1, z: 2 });

// oscillator: 4 speeds (2 EMA + 2 SMA). yellow slice = candle pattern on that bar
output("osc_buy_hi", histogram, lower, { color: "#00ffd5", description: "Buy high confluence", format: "0" });
output("osc_buy", histogram, lower, { color: "#5eead4", description: "Buy confluence", format: "0" });
output("osc_soon", histogram, lower, { color: "#3b82f6", description: "Buy confluence soon", format: "0" });
output("osc_sell", histogram, lower, { color: "#ef4444", description: "Sell confluence", format: "0" });
output("osc_sell_hi", histogram, lower, { color: "#ff2bd6", description: "Sell high confluence", format: "0" });
output("osc_pat", histogram, lower, { color: "#facc15", description: "Candle pattern slice", format: "0" });

// most important trend lines: rising teal, falling pink. cap 16 (limit 30)
handles.line({ width: 2, line_style: "solid", extend: "right" });
const tl0 = draw.line(40); const tl1 = draw.line(41); const tl2 = draw.line(42); const tl3 = draw.line(43);
const tl4 = draw.line(44); const tl5 = draw.line(45); const tl6 = draw.line(46); const tl7 = draw.line(47);
const tl8 = draw.line(48); const tl9 = draw.line(49); const tl10 = draw.line(50); const tl11 = draw.line(51);
const tl12 = draw.line(52); const tl13 = draw.line(53); const tl14 = draw.line(54); const tl15 = draw.line(55);
function tlAt(i: i32): LineHandle {
  if (i == 0) return tl0; if (i == 1) return tl1; if (i == 2) return tl2; if (i == 3) return tl3;
  if (i == 4) return tl4; if (i == 5) return tl5; if (i == 6) return tl6; if (i == 7) return tl7;
  if (i == 8) return tl8; if (i == 9) return tl9; if (i == 10) return tl10; if (i == 11) return tl11;
  if (i == 12) return tl12; if (i == 13) return tl13; if (i == 14) return tl14; return tl15;
}

string("tag", { max_bytes: 32 });
handles.label({ size: 16, style: "knockout", font_weight: "bold" });
const lab0 = draw.label(60); const lab1 = draw.label(61); const lab2 = draw.label(62); const lab3 = draw.label(63);
const lab4 = draw.label(64); const lab5 = draw.label(65);
function labAt(i: i32): LabelHandle {
  if (i == 0) return lab0; if (i == 1) return lab1; if (i == 2) return lab2;
  if (i == 3) return lab3; if (i == 4) return lab4; return lab5;
}
let labN: i32 = 0;

// white flag outlines (top 3 bull + top 3 bear)
handles.polyline({ width: 2, line_style: "solid", color: "#ffffff" });
const flBull0 = draw.polyline(20);
const flBull1 = draw.polyline(21);
const flBull2 = draw.polyline(22);
const flBear0 = draw.polyline(23);
const flBear1 = draw.polyline(24);
const flBear2 = draw.polyline(25);

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


output("pat_hi", line, overlay, { color: "#ffffff", width: 2, line_style: "dashed", description: "Pattern upper" });
output("pat_lo", line, overlay, { color: "#ffffff", width: 2, line_style: "dashed", description: "Pattern lower" });
// 3 RED regression channels — fat outer, dotted mid
output("rr1_hi", line, overlay, { color: "#ef4444", width: 3, line_style: "solid", description: "Red1 upper (fat)" });
output("rr1_md", line, overlay, { color: "#f87171", width: 1, line_style: "dotted", description: "Red1 mid" });
output("rr1_lo", line, overlay, { color: "#ef4444", width: 3, line_style: "solid", description: "Red1 lower (fat)" });
output("rr2_hi", line, overlay, { color: "#dc2626", width: 3, line_style: "solid", description: "Red2 upper (fat)" });
output("rr2_md", line, overlay, { color: "#f87171", width: 1, line_style: "dotted", description: "Red2 mid" });
output("rr2_lo", line, overlay, { color: "#dc2626", width: 3, line_style: "solid", description: "Red2 lower (fat)" });
output("rr3_hi", line, overlay, { color: "#991b1b", width: 3, line_style: "solid", description: "Red3 upper (fat)" });
output("rr3_md", line, overlay, { color: "#fca5a5", width: 1, line_style: "dotted", description: "Red3 mid" });
output("rr3_lo", line, overlay, { color: "#991b1b", width: 3, line_style: "solid", description: "Red3 lower (fat)" });
output("gg1_hi", line, overlay, { color: "#22c55e", width: 3, line_style: "solid", description: "Green1 upper (fat)" });
output("gg1_md", line, overlay, { color: "#4ade80", width: 1, line_style: "dotted", description: "Green1 mid" });
output("gg1_lo", line, overlay, { color: "#22c55e", width: 3, line_style: "solid", description: "Green1 lower (fat)" });
output("gg2_hi", line, overlay, { color: "#16a34a", width: 3, line_style: "solid", description: "Green2 upper (fat)" });
output("gg2_md", line, overlay, { color: "#4ade80", width: 1, line_style: "dotted", description: "Green2 mid" });
output("gg2_lo", line, overlay, { color: "#16a34a", width: 3, line_style: "solid", description: "Green2 lower (fat)" });
output("gg3_hi", line, overlay, { color: "#14532d", width: 3, line_style: "solid", description: "Green3 upper (fat)" });
output("gg3_md", line, overlay, { color: "#86efac", width: 1, line_style: "dotted", description: "Green3 mid" });
output("gg3_lo", line, overlay, { color: "#14532d", width: 3, line_style: "solid", description: "Green3 lower (fat)" });
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
alert("bat", { when: gBat, message: "{{symbol}}: BAT pattern at {{close}}", description: "Bat" });
alert("butterfly", { when: gFly, message: "{{symbol}}: BUTTERFLY at {{close}}", description: "Butterfly" });

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
function inR(v: f64, a: f64, b: f64, tol: f64): bool {
  return v >= a - tol && v <= b + tol;
}
// Resistance channel (red): linreg on highs, outer bands touch extreme highs/lows in window
function computeRegHi(n: i32): void {
  tmpHi = NaN; tmpMd = NaN; tmpLo = NaN;
  if (rN < n || n < 5) return;
  let sumX: f64 = 0.0; let sumY: f64 = 0.0; let sumXY: f64 = 0.0; let sumX2: f64 = 0.0;
  const nf = f64(n);
  for (let i = 0; i < n; i += 1) {
    const j = (rCur - n + i + RMAX) % RMAX;
    const x = f64(i); const y = rHi[j];
    sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x;
  }
  const den = nf * sumX2 - sumX * sumX;
  if (Math.abs(den) < 1e-12) return;
  const slope = (nf * sumXY - sumX * sumY) / den;
  const intercept = (sumY - slope * sumX) / nf;
  let maxUp: f64 = 0.0; let maxDn: f64 = 0.0;
  for (let i = 0; i < n; i += 1) {
    const j = (rCur - n + i + RMAX) % RMAX;
    const reg = intercept + slope * f64(i);
    const up = rHi[j] - reg; const dn = reg - rLo[j];
    if (up > maxUp) maxUp = up; if (dn > maxDn) maxDn = dn;
  }
  const regNow = intercept + slope * f64(n - 1);
  tmpMd = regNow; tmpHi = regNow + maxUp; tmpLo = regNow - maxDn;
}
// Support channel (green): linreg on lows, outer bands touch extreme highs/lows in window
function computeRegLo(n: i32): void {
  tmpHi = NaN; tmpMd = NaN; tmpLo = NaN;
  if (rN < n || n < 5) return;
  let sumX: f64 = 0.0; let sumY: f64 = 0.0; let sumXY: f64 = 0.0; let sumX2: f64 = 0.0;
  const nf = f64(n);
  for (let i = 0; i < n; i += 1) {
    const j = (rCur - n + i + RMAX) % RMAX;
    const x = f64(i); const y = rLo[j];
    sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x;
  }
  const den = nf * sumX2 - sumX * sumX;
  if (Math.abs(den) < 1e-12) return;
  const slope = (nf * sumXY - sumX * sumY) / den;
  const intercept = (sumY - slope * sumX) / nf;
  let maxUp: f64 = 0.0; let maxDn: f64 = 0.0;
  for (let i = 0; i < n; i += 1) {
    const j = (rCur - n + i + RMAX) % RMAX;
    const reg = intercept + slope * f64(i);
    const up = rHi[j] - reg; const dn = reg - rLo[j];
    if (up > maxUp) maxUp = up; if (dn > maxDn) maxDn = dn;
  }
  const regNow = intercept + slope * f64(n - 1);
  tmpMd = regNow; tmpHi = regNow + maxUp; tmpLo = regNow - maxDn;
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
let shZones = true; let shCh = true; let shPoc = true; let shSig = true;
let shVd = true; let shVw = true; let shVm = true;
let shE1 = true; let shE2 = true; let shE3 = true; let shE4 = true; let shE5 = true; let shE6 = true;
let lastRes1: f64 = NaN; let lastRes2: f64 = NaN; let lastRes3: f64 = NaN;
let lastSup1: f64 = NaN; let lastSup2: f64 = NaN; let lastSup3: f64 = NaN;
let lb1: i32 = 34; let lb2: i32 = 89; let lb3: i32 = 200;
let fibTol: f64 = 0.05; let shHarm = true;
const RMAX = 337;
const rHi = new StaticArray<f64>(RMAX);
const rLo = new StaticArray<f64>(RMAX);
const rCl = new StaticArray<f64>(RMAX);
let rN: i32 = 0; let rCur: i32 = 0;
let tmpHi: f64 = NaN; let tmpMd: f64 = NaN; let tmpLo: f64 = NaN;
const pivPx = new StaticArray<f64>(5);
let pivN: i32 = 0; let lastWasHi = false; let havePivot = false;
let shTl = true; let shFibz = true; let shOsc = true;
const PV = 14;
const pvH = new StaticArray<f64>(PV); const pvHi = new StaticArray<i32>(PV);
const pvL = new StaticArray<f64>(PV); const pvLi = new StaticArray<i32>(PV);
let nPvH: i32 = 0; let nPvL: i32 = 0;
let prevO: f64 = NaN; let prevH: f64 = NaN; let prevL: f64 = NaN; let prevC: f64 = NaN;
let prev2O: f64 = NaN; let prev2C: f64 = NaN;
let emaA: f64 = NaN; let emaB: f64 = NaN;
let prevEmaA: f64 = NaN; let prevEmaB: f64 = NaN;
let prevSmaA: f64 = NaN; let prevSmaB: f64 = NaN;
const NT = 8;
const scUp = new StaticArray<f64>(NT); const scDn = new StaticArray<f64>(NT);
const upX1 = new StaticArray<i32>(NT); const upX2 = new StaticArray<i32>(NT);
const upY1 = new StaticArray<f64>(NT); const upY2 = new StaticArray<f64>(NT);
const dnX1 = new StaticArray<i32>(NT); const dnX2 = new StaticArray<i32>(NT);
const dnY1 = new StaticArray<f64>(NT); const dnY2 = new StaticArray<f64>(NT);
const fibLv = new StaticArray<f64>(12);

// flag search ring (last 400 bars)
const FMAX = 400;
const fHi = new StaticArray<f64>(FMAX);
const fLo = new StaticArray<f64>(FMAX);
const fCl = new StaticArray<f64>(FMAX);
const fT  = new StaticArray<f64>(FMAX);
let fN: i32 = 0; let fCur: i32 = 0;
let shFlags = true;
let flagPoleAtr: f64 = 1.8;
let flagMaxBars: i32 = 400;
// best flags (score, startIdx, endIdx, upper1, lower1, upper2, lower2, isBull)
const flScore = new StaticArray<f64>(6);
const flS = new StaticArray<i32>(6);
const flE = new StaticArray<i32>(6);
const flU1 = new StaticArray<f64>(6);
const flL1 = new StaticArray<f64>(6);
const flU2 = new StaticArray<f64>(6);
const flL2 = new StaticArray<f64>(6);
const flBull = new StaticArray<bool>(6);
let flCount: i32 = 0;
const pbuf = new StaticArray<f64>(16);

function onStart(): void {
  right = i32(p_swing_len()); sw = new Swings(right, right);
  pN = i32(p_poc_lookback());
  wBase = p_w_base(); wPoc = p_w_poc(); wVd = p_w_vd(); wVw = p_w_vw(); wVm = p_w_vm();
  wE1 = p_w_e1(); wE2 = p_w_e2(); wE3 = p_w_e3(); wE4 = p_w_e4(); wE5 = p_w_e5(); wE6 = p_w_e6();
  wTl = p_w_tl();
  e1 = new Ema(i32(p_ema1())); e2 = new Ema(i32(p_ema2())); e3 = new Ema(i32(p_ema3()));
  e4 = new Ema(i32(p_ema4())); e5 = new Ema(i32(p_ema5())); e6 = new Ema(i32(p_ema6()));
  shZones = pb_show_zones(); shCh = pb_show_ch(); shPoc = pb_show_poc(); shSig = pb_show_sig();
  shVd = pb_show_vd(); shVw = pb_show_vw(); shVm = pb_show_vm();
  shE1 = pb_show_e1(); shE2 = pb_show_e2(); shE3 = pb_show_e3(); shE4 = pb_show_e4(); shE5 = pb_show_e5(); shE6 = pb_show_e6();
  shPatterns = pb_show_patterns(); shOpens = pb_show_opens(); shTargets = pb_show_targets();
  chAtr = p_ch_atr(); peakScore = p_peak_score(); nearScore = p_near_score();
  tgtMin = p_tgt_min_pct(); tgtMax = p_tgt_max_pct();
  lb1 = i32(p_ch_lb1()); lb2 = i32(p_ch_lb2()); lb3 = i32(p_ch_lb3());
  if (lb1 < 10) lb1 = 10; if (lb2 < 20) lb2 = 20; if (lb3 < 50) lb3 = 50;
  if (lb3 > RMAX) lb3 = RMAX;
  fibTol = p_fib_tol(); shHarm = pb_show_harm();
  shTl = pb_show_tl(); shFibz = pb_show_fibz(); shOsc = pb_show_osc();
  shFlags = pb_show_flags();
  flagPoleAtr = p_flag_pole_atr();
  flagMaxBars = i32(p_flag_max_bars());
  if (flagMaxBars > FMAX) flagMaxBars = FMAX;
  if (flagMaxBars < 80) flagMaxBars = 80;
}

function onBar(): void {
  const o = bar.open(); const h = bar.high(); const l = bar.low(); const c = bar.close();
  const t = bar.time();
  const tr = isNaN(pClose) ? h - l : Math.max(h - l, Math.max(Math.abs(h - pClose), Math.abs(l - pClose)));
  atr = isNaN(atr) ? tr : (atr * 13.0 + tr) / 14.0;
  if (atr <= 0.0) atr = Math.abs(c) * 0.01;
  sw.update(h, l);
  rCur = (rCur + 1) % RMAX;
  rHi[rCur] = h; rLo[rCur] = l; rCl[rCur] = c;
  if (rN < RMAX) rN += 1;
  // flag ring
  fCur = (fCur + 1) % FMAX;
  fHi[fCur] = h; fLo[fCur] = l; fCl[fCur] = c; fT[fCur] = t;
  if (fN < FMAX) fN += 1;
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
    for (let k = PV - 1; k > 0; k -= 1) { pvH[k] = pvH[k - 1]; pvHi[k] = pvHi[k - 1]; }
    pvH[0] = hp1; pvHi[0] = hi1; if (nPvH < PV) nPvH += 1;
  }
  if (sw.newLow()) {
    lp2 = lp1; li2 = li1; lp1 = sw.lastLow(); li1 = idx - right;
    pkLo[pkLoC % PKN] = lp1; pkLoC += 1; if (pkLoN < PKN) pkLoN += 1;
    for (let k = PV - 1; k > 0; k -= 1) { pvL[k] = pvL[k - 1]; pvLi[k] = pvLi[k - 1]; }
    pvL[0] = lp1; pvLi[0] = li1; if (nPvL < PV) nPvL += 1;
  }

  let batFire = 0.0; let flyFire = 0.0;
  if (shHarm && (sw.newHigh() || sw.newLow())) {
    const isHi = sw.newHigh();
    const px = isHi ? sw.lastHigh() : sw.lastLow();
    if (!havePivot || isHi != lastWasHi) {
      for (let k = 0; k < 4; k += 1) pivPx[k] = pivPx[k + 1];
      pivPx[4] = px;
      if (pivN < 5) pivN += 1;
      lastWasHi = isHi; havePivot = true;
    } else {
      if (isHi && px > pivPx[4]) pivPx[4] = px;
      if (!isHi && px < pivPx[4]) pivPx[4] = px;
    }
    if (pivN >= 5) {
      const X = pivPx[0]; const A = pivPx[1]; const B = pivPx[2]; const C = pivPx[3]; const D = pivPx[4];
      const XA = Math.abs(A - X);
      if (XA > 0.0) {
        const AB = Math.abs(B - A);
        const rB = AB / XA;
        const rC = Math.abs(C - B) / (AB > 0.0 ? AB : 1.0);
        const rD = Math.abs(D - X) / XA;
        if (inR(rB, 0.382, 0.5, fibTol) && inR(rC, 0.382, 0.886, fibTol) && Math.abs(rD - 0.886) <= fibTol) batFire = 1.0;
        if (inR(rB, 0.786, 0.786, fibTol) && inR(rD, 1.272, 1.618, fibTol)) flyFire = 1.0;
      }
    }
  }

  const vol = bar.volume();
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
    if (shCh && !isNaN(lp1) && inBand(lp1, dB, dT, ct)) s += wTl;
    scoreBuy = Math.max(1.0, Math.min(100.0, Math.round(s)));
  }
  if (sellReact) {
    let s = wBase;
    if (shPoc && (inBand(pocLvl, sB, sT, ct) || inBand(barPoc, sB, sT, ct))) s += wPoc;
    if (shVd && inBand(vdv, sB, sT, ct)) s += wVd; if (shVw && inBand(vwv, sB, sT, ct)) s += wVw; if (shVm && inBand(vmv, sB, sT, ct)) s += wVm;
    if (shE1 && inBand(v1, sB, sT, ct)) s += wE1; if (shE2 && inBand(v2, sB, sT, ct)) s += wE2; if (shE3 && inBand(v3, sB, sT, ct)) s += wE3;
    if (shE4 && inBand(v4, sB, sT, ct)) s += wE4; if (shE5 && inBand(v5, sB, sT, ct)) s += wE5; if (shE6 && inBand(v6, sB, sT, ct)) s += wE6;
    if (shCh && !isNaN(hp1) && inBand(hp1, sB, sT, ct)) s += wTl;
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


  if (shCh) {
    // Red = resistance channels from highs (3 different lookbacks)
    computeRegHi(lb1);
    lastRes1 = tmpHi;
    out_rr1_hi(tmpHi); out_rr1_md(tmpMd); out_rr1_lo(tmpLo);
    computeRegHi(lb2);
    lastRes2 = tmpHi;
    out_rr2_hi(tmpHi); out_rr2_md(tmpMd); out_rr2_lo(tmpLo);
    computeRegHi(lb3);
    lastRes3 = tmpHi;
    out_rr3_hi(tmpHi); out_rr3_md(tmpMd); out_rr3_lo(tmpLo);
    // Green = support channels from lows (same lookbacks)
    computeRegLo(lb1);
    lastSup1 = tmpLo;
    out_gg1_hi(tmpHi); out_gg1_md(tmpMd); out_gg1_lo(tmpLo);
    computeRegLo(lb2);
    lastSup2 = tmpLo;
    out_gg2_hi(tmpHi); out_gg2_md(tmpMd); out_gg2_lo(tmpLo);
    computeRegLo(lb3);
    lastSup3 = tmpLo;
    out_gg3_hi(tmpHi); out_gg3_md(tmpMd); out_gg3_lo(tmpLo);
  } else {
    out_rr1_hi(NaN); out_rr1_md(NaN); out_rr1_lo(NaN);
    out_rr2_hi(NaN); out_rr2_md(NaN); out_rr2_lo(NaN);
    out_rr3_hi(NaN); out_rr3_md(NaN); out_rr3_lo(NaN);
    out_gg1_hi(NaN); out_gg1_md(NaN); out_gg1_lo(NaN);
    out_gg2_hi(NaN); out_gg2_md(NaN); out_gg2_lo(NaN);
    out_gg3_hi(NaN); out_gg3_md(NaN); out_gg3_lo(NaN);
  }

  if (peakBuy) { out_peak_bar_buy(100.0); out_peak_bar_sell(0.0); }
  else if (peakSell) { out_peak_bar_buy(0.0); out_peak_bar_sell(100.0); }
  else if (fireBuy) { out_peak_bar_buy(Math.max(40.0, scoreBuy)); out_peak_bar_sell(0.0); }
  else if (fireSell) { out_peak_bar_buy(0.0); out_peak_bar_sell(Math.max(40.0, scoreSell)); }
  else { out_peak_bar_buy(0.0); out_peak_bar_sell(0.0); }

  out_g_bat(shHarm ? batFire : 0.0); out_g_fly(shHarm ? flyFire : 0.0);
  out_bat_mk((shHarm && batFire > 0.0) ? h : NaN);
  out_fly_mk((shHarm && flyFire > 0.0) ? h : NaN);
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

  // ---- BULL / BEAR FLAGS (white lines, top 3 each, last ~400 bars)
  // 1 touch top + 1 touch bottom is enough. Prefer larger poles (HTF relevance).
  if (shFlags && fN >= 60 && (idx % 3 == 0 || idx < 10)) {
    // reset candidates
    for (let i = 0; i < 6; i += 1) { flScore[i] = -1.0; flBull[i] = false; }
    flCount = 0;
    const look = fN < flagMaxBars ? fN : flagMaxBars;
    const minPole = flagPoleAtr * atr;
    // scan possible poles ending in the last look bars
    for (let pe = 12; pe < look - 8; pe += 2) {
      // pole end index in ring
      const peJ = (fCur - pe + FMAX) % FMAX;
      // search for pole start further back (8..55 bars)
      for (let plen = 8; plen <= 55 && pe + plen < look; plen += 3) {
        const psJ = (fCur - (pe + plen) + FMAX) % FMAX;
        const poleHi = fHi[peJ] > fHi[psJ] ? fHi[peJ] : fHi[psJ];
        const poleLo = fLo[peJ] < fLo[psJ] ? fLo[peJ] : fLo[psJ];
        // measure net pole move
        const upPole = fCl[peJ] - fCl[psJ];
        const dnPole = fCl[psJ] - fCl[peJ];
        let isBullPole = false;
        let poleH = 0.0;
        if (upPole >= minPole && upPole > dnPole) { isBullPole = true; poleH = upPole; }
        else if (dnPole >= minPole && dnPole > upPole) { isBullPole = false; poleH = dnPole; }
        else continue;

        // consolidation window right after pole (5..40 bars)
        for (let cLen = 6; cLen <= 40 && pe - cLen >= 2; cLen += 2) {
          const cStart = pe - cLen; // bars ago
          const csJ = (fCur - cStart + FMAX) % FMAX; // older end of flag
          const ceJ = (fCur - 2 + FMAX) % FMAX;       // near now
          // find upper/lower bounds of consolidation
          let maxH = -1e99; let minL = 1e99;
          let touchUp = 0; let touchDn = 0;
          let firstUp = -1; let firstDn = -1;
          for (let k = 0; k < cLen; k += 1) {
            const j = (fCur - (cStart - k) + FMAX) % FMAX;
            if (fHi[j] > maxH) maxH = fHi[j];
            if (fLo[j] < minL) minL = fLo[j];
          }
          const mid = (maxH + minL) * 0.5;
          const half = (maxH - minL) * 0.5;
          if (half <= 0.0 || half > poleH * 0.65) continue; // too wide vs pole
          // require at least 1 touch near top and 1 near bottom
          const tol = half * 0.25 + 0.15 * atr;
          for (let k = 0; k < cLen; k += 1) {
            const j = (fCur - (cStart - k) + FMAX) % FMAX;
            if (fHi[j] >= maxH - tol) { touchUp += 1; if (firstUp < 0) firstUp = k; }
            if (fLo[j] <= minL + tol) { touchDn += 1; if (firstDn < 0) firstDn = k; }
          }
          if (touchUp < 1 || touchDn < 1) continue;

          // slight counter-slope preferred
          const slope = (fCl[ceJ] - fCl[csJ]) / f64(cLen);
          let slopeOk = false;
          if (isBullPole && slope <= atr * 0.08) slopeOk = true;   // flat or down
          if (!isBullPole && slope >= -atr * 0.08) slopeOk = true; // flat or up
          if (!slopeOk) continue;

          // score: larger pole (HTF weight), tighter flag, more recent, dual touches
          let score = (poleH / atr) * 10.0;
          score += (poleH / (half + atr * 0.1)) * 4.0;
          score += f64(touchUp + touchDn);
          score += (40.0 - f64(pe)) * 0.15; // recency
          // mild HTF bias via EMA50
          if (isBullPole && !isNaN(v2) && c > v2) score += 6.0;
          if (!isBullPole && !isNaN(v2) && c < v2) score += 6.0;

          // keep top 3 bull + top 3 bear
          let slot = -1;
          if (isBullPole) {
            // find worst bull slot or empty
            let worst = 1e99; let wi = -1;
            let filled = 0;
            for (let s = 0; s < 3; s += 1) {
              if (flScore[s] < 0.0) { slot = s; break; }
              filled += 1;
              if (flScore[s] < worst) { worst = flScore[s]; wi = s; }
            }
            if (slot < 0 && score > worst) slot = wi;
          } else {
            let worst = 1e99; let wi = -1;
            for (let s = 3; s < 6; s += 1) {
              if (flScore[s] < 0.0) { slot = s; break; }
              if (flScore[s] < worst) { worst = flScore[s]; wi = s; }
            }
            if (slot < 0 && score > worst) slot = wi;
          }
          if (slot >= 0) {
            flScore[slot] = score;
            flS[slot] = cStart;
            flE[slot] = 2;
            flU1[slot] = maxH;
            flL1[slot] = minL;
            flU2[slot] = maxH;
            flL2[slot] = minL;
            flBull[slot] = isBullPole;
          }
        }
      }
    }

    // draw the kept flags as white rectangles (4-point closed polylines)
    const polys: PolylineHandle[] = [flBull0, flBull1, flBull2, flBear0, flBear1, flBear2];
    for (let s = 0; s < 6; s += 1) {
      const poly = polys[s];
      if (flScore[s] < 0.0) {
        poly.setPoints(pbuf, 0);
        continue;
      }
      const a = (fCur - flS[s] + FMAX) % FMAX;
      const b = (fCur - flE[s] + FMAX) % FMAX;
      const t0 = fT[a];
      const t1 = fT[b];
      const u = flU1[s];
      const d = flL1[s];
      // closed rectangle: TL, TR, BR, BL, TL
      pbuf[0] = t0; pbuf[1] = u;
      pbuf[2] = t1; pbuf[3] = u;
      pbuf[4] = t1; pbuf[5] = d;
      pbuf[6] = t0; pbuf[7] = d;
      pbuf[8] = t0; pbuf[9] = u;
      poly.setPoints(pbuf, 5);
    }
  }


  // ---- SFP + traps
  let sfpBuy = false; let sfpSell = false;
  if (!isNaN(lp1) && l < lp1 - 0.05 * atr && c > lp1) sfpBuy = true;
  if (!isNaN(hp1) && h > hp1 + 0.05 * atr && c < hp1) sfpSell = true;
  const bv2 = in_buy_vol(); const sv2 = in_sell_vol();
  const tot2 = bv2 + sv2;
  const buyShare2 = tot2 > 0.0 ? bv2 / tot2 : 0.5;
  const trapShort = sfpBuy && buyShare2 >= 0.5;
  const trapLong = sfpSell && buyShare2 <= 0.5;
  const inDemand = dL == 1.0 && !isNaN(dB) && l <= dT && h >= dB;
  const inSupply = sL == 1.0 && !isNaN(sT) && h >= sB && l <= sT;

  // ---- candlestick patterns
  const rng = h - l;
  const body = Math.abs(c - o);
  const upW = h - Math.max(o, c);
  const loW = Math.min(o, c) - l;
  let pat = 0; // 1 hammer 2 star 3 doji 4 bull eng 5 bear eng 6 morning 7 evening
  if (rng > 0.0) {
    if (body <= 0.10 * rng) pat = 3;
    if (body > 0.0 && loW >= 2.0 * body && upW <= 0.25 * rng) pat = 1;
    if (body > 0.0 && upW >= 2.0 * body && loW <= 0.25 * rng) pat = 2;
    if (!isNaN(prevC) && !isNaN(prevO)) {
      const pBody = Math.abs(prevC - prevO);
      if (c > o && prevC < prevO && c >= prevO && o <= prevC && body > pBody) pat = 4;
      if (c < o && prevC > prevO && c <= prevO && o >= prevC && body > pBody) pat = 5;
    }
    if (!isNaN(prev2C) && !isNaN(prevC) && !isNaN(prev2O)) {
      if (prev2C < prev2O && body <= 0.35 * rng && c > o && c > (prev2O + prev2C) * 0.5) pat = 6;
      if (prev2C > prev2O && body <= 0.35 * rng && c < o && c < (prev2O + prev2C) * 0.5) pat = 7;
    }
  }
  let med = range;
  if (fN >= 5) {
    let a0 = 0.0; let a1 = 0.0; let a2 = 0.0; let a3 = 0.0;
    for (let k = 1; k <= 4; k += 1) {
      const j = (fCur - k + FMAX) % FMAX;
      const rg = fHi[j] - fLo[j];
      if (k == 1) a0 = rg; else if (k == 2) a1 = rg; else if (k == 3) a2 = rg; else a3 = rg;
    }
    // median of 4
    let b0 = a0; let b1 = a1; let b2 = a2; let b3 = a3;
    if (b0 > b1) { const z = b0; b0 = b1; b1 = z; }
    if (b2 > b3) { const z = b2; b2 = b3; b3 = z; }
    if (b0 > b2) { const z = b0; b0 = b2; b2 = z; }
    if (b1 > b3) { const z = b1; b1 = b3; b3 = z; }
    if (b1 > b2) { const z = b1; b1 = b2; b2 = z; }
    med = (b1 + b2) * 0.5;
  }
  const c4j = (fCur - 4 + FMAX) % FMAX;
  const c4 = fN >= 5 ? fCl[c4j] : c;
  const sharp = fN >= 5 && med > 0.0 && Math.abs(c - c4) >= 2.0 * med;
  const hot = pat > 0 && sharp;
  out_g_hot(hot ? 1.0 : 0.0);
  out_hot_top(hot ? h : NaN); out_hot_bot(hot ? l : NaN);
  out_g_sfp_b(sfpBuy ? 1.0 : 0.0); out_g_sfp_s(sfpSell ? 1.0 : 0.0);

  if (pat > 0 || sfpBuy || sfpSell || trapShort || trapLong) {
    sb_clear();
    if (pat == 1) sb_text("HAMMER");
    else if (pat == 2) sb_text("STAR");
    else if (pat == 3) sb_text("DOJI");
    else if (pat == 4) sb_text("ENGULF");
    else if (pat == 5) sb_text("ENGULF");
    else if (pat == 6) sb_text("M-STAR");
    else if (pat == 7) sb_text("E-STAR");
    else if (trapShort) sb_text("TRAP SHORT");
    else if (trapLong) sb_text("TRAP LONG");
    else if (sfpBuy) sb_text("SFP");
    else sb_text("SFP");
    const lb = labAt(labN % 6);
    labN += 1;
    const yLab = (pat == 2 || pat == 5 || pat == 7 || sfpSell || trapLong) ? h + 0.45 * atr : l - 0.45 * atr;
    const col = hot ? rgba(250, 204, 21, 255) : (pat == 1 || pat == 4 || pat == 6 || sfpBuy || trapShort) ? rgba(0, 255, 213, 255) : rgba(255, 43, 214, 255);
    lb.set(t, yLab).text(str_tag_sb).color(col);
  }

  // ---- fib confluence zones (width = 0.2% of price)
  if (shFibz && !isNaN(hp1) && !isNaN(lp1) && hp1 > lp1 && c > 0.0) {
    fibLv[0] = 0.0; fibLv[1] = 0.236; fibLv[2] = 0.382; fibLv[3] = 0.5; fibLv[4] = 0.618; fibLv[5] = 0.786;
    fibLv[6] = 1.0; fibLv[7] = 1.272; fibLv[8] = 1.618; fibLv[9] = 2.0; fibLv[10] = -0.272; fibLv[11] = 2.618;
    const span = hp1 - lp1;
    // cluster scores: scan fibs, keep best 2 below and 2 above
    let b1 = NaN; let b1s = -1.0; let b2 = NaN; let b2s = -1.0;
    let a1 = NaN; let a1s = -1.0; let a2 = NaN; let a2s = -1.0;
    for (let i = 0; i < 12; i += 1) {
      const lvl = lp1 + fibLv[i] * span;
      let hits = 1.0;
      for (let j = 0; j < 12; j += 1) {
        if (j == i) continue;
        const other = lp1 + fibLv[j] * span;
        if (Math.abs(other - lvl) <= c * 0.002) hits += 1.0;
      }
      // extra if a pivot sits on it
      for (let k = 0; k < nPvH; k += 1) { if (Math.abs(pvH[k] - lvl) <= c * 0.002) hits += 1.0; }
      for (let k = 0; k < nPvL; k += 1) { if (Math.abs(pvL[k] - lvl) <= c * 0.002) hits += 1.0; }
      if (lvl < c * 0.999) {
        if (hits > b1s) { b2 = b1; b2s = b1s; b1 = lvl; b1s = hits; }
        else if (hits > b2s && Math.abs(lvl - b1) > c * 0.0025) { b2 = lvl; b2s = hits; }
      } else if (lvl > c * 1.001) {
        if (hits > a1s) { a2 = a1; a2s = a1s; a1 = lvl; a1s = hits; }
        else if (hits > a2s && Math.abs(lvl - a1) > c * 0.0025) { a2 = lvl; a2s = hits; }
      }
    }
    const half = c * 0.001; // full width 0.2%
    if (!isNaN(b1) && b1s >= 2.0) { out_fz_b1_t(b1 + half); out_fz_b1_b(b1 - half); out_fz_b1_l(1.0); }
    else { out_fz_b1_t(NaN); out_fz_b1_b(NaN); out_fz_b1_l(0.0); }
    if (!isNaN(b2) && b2s >= 2.0) { out_fz_b2_t(b2 + half); out_fz_b2_b(b2 - half); out_fz_b2_l(1.0); }
    else { out_fz_b2_t(NaN); out_fz_b2_b(NaN); out_fz_b2_l(0.0); }
    if (!isNaN(a1) && a1s >= 2.0) { out_fz_s1_t(a1 + half); out_fz_s1_b(a1 - half); out_fz_s1_l(1.0); }
    else { out_fz_s1_t(NaN); out_fz_s1_b(NaN); out_fz_s1_l(0.0); }
    if (!isNaN(a2) && a2s >= 2.0) { out_fz_s2_t(a2 + half); out_fz_s2_b(a2 - half); out_fz_s2_l(1.0); }
    else { out_fz_s2_t(NaN); out_fz_s2_b(NaN); out_fz_s2_l(0.0); }
  } else if (shFibz) {
    out_fz_b1_l(0.0); out_fz_b2_l(0.0); out_fz_s1_l(0.0); out_fz_s2_l(0.0);
  }

  // ---- trend lines, most touches, rising teal / falling pink, max 8+8
  if (shTl && (nPvH + nPvL) >= 3 && (idx % 2 == 0)) {
    for (let i = 0; i < NT; i += 1) { scUp[i] = -1.0; scDn[i] = -1.0; }
    // highs as resistance anchors
    for (let a = 0; a < nPvH; a += 1) {
      for (let b = a + 1; b < nPvH; b += 1) {
        const i1 = pvHi[b]; const i2 = pvHi[a];
        if (i2 == i1) continue;
        const y1 = pvH[b]; const y2 = pvH[a];
        const slope = (y2 - y1) / f64(i2 - i1);
        let touches = 2.0;
        for (let k = 0; k < nPvH; k += 1) {
          if (k == a || k == b) continue;
          const yy = y1 + slope * f64(pvHi[k] - i1);
          if (Math.abs(pvH[k] - yy) <= 0.35 * atr) touches += 1.0;
        }
        for (let k = 0; k < nPvL; k += 1) {
          const yy = y1 + slope * f64(pvLi[k] - i1);
          if (Math.abs(pvL[k] - yy) <= 0.35 * atr) touches += 0.5;
        }
        const rec = 1.0 / (1.0 + f64(idx - i2) / 80.0);
        const score = touches * 10.0 * rec;
        if (slope >= 0.0) {
          let slot = -1; let worst = 1e99; let wi = 0;
          for (let s = 0; s < NT; s += 1) {
            if (scUp[s] < 0.0) { slot = s; break; }
            if (scUp[s] < worst) { worst = scUp[s]; wi = s; }
          }
          if (slot < 0 && score > worst) slot = wi;
          if (slot >= 0) { scUp[slot] = score; upX1[slot] = i1; upX2[slot] = i2; upY1[slot] = y1; upY2[slot] = y2; }
        } else {
          let slot = -1; let worst = 1e99; let wi = 0;
          for (let s = 0; s < NT; s += 1) {
            if (scDn[s] < 0.0) { slot = s; break; }
            if (scDn[s] < worst) { worst = scDn[s]; wi = s; }
          }
          if (slot < 0 && score > worst) slot = wi;
          if (slot >= 0) { scDn[slot] = score; dnX1[slot] = i1; dnX2[slot] = i2; dnY1[slot] = y1; dnY2[slot] = y2; }
        }
      }
    }
    // lows as support anchors
    for (let a = 0; a < nPvL; a += 1) {
      for (let b = a + 1; b < nPvL; b += 1) {
        const i1 = pvLi[b]; const i2 = pvLi[a];
        if (i2 == i1) continue;
        const y1 = pvL[b]; const y2 = pvL[a];
        const slope = (y2 - y1) / f64(i2 - i1);
        let touches = 2.0;
        for (let k = 0; k < nPvL; k += 1) {
          if (k == a || k == b) continue;
          const yy = y1 + slope * f64(pvLi[k] - i1);
          if (Math.abs(pvL[k] - yy) <= 0.35 * atr) touches += 1.0;
        }
        for (let k = 0; k < nPvH; k += 1) {
          const yy = y1 + slope * f64(pvHi[k] - i1);
          if (Math.abs(pvH[k] - yy) <= 0.35 * atr) touches += 0.5;
        }
        const rec = 1.0 / (1.0 + f64(idx - i2) / 80.0);
        const score = touches * 10.0 * rec;
        if (slope >= 0.0) {
          let slot = -1; let worst = 1e99; let wi = 0;
          for (let s = 0; s < NT; s += 1) {
            if (scUp[s] < 0.0) { slot = s; break; }
            if (scUp[s] < worst) { worst = scUp[s]; wi = s; }
          }
          if (slot < 0 && score > worst) slot = wi;
          if (slot >= 0 && score >= scUp[slot]) { scUp[slot] = score; upX1[slot] = i1; upX2[slot] = i2; upY1[slot] = y1; upY2[slot] = y2; }
        } else {
          let slot = -1; let worst = 1e99; let wi = 0;
          for (let s = 0; s < NT; s += 1) {
            if (scDn[s] < 0.0) { slot = s; break; }
            if (scDn[s] < worst) { worst = scDn[s]; wi = s; }
          }
          if (slot < 0 && score > worst) slot = wi;
          if (slot >= 0 && score >= scDn[slot]) { scDn[slot] = score; dnX1[slot] = i1; dnX2[slot] = i2; dnY1[slot] = y1; dnY2[slot] = y2; }
        }
      }
    }
    const TEAL = rgba(0, 255, 213, 255);
    const PINK = rgba(255, 43, 214, 255);
    for (let s = 0; s < NT; s += 1) {
      const lnU = tlAt(s);
      if (scUp[s] < 0.0) lnU.delete();
      else {
        const ago1 = idx - upX1[s]; const ago2 = idx - upX2[s];
        if (ago1 >= 0 && ago1 < fN && ago2 >= 0 && ago2 < fN) {
          const tx1 = fT[(fCur - ago1 + FMAX) % FMAX];
          const tx2 = fT[(fCur - ago2 + FMAX) % FMAX];
          lnU.set(tx1, upY1[s], tx2, upY2[s]).color(TEAL);
        }
      }
      const lnD = tlAt(s + NT);
      if (scDn[s] < 0.0) lnD.delete();
      else {
        const ago1 = idx - dnX1[s]; const ago2 = idx - dnX2[s];
        if (ago1 >= 0 && ago1 < fN && ago2 >= 0 && ago2 < fN) {
          const tx1 = fT[(fCur - ago1 + FMAX) % FMAX];
          const tx2 = fT[(fCur - ago2 + FMAX) % FMAX];
          lnD.set(tx1, dnY1[s], tx2, dnY2[s]).color(PINK);
        }
      }
    }
  }

  // ---- oscillator: 2 EMA (8, 21) + 2 SMA (10, 30)
  prevEmaA = emaA; prevEmaB = emaB;
  const kA = 2.0 / 9.0; const kB = 2.0 / 22.0;
  emaA = isNaN(emaA) ? c : emaA + kA * (c - emaA);
  emaB = isNaN(emaB) ? c : emaB + kB * (c - emaB);
  let sma10 = c; let sma30 = c;
  if (fN >= 10) {
    let s = 0.0; for (let k = 0; k < 10; k += 1) s += fCl[(fCur - k + FMAX) % FMAX]; sma10 = s / 10.0;
  }
  if (fN >= 30) {
    let s = 0.0; for (let k = 0; k < 30; k += 1) s += fCl[(fCur - k + FMAX) % FMAX]; sma30 = s / 30.0;
  }
  let upN = 0;
  if (c > emaA) upN += 1;
  if (c > emaB) upN += 1;
  if (c > sma10) upN += 1;
  if (c > sma30) upN += 1;
  let rise = 0;
  if (!isNaN(prevEmaA) && emaA > prevEmaA) rise += 1;
  if (!isNaN(prevEmaB) && emaB > prevEmaB) rise += 1;
  if (!isNaN(prevSmaA) && sma10 > prevSmaA) rise += 1;
  if (!isNaN(prevSmaB) && sma30 > prevSmaB) rise += 1;
  prevSmaA = sma10; prevSmaB = sma30;
  let side = 0; // 1 buy 2 soon  -1 sell
  if (upN >= 3 && rise >= 2) side = 1;
  else if (upN >= 2 && rise >= 1) side = 2;
  else if (upN <= 1) side = -1;
  let hgt = 20.0;
  let torusNow = false;
  if (!isNaN(vdv) && l <= vdv && h >= vdv) torusNow = true;
  if (!isNaN(v2) && l <= v2 && h >= v2) torusNow = true;
  if (side >= 1) {
    if (torusNow) hgt += 20.0;
    if (trapShort) hgt += 20.0;
    if (inDemand) hgt += 20.0;
    if (sfpBuy) hgt += 20.0;
  } else if (side < 0) {
    if (torusNow) hgt += 20.0;
    if (trapLong) hgt += 20.0;
    if (inSupply) hgt += 20.0;
    if (sfpSell) hgt += 20.0;
  }
  if (pat > 0) hgt += 10.0;
  if (hgt > 100.0) hgt = 100.0;
  const yel = pat > 0 ? hgt * 0.35 : 0.0;
  const mainH = pat > 0 ? hgt * 0.65 : hgt;
  const hiBuy = side == 1 && hgt >= 70.0;
  if (!shOsc) {
    out_osc_buy_hi(NaN); out_osc_buy(NaN); out_osc_soon(NaN); out_osc_sell(NaN); out_osc_sell_hi(NaN); out_osc_pat(NaN);
  } else {
    out_osc_buy_hi(hiBuy ? mainH : NaN);
    out_osc_buy((side == 1 && !hiBuy) ? mainH : NaN);
    out_osc_soon(side == 2 ? mainH : NaN);
    out_osc_sell((side < 0 && hgt < 70.0) ? mainH : NaN);
    out_osc_sell_hi((side < 0 && hgt >= 70.0) ? mainH : NaN);
    out_osc_pat(yel > 0.0 ? yel : NaN);
  }

  prev2O = prevO; prev2C = prevC;
  prevO = o; prevH = h; prevL = l; prevC = c;

  pClose = c; idx += 1;
}
