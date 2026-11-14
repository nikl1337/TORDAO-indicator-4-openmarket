//@lang=wrun-ts
// TORDAO indicator 4 (MERGED). UNTESTED as a whole; the SFP/double-top/manipulation part compiled in Kata. Sound: Chart > Sounds.
// Handle ids: 0-23 score labels, 40-45 manip boxes, 50-55 manip labels, 60-63 abcd lines, 70-85 abcd labels, 100-111 lines, 112 weekly path, 200-253 harmonics/candles.

input("close", ohlcv.close);
input("profile", volume_profile.cells, { max_cells: 8192, missing: "empty", description: "This bar's volume by price level" });
input("wk", candles.cells, { interval: "1w", bars: 300, description: "Closed weekly candles" });
input("c15", candles.cells, { interval: "15m", bars: 8, max_cells: 64, description: "Closed 15m candles" });
input("c60", candles.cells, { interval: "1h", bars: 8, max_cells: 16, description: "Closed 1h candles" });

param.bool("show_zones", true, { label: "Show auction zones" });
param.bool("show_tl", true, { label: "Show trendlines + break/retest marks" });
param.bool("show_poc", true, { label: "Show point of control" });
param.bool("show_sig", true, { label: "Show neon zone reactions + confluence numbers" });
param.bool("show_vd", true, { label: "Show daily VWAP" });
param.bool("show_vw", true, { label: "Show weekly VWAP" });
param.bool("show_vm", true, { label: "Show monthly VWAP" });
param.bool("show_e1", true, { label: "Show EMA 1 (21)" });
param.bool("show_e2", true, { label: "Show EMA 2 (50)" });
param.bool("show_e3", true, { label: "Show EMA 3 (144)" });
param.bool("show_e4", true, { label: "Show EMA 4 (360)" });
param.bool("show_e5", true, { label: "Show EMA 5 (667)" });
param.bool("show_e6", true, { label: "Show EMA 6 (800)" });
param.bool("show_levels", true, { label: "HTF levels (last 3 swing highs and lows)" });
param.bool("show_trend", true, { label: "HTF trendlines" });
param.bool("show_channel", true, { label: "HTF channels + middle lines" });
param.bool("show_pattern", true, { label: "HTF pattern line" });
param.bool("show_do", true, { label: "Daily open" });
param.bool("show_wo", true, { label: "Weekly open" });
param.bool("show_mo", true, { label: "Monthly open" });
param.bool("show_peq", true, { label: "EQ of previous day (neon green)" });
param.bool("show_ceq", true, { label: "EQ of current day (neon pink)" });
param.bool("en_sfp", true, { label: "Signal: swing failure pattern" });
param.bool("en_dbl", true, { label: "Signal: HTF double top / bottom" });
param.bool("en_manip", true, { label: "Signal: manipulation boxes" });
param.bool("en_abcd", true, { label: "Signal: ABCD pattern" });
param.bool("en_15", true, { label: "Signal: 15m reversal candles" });
param.bool("en_60", true, { label: "Signal: 1h reversal candles" });
param.bool("en_doji", true, { label: "Reversal: doji" });
param.bool("en_hammer", true, { label: "Reversal: hammer / shooting star" });
param.bool("en_bat", true, { label: "Signal: bat pattern" });
param.bool("en_fly", true, { label: "Signal: butterfly pattern" });

param("swing_len", 5, { min: 2, max: 30, description: "Swing length (bars each side), shared" });
param("zone_atr", 0.6, { min: 0.1, max: 3, description: "Zone depth in ATR" });
param("near_atr", 1.5, { min: 0.3, max: 6, description: "Revisit-likely distance in ATR" });
param("max_touch", 3, { min: 1, max: 10, description: "Touches before a zone is worn out" });
param("allow_sfp", 1, { min: 0, max: 1, description: "Sweep and reclaim keeps the zone (1) or kills it (0)" });
param("tl_tol", 0.35, { min: 0.05, max: 2, description: "Trendline 3rd-touch tolerance in ATR" });
param("brk_buf", 0.1, { min: 0, max: 1, description: "Break buffer in ATR" });
param("retest_bars", 20, { min: 3, max: 100, description: "Bars to wait for a retest" });
param("fake_bars", 5, { min: 1, max: 30, description: "Close back inside within N bars = fake break" });
param("poc_lookback", 24, { min: 2, max: 200, description: "Bars for the developing POC level" });
param("react_wick", 0.3, { min: 0, max: 0.9, description: "Min rejection wick share for a zone reaction" });
param("conf_tol", 0.4, { min: 0.05, max: 3, description: "Confluence when within this many ATR of the zone" });
param("min_score", 35, { min: 1, max: 100, description: "Mark reactions with a score at or above this" });
param("keep_score", 60, { min: 1, max: 100, description: "Number labels only for scores at or above this" });
param("keep_n", 4, { min: 1, max: 12, description: "Latest buy and sell number labels kept" });
param("w_base", 25, { min: 0, max: 100, description: "Weight: zone reaction" });
param("w_poc", 10, { min: 0, max: 100, description: "Weight: POC" });
param("w_vd", 5, { min: 0, max: 100, description: "Weight: daily VWAP" });
param("w_vw", 7, { min: 0, max: 100, description: "Weight: weekly VWAP" });
param("w_vm", 8, { min: 0, max: 100, description: "Weight: monthly VWAP" });
param("w_e1", 2, { min: 0, max: 100, description: "Weight: EMA 1" });
param("w_e2", 3, { min: 0, max: 100, description: "Weight: EMA 2" });
param("w_e3", 4, { min: 0, max: 100, description: "Weight: EMA 3" });
param("w_e4", 5, { min: 0, max: 100, description: "Weight: EMA 4" });
param("w_e5", 5, { min: 0, max: 100, description: "Weight: EMA 5" });
param("w_e6", 6, { min: 0, max: 100, description: "Weight: EMA 6" });
param("w_tl", 12, { min: 0, max: 100, description: "Weight: trendline at the zone" });
param("w_tlb", 8, { min: 0, max: 100, description: "Weight: trendline just broke or retested" });
param("ema1", 21, { min: 2, max: 2000, description: "EMA 1 length" });
param("ema2", 50, { min: 2, max: 2000, description: "EMA 2 length" });
param("ema3", 144, { min: 2, max: 2000, description: "EMA 3 length" });
param("ema4", 360, { min: 2, max: 2000, description: "EMA 4 length" });
param("ema5", 667, { min: 2, max: 2000, description: "EMA 5 length" });
param("ema6", 800, { min: 2, max: 2000, description: "EMA 6 length" });
param.int("sfp_bars", 1, { min: 1, max: 5, label: "SFP: bars allowed to close back inside" });
param.number("sfp_min_atr", 0.05, { min: 0, max: 2, step: 0.01, label: "SFP: min sweep depth in ATR" });
param.int("htf_min", 240, { min: 5, max: 10080, label: "Double top timeframe in minutes" });
param.int("htf_len", 3, { min: 2, max: 10, label: "Swing length in HTF candles (double top, weekly levels)" });
param.number("dbl_tol", 0.3, { min: 0.05, max: 3, step: 0.05, label: "Double top: peak match tolerance in percent" });
param.number("dbl_depth", 0.8, { min: 0.1, max: 20, step: 0.1, label: "Double top: min depth in percent" });
param.int("dbl_gap_min", 4, { min: 2, max: 100, label: "Double top: min HTF candles between peaks" });
param.int("dbl_gap_max", 60, { min: 5, max: 400, label: "Double top: max HTF candles between peaks" });
param.number("manip_lo", 90, { min: 50, max: 100, step: 1, label: "Manipulation: AB at least this percent of BC" });
param.number("manip_hi", 110, { min: 100, max: 200, step: 1, label: "Manipulation: AB at most this percent of BC" });
param.number("manip_min_atr", 1.5, { min: 0, max: 20, step: 0.1, label: "Manipulation: min leg size in ATR" });
param.number("abcd_ret_lo", 38.2, { min: 10, max: 100, step: 0.1, label: "ABCD: BC retraces at least this percent of AB" });
param.number("abcd_ret_hi", 88.6, { min: 10, max: 100, step: 0.1, label: "ABCD: BC retraces at most this percent of AB" });
param.number("abcd_cd_lo", 90, { min: 50, max: 200, step: 1, label: "ABCD: CD at least this percent of AB" });
param.number("abcd_cd_hi", 110, { min: 50, max: 300, step: 1, label: "ABCD: CD at most this percent of AB" });
param.number("abcd_min_atr", 1.5, { min: 0, max: 20, step: 0.1, label: "ABCD: min AB size in ATR" });
param.int("pattern_pts", 8, { min: 3, max: 24, label: "HTF pattern line: price points joined" });
param.number("doji_pct", 10, { min: 1, max: 30, step: 1, label: "Doji: body at most this percent of the range" });
param.number("wick_mult", 2, { min: 1, max: 5, step: 0.1, label: "Hammer: long wick at least this many bodies" });
param.number("small_wick", 15, { min: 0, max: 40, step: 1, label: "Hammer: opposite wick at most this percent" });
param.number("min_range", 0.8, { min: 0, max: 3, step: 0.1, label: "Reversal: min range vs average of last 5" });
param.int("trend_n", 5, { min: 2, max: 12, label: "Reversal: prior trend lookback in candles" });
param.number("fib_tol", 0.05, { min: 0.01, max: 0.15, step: 0.01, label: "Harmonics: ratio tolerance" });

const dTop = output("d_top", none), dBot = output("d_bot", none), dLive = output("d_live", none), dState = output("d_state", none);
const sTop = output("s_top", none), sBot = output("s_bot", none), sLive = output("s_live", none), sState = output("s_state", none);
box("demand_zone", { top: dTop, bottom: dBot, when: dLive, colorBy: dState, borderWidth: 1, borderStyle: "solid", opacity: 0.22,
  colors: ["#22c55e", "#facc15", "#38bdf8", "#f97316", "#64748b"], borderColors: ["#22c55e", "#facc15", "#38bdf8", "#f97316", "#64748b"], borderColorBy: dState });
box("supply_zone", { top: sTop, bottom: sBot, when: sLive, colorBy: sState, borderWidth: 1, borderStyle: "solid", opacity: 0.22,
  colors: ["#ef4444", "#facc15", "#38bdf8", "#f97316", "#64748b"], borderColors: ["#ef4444", "#facc15", "#38bdf8", "#f97316", "#64748b"], borderColorBy: sState });
const gBuy = output("g_buy", none), gSell = output("g_sell", none);
box("neon_buy", { top: dTop, bottom: dBot, when: gBuy, color: "#00ffd5", opacity: 0.5, borderColor: "#00ffd5", borderWidth: 2, z: 5 });
box("neon_sell", { top: sTop, bottom: sBot, when: gSell, color: "#ff2bd6", opacity: 0.5, borderColor: "#ff2bd6", borderWidth: 2, z: 5 });
output("sig_buy", shape, overlay, { color: "#00ffd5", shape_where: "g_buy", shape: "triangle_up", location: "below_bar", glow: 8, description: "Buy reaction in a zone" });
output("sig_sell", shape, overlay, { color: "#ff2bd6", shape_where: "g_sell", shape: "triangle_down", location: "above_bar", glow: 8, description: "Sell reaction in a zone" });
output("conf_buy", histogram, lower, { color: "#00ffd5", description: "Buy confluence score 1-100", format: "int" });
output("conf_sell", histogram, lower, { color: "#ff2bd6", description: "Sell confluence score 1-100", format: "int" });
output("poc_bar", scatter, overlay, { color: "#fbbf24", description: "POC of each bar" });
output("poc_lvl", line, overlay, { color: "#f59e0b", width: 2, step: true, line_style: "dotted", description: "Developing POC level" });
output("tl_res", line, overlay, { color: "#ef4444", width: 2, line_style: "dashed", description: "Descending 3-touch trendline" });
output("tl_sup", line, overlay, { color: "#22c55e", width: 2, line_style: "dashed", description: "Ascending 3-touch trendline" });
const gBU = output("g_brk_up", none), gBD = output("g_brk_dn", none), gRU = output("g_ret_up", none), gRD = output("g_ret_dn", none);
const gLost = output("g_zone_lost", none);
output("brk_up", shape, overlay, { color: "#16a34a", shape_where: "g_brk_up", shape: "triangle_up", location: "below_bar", description: "Breakout" });
output("brk_dn", shape, overlay, { color: "#dc2626", shape_where: "g_brk_dn", shape: "triangle_down", location: "above_bar", description: "Breakdown" });
output("ret_up", shape, overlay, { color: "#0ea5e9", shape_where: "g_ret_up", location: "below_bar", description: "Retest of broken resistance" });
output("ret_dn", shape, overlay, { color: "#f59e0b", shape_where: "g_ret_dn", location: "above_bar", description: "Retest of broken support" });
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
output("open_d", line, overlay, { color: "#ffffff", width: 1, line_style: "dotted", axis_label: true, description: "Daily open (UTC)" });
output("open_w", line, overlay, { color: "#ffffff", width: 1, line_style: "dotted", axis_label: true, description: "Weekly open (UTC)" });
output("open_m", line, overlay, { color: "#ffffff", width: 1, line_style: "dotted", axis_label: true, description: "Monthly open (UTC)" });
output("eq_prev", line, overlay, { color: "#39ff14", width: 1, line_style: "dotted", axis_label: true, description: "EQ of the previous day" });
output("eq_cur", line, overlay, { color: "#ff2bd6", width: 1, line_style: "dotted", axis_label: true, description: "EQ of the current day" });
const gSfpBear = output("g_sfp_bear", none);
const gSfpBull = output("g_sfp_bull", none);
const gDt = output("g_dt", none);
const gDb = output("g_db", none);
const gManip = output("g_manip", none);
const gAbcdBull = output("g_abcd_bull", none);
const gAbcdBear = output("g_abcd_bear", none);
output("sfp_bear", shape, overlay, { color: "#f43f5e", shape_where: "g_sfp_bear", shape: "triangle_down", location: "above_bar", glow: 8, description: "Bearish SFP" });
output("sfp_bull", shape, overlay, { color: "#22d3ee", shape_where: "g_sfp_bull", shape: "triangle_up", location: "below_bar", glow: 8, description: "Bullish SFP" });
output("dbl_top", shape, overlay, { color: "#fb7185", shape_where: "g_dt", shape: "diamond", location: "above_bar", glow: 8, description: "HTF double top" });
output("dbl_bot", shape, overlay, { color: "#4ade80", shape_where: "g_db", shape: "diamond", location: "below_bar", glow: 8, description: "HTF double bottom" });
output("dbl_neck", none, overlay, { description: "Neckline price", format: "price" });
output("manip_ratio", none, lower, { description: "Manipulation: AB as percent of BC", format: "0" });
output("abcd_cd", none, lower, { description: "ABCD: CD as percent of AB", format: "0" });
const gR15 = output("g_r15", none);
const gR60 = output("g_r60", none);
const gBat = output("g_bat", none);
const gFly = output("g_fly", none);
output("pat_dir", none, overlay, { description: "+1 bullish, -1 bearish for the harmonic that just finished" });

alert("buy_reaction", { when: gBuy, message: "{{symbol}}: BUY reaction in demand zone at {{close}}", description: "Neon teal buy reaction" });
alert("sell_reaction", { when: gSell, message: "{{symbol}}: SELL reaction in supply zone at {{close}}", description: "Neon pink sell reaction" });
alert("sfp_bear_alert", { when: gSfpBear, message: "{{symbol}}: BEARISH SFP at {{close}}", title: "SFP bearish", description: "Auction failed above a swing high" });
alert("sfp_bull_alert", { when: gSfpBull, message: "{{symbol}}: BULLISH SFP at {{close}}", title: "SFP bullish", description: "Auction failed below a swing low" });
alert("butterfly", { when: gFly, message: "{{symbol}}: finished BUTTERFLY ({{pat_dir}}) at {{close}}", title: "Butterfly", description: "Butterfly completed at D" });
alert("bat", { when: gBat, message: "{{symbol}}: finished BAT ({{pat_dir}}) at {{close}}", title: "Bat", description: "Bat completed at D" });
alert("abcd_bull_alert", { when: gAbcdBull, message: "{{symbol}}: bullish ABCD completed at D, CD is {{abcd_cd}}% of AB", title: "ABCD bullish", description: "Bullish ABCD completed" });
alert("abcd_bear_alert", { when: gAbcdBear, message: "{{symbol}}: bearish ABCD completed at D, CD is {{abcd_cd}}% of AB", title: "ABCD bearish", description: "Bearish ABCD completed" });
alert("double_top", { when: gDt, message: "{{symbol}}: HTF DOUBLE TOP, neckline {{dbl_neck}}", title: "HTF double top", description: "Double top confirmed" });
alert("double_bottom", { when: gDb, message: "{{symbol}}: HTF DOUBLE BOTTOM, neckline {{dbl_neck}}", title: "HTF double bottom", description: "Double bottom confirmed" });
alert("manipulation", { when: gManip, message: "{{symbol}}: MANIPULATION, AB is {{manip_ratio}}% of BC", title: "Manipulation", description: "AB within the set percent of BC" });
alert("rev_1h", { when: gR60, message: "{{symbol}}: 1h REVERSAL candle at {{close}}", title: "1h reversal candle", description: "1h doji / hammer / shooting star" });
alert("rev_15m", { when: gR15, message: "{{symbol}}: 15m REVERSAL candle at {{close}}", title: "15m reversal candle", description: "15m doji / hammer / shooting star" });
alert("breakout", { when: gBU, message: "{{symbol}}: trendline BREAKOUT at {{close}}", description: "Trendline breakout" });
alert("breakdown", { when: gBD, message: "{{symbol}}: trendline BREAKDOWN at {{close}}", description: "Trendline breakdown" });
alert("retest_up", { when: gRU, message: "{{symbol}}: retest of broken resistance at {{close}}", description: "Retest (long)" });
alert("retest_dn", { when: gRD, message: "{{symbol}}: retest of broken support at {{close}}", description: "Retest (short)" });
alert("zone_lost", { when: gLost, message: "{{symbol}}: zone lost at {{close}}", description: "A zone was lost" });

string("tag", { max_bytes: 48 });
handles.label({ size: 12 });
handles.box({ color: "#facc15", opacity: 0.18, borderWidth: 1 });
handles.line({ color: "#ffffff", width: 1, line_style: "dotted", sticky_right: true, axis_label: "price" });
handles.polyline({ width: 2 });
const TEAL: i32 = rgba(0, 255, 213, 255);
const PINK: i32 = rgba(255, 43, 214, 255);
const YELLOW: i32 = rgba(250, 204, 21, 255);
const WHITE: i32 = rgba(255, 255, 255, 255);
const FLY: i32 = rgba(192, 132, 252, 255);
const BAT: i32 = rgba(251, 146, 60, 255);
function makeLabels(first: i32, count: i32): LabelHandle[] { const out: LabelHandle[] = []; for (let i = 0; i < count; i += 1) out.push(draw.label(first + i)); return out; }
function makeBoxes(first: i32, count: i32): BoxHandle[] { const out: BoxHandle[] = []; for (let i = 0; i < count; i += 1) out.push(draw.box(first + i)); return out; }
function makeLines(first: i32, count: i32): LineHandle[] { const out: LineHandle[] = []; for (let i = 0; i < count; i += 1) out.push(draw.line(first + i)); return out; }
const MAX_TAGS = 12;
const buyTags = makeLabels(0, MAX_TAGS);
const sellTags = makeLabels(MAX_TAGS, MAX_TAGS);
const RING = 6;
const manBoxes = makeBoxes(40, RING);
const manLabels = makeLabels(50, RING);
const cdPolys: PolylineHandle[] = [draw.polyline(60), draw.polyline(61), draw.polyline(62), draw.polyline(63)];
const cdLabels = makeLabels(70, 16);
const cdBuf = new StaticArray<f64>(8);
const NLINES = 12;
const lines = makeLines(100, NLINES);
const wpoly = draw.polyline(112);
const lab15 = makeLabels(200, 8);
const lab60 = makeLabels(210, 8);
const polys: PolylineHandle[] = [draw.polyline(220), draw.polyline(221), draw.polyline(222), draw.polyline(223)];
const ptLabs = makeLabels(230, 20);
const nameLabs = makeLabels(250, 4);

let sw = new Swings(5, 5);
let right: i32 = 5;
let idx: i32 = 0;
let atr: f64 = NaN;
let pClose: f64 = NaN;
let lastT: f64 = NaN;
let width: f64 = NaN;
let nBuy: i32 = 0; let nSell: i32 = 0; let keepN: i32 = 4; let keepScore: f64 = 60.0;
const MAXP = 200;
const pocRing = new StaticArray<f64>(MAXP);
const pocVolRing = new StaticArray<f64>(MAXP);
let pcur: i32 = 0; let pcount: i32 = 0; let pN: i32 = 24; let pocLvl: f64 = NaN;
let wBase: f64 = 25.0; let wPoc: f64 = 10.0; let wVd: f64 = 5.0; let wVw: f64 = 7.0; let wVm: f64 = 8.0;
let wE1: f64 = 2.0; let wE2: f64 = 3.0; let wE3: f64 = 4.0; let wE4: f64 = 5.0; let wE5: f64 = 5.0; let wE6: f64 = 6.0;
let wTl: f64 = 12.0; let wTlb: f64 = 8.0;
let vD = new Vwap("day", "hlc3");
let vW = new Vwap("week", "hlc3");
let vM = new Vwap("month", "hlc3");
let e1 = new Ema(21); let e2 = new Ema(50); let e3 = new Ema(144); let e4 = new Ema(360); let e5 = new Ema(667); let e6 = new Ema(800);
let shZones = true; let shTl = true; let shPoc = true; let shSig = true;
let shVd = true; let shVw = true; let shVm = true;
let shE1 = true; let shE2 = true; let shE3 = true; let shE4 = true; let shE5 = true; let shE6 = true;
let dT: f64 = NaN; let dB: f64 = NaN; let dL: f64 = 0.0; let dS: f64 = 0.0; let dTouch: i32 = 0; let dGhost: i32 = 0;
let sT: f64 = NaN; let sB: f64 = NaN; let sL: f64 = 0.0; let sS: f64 = 0.0; let sTouch: i32 = 0; let sGhost: i32 = 0;
let hp1: f64 = NaN; let hp2: f64 = NaN; let hp3: f64 = NaN; let hi1: i32 = 0; let hi2: i32 = 0; let hi3: i32 = 0;
let lp1: f64 = NaN; let lp2: f64 = NaN; let lp3: f64 = NaN; let li1: i32 = 0; let li2: i32 = 0; let li3: i32 = 0;
let rOn = false; let rBase: f64 = 0; let rSlope: f64 = 0; let rX0: i32 = 0;
let uOn = false; let uBase: f64 = 0; let uSlope: f64 = 0; let uX0: i32 = 0;
let rBrokeAt: i32 = -1; let rBrokeLvl: f64 = NaN; let rRetested = false;
let uBrokeAt: i32 = -1; let uBrokeLvl: f64 = NaN; let uRetested = false;
let breaks: i32 = 0; let fakes: i32 = 0;
const HR = 512;
const hiRing = new StaticArray<f64>(HR);
const loRing = new StaticArray<f64>(HR);
let hs = new Swings(3, 3);
let htfLen: i32 = 3; let htfSec: f64 = 14400.0;
let enSfp = true; let enDbl = true; let enManip = true; let enAbcd = true;
let sfpBars: i32 = 1; let sfpMin: f64 = 0.05;
let dblTol: f64 = 0.3; let dblDepth: f64 = 0.8; let gapMin: i32 = 4; let gapMax: i32 = 60;
let manLo: f64 = 90.0; let manHi: f64 = 110.0; let manMin: f64 = 1.5;
let rLo: f64 = 38.2; let rHi: f64 = 88.6; let cLo: f64 = 90.0; let cHi: f64 = 110.0; let cdMin: f64 = 1.5;
let lvlH: f64 = NaN; let hActive = false; let hDone = false; let hStart: i32 = 0; let hExt: f64 = NaN;
let lvlL: f64 = NaN; let lActive = false; let lDone = false; let lStart: i32 = 0; let lExt: f64 = NaN;
let bucket: f64 = NaN; let curH: f64 = NaN; let curL: f64 = NaN; let htfCount: i32 = 0;
let pH: f64 = NaN; let pHi: i32 = 0; let pL: f64 = NaN; let pLi: i32 = 0;
let pa: f64 = NaN; let pb: f64 = NaN; let pc: f64 = NaN; let pd: f64 = NaN;
let ta: f64 = NaN; let tb: f64 = NaN; let tc: f64 = NaN; let td: f64 = NaN;
let cHigh = false; let nPiv: i32 = 0; let manN: i32 = 0; let cdN: i32 = 0;
let manFire = false; let manRatio: f64 = NaN;
let cdBull = false; let cdBear = false; let cdRatio: f64 = NaN;
const NP = 32; const CR = 64;
const pxs = new StaticArray<f64>(NP);
const pts = new StaticArray<f64>(NP);
const pkind = new StaticArray<i32>(NP);
const ctimes = new StaticArray<f64>(CR);
const wbuf = new StaticArray<f64>(NP * 2);
let ws = new Swings(3, 3);
let patPts: i32 = 8; let np: i32 = 0; let ncandle: i32 = 0;
let day = new PeriodLevels("day");
let week = new PeriodLevels("week");
let month = new PeriodLevels("month");
let shLevels = true; let shTrend = true; let shChan = true; let shPat = true;
let shDo = true; let shWo = true; let shMo = true; let shPeq = true; let shCeq = true;
const hx = new StaticArray<f64>(5);
const ht = new StaticArray<f64>(5);
const hk = new StaticArray<i32>(5);
const hbuf = new StaticArray<f64>(10);
let hPiv: i32 = 0; let nPat: i32 = 0; let n15: i32 = 0; let n60: i32 = 0;
let fibTol: f64 = 0.05; let patFire: i32 = 0; let patDir: f64 = NaN;
let en15 = true; let en60 = true; let enDoji = true; let enHam = true; let enBat = true; let enFly = true;
let trendN: i32 = 5; let dojiPct: f64 = 10.0; let wickMult: f64 = 2.0; let smallWick: f64 = 15.0; let minRange: f64 = 0.8;
class Tf {
  closes: StaticArray<f64> = new StaticArray<f64>(16);
  ranges: StaticArray<f64> = new StaticArray<f64>(5);
  nc: i32 = 0;
}
const s15 = new Tf();
const s60 = new Tf();

function inBand(level: f64, lo: f64, hi: f64, tol: f64): bool {
  return !isNaN(level) && !isNaN(lo) && !isNaN(hi) && level >= lo - tol && level <= hi + tol;
}

function drawManip(): void {
  const top = Math.max(pb, Math.max(pc, pd));
  const bot = Math.min(pb, Math.min(pc, pd));
  const slot = manN % RING;
  manN += 1;
  manBoxes[slot].set(tb, top, td, bot);
  sb_clear(); sb_text("MANIPULATION");
  manLabels[slot].set(td, pd).text(str_tag_sb).color(YELLOW);
}

function drawAbcd(bull: bool): void {
  const slot = cdN % 4;
  cdN += 1;
  cdBuf[0] = ta; cdBuf[1] = pa; cdBuf[2] = tb; cdBuf[3] = pb;
  cdBuf[4] = tc; cdBuf[5] = pc; cdBuf[6] = td; cdBuf[7] = pd;
  cdPolys[slot].setPoints(cdBuf, 4);
  cdPolys[slot].width(2).color(bull ? TEAL : PINK);
  const base = slot * 4;
  sb_clear(); sb_text("A");
  cdLabels[base].set(ta, pa).text(str_tag_sb).color(bull ? TEAL : PINK);
  sb_clear(); sb_text("B");
  cdLabels[base + 1].set(tb, pb).text(str_tag_sb).color(bull ? TEAL : PINK);
  sb_clear(); sb_text("C");
  cdLabels[base + 2].set(tc, pc).text(str_tag_sb).color(bull ? TEAL : PINK);
  sb_clear(); sb_text(bull ? "D bullish" : "D bearish");
  cdLabels[base + 3].set(td, pd).text(str_tag_sb).color(bull ? TEAL : PINK);
}

function pushPivot(px: f64, ts: f64, isHigh: bool, atrNow: f64): void {
  if (nPiv > 0 && cHigh == isHigh) {
    if (isHigh) { if (px > pd) { pd = px; td = ts; } }
    else { if (px < pd) { pd = px; td = ts; } }
    return;
  }
  pa = pb; ta = tb; pb = pc; tb = tc; pc = pd; tc = td; pd = px; td = ts; cHigh = isHigh; nPiv += 1;
  if (nPiv < 3) return;
  const mab = Math.abs(pc - pb);
  const mbc = Math.abs(pd - pc);
  if (mab > 0.0 && mbc > 0.0) {
    const r = mab / mbc * 100.0;
    if (r >= manLo && r <= manHi && mab >= manMin * atrNow && mbc >= manMin * atrNow) {
      manFire = true; manRatio = r;
      if (enManip) drawManip();
    }
  }
  if (nPiv < 4) return;
  const ab = Math.abs(pb - pa);
  const bc = Math.abs(pc - pb);
  const cd = Math.abs(pd - pc);
  if (ab <= 0.0 || ab < cdMin * atrNow) return;
  const ret = bc / ab * 100.0;
  const ext = cd / ab * 100.0;
  if (ret < rLo || ret > rHi || ext < cLo || ext > cHi) return;
  const bull = !cHigh && pd < pb && pc < pa;
  const bear = cHigh && pd > pb && pc > pa;
  if (!bull && !bear) return;
  cdRatio = ext;
  if (bull) cdBull = true; else cdBear = true;
  if (enAbcd) drawAbcd(bull);
}

function addPivot(price: f64, time: f64, kind: i32): void {
  if (np == NP) {
    for (let i = 0; i < NP - 1; i++) { pxs[i] = pxs[i + 1]; pts[i] = pts[i + 1]; pkind[i] = pkind[i + 1]; }
    np = NP - 1;
  }
  pxs[np] = price; pts[np] = time; pkind[np] = kind; np += 1;
}

function styleLine(h: LineHandle, op: f64): void {
  h.style(LineStyle.Dotted).width(1).color(WHITE).extend(Extend.Right).opacity(op);
}

function drawLevel(slot: i32, k: i32, show: bool, t: f64): void {
  if (show && k >= 0) {
    const h = lines[slot];
    h.set(pts[k], pxs[k], t, pxs[k]);
    styleLine(h, 1.0);
  } else {
    lines[slot].delete();
  }
}

function drawSlope(idMain: i32, idPar: i32, idMid: i32, ka: i32, kb: i32, isRes: bool, t: f64): void {
  if (ka < 0 || kb < 0 || pts[kb] <= pts[ka]) { lines[idMain].delete(); lines[idPar].delete(); lines[idMid].delete(); return; }
  const m = (pxs[kb] - pxs[ka]) / (pts[kb] - pts[ka]);
  const yNow = pxs[ka] + m * (t - pts[ka]);
  if (shTrend) {
    const h = lines[idMain];
    h.set(pts[ka], pxs[ka], t, yNow);
    styleLine(h, 1.0);
  } else lines[idMain].delete();
  let d: f64 = 0.0;
  let have = false;
  for (let k = ka; k < np; k++) {
    if (pkind[k] == (isRes ? -1 : 1)) {
      const dv = pxs[k] - (pxs[ka] + m * (pts[k] - pts[ka]));
      if (isRes) { if (!have || dv < d) { d = dv; have = true; } }
      else { if (!have || dv > d) { d = dv; have = true; } }
    }
  }
  const valid = have && ((isRes && d < 0.0) || (!isRes && d > 0.0));
  if (shChan && valid) {
    const p = lines[idPar];
    p.set(pts[ka], pxs[ka] + d, t, yNow + d);
    styleLine(p, 1.0);
    const md = lines[idMid];
    md.set(pts[ka], pxs[ka] + d * 0.5, t, yNow + d * 0.5);
    styleLine(md, 0.6);
  } else { lines[idPar].delete(); lines[idMid].delete(); }
}

function judge(s: Tf, o: f64, h: f64, l: f64, c: f64): i32 {
  const range = h - l;
  let code = 0;
  if (range > 0.0 && s.nc > trendN) {
    let avg = 0.0; let cnt = 0;
    for (let i = 0; i < 5; i++) { if (s.ranges[i] > 0.0) { avg += s.ranges[i]; cnt += 1; } }
    avg = cnt > 0 ? avg / f64(cnt) : range;
    if (range >= minRange * avg) {
      const prev = s.closes[(s.nc - 1) % 16];
      const back = s.closes[(s.nc - 1 - trendN) % 16];
      const up = prev > back; const down = prev < back;
      const body = Math.abs(c - o);
      const upW = h - Math.max(o, c);
      const loW = Math.min(o, c) - l;
      if (enDoji && body <= dojiPct / 100.0 * range) {
        if (down) code = 1; else if (up) code = 2;
      }
      if (code == 0 && enHam && body > 0.0) {
        if (loW >= wickMult * body && upW <= smallWick / 100.0 * range && down) code = 3;
        else if (upW >= wickMult * body && loW <= smallWick / 100.0 * range && up) code = 4;
      }
    }
  }
  s.closes[s.nc % 16] = c;
  s.ranges[s.nc % 5] = range;
  s.nc += 1;
  return code;
}

function tagCandle(hd: LabelHandle, isHour: bool, code: i32, x: f64, hi: f64, lo: f64, atrNow: f64): void {
  const top = code == 2 || code == 4;
  sb_clear();
  sb_text(isHour ? "1h " : "15m ");
  if (code == 1 || code == 2) sb_text("Doji"); else if (code == 3) sb_text("Hammer"); else sb_text("Shooting star");
  sb_text(top ? ": TOP REVERSAL" : ": BOTTOM REVERSAL");
  if (top) hd.set(x, hi + 0.4 * atrNow).text(str_tag_sb).color(PINK);
  else hd.set(x, lo - 0.4 * atrNow).text(str_tag_sb).color(TEAL);
}

function inR(v: f64, lo: f64, hi: f64, tol: f64): bool { return v >= lo - tol && v <= hi + tol; }

function drawHarm(isFly: bool): void {
  const slot = nPat % 4;
  nPat += 1;
  const bull = hk[4] == -1;
  for (let i = 0; i < 5; i++) { hbuf[2 * i] = ht[i]; hbuf[2 * i + 1] = hx[i]; }
  polys[slot].setPoints(hbuf, 5);
  polys[slot].width(2).color(isFly ? FLY : BAT);
  for (let i = 0; i < 5; i++) {
    sb_clear();
    if (i == 0) sb_text("X"); else if (i == 1) sb_text("A"); else if (i == 2) sb_text("B"); else if (i == 3) sb_text("C"); else sb_text("D");
    ptLabs[slot * 5 + i].set(ht[i], hx[i]).text(str_tag_sb).color(isFly ? FLY : BAT);
  }
  sb_clear(); sb_text(isFly ? "BUTTERFLY " : "BAT "); sb_text(bull ? "bullish" : "bearish");
  nameLabs[slot].set(ht[4], hx[4]).text(str_tag_sb).color(bull ? TEAL : PINK);
}

function pushHarm(price: f64, time: f64, kind: i32): void {
  if (hPiv > 0 && hk[4] == kind) {
    if ((kind == 1 && price > hx[4]) || (kind == -1 && price < hx[4])) { hx[4] = price; ht[4] = time; }
    return;
  }
  for (let i = 0; i < 4; i++) { hx[i] = hx[i + 1]; ht[i] = ht[i + 1]; hk[i] = hk[i + 1]; }
  hx[4] = price; ht[4] = time; hk[4] = kind;
  hPiv += 1;
  if (hPiv < 5) return;
  const xa = Math.abs(hx[1] - hx[0]);
  const ab = Math.abs(hx[2] - hx[1]);
  const bc = Math.abs(hx[3] - hx[2]);
  const cd = Math.abs(hx[4] - hx[3]);
  const xd = Math.abs(hx[4] - hx[1]);
  if (xa <= 0.0 || ab <= 0.0 || bc <= 0.0) return;
  const rB = ab / xa; const rC = bc / ab; const rBC = cd / bc; const rD = xd / xa;
  const rcOk = inR(rC, 0.382, 0.886, fibTol);
  const projOk = inR(rBC, 1.618, 2.618, fibTol * 2.0);
  const dir = kind == -1 ? 1.0 : -1.0;
  if (enBat && rcOk && projOk && inR(rB, 0.382, 0.5, fibTol) && Math.abs(rD - 0.886) <= fibTol) { patFire = 1; patDir = dir; drawHarm(false); }
  else if (enFly && rcOk && projOk && inR(rB, 0.786, 0.786, fibTol) && inR(rD, 1.272, 1.618, fibTol)) { patFire = 2; patDir = dir; drawHarm(true); }
}

function onStart(): void {
  right = i32(p_swing_len());
  sw = new Swings(right, right);
  htfLen = i32(p_htf_len());
  hs = new Swings(htfLen, htfLen);
  ws = new Swings(htfLen, htfLen);
  htfSec = f64(i32(p_htf_min())) * 60.0;
  pN = i32(p_poc_lookback());
  keepN = i32(p_keep_n());
  keepScore = p_keep_score();
  wBase = p_w_base(); wPoc = p_w_poc(); wVd = p_w_vd(); wVw = p_w_vw(); wVm = p_w_vm();
  wE1 = p_w_e1(); wE2 = p_w_e2(); wE3 = p_w_e3(); wE4 = p_w_e4(); wE5 = p_w_e5(); wE6 = p_w_e6();
  wTl = p_w_tl(); wTlb = p_w_tlb();
  vD = new Vwap("day", "hlc3"); vW = new Vwap("week", "hlc3"); vM = new Vwap("month", "hlc3");
  e1 = new Ema(i32(p_ema1())); e2 = new Ema(i32(p_ema2())); e3 = new Ema(i32(p_ema3()));
  e4 = new Ema(i32(p_ema4())); e5 = new Ema(i32(p_ema5())); e6 = new Ema(i32(p_ema6()));
  shZones = pb_show_zones(); shTl = pb_show_tl(); shPoc = pb_show_poc(); shSig = pb_show_sig();
  shVd = pb_show_vd(); shVw = pb_show_vw(); shVm = pb_show_vm();
  shE1 = pb_show_e1(); shE2 = pb_show_e2(); shE3 = pb_show_e3(); shE4 = pb_show_e4(); shE5 = pb_show_e5(); shE6 = pb_show_e6();
  enSfp = pb_en_sfp(); enDbl = pb_en_dbl(); enManip = pb_en_manip(); enAbcd = pb_en_abcd();
  sfpBars = i32(p_sfp_bars()); sfpMin = p_sfp_min_atr();
  dblTol = p_dbl_tol(); dblDepth = p_dbl_depth(); gapMin = i32(p_dbl_gap_min()); gapMax = i32(p_dbl_gap_max());
  manLo = p_manip_lo(); manHi = p_manip_hi(); manMin = p_manip_min_atr();
  rLo = p_abcd_ret_lo(); rHi = p_abcd_ret_hi(); cLo = p_abcd_cd_lo(); cHi = p_abcd_cd_hi(); cdMin = p_abcd_min_atr();
  patPts = i32(p_pattern_pts());
  day = new PeriodLevels("day"); week = new PeriodLevels("week"); month = new PeriodLevels("month");
  shLevels = pb_show_levels(); shTrend = pb_show_trend(); shChan = pb_show_channel(); shPat = pb_show_pattern();
  shDo = pb_show_do(); shWo = pb_show_wo(); shMo = pb_show_mo(); shPeq = pb_show_peq(); shCeq = pb_show_ceq();
  en15 = pb_en_15(); en60 = pb_en_60(); enDoji = pb_en_doji(); enHam = pb_en_hammer(); enBat = pb_en_bat(); enFly = pb_en_fly();
  trendN = i32(p_trend_n()); dojiPct = p_doji_pct(); wickMult = p_wick_mult(); smallWick = p_small_wick(); minRange = p_min_range();
  fibTol = p_fib_tol();
}

function onBar(): void {
  const o = bar.open(), h = bar.high(), l = bar.low(), c = bar.close();
  const t = bar.time();
  if (!isNaN(lastT) && t > lastT && (isNaN(width) || t - lastT < width)) width = t - lastT;
  lastT = t;
  const tr = isNaN(pClose) ? h - l : Math.max(h - l, Math.max(Math.abs(h - pClose), Math.abs(l - pClose)));
  atr = isNaN(atr) ? tr : (atr * 13.0 + tr) / 14.0;
  sw.update(h, l);
  manFire = false; manRatio = NaN; cdBull = false; cdBear = false; cdRatio = NaN; patFire = 0; patDir = NaN;
  const zd = p_zone_atr() * atr;
  const near = p_near_atr() * atr;
  const maxT = i32(p_max_touch());
  const sfpOk = p_allow_sfp() >= 1.0;
  let lost = 0.0;

  if (sw.newLow()) { dT = sw.lastLow() + zd; dB = sw.lastLow(); dL = 1.0; dS = 0.0; dTouch = 0; dGhost = 0; }
  if (sw.newHigh()) { sT = sw.lastHigh(); sB = sw.lastHigh() - zd; sL = 1.0; sS = 0.0; sTouch = 0; sGhost = 0; }
  if (dL == 1.0 && dS < 4.0) {
    if (l < dB && c > dB && sfpOk) { dS = 3.0; }
    else if (c < dB) { dS = 4.0; dGhost = 15; lost = 1.0; }
    else if (l <= dT && c > dB) { dTouch += 1; dS = dTouch >= maxT ? 4.0 : 2.0; if (dS == 4.0) { dGhost = 15; lost = 1.0; } }
    else if (c - dT <= near && c > dT && dS < 2.0) { dS = 1.0; }
  } else if (dS == 4.0) { dGhost -= 1; if (dGhost <= 0) dL = 0.0; }
  if (sL == 1.0 && sS < 4.0) {
    if (h > sT && c < sT && sfpOk) { sS = 3.0; }
    else if (c > sT) { sS = 4.0; sGhost = 15; lost = 1.0; }
    else if (h >= sB && c < sT) { sTouch += 1; sS = sTouch >= maxT ? 4.0 : 2.0; if (sS == 4.0) { sGhost = 15; lost = 1.0; } }
    else if (sB - c <= near && c < sB && sS < 2.0) { sS = 1.0; }
  } else if (sS == 4.0) { sGhost -= 1; if (sGhost <= 0) sL = 0.0; }

  const tol = p_tl_tol() * atr;
  if (sw.newHigh()) {
    hp3 = hp2; hi3 = hi2; hp2 = hp1; hi2 = hi1; hp1 = sw.lastHigh(); hi1 = idx - right;
    if (!isNaN(hp3) && hp3 > hp2 && hp2 > hp1 && hi1 > hi3) {
      const slope = (hp1 - hp3) / f64(hi1 - hi3);
      const mid = hp3 + slope * f64(hi2 - hi3);
      if (Math.abs(mid - hp2) <= tol) { rOn = true; rBase = hp1; rSlope = slope; rX0 = hi1; rBrokeAt = -1; rRetested = false; }
    }
  }
  if (sw.newLow()) {
    lp3 = lp2; li3 = li2; lp2 = lp1; li2 = li1; lp1 = sw.lastLow(); li1 = idx - right;
    if (!isNaN(lp3) && lp3 < lp2 && lp2 < lp1 && li1 > li3) {
      const slope = (lp1 - lp3) / f64(li1 - li3);
      const mid = lp3 + slope * f64(li2 - li3);
      if (Math.abs(mid - lp2) <= tol) { uOn = true; uBase = lp1; uSlope = slope; uX0 = li1; uBrokeAt = -1; uRetested = false; }
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
  const vdv = vD.update(o, h, l, c, vol, t);
  const vwv = vW.update(o, h, l, c, vol, t);
  const vmv = vM.update(o, h, l, c, vol, t);
  const v1 = e1.update(c); const v2 = e2.update(c); const v3 = e3.update(c);
  const v4 = e4.update(c); const v5 = e5.update(c); const v6 = e6.update(c);

  let barPoc: f64 = NaN;
  let barPocVol: f64 = NaN;
  const pn = in_profile_cells();
  if (pn >= 4) {
    const pcells = in_profile_view();
    barPoc = vpPoc(pcells, pn);
    barPocVol = vpPocVolume(pcells, pn);
  }
  pocRing[pcur] = barPoc;
  pocVolRing[pcur] = barPocVol;
  pcur = (pcur + 1) % MAXP;
  if (pcount < MAXP) pcount += 1;
  let best: f64 = -1.0;
  const span = pcount < pN ? pcount : pN;
  for (let k = 1; k <= span; k++) {
    const j = (pcur - k + MAXP) % MAXP;
    const pv = pocVolRing[j];
    if (!isNaN(pv) && pv > best) { best = pv; pocLvl = pocRing[j]; }
  }
  if (best < 0.0) pocLvl = NaN;

  const range = h - l;
  const lowWick = Math.min(o, c) - l;
  const upWick = h - Math.max(o, c);
  const wickMin = p_react_wick();
  const buyReact = dL == 1.0 && dS < 4.0 && !isNaN(dT) && l <= dT && c > dB && c > o && range > 0.0 && lowWick / range >= wickMin;
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
    const tg = buyTags[nBuy % keepN];
    nBuy += 1;
    sb_clear(); sb_int(i32(scoreBuy));
    tg.set(t, l - 0.3 * atr).text(str_tag_sb).color(TEAL);
  }
  if (fireSell && scoreSell >= keepScore) {
    const tg = sellTags[nSell % keepN];
    nSell += 1;
    sb_clear(); sb_int(i32(scoreSell));
    tg.set(t, h + 0.3 * atr).text(str_tag_sb).color(PINK);
  }

  let sfBear = 0.0; let sfBull = 0.0; let dtF = 0.0; let dbF = 0.0; let neck = NaN;
  if (sw.newHigh()) { lvlH = sw.lastHigh(); hActive = false; hDone = false; }
  if (sw.newLow()) { lvlL = sw.lastLow(); lActive = false; lDone = false; }
  if (!isNaN(lvlH) && !hDone) {
    if (h > lvlH) { if (!hActive) { hActive = true; hStart = idx; hExt = h; } else if (h > hExt) hExt = h; }
    if (hActive) {
      if (c < lvlH) { if (hExt - lvlH >= sfpMin * atr) sfBear = 1.0; hActive = false; hDone = true; }
      else if (idx - hStart + 1 >= sfpBars) { hActive = false; hDone = true; }
    }
  }
  if (!isNaN(lvlL) && !lDone) {
    if (l < lvlL) { if (!lActive) { lActive = true; lStart = idx; lExt = l; } else if (l < lExt) lExt = l; }
    if (lActive) {
      if (c > lvlL) { if (lvlL - lExt >= sfpMin * atr) sfBull = 1.0; lActive = false; lDone = true; }
      else if (idx - lStart + 1 >= sfpBars) { lActive = false; lDone = true; }
    }
  }

  const bk = Math.floor(t / htfSec);
  if (isNaN(bucket)) { bucket = bk; curH = h; curL = l; }
  else if (bk != bucket) {
    const slot = htfCount % HR;
    hiRing[slot] = curH; loRing[slot] = curL;
    htfCount += 1;
    hs.update(curH, curL);
    const sIdx = htfCount - 1 - htfLen;
    if (hs.newHigh()) {
      const hpx = hs.lastHigh();
      if (!isNaN(pH) && sIdx - pHi >= gapMin && sIdx - pHi <= gapMax && Math.abs(hpx - pH) / pH * 100.0 <= dblTol) {
        let mn = Infinity;
        for (let k = pHi; k <= sIdx; k++) { const v = loRing[k % HR]; if (v < mn) mn = v; }
        const topv = Math.min(hpx, pH);
        if ((topv - mn) / topv * 100.0 >= dblDepth) { dtF = 1.0; neck = mn; }
      }
      pH = hpx; pHi = sIdx;
    }
    if (hs.newLow()) {
      const lpx = hs.lastLow();
      if (!isNaN(pL) && sIdx - pLi >= gapMin && sIdx - pLi <= gapMax && Math.abs(lpx - pL) / pL * 100.0 <= dblTol) {
        let mx = -Infinity;
        for (let k = pLi; k <= sIdx; k++) { const v = hiRing[k % HR]; if (v > mx) mx = v; }
        const botv = Math.max(lpx, pL);
        if ((mx - botv) / botv * 100.0 >= dblDepth) { dbF = 1.0; neck = mx; }
      }
      pL = lpx; pLi = sIdx;
    }
    bucket = bk; curH = h; curL = l;
  } else {
    if (h > curH) curH = h;
    if (l < curL) curL = l;
  }

  const tp = isNaN(width) ? NaN : t - width * f64(right);
  if (sw.newHigh()) { pushPivot(sw.lastHigh(), tp, true, atr); pushHarm(sw.lastHigh(), tp, 1); }
  if (sw.newLow()) { pushPivot(sw.lastLow(), tp, false, atr); pushHarm(sw.lastLow(), tp, -1); }

  const nw = in_wk_cells();
  if (nw >= 6) {
    const wc = in_wk_view();
    for (let i = 0; i + 5 < nw; i += 6) {
      ctimes[ncandle % CR] = t + wc[i] / 1000.0;
      ncandle += 1;
      ws.update(wc[i + 2], wc[i + 3]);
      const pi = ncandle - 1 - htfLen;
      if (pi >= 0) {
        const ptm = ctimes[pi % CR];
        if (ws.newHigh()) addPivot(ws.lastHigh(), ptm, 1);
        if (ws.newLow()) addPivot(ws.lastLow(), ptm, -1);
      }
    }
  }
  day.update(t, o, h, l, c);
  week.update(t, o, h, l, c);
  month.update(t, o, h, l, c);
  const dHi = day.high(); const dLo = day.low();
  const pdHi = day.prevHigh(); const pdLo = day.prevLow();
  if (bar.isLast()) {
    let h1 = -1; let h2 = -1; let h3 = -1; let l1 = -1; let l2 = -1; let l3 = -1;
    for (let k = np - 1; k >= 0; k--) {
      if (pkind[k] == 1) { if (h1 < 0) h1 = k; else if (h2 < 0) h2 = k; else if (h3 < 0) h3 = k; }
      else { if (l1 < 0) l1 = k; else if (l2 < 0) l2 = k; else if (l3 < 0) l3 = k; }
    }
    drawLevel(0, h1, shLevels, t); drawLevel(1, h2, shLevels, t); drawLevel(2, h3, shLevels, t);
    drawLevel(3, l1, shLevels, t); drawLevel(4, l2, shLevels, t); drawLevel(5, l3, shLevels, t);
    drawSlope(6, 8, 9, h2, h1, true, t);
    drawSlope(7, 10, 11, l2, l1, false, t);
    const cnt = np < patPts ? np : patPts;
    if (shPat && cnt >= 2) {
      const start = np - cnt;
      for (let j = 0; j < cnt; j++) { wbuf[2 * j] = pts[start + j]; wbuf[2 * j + 1] = pxs[start + j]; }
      wbuf[2 * cnt] = t; wbuf[2 * cnt + 1] = c;
      wpoly.setPoints(wbuf, cnt + 1);
      wpoly.style(LineStyle.Dotted).width(1).color(WHITE);
    } else wpoly.delete();
  }

  let f15 = 0.0; let f60 = 0.0;
  const n1 = in_c15_cells();
  if (n1 >= 6) {
    const cc = in_c15_view();
    for (let i = 0; i + 5 < n1; i += 6) {
      const code = judge(s15, cc[i + 1], cc[i + 2], cc[i + 3], cc[i + 4]);
      if (code > 0 && en15) {
        const slot = n15 % 8; n15 += 1;
        tagCandle(lab15[slot], false, code, t + cc[i] / 1000.0, cc[i + 2], cc[i + 3], atr);
        if (i + 6 >= n1) f15 = 1.0;
      }
    }
  }
  const n2 = in_c60_cells();
  if (n2 >= 6) {
    const c6 = in_c60_view();
    for (let i = 0; i + 5 < n2; i += 6) {
      const code = judge(s60, c6[i + 1], c6[i + 2], c6[i + 3], c6[i + 4]);
      if (code > 0 && en60) {
        const slot = n60 % 8; n60 += 1;
        tagCandle(lab60[slot], true, code, t + c6[i] / 1000.0, c6[i + 2], c6[i + 3], atr);
        if (i + 6 >= n2) f60 = 1.0;
      }
    }
  }

  out_vwap_d(shVd ? vdv : NaN); out_vwap_w(shVw ? vwv : NaN); out_vwap_m(shVm ? vmv : NaN);
  out_ema_1(shE1 ? v1 : NaN); out_ema_2(shE2 ? v2 : NaN); out_ema_3(shE3 ? v3 : NaN);
  out_ema_4(shE4 ? v4 : NaN); out_ema_5(shE5 ? v5 : NaN); out_ema_6(shE6 ? v6 : NaN);
  out_poc_bar(shPoc ? barPoc : NaN);
  out_poc_lvl(shPoc ? pocLvl : NaN);
  out_open_d(shDo ? day.open() : NaN);
  out_open_w(shWo ? week.open() : NaN);
  out_open_m(shMo ? month.open() : NaN);
  out_eq_prev(shPeq && !isNaN(pdHi) && !isNaN(pdLo) ? (pdHi + pdLo) * 0.5 : NaN);
  out_eq_cur(shCeq && !isNaN(dHi) && !isNaN(dLo) ? (dHi + dLo) * 0.5 : NaN);
  out_g_buy(fireBuy ? 1.0 : 0.0); out_g_sell(fireSell ? 1.0 : 0.0);
  out_sig_buy(l); out_sig_sell(h);
  out_conf_buy(fireBuy ? scoreBuy : NaN); out_conf_sell(fireSell ? scoreSell : NaN);
  out_d_top(dT); out_d_bot(dB); out_d_live(shZones ? dL : 0.0); out_d_state(dS);
  out_s_top(sT); out_s_bot(sB); out_s_live(shZones ? sL : 0.0); out_s_state(sS);
  out_tl_res(shTl && rOn ? rv : NaN);
  out_tl_sup(shTl && uOn ? uv : NaN);
  out_g_brk_up(shTl ? bu : 0.0); out_g_brk_dn(shTl ? bd : 0.0);
  out_g_ret_up(shTl ? ru : 0.0); out_g_ret_dn(shTl ? rd : 0.0);
  out_brk_up(l); out_brk_dn(h); out_ret_up(l); out_ret_dn(h);
  out_g_zone_lost(shZones ? lost : 0.0);
  out_brk_price(shTl ? bp : NaN);
  out_fake_rate(shTl && breaks > 0 ? 100.0 * f64(fakes) / f64(breaks) : NaN);
  out_g_sfp_bear(enSfp ? sfBear : 0.0); out_g_sfp_bull(enSfp ? sfBull : 0.0);
  out_sfp_bear(h); out_sfp_bull(l);
  out_g_dt(enDbl ? dtF : 0.0); out_g_db(enDbl ? dbF : 0.0);
  out_dbl_top(h); out_dbl_bot(l);
  out_dbl_neck(enDbl ? neck : NaN);
  out_g_manip(enManip && manFire ? 1.0 : 0.0);
  out_manip_ratio(enManip && manFire ? manRatio : NaN);
  out_g_abcd_bull(enAbcd && cdBull ? 1.0 : 0.0);
  out_g_abcd_bear(enAbcd && cdBear ? 1.0 : 0.0);
  out_abcd_cd(enAbcd && (cdBull || cdBear) ? cdRatio : NaN);
  out_g_r15(f15); out_g_r60(f60);
  out_g_bat(patFire == 1 ? 1.0 : 0.0);
  out_g_fly(patFire == 2 ? 1.0 : 0.0);
  out_pat_dir(patDir);
  pClose = c;
  idx += 1;
}
