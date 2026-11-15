//@lang=wrun-ts
// TORDAO indicator 1: peak/near, LIQ, pressure, mega bars, fat 337 max 3/side, TORus Signal

input("close", ohlcv.close);
input("profile", volume_profile.cells, { max_cells: 8192, missing: "empty", description: "Bar volume by price" });
input("buy_vol", trades.volume, { side: "BUY", description: "Taker buy volume" });
input("sell_vol", trades.volume, { side: "SELL", description: "Taker sell volume" });

page("Display");
param.bool("show_zones", true, { label: "Auction zones" });
param.bool("show_tl", true, { label: "Channels (max 3/side by confluence)" });
param.bool("show_patterns", true, { label: "Megaphone / wedge" });
param.bool("show_opens", true, { label: "Session opens + prev EQ" });
param.bool("show_targets", true, { label: "Spike targets min 2%" });
param.bool("show_events", true, { label: "Event bars" });
param.bool("show_scen", true, { label: "Scenario / pressure labels" });
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
param("tl_tol", 0.5, { min: 0.05, max: 2, description: "TL tol ATR" });
param.number("ch_atr", 0.6, { min: 0.15, max: 3, step: 0.05, label: "Channel half ATR", when: "show_tl" });
param("brk_buf", 0.1, { min: 0, max: 1, description: "Break buffer ATR" });
param("retest_bars", 20, { min: 3, max: 100, description: "Retest bars" });
param("fake_bars", 5, { min: 1, max: 30, description: "Fake bars" });
param("poc_lookback", 24, { min: 2, max: 200, description: "POC lookback" });
param("react_wick", 0.25, { min: 0, max: 0.9, description: "Min wick share" });
param("conf_tol", 0.5, { min: 0.05, max: 3, description: "Conf tol ATR" });
param.number("min_score", 20, { min: 1, max: 100, label: "Min reaction score", when: "show_sig" });
param.number("peak_score", 45, { min: 25, max: 100, label: "Peak neon threshold", when: "show_sig" });
param.number("near_score", 40, { min: 20, max: 80, label: "Near-peak threshold", when: "show_sig" });
param("keep_score", 50, { min: 1, max: 100, description: "Min label score" });
param("keep_n", 6, { min: 1, max: 12, description: "Labels kept" });
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
param.number("w_tlb", 8, { min: 0, max: 100, label: "Weight break bonus", when: "show_tl" });

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

output("conf_buy", histogram, lower, { color: "#00ffd5", description: "Buy confluence", format: "int" });
output("conf_sell", histogram, lower, { color: "#ff2bd6", description: "Sell confluence", format: "int" });
output("peak_bar_buy", histogram, lower, { color: "#00ffd5", description: "PEAK BUY mega bar", format: "int" });
output("peak_bar_sell", histogram, lower, { color: "#ff2bd6", description: "PEAK SELL mega bar", format: "int" });
output("scen_long", histogram, lower, { color: "#00ffd5", description: "LONG SETUP %", format: "int" });
output("scen_short", histogram, lower, { color: "#ff2bd6", description: "SHORT SETUP %", format: "int" });
output("scen_bout", histogram, lower, { color: "#22c55e", description: "BULL BREAKOUT %", format: "int" });
output("scen_bdn", histogram, lower, { color: "#ef4444", description: "BEAR BREAKOUT %", format: "int" });
output("scen_revu", histogram, lower, { color: "#38bdf8", description: "BUY PRESSURE %", format: "int" });
output("scen_revd", histogram, lower, { color: "#f97316", description: "SELL PRESSURE %", format: "int" });
output("scen_range", histogram, lower, { color: "#a78bfa", description: "Pressure / wait %", format: "int" });

output("ev_zone", histogram, lower, { color: "#22c55e", description: "Event zone", format: "int" });
output("ev_ema", histogram, lower, { color: "#fde047", description: "Event EMA", format: "int" });
output("ev_vwap", histogram, lower, { color: "#38bdf8", description: "Event VWAP", format: "int" });
output("ev_chan", histogram, lower, { color: "#a855f7", description: "Event channel", format: "int" });
output("ev_poc", histogram, lower, { color: "#fbbf24", description: "Event POC", format: "int" });
output("ev_open", histogram, lower, { color: "#e2e8f0", description: "Event open", format: "int" });
output("ev_pat", histogram, lower, { color: "#ffffff", description: "Event pattern", format: "int" });
output("ev_trap", histogram, lower, { color: "#f97316", description: "Event trap", format: "int" });
output("ev_brk", histogram, lower, { color: "#ef4444", description: "Event break", format: "int" });
output("ev_peak", histogram, lower, { color: "#ff2bd6", description: "Event peak", format: "int" });

const pocTop = output("poc_top", none);
const pocBot = output("poc_bot", none);
const pocLive = output("poc_live", none);
box("poc_zone", { top: pocTop, bottom: pocBot, when: pocLive, color: "#f59e0b", opacity: 0.18, borderColor: "#fbbf24", borderWidth: 2, borderStyle: "solid", z: 3 });
output("poc_bar", scatter, overlay, { color: "#fbbf24", description: "Bar POC" });
output("poc_lvl", line, overlay, { color: "#fbbf24", width: 2, step: true, line_style: "solid", description: "POC mid" });
param.number("poc_half_atr", 0.35, { min: 0.05, max: 2, step: 0.05, label: "POC half ATR", when: "show_poc" });

output("ch_res_hi", line, overlay, { color: "#ef4444", width: 2, line_style: "solid", description: "Res ch upper" });
output("ch_res_lo", line, overlay, { color: "#ef4444", width: 1, line_style: "solid", description: "Res ch lower" });
output("ch_res_mid", line, overlay, { color: "#f87171", width: 1, line_style: "dotted", description: "Res ch mid" });
output("ch_sup_hi", line, overlay, { color: "#22c55e", width: 1, line_style: "solid", description: "Sup ch upper" });
output("ch_sup_lo", line, overlay, { color: "#22c55e", width: 2, line_style: "solid", description: "Sup ch lower" });
output("ch_sup_mid", line, overlay, { color: "#4ade80", width: 1, line_style: "dotted", description: "Sup ch mid" });
output("pk_res1", line, overlay, { color: "#f87171", width: 1, line_style: "solid", description: "Peak bear1 upper" });
output("pk_res1m", line, overlay, { color: "#fca5a5", width: 1, line_style: "dotted", description: "Peak bear1 mid" });
output("pk_res1lo", line, overlay, { color: "#f87171", width: 1, line_style: "solid", description: "Peak bear1 lower" });
output("pk_res2", line, overlay, { color: "#dc2626", width: 1, line_style: "solid", description: "Peak bear2 upper" });
output("pk_res2m", line, overlay, { color: "#fca5a5", width: 1, line_style: "dotted", description: "Peak bear2 mid" });
output("pk_res2lo", line, overlay, { color: "#dc2626", width: 1, line_style: "solid", description: "Peak bear2 lower" });
output("pk_sup1", line, overlay, { color: "#4ade80", width: 1, line_style: "solid", description: "Peak bull1 lower" });
output("pk_sup1m", line, overlay, { color: "#86efac", width: 1, line_style: "dotted", description: "Peak bull1 mid" });
output("pk_sup1hi", line, overlay, { color: "#4ade80", width: 1, line_style: "solid", description: "Peak bull1 upper" });
output("pk_sup2", line, overlay, { color: "#16a34a", width: 1, line_style: "solid", description: "Peak bull2 lower" });
output("pk_sup2m", line, overlay, { color: "#86efac", width: 1, line_style: "dotted", description: "Peak bull2 mid" });
output("pk_sup2hi", line, overlay, { color: "#16a34a", width: 1, line_style: "solid", description: "Peak bull2 upper" });
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
output("tp_b1", line, overlay, { color: "#2dd4bf", width: 1, line_style: "dashed", description: "Time-pivot bull 1" });
output("tp_b2", line, overlay, { color: "#2dd4bf", width: 1, line_style: "dashed", description: "Time-pivot bull 2" });
output("tp_s1", line, overlay, { color: "#e879f9", width: 1, line_style: "dashed", description: "Time-pivot bear 1" });
output("tp_s2", line, overlay, { color: "#e879f9", width: 1, line_style: "dashed", description: "Time-pivot bear 2" });
plot.rays({ name: "fat", slots: 6, colors: ["#ef4444","#ef4444","#ef4444","#22c55e","#22c55e","#22c55e"], width: 4, line_style: "solid", opacity: 0.95,
  words: ["UP PEAKS","UP PEAKS","UP PEAKS","DN TROUGHS","DN TROUGHS","DN TROUGHS"], tooltip: "{{word}}", panel: "overlay" });

const gBU = output("g_brk_up", none);
const gBD = output("g_brk_dn", none);
const gRU = output("g_ret_up", none);
const gRD = output("g_ret_dn", none);
const gLost = output("g_zone_lost", none);
output("brk_up", shape, overlay, { color: "#00ffd5", shape_where: "g_brk_up", shape: "square", location: "below_bar", glow: 12, description: "Breakout" });
output("brk_dn", shape, overlay, { color: "#ff2bd6", shape_where: "g_brk_dn", shape: "square", location: "above_bar", glow: 12, description: "Breakdown" });
output("ret_up", shape, overlay, { color: "#0ea5e9", shape_where: "g_ret_up", shape: "square", location: "below_bar", glow: 10, description: "Retest up" });
output("ret_dn", shape, overlay, { color: "#f59e0b", shape_where: "g_ret_dn", shape: "square", location: "above_bar", glow: 10, description: "Retest dn" });
output("brk_price", none, overlay, { description: "Break price", format: "price" });
output("fake_rate", none, lower, { description: "Fake rate", format: "%" });
output("vwap_d", line, overlay, { color: "#38bdf8", width: 1, description: "dVWAP" });
output("vwap_w", line, overlay, { color: "#f5a623", width: 2, description: "wVWAP" });
output("vwap_m", line, overlay, { color: "#c084fc", width: 2, description: "mVWAP" });
output("ema_1", line, overlay, { color: "#fde047", width: 1, description: "EMA21" });
output("ema_2", line, overlay, { color: "#fb923c", width: 1, description: "EMA50" });
output("ema_3", line, overlay, { color: "#f43f5e", width: 2, description: "EMA144" });
output("ema_4", line, overlay, { color: "#a855f7", width: 2, description: "EMA360" });
output("ema_5", line, overlay, { color: "#3b82f6", width: 2, description: "EMA667" });
output("ema_6", line, overlay, { color: "#e2e8f0", width: 3, description: "EMA800" });

alert("breakout", { when: gBU, message: "{{symbol}}: breakout {{close}}", description: "Breakout" });
alert("breakdown", { when: gBD, message: "{{symbol}}: breakdown {{close}}", description: "Breakdown" });
alert("retest_up", { when: gRU, message: "{{symbol}}: retest up {{close}}", description: "Retest up" });
alert("retest_dn", { when: gRD, message: "{{symbol}}: retest dn {{close}}", description: "Retest dn" });
alert("buy_reaction", { when: gBuy, message: "{{symbol}}: BUY {{close}}", description: "Buy" });
alert("sell_reaction", { when: gSell, message: "{{symbol}}: SELL {{close}}", description: "Sell" });
alert("peak_buy_al", { when: gPeakBuy, message: "{{symbol}}: PEAK BUY {{close}}", description: "Peak buy" });
alert("peak_sell_al", { when: gPeakSell, message: "{{symbol}}: PEAK SELL {{close}}", description: "Peak sell" });

string("tag", { max_bytes: 48 });
handles.label({ size: 16 });
const MAX_TAGS = 12;
const TEAL: i32 = rgba(0, 255, 213, 255);
const PINK: i32 = rgba(255, 43, 214, 255);
const WHITE: i32 = rgba(255, 255, 255, 255);
function makeLabels(first: i32, count: i32): LabelHandle[] {
  const out: LabelHandle[] = [];
  for (let i = 0; i < count; i += 1) out.push(draw.label(first + i));
  return out;
}
const buyTags = makeLabels(0, MAX_TAGS);
const sellTags = makeLabels(MAX_TAGS, MAX_TAGS);
const pocTag = draw.label(24);
const scenTag = draw.label(25);
const tgtTag0 = draw.label(26);
const tgtTag1 = draw.label(27);
const tgtTag2 = draw.label(28);
const tgtTag3 = draw.label(29);
const patTag = draw.label(30);
const openTag = draw.label(31);
const liqBuyTag = draw.label(32);
const liqSellTag = draw.label(33);
const pressTag = draw.label(34);
const torusTag = draw.label(35);
let nBuy: i32 = 0; let nSell: i32 = 0; let keepN: i32 = 6; let keepScore: f64 = 50.0;

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
function vpPocVolume(cells: StaticArray<f64>, n: i32): f64 {
  const i = vpPocIndex(cells, n);
  return i < 0 ? NaN : cells[i + 2] + cells[i + 3];
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
let wTl: f64 = 12.0; let wTlb: f64 = 8.0;
let sw = new Swings(3, 3);
let vD = new Vwap("day", "hlc3"); let vW = new Vwap("week", "hlc3"); let vM = new Vwap("month", "hlc3");
let e1 = new Ema(21); let e2 = new Ema(50); let e3 = new Ema(144); let e4 = new Ema(360); let e5 = new Ema(667); let e6 = new Ema(800);
let right: i32 = 3; let idx: i32 = 0; let atr: f64 = NaN; let pClose: f64 = NaN;
let dT: f64 = NaN; let dB: f64 = NaN; let dL: f64 = 0.0; let dS: f64 = 0.0; let dTouches: i32 = 0;
let sT: f64 = NaN; let sB: f64 = NaN; let sL: f64 = 0.0; let sS: f64 = 0.0; let sTouches: i32 = 0;
let hp1: f64 = NaN; let hp2: f64 = NaN; let hp3: f64 = NaN; let hi1: i32 = 0; let hi2: i32 = 0; let hi3: i32 = 0;
let lp1: f64 = NaN; let lp2: f64 = NaN; let lp3: f64 = NaN; let li1: i32 = 0; let li2: i32 = 0; let li3: i32 = 0;
let rOn = false; let rBase: f64 = 0; let rSlope: f64 = 0; let rX0: i32 = 0;
let uOn = false; let uBase: f64 = 0; let uSlope: f64 = 0; let uX0: i32 = 0;
let rBrokeAt: i32 = -1; let rBrokeLvl: f64 = NaN; let rRetested = false;
let uBrokeAt: i32 = -1; let uBrokeLvl: f64 = NaN; let uRetested = false;
let breaks: i32 = 0; let fakes: i32 = 0;
let dayKey: i32 = -1; let weekKey: i32 = -1; let monKey: i32 = -1;
let dayOpen: f64 = NaN; let weekOpen: f64 = NaN; let monOpen: f64 = NaN;
let dayHi: f64 = NaN; let dayLo: f64 = NaN; let pdHi: f64 = NaN; let pdLo: f64 = NaN;
let nearBuyLeft: i32 = 0; let nearSellLeft: i32 = 0;
let prevHiPx: f64 = NaN; let prevHiT: f64 = NaN; let prevHiI: i32 = -1;
let prevLoPx: f64 = NaN; let prevLoT: f64 = NaN; let prevLoI: i32 = -1;
let fatUpN: i32 = 0; let fatDnN: i32 = 0;
const FAT_MAX = 337;
let nearScore: f64 = 40.0; let volAvg: f64 = NaN;
const PKN = 48;
const pkHi = new StaticArray<f64>(PKN);
const pkLo = new StaticArray<f64>(PKN);
let pkHiN: i32 = 0; let pkLoN: i32 = 0; let pkHiC: i32 = 0; let pkLoC: i32 = 0;
let shPatterns = true; let shOpens = true; let shTargets = true; let shEvents = true; let shScen = true;
let chAtr: f64 = 0.6; let peakScore: f64 = 45.0; let tgtMin: f64 = 2.0; let tgtMax: f64 = 7.0;
let shZones = true; let shTl = true; let shPoc = true; let shSig = true;
let shVd = true; let shVw = true; let shVm = true;
let shE1 = true; let shE2 = true; let shE3 = true; let shE4 = true; let shE5 = true; let shE6 = true;
let tpBull1: f64 = NaN; let tpBull2: f64 = NaN; let tpBear1: f64 = NaN; let tpBear2: f64 = NaN;

function onStart(): void {
  right = i32(p_swing_len()); sw = new Swings(right, right);
  pN = i32(p_poc_lookback()); keepN = i32(p_keep_n()); keepScore = p_keep_score();
  wBase = p_w_base(); wPoc = p_w_poc(); wVd = p_w_vd(); wVw = p_w_vw(); wVm = p_w_vm();
  wE1 = p_w_e1(); wE2 = p_w_e2(); wE3 = p_w_e3(); wE4 = p_w_e4(); wE5 = p_w_e5(); wE6 = p_w_e6();
  wTl = p_w_tl(); wTlb = p_w_tlb();
  e1 = new Ema(i32(p_ema1())); e2 = new Ema(i32(p_ema2())); e3 = new Ema(i32(p_ema3()));
  e4 = new Ema(i32(p_ema4())); e5 = new Ema(i32(p_ema5())); e6 = new Ema(i32(p_ema6()));
  shZones = pb_show_zones(); shTl = pb_show_tl(); shPoc = pb_show_poc(); shSig = pb_show_sig();
  shVd = pb_show_vd(); shVw = pb_show_vw(); shVm = pb_show_vm();
  shE1 = pb_show_e1(); shE2 = pb_show_e2(); shE3 = pb_show_e3(); shE4 = pb_show_e4(); shE5 = pb_show_e5(); shE6 = pb_show_e6();
  shPatterns = pb_show_patterns(); shOpens = pb_show_opens(); shTargets = pb_show_targets();
  shEvents = pb_show_events(); shScen = pb_show_scen();
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
  const tol = p_tl_tol() * atr;
  if (sw.newHigh()) {
    hp3 = hp2; hi3 = hi2; hp2 = hp1; hi2 = hi1; hp1 = sw.lastHigh(); hi1 = idx - right;
    pkHi[pkHiC % PKN] = hp1; pkHiC += 1; if (pkHiN < PKN) pkHiN += 1;
    if (!isNaN(prevHiPx) && !isNaN(prevHiT) && hi1 - prevHiI <= FAT_MAX && hi1 > prevHiI && hp1 >= prevHiPx) {
      const slot = fatUpN % 3;
      out_fat_ray_at(slot, prevHiPx, hp1, prevHiT, bar.time(), slot, slot, 1);
      fatUpN += 1;
    }
    prevHiPx = hp1; prevHiT = bar.time(); prevHiI = hi1;
    if (!isNaN(hp3) && hp1 < hp2 && hp2 < hp3 && hi1 > hi3) {
      const slope = (hp1 - hp3) / f64(hi1 - hi3); const mid = hp3 + slope * f64(hi2 - hi3);
      if (Math.abs(mid - hp2) <= tol) { rOn = true; rBase = hp1; rSlope = slope; rX0 = hi1; rBrokeAt = -1; rRetested = false; }
    }
  }
  if (sw.newLow()) {
    lp3 = lp2; li3 = li2; lp2 = lp1; li2 = li1; lp1 = sw.lastLow(); li1 = idx - right;
    pkLo[pkLoC % PKN] = lp1; pkLoC += 1; if (pkLoN < PKN) pkLoN += 1;
    if (!isNaN(prevLoPx) && !isNaN(prevLoT) && li1 - prevLoI <= FAT_MAX && li1 > prevLoI && lp1 <= prevLoPx) {
      const slot = 3 + (fatDnN % 3);
      out_fat_ray_at(slot, prevLoPx, lp1, prevLoT, bar.time(), slot, slot, 1);
      fatDnN += 1;
    }
    prevLoPx = lp1; prevLoT = bar.time(); prevLoI = li1;
    if (!isNaN(lp3) && lp3 < lp2 && lp2 < lp1 && li1 > li3) {
      const slope = (lp1 - lp3) / f64(li1 - li3); const mid = lp3 + slope * f64(li2 - li3);
      if (Math.abs(mid - lp2) <= tol) { uOn = true; uBase = lp1; uSlope = slope; uX0 = li1; uBrokeAt = -1; uRetested = false; }
    }
  }
  const buf = p_brk_buf() * atr; const fb = i32(p_fake_bars()); const rb = i32(p_retest_bars());
  let rv = NaN; let uv = NaN; let bu = 0.0; let bd = 0.0; let ru = 0.0; let rd = 0.0; let bp = NaN;
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
  const vol = bar.volume(); const t = bar.time();
  const bVol = in_buy_vol(); const sVol = in_sell_vol();
  volAvg = isNaN(volAvg) ? vol : (volAvg * 19.0 + vol) / 20.0;
  const hiVol = !isNaN(volAvg) && volAvg > 0.0 && vol >= volAvg * 1.8;
  const flow = bVol + sVol;
  const buyShare = flow > 0.0 ? bVol / flow : 0.5;
  const sellShare = flow > 0.0 ? sVol / flow : 0.5;
  const thinSellSide = buyShare >= 0.62;
  const thinBuySide = sellShare >= 0.62;
  const buyPressure = buyShare >= 0.55 && buyShare < 0.62;
  const sellPressure = sellShare >= 0.55 && sellShare < 0.62;
  const tSec = t > 100000000000.0 ? t / 1000.0 : t;
  const dKey = i32(Math.floor(tSec / 86400.0));
  const wKey = i32(Math.floor((tSec - 345600.0) / 604800.0));
  const mKey = i32(Math.floor(tSec / 2629800.0));
  const minOfDay = i32(Math.floor((tSec % 86400.0) / 60.0));
  if (dKey != dayKey) { pdHi = dayHi; pdLo = dayLo; dayHi = h; dayLo = l; dayOpen = o; dayKey = dKey; }
  else { if (isNaN(dayHi) || h > dayHi) dayHi = h; if (isNaN(dayLo) || l < dayLo) dayLo = l; if (isNaN(dayOpen)) dayOpen = o; }
  if (wKey != weekKey) { weekOpen = o; weekKey = wKey; }
  if (mKey != monKey) { monOpen = o; monKey = mKey; }
  if (isNaN(dayOpen)) dayOpen = o; if (isNaN(weekOpen)) weekOpen = o; if (isNaN(monOpen)) monOpen = o;
  const vdv = vD.update(o, h, l, c, vol, t); const vwv = vW.update(o, h, l, c, vol, t); const vmv = vM.update(o, h, l, c, vol, t);
  const v1 = e1.update(c); const v2 = e2.update(c); const v3 = e3.update(c); const v4 = e4.update(c); const v5 = e5.update(c); const v6 = e6.update(c);
  let barPoc: f64 = NaN; let barPocVol: f64 = NaN; const pn = in_profile_cells();
  if (pn >= 4) { const cells = in_profile_view(); barPoc = vpPoc(cells, pn); barPocVol = vpPocVolume(cells, pn); }
  pcur = (pcur + 1) % MAXP; pocRing[pcur] = barPoc; pocVolRing[pcur] = barPocVol; if (pcount < MAXP) pcount += 1;
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
    if (shTl && uOn && inBand(uv, dB, dT, ct)) { s += wTl; if (ru == 1.0 || bu == 1.0) s += wTlb; }
    scoreBuy = Math.max(1.0, Math.min(100.0, Math.round(s)));
  }
  if (sellReact) {
    let s = wBase;
    if (shPoc && (inBand(pocLvl, sB, sT, ct) || inBand(barPoc, sB, sT, ct))) s += wPoc;
    if (shVd && inBand(vdv, sB, sT, ct)) s += wVd; if (shVw && inBand(vwv, sB, sT, ct)) s += wVw; if (shVm && inBand(vmv, sB, sT, ct)) s += wVm;
    if (shE1 && inBand(v1, sB, sT, ct)) s += wE1; if (shE2 && inBand(v2, sB, sT, ct)) s += wE2; if (shE3 && inBand(v3, sB, sT, ct)) s += wE3;
    if (shE4 && inBand(v4, sB, sT, ct)) s += wE4; if (shE5 && inBand(v5, sB, sT, ct)) s += wE5; if (shE6 && inBand(v6, sB, sT, ct)) s += wE6;
    if (shTl && rOn && inBand(rv, sB, sT, ct)) { s += wTl; if (rd == 1.0 || bd == 1.0) s += wTlb; }
    scoreSell = Math.max(1.0, Math.min(100.0, Math.round(s)));
  }
  const minS = p_min_score();
  const fireBuy = shSig && scoreBuy >= minS && scoreBuy > 0.0;
  const fireSell = shSig && scoreSell >= minS && scoreSell > 0.0;
  const peakBuy = (fireBuy && scoreBuy >= peakScore) || (buyReact && hiVol && scoreBuy >= nearScore) || (buyReact && buyShare >= 0.58 && scoreBuy >= minS);
  const peakSell = (fireSell && scoreSell >= peakScore) || (sellReact && hiVol && scoreSell >= nearScore);
  if (peakBuy || (fireBuy && scoreBuy >= nearScore)) nearBuyLeft = 3;
  if (peakSell || (fireSell && scoreSell >= nearScore)) nearSellLeft = 3;
  const nearBuyOn = nearBuyLeft > 0 && !peakBuy;
  const nearSellOn = nearSellLeft > 0 && !peakSell;
  if (nearBuyLeft > 0) nearBuyLeft -= 1;
  if (nearSellLeft > 0) nearSellLeft -= 1;
  if (fireBuy && scoreBuy >= keepScore) { const tag = buyTags[nBuy % keepN]; nBuy += 1; sb_clear(); sb_int(i32(scoreBuy)); tag.set(f64(t), l - 0.3 * atr).text(str_tag_sb).color(TEAL); }
  if (fireSell && scoreSell >= keepScore) { const tag = sellTags[nSell % keepN]; nSell += 1; sb_clear(); sb_int(i32(scoreSell)); tag.set(f64(t), h + 0.3 * atr).text(str_tag_sb).color(PINK); }
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
  if (liqBuy) { sb_clear(); sb_text("LIQ BUY"); liqBuyTag.set(f64(t), l - 0.6 * atr).text(str_tag_sb).color(WHITE); }
  if (liqSell) { sb_clear(); sb_text("LIQ SELL"); liqSellTag.set(f64(t), h + 0.6 * atr).text(str_tag_sb).color(WHITE); }
  out_conf_buy(fireBuy ? scoreBuy : NaN); out_conf_sell(fireSell ? scoreSell : NaN);
  out_d_top(dT); out_d_bot(dB); out_d_live(shZones ? dL : 0.0); out_d_state(dS);
  out_s_top(sT); out_s_bot(sB); out_s_live(shZones ? sL : 0.0); out_s_state(sS);
  const halfCh = chAtr * atr;
  if (shTl && !isNaN(hp1) && !isNaN(hp2) && hi1 != hi2) {
    const hs = (hp1 - hp2) / f64(hi1 - hi2); const resLine = hp1 + hs * f64(idx - hi1);
    out_ch_res_hi(resLine); out_ch_res_lo(resLine - halfCh); out_ch_res_mid(resLine - 0.5 * halfCh);
  } else if (shTl && rOn && !isNaN(rv)) { out_ch_res_hi(rv); out_ch_res_lo(rv - halfCh); out_ch_res_mid(rv - 0.5 * halfCh); }
  else { out_ch_res_hi(NaN); out_ch_res_lo(NaN); out_ch_res_mid(NaN); }
  if (shTl && !isNaN(lp1) && !isNaN(lp2) && li1 != li2) {
    const ls = (lp1 - lp2) / f64(li1 - li2); const supLine = lp1 + ls * f64(idx - li1);
    out_ch_sup_lo(supLine); out_ch_sup_hi(supLine + halfCh); out_ch_sup_mid(supLine + 0.5 * halfCh);
  } else if (shTl && uOn && !isNaN(uv)) { out_ch_sup_lo(uv); out_ch_sup_hi(uv + halfCh); out_ch_sup_mid(uv + 0.5 * halfCh); }
  else { out_ch_sup_hi(NaN); out_ch_sup_lo(NaN); out_ch_sup_mid(NaN); }
  out_g_brk_up(shTl ? bu : 0.0); out_g_brk_dn(shTl ? bd : 0.0);
  out_g_ret_up(shTl ? ru : 0.0); out_g_ret_dn(shTl ? rd : 0.0);
  out_brk_up((shTl && bu > 0.0) ? l : NaN); out_brk_dn((shTl && bd > 0.0) ? h : NaN);
  out_ret_up((shTl && ru > 0.0) ? l : NaN); out_ret_dn((shTl && rd > 0.0) ? h : NaN);
  out_g_zone_lost(shZones ? lost : 0.0); out_brk_price(shTl ? bp : NaN);
  out_fake_rate(shTl && breaks > 0 ? 100.0 * f64(fakes) / f64(breaks) : NaN);
  if (shPoc && !isNaN(pocLvl)) {
    const half = p_poc_half_atr() * atr; out_poc_top(pocLvl + half); out_poc_bot(pocLvl - half); out_poc_live(1.0);
    sb_clear(); sb_text("POC"); pocTag.set(f64(t), pocLvl).text(str_tag_sb).color(rgba(251, 191, 36, 255));
  } else { out_poc_top(NaN); out_poc_bot(NaN); out_poc_live(0.0); }
  if (shOpens) {
    out_open_d(dayOpen); out_open_w(weekOpen); out_open_m(monOpen);
    out_eq_pd((!isNaN(pdHi) && !isNaN(pdLo)) ? (pdHi + pdLo) * 0.5 : NaN);
  } else { out_open_d(NaN); out_open_w(NaN); out_open_m(NaN); out_eq_pd(NaN); }
  let isMega = false; let isRiseW = false; let isFallW = false;
  if (shPatterns && !isNaN(hp1) && !isNaN(hp2) && !isNaN(lp1) && !isNaN(lp2) && hi1 != hi2 && li1 != li2) {
    const hs2 = (hp1 - hp2) / f64(hi1 - hi2); const ls2 = (lp1 - lp2) / f64(li1 - li2);
    const ph = hp1 + hs2 * f64(idx - hi1); const pl = lp1 + ls2 * f64(idx - li1);
    isMega = hs2 > 0.0 && ls2 < 0.0; isRiseW = hs2 < 0.0 && ls2 > 0.0; isFallW = hs2 < 0.0 && ls2 < 0.0 && hs2 > ls2;
    out_pat_hi(ph); out_pat_lo(pl);
  } else { out_pat_hi(NaN); out_pat_lo(NaN); }
  {
    sb_clear();
    let pcol: i32 = WHITE;
    if (thinSellSide) { sb_text("BULL BREAKOUT"); pcol = TEAL; }
    else if (thinBuySide) { sb_text("BEAR BREAKOUT"); pcol = PINK; }
    else if (buyPressure || (buyShare > sellShare && c > o)) { sb_text("BUY PRESSURE"); pcol = TEAL; }
    else if (sellPressure || (sellShare > buyShare && c < o)) { sb_text("SELL PRESSURE"); pcol = PINK; }
    else { sb_text(""); }
    pressTag.set(f64(t), c).text(str_tag_sb).color(pcol);
  }
  if (shTl && pkHiN >= 1) {
    const half = chAtr * atr; const tolP = atr * 0.25;
    let best1 = NaN; let best2 = NaN; let best3 = NaN;
    let sc1 = -1.0; let sc2 = -1.0; let sc3 = -1.0;
    for (let i = 0; i < pkHiN; i += 1) {
      const v = pkHi[i]; if (isNaN(v)) continue;
      let sc = 0.0;
      for (let j = 0; j < pkHiN; j += 1) { const w = pkHi[j]; if (!isNaN(w) && Math.abs(w - v) <= tolP) sc += 1.0; }
      if (sc > sc1 || (sc == sc1 && (isNaN(best1) || v > best1))) { sc3 = sc2; best3 = best2; sc2 = sc1; best2 = best1; sc1 = sc; best1 = v; }
      else if ((sc > sc2 || (sc == sc2 && (isNaN(best2) || v > best2))) && Math.abs(v - best1) > tolP) { sc3 = sc2; best3 = best2; sc2 = sc; best2 = v; }
      else if ((sc > sc3 || (sc == sc3 && (isNaN(best3) || v > best3))) && Math.abs(v - best1) > tolP && (isNaN(best2) || Math.abs(v - best2) > tolP)) { sc3 = sc; best3 = v; }
    }
    if (!isNaN(best1)) { out_pk_res1(best1); out_pk_res1lo(best1 - half); out_pk_res1m(best1 - 0.5 * half); } else { out_pk_res1(NaN); out_pk_res1lo(NaN); out_pk_res1m(NaN); }
    if (!isNaN(best2)) { out_pk_res2(best2); out_pk_res2lo(best2 - half); out_pk_res2m(best2 - 0.5 * half); } else { out_pk_res2(NaN); out_pk_res2lo(NaN); out_pk_res2m(NaN); }
    if (!isNaN(best3) && !rOn) { out_ch_res_hi(best3); out_ch_res_lo(best3 - half); out_ch_res_mid(best3 - 0.5 * half); }
  } else { out_pk_res1(NaN); out_pk_res1lo(NaN); out_pk_res1m(NaN); out_pk_res2(NaN); out_pk_res2lo(NaN); out_pk_res2m(NaN); }
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
    if (!isNaN(best1)) { out_pk_sup1(best1); out_pk_sup1hi(best1 + half); out_pk_sup1m(best1 + 0.5 * half); } else { out_pk_sup1(NaN); out_pk_sup1hi(NaN); out_pk_sup1m(NaN); }
    if (!isNaN(best2)) { out_pk_sup2(best2); out_pk_sup2hi(best2 + half); out_pk_sup2m(best2 + 0.5 * half); } else { out_pk_sup2(NaN); out_pk_sup2hi(NaN); out_pk_sup2m(NaN); }
    if (!isNaN(best3) && !uOn) { out_ch_sup_lo(best3); out_ch_sup_hi(best3 + half); out_ch_sup_mid(best3 + 0.5 * half); }
  } else { out_pk_sup1(NaN); out_pk_sup1hi(NaN); out_pk_sup1m(NaN); out_pk_sup2(NaN); out_pk_sup2hi(NaN); out_pk_sup2m(NaN); }
  const isPivotMin = minOfDay == 450 || minOfDay == 510 || minOfDay == 690 || minOfDay == 875 || minOfDay == 995 || minOfDay == 1115 || (minOfDay >= 0 && minOfDay <= 2);
  if (isPivotMin) {
    if (upWick > loWick && upWick > atr * 0.3) { tpBear1 = h; tpBear2 = h + atr * 0.5; }
    if (loWick > upWick && loWick > atr * 0.3) { tpBull1 = l; tpBull2 = l - atr * 0.5; }
  }
  if (!isNaN(dayHi) && !isNaN(dayLo) && dayHi > dayLo) {
    const dr = dayHi - dayLo;
    if (isNaN(tpBull1)) tpBull1 = dayLo - dr * 0.382;
    if (isNaN(tpBull2)) tpBull2 = dayLo - dr * 0.618;
    if (isNaN(tpBear1)) tpBear1 = dayHi + dr * 0.382;
    if (isNaN(tpBear2)) tpBear2 = dayHi + dr * 0.618;
  }
  out_tp_b1(tpBull1); out_tp_b2(tpBull2); out_tp_s1(tpBear1); out_tp_s2(tpBear2);
  if (shTargets) {
    const loPct = tgtMin / 100.0; const hiPct = tgtMax / 100.0;
    out_tgt_b1(c * (1.0 + loPct)); out_tgt_b2(c * (1.0 + hiPct * 0.85));
    out_tgt_s1(c * (1.0 - loPct)); out_tgt_s2(c * (1.0 - hiPct * 0.85));
  } else { out_tgt_b1(NaN); out_tgt_b2(NaN); out_tgt_s1(NaN); out_tgt_s2(NaN); }
  let evZone: f64 = 0.0; let evEma: f64 = 0.0; let evVwap: f64 = 0.0; let evChan: f64 = 0.0;
  let evPoc: f64 = 0.0; let evOpen: f64 = 0.0; let evPat: f64 = 0.0; let evTrap: f64 = 0.0; let evBrk: f64 = 0.0; let evPeak: f64 = 0.0;
  if (shEvents) {
    if (buyReact) evZone = scoreBuy; else if (sellReact) evZone = -scoreSell;
    let emaStack = 0.0; if (c > v1) emaStack += 1.0; else emaStack -= 1.0; if (c > v2) emaStack += 1.0; else emaStack -= 1.0; if (c > v3) emaStack += 1.0; else emaStack -= 1.0;
    evEma = emaStack * 15.0;
    if (!isNaN(vdv)) { if (c > vdv) evVwap = 20.0; else evVwap = -20.0; }
    if (bu > 0.0 || ru > 0.0) evChan = 40.0; else if (bd > 0.0 || rd > 0.0) evChan = -40.0;
    else if (uOn && !isNaN(uv) && c > uv) evChan = 15.0; else if (rOn && !isNaN(rv) && c < rv) evChan = -15.0;
    if (!isNaN(pocLvl) && Math.abs(c - pocLvl) <= ct) evPoc = 25.0;
    if (!isNaN(dayOpen) && Math.abs(c - dayOpen) <= atr * 0.5) evOpen = 18.0;
    if (isMega || isRiseW || isFallW) evPat = 30.0;
    if (buyReact || sellReact) evTrap = buyReact ? 22.0 : -22.0;
    if (bu > 0.0 || bd > 0.0) evBrk = bu > 0.0 ? 50.0 : -50.0;
    if (peakBuy) evPeak = scoreBuy; else if (peakSell) evPeak = -scoreSell;
  }
  out_ev_zone(shEvents ? evZone : NaN); out_ev_ema(shEvents ? evEma : NaN); out_ev_vwap(shEvents ? evVwap : NaN);
  out_ev_chan(shEvents ? evChan : NaN); out_ev_poc(shEvents ? evPoc : NaN); out_ev_open(shEvents ? evOpen : NaN);
  out_ev_pat(shEvents ? evPat : NaN); out_ev_trap(shEvents ? evTrap : NaN); out_ev_brk(shEvents ? evBrk : NaN); out_ev_peak(shEvents ? evPeak : NaN);
  {
    let pLong: f64 = 10.0; let pShort: f64 = 10.0; let pBrkOut: f64 = 10.0; let pBrkDn: f64 = 10.0;
    let pRevUp: f64 = 10.0; let pRevDn: f64 = 10.0; let pRange: f64 = 20.0;
    if (fireBuy) pLong += scoreBuy * 0.45; if (fireSell) pShort += scoreSell * 0.45;
    if (peakBuy) pLong += 18.0; if (peakSell) pShort += 18.0;
    if (nearBuyOn) pLong += 8.0; if (nearSellOn) pShort += 8.0;
    if (bu > 0.0 || (rOn && !isNaN(rv) && c > rv)) pBrkOut += 28.0;
    if (bd > 0.0 || (uOn && !isNaN(uv) && c < uv)) pBrkDn += 28.0;
    if (buyReact && c > v1) pRevUp += 32.0; if (sellReact && c < v1) pRevDn += 32.0;
    if (isRiseW) pRevDn += 22.0; if (isFallW) pRevUp += 22.0;
    if (isMega) { pBrkOut += 12.0; pBrkDn += 12.0; }
    if (!fireBuy && !fireSell && bu == 0.0 && bd == 0.0) pRange += 28.0;
    if (c > v1 && c > v2) pLong += 10.0; else if (c < v1 && c < v2) pShort += 10.0;
    if (hiVol && buyReact) pRevUp += 12.0; if (hiVol && sellReact) pRevDn += 12.0;
    const total = pLong + pShort + pBrkOut + pBrkDn + pRevUp + pRevDn + pRange;
    const inv = total > 0.0 ? 100.0 / total : 0.0;
    const L = Math.round(pLong * inv); const S = Math.round(pShort * inv);
    const BO = Math.round(pBrkOut * inv); const BD = Math.round(pBrkDn * inv);
    const RU = Math.round(pRevUp * inv); const RD = Math.round(pRevDn * inv); const RG = Math.round(pRange * inv);
    let bestP = L; let bestId: i32 = 0;
    if (S > bestP) { bestP = S; bestId = 1; }
    if (BO > bestP) { bestP = BO; bestId = 2; }
    if (BD > bestP) { bestP = BD; bestId = 3; }
    if (RU > bestP) { bestP = RU; bestId = 4; }
    if (RD > bestP) { bestP = RD; bestId = 5; }
    if (RG > bestP) { bestP = RG; bestId = 6; }
    if (peakBuy) {
      out_scen_long(100.0); out_scen_short(0.0); out_scen_bout(0.0); out_scen_bdn(0.0);
      out_scen_revu(0.0); out_scen_revd(0.0); out_scen_range(0.0);
      out_peak_bar_buy(100.0); out_peak_bar_sell(0.0); out_conf_buy(100.0);
    } else if (peakSell) {
      out_scen_long(0.0); out_scen_short(100.0); out_scen_bout(0.0); out_scen_bdn(0.0);
      out_scen_revu(0.0); out_scen_revd(0.0); out_scen_range(0.0);
      out_peak_bar_buy(0.0); out_peak_bar_sell(100.0); out_conf_sell(100.0);
    } else if (fireBuy && scoreBuy >= nearScore) {
      out_scen_long(Math.max(bestP, scoreBuy)); out_scen_short(0.0); out_scen_bout(0.0); out_scen_bdn(0.0);
      out_scen_revu(0.0); out_scen_revd(0.0); out_scen_range(0.0);
      out_peak_bar_buy(Math.max(40.0, scoreBuy)); out_peak_bar_sell(0.0);
    } else if (fireSell && scoreSell >= nearScore) {
      out_scen_long(0.0); out_scen_short(Math.max(bestP, scoreSell)); out_scen_bout(0.0); out_scen_bdn(0.0);
      out_scen_revu(0.0); out_scen_revd(0.0); out_scen_range(0.0);
      out_peak_bar_buy(0.0); out_peak_bar_sell(Math.max(40.0, scoreSell));
    } else {
      out_scen_long(bestId == 0 ? bestP : 0.0); out_scen_short(bestId == 1 ? bestP : 0.0);
      out_scen_bout(bestId == 2 ? bestP : 0.0); out_scen_bdn(bestId == 3 ? bestP : 0.0);
      out_scen_revu(bestId == 4 ? bestP : 0.0); out_scen_revd(bestId == 5 ? bestP : 0.0);
      out_scen_range(bestId == 6 ? bestP : 0.0);
      out_peak_bar_buy(0.0); out_peak_bar_sell(0.0);
    }
    if (shScen) {
      sb_clear();
      let scol: i32 = WHITE;
      if (peakBuy) { sb_text("GOOD BUY "); sb_int(i32(scoreBuy)); scol = TEAL; }
      else if (peakSell) { sb_text("GOOD SELL "); sb_int(i32(scoreSell)); scol = PINK; }
      else if (bestId == 0) { sb_text("LONG SETUP "); sb_int(i32(bestP)); sb_text("%"); scol = TEAL; }
      else if (bestId == 1) { sb_text("SHORT SETUP "); sb_int(i32(bestP)); sb_text("%"); scol = PINK; }
      else if (bestId == 2) { sb_text("BULL BREAKOUT "); sb_int(i32(bestP)); sb_text("%"); scol = rgba(34, 197, 94, 255); }
      else if (bestId == 3) { sb_text("BEAR BREAKOUT "); sb_int(i32(bestP)); sb_text("%"); scol = rgba(239, 68, 68, 255); }
      else if (bestId == 4) { sb_text("BUY PRESSURE "); sb_int(i32(bestP)); sb_text("%"); scol = rgba(56, 189, 248, 255); }
      else if (bestId == 5) { sb_text("SELL PRESSURE "); sb_int(i32(bestP)); sb_text("%"); scol = rgba(249, 115, 22, 255); }
      else if (buyShare >= sellShare) { sb_text("BUY PRESSURE "); sb_int(i32(bestP)); sb_text("%"); scol = TEAL; }
      else { sb_text("SELL PRESSURE "); sb_int(i32(bestP)); sb_text("%"); scol = PINK; }
      scenTag.set(f64(t), h + 1.2 * atr).text(str_tag_sb).color(scol);
    }
  }
  {
    let torus = false;
    if (!isNaN(vdv) && l <= vdv && h >= vdv) torus = true;
    if (!isNaN(v2) && l <= v2 && h >= v2) torus = true;
    if (rOn && !isNaN(rv) && l <= rv && h >= rv) torus = true;
    if (uOn && !isNaN(uv) && l <= uv && h >= uv) torus = true;
    if (ru > 0.0 || rd > 0.0 || bu > 0.0 || bd > 0.0) torus = true;
    if (torus) {
      sb_clear(); sb_text("TORus Signal");
      torusTag.set(f64(t), h + 0.8 * atr).text(str_tag_sb).color(WHITE);
    }
  }
  pClose = c; idx += 1;
}
