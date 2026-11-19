//@lang=wrun-ts
// NOVA 4 ext - EMAs, multi VWAP/opens, bands, HTF flags, harmonics, POC/VA, prev-day EQ + reg channels
page("Display");
param.bool("show_ema", true, { label: "EMA ribbon 21/100/144/360/667/800" });
param.bool("show_ema_box", true, { label: "Boxes red@360 green@800" });
param.bool("show_vwap", true, { label: "Daily / Weekly / Monthly VWAP" });
param.bool("show_open", true, { label: "Daily / Weekly / Monthly Open" });
param.bool("show_bands", true, { label: "VWAP deviation bands (teal below / pink above)" });
param.bool("show_flags", true, { label: "HTF bull (teal) + bear (red) flags" });
param.bool("show_harm", true, { label: "Harmonics 10% tol" });
param.bool("show_zz", true, { label: "Pattern zigzag (finite)" });
param.bool("show_poc", true, { label: "POC + VAH/VAL (yellow)" });
param.bool("show_eq", true, { label: "Prev-day EQ (purple) + reg channels" });

page("Logic");
param.int("swing_len", 3, { min: 2, max: 12, label: "Swing length each side" });
param.number("fib_tol", 0.10, { min: 0.02, max: 0.25, step: 0.01, label: "Fib tolerance", when: "show_harm" });
param.int("keep_bars", 220, { min: 40, max: 500, label: "Keep pattern bars", when: "show_harm" });
param.number("flag_pole_atr", 1.8, { min: 0.8, max: 6, step: 0.1, label: "Flag min pole ATR", when: "show_flags" });
param.number("band_mult", 1.0, { min: 0.5, max: 3.0, step: 0.1, label: "Band ATR mult", when: "show_bands" });
param.int("poc_lb", 96, { min: 16, max: 300, label: "POC lookback (bars)", when: "show_poc" });
param.number("va_pct", 70, { min: 50, max: 90, step: 1, label: "Value Area %", when: "show_poc" });
param.int("eq_reg_lb", 48, { min: 12, max: 120, label: "EQ regression lookback", when: "show_eq" });

// --- Rays (finite zigzag + target leg) ---
plot.rays({
  name: "zz", slots: 5,
  colors: ["#a78bfa", "#c4b5fd", "#fbbf24", "#f97316", "#38bdf8"],
  width: 2.5, line_style: "solid", opacity: 0.95,
  words: ["ABCD", "Gartley", "BAT", "BUTTERFLY", "Crab", "Cypher", "Shark", "WXY", "Target"],
  tooltip: "{{word}}", panel: "overlay"
});

// --- Soft VWAP band zones (10% opacity) ---
plot.spans({
  name: "band", slots: 4,
  colors: ["#00ffd5", "#00ffd5", "#ff2bd6", "#ff2bd6"],
  opacity: 0.10,
  border: { width: 0, opacity: 0.0 },
  words: ["Teal -1 ATR", "Teal -2 ATR", "Pink +1 ATR", "Pink +2 ATR"],
  tooltip: "{{word}}", panel: "overlay"
});

// --- EMAs ---
output("ema21", line, overlay, { color: "#fde047", width: 1, description: "EMA 21" });
output("ema100", line, overlay, { color: "#94a3b8", width: 1, description: "EMA 100" });
output("ema144", line, overlay, { color: "#a78bfa", width: 1, description: "EMA 144" });
output("ema360", line, overlay, { color: "#f97316", width: 2, description: "EMA 360" });
output("ema667", line, overlay, { color: "#38bdf8", width: 1, description: "EMA 667" });
output("ema800", line, overlay, { color: "#22c55e", width: 2, description: "EMA 800" });

// --- VWAP lines (white) ---
output("dvwap", line, overlay, { color: "#ffffff", width: 2, description: "Daily VWAP" });
output("wvwap", line, overlay, { color: "#e5e7eb", width: 1.5, line_style: "dashed", description: "Weekly VWAP" });
output("mvwap", line, overlay, { color: "#d1d5db", width: 1.5, line_style: "dotted", description: "Monthly VWAP" });

// --- Session opens (white) ---
output("dopen", line, overlay, { color: "#ffffff", width: 1, line_style: "dashed", description: "Daily Open" });
output("wopen", line, overlay, { color: "#e5e7eb", width: 1, line_style: "dashed", description: "Weekly Open" });
output("mopen", line, overlay, { color: "#d1d5db", width: 1, line_style: "dotted", description: "Monthly Open" });

// --- POC + Value Area (yellow) ---
output("poc", line, overlay, { color: "#facc15", width: 2, description: "POC" });
output("vah", line, overlay, { color: "#fde047", width: 1, line_style: "dashed", description: "VAH" });
output("val", line, overlay, { color: "#fde047", width: 1, line_style: "dashed", description: "VAL" });

// --- Previous day EQ (purple) + regression / std channels ---
output("eq", line, overlay, { color: "#a855f7", width: 2, description: "Prev-day EQ" });
output("eq_u1", line, overlay, { color: "#00ffd5", width: 1, line_style: "dashed", description: "EQ +1σ teal" });
output("eq_u2", line, overlay, { color: "#00ffd5", width: 1, line_style: "dotted", description: "EQ +2σ teal extreme" });
output("eq_d1", line, overlay, { color: "#ff2bd6", width: 1, line_style: "dashed", description: "EQ -1σ pink" });
output("eq_d2", line, overlay, { color: "#ff2bd6", width: 1, line_style: "dotted", description: "EQ -2σ pink extreme" });

// Session open fib helpers
output("do_382", line, overlay, { color: "#c4b5fd", width: 1, line_style: "dotted", description: "DayOpen +0.382 range" });
output("do_618", line, overlay, { color: "#c4b5fd", width: 1, line_style: "dotted", description: "DayOpen +0.618 range" });
output("do_n382", line, overlay, { color: "#c4b5fd", width: 1, line_style: "dotted", description: "DayOpen -0.382 range" });
output("do_n618", line, overlay, { color: "#c4b5fd", width: 1, line_style: "dotted", description: "DayOpen -0.618 range" });

// --- EMA touch boxes ---
const b360t = output("b360_t", none);
const b360b = output("b360_b", none);
const b360l = output("b360_l", none);
box("ema360_touch", { top: b360t, bottom: b360b, when: b360l, color: "#ef4444", opacity: 0.50, borderColor: "#ef4444", borderWidth: 1, z: 5 });
const b800t = output("b800_t", none);
const b800b = output("b800_b", none);
const b800l = output("b800_l", none);
box("ema800_touch", { top: b800t, bottom: b800b, when: b800l, color: "#22c55e", opacity: 0.50, borderColor: "#22c55e", borderWidth: 1, z: 5 });

// --- Pattern letter labels ---
output("lab_a", shape, overlay, { color: "#e879f9", shape_where: "g_a", shape: "char", char: "A", location: "above_bar", glow: 8, description: "A" });
output("lab_b", shape, overlay, { color: "#e879f9", shape_where: "g_b", shape: "char", char: "B", location: "below_bar", glow: 8, description: "B" });
output("lab_c", shape, overlay, { color: "#e879f9", shape_where: "g_c", shape: "char", char: "C", location: "above_bar", glow: 8, description: "C" });
output("lab_d", shape, overlay, { color: "#e879f9", shape_where: "g_d", shape: "char", char: "D", location: "below_bar", glow: 8, description: "D" });
output("lab_x", shape, overlay, { color: "#38bdf8", shape_where: "g_x", shape: "char", char: "X", location: "above_bar", glow: 8, description: "X" });

// --- Pattern name markers + bigger BAT/BUTTERFLY ---
output("n_bat", shape, overlay, { color: "#22c55e", shape_where: "g_bat_bull", shape: "flag", location: "above_bar", glow: 36, description: "BAT bull" });
output("n_bat_r", shape, overlay, { color: "#ef4444", shape_where: "g_bat_bear", shape: "flag", location: "below_bar", glow: 36, description: "BAT bear" });
output("n_fly", shape, overlay, { color: "#22c55e", shape_where: "g_fly_bull", shape: "flag", location: "above_bar", glow: 36, description: "BUTTERFLY bull" });
output("n_fly_r", shape, overlay, { color: "#ef4444", shape_where: "g_fly_bear", shape: "flag", location: "below_bar", glow: 36, description: "BUTTERFLY bear" });
output("n_bat2", shape, overlay, { color: "#86efac", shape_where: "g_bat_bull", shape: "circle", location: "above_bar", glow: 40, description: "BAT" });
output("n_fly2", shape, overlay, { color: "#86efac", shape_where: "g_fly_bull", shape: "circle", location: "above_bar", glow: 40, description: "BUTTERFLY" });
output("n_bat2r", shape, overlay, { color: "#fca5a5", shape_where: "g_bat_bear", shape: "circle", location: "below_bar", glow: 40, description: "BAT" });
output("n_fly2r", shape, overlay, { color: "#fca5a5", shape_where: "g_fly_bear", shape: "circle", location: "below_bar", glow: 40, description: "BUTTERFLY" });

output("n_gart", shape, overlay, { color: "#22c55e", shape_where: "g_gart_bull", shape: "diamond", location: "above_bar", glow: 12, description: "Gartley" });
output("n_gart_r", shape, overlay, { color: "#ef4444", shape_where: "g_gart_bear", shape: "diamond", location: "below_bar", glow: 12, description: "Gartley" });
output("n_crab", shape, overlay, { color: "#22c55e", shape_where: "g_crab_bull", shape: "diamond", location: "above_bar", glow: 12, description: "Crab" });
output("n_crab_r", shape, overlay, { color: "#ef4444", shape_where: "g_crab_bear", shape: "diamond", location: "below_bar", glow: 12, description: "Crab" });
output("n_cyph", shape, overlay, { color: "#22c55e", shape_where: "g_cyph_bull", shape: "diamond", location: "above_bar", glow: 12, description: "Cypher" });
output("n_cyph_r", shape, overlay, { color: "#ef4444", shape_where: "g_cyph_bear", shape: "diamond", location: "below_bar", glow: 12, description: "Cypher" });
output("n_shark", shape, overlay, { color: "#22c55e", shape_where: "g_shark_bull", shape: "diamond", location: "above_bar", glow: 12, description: "Shark" });
output("n_shark_r", shape, overlay, { color: "#ef4444", shape_where: "g_shark_bear", shape: "diamond", location: "below_bar", glow: 12, description: "Shark" });
// FIXED shapes
output("n_abcd", shape, overlay, { color: "#22c55e", shape_where: "g_abcd_bull", shape: "triangle_up", location: "above_bar", glow: 10, description: "ABCD" });
output("n_abcd_r", shape, overlay, { color: "#ef4444", shape_where: "g_abcd_bear", shape: "triangle_down", location: "below_bar", glow: 10, description: "ABCD" });
output("n_wxy", shape, overlay, { color: "#22c55e", shape_where: "g_wxy_bull", shape: "triangle_up", location: "above_bar", glow: 10, description: "WXY" });
output("n_wxy_r", shape, overlay, { color: "#ef4444", shape_where: "g_wxy_bear", shape: "triangle_down", location: "below_bar", glow: 10, description: "WXY" });

output("n_near", shape, overlay, { color: "#c4b5fd", shape_where: "g_near", shape: "circle", location: "above_bar", glow: 6, description: "near" });
output("n_done", shape, overlay, { color: "#fbbf24", shape_where: "g_done", shape: "circle", location: "above_bar", glow: 10, description: "done" });
output("eq_hit", shape, overlay, { color: "#a855f7", shape_where: "g_eq_hit", shape: "circle", location: "above_bar", glow: 18, description: "EQ hit" });

const g_a = output("g_a", none);
const g_b = output("g_b", none);
const g_c = output("g_c", none);
const g_d = output("g_d", none);
const g_x = output("g_x", none);
const g_near = output("g_near", none);
const g_done = output("g_done", none);
const g_bat_bull = output("g_bat_bull", none);
const g_bat_bear = output("g_bat_bear", none);
const g_fly_bull = output("g_fly_bull", none);
const g_fly_bear = output("g_fly_bear", none);
const g_gart_bull = output("g_gart_bull", none);
const g_gart_bear = output("g_gart_bear", none);
const g_crab_bull = output("g_crab_bull", none);
const g_crab_bear = output("g_crab_bear", none);
const g_cyph_bull = output("g_cyph_bull", none);
const g_cyph_bear = output("g_cyph_bear", none);
const g_shark_bull = output("g_shark_bull", none);
const g_shark_bear = output("g_shark_bear", none);
const g_abcd_bull = output("g_abcd_bull", none);
const g_abcd_bear = output("g_abcd_bear", none);
const g_wxy_bull = output("g_wxy_bull", none);
const g_wxy_bear = output("g_wxy_bear", none);
const g_eq_hit = output("g_eq_hit", none);

output("bf1_u", line, overlay, { color: "#00ffd5", width: 1.5, line_style: "dashed", description: "Bull flag 1 upper" });
output("bf1_m", line, overlay, { color: "#00ffd5", width: 1, line_style: "dotted", description: "Bull flag 1 mid" });
output("bf1_l", line, overlay, { color: "#00ffd5", width: 1.5, line_style: "dashed", description: "Bull flag 1 lower" });
output("bf2_u", line, overlay, { color: "#2dd4bf", width: 1.5, line_style: "dashed", description: "Bull flag 2 upper" });
output("bf2_m", line, overlay, { color: "#2dd4bf", width: 1, line_style: "dotted", description: "Bull flag 2 mid" });
output("bf2_l", line, overlay, { color: "#2dd4bf", width: 1.5, line_style: "dashed", description: "Bull flag 2 lower" });
output("rf1_u", line, overlay, { color: "#ef4444", width: 1.5, line_style: "dashed", description: "Bear flag 1 upper" });
output("rf1_m", line, overlay, { color: "#ef4444", width: 1, line_style: "dotted", description: "Bear flag 1 mid" });
output("rf1_l", line, overlay, { color: "#ef4444", width: 1.5, line_style: "dashed", description: "Bear flag 1 lower" });
output("rf2_u", line, overlay, { color: "#f87171", width: 1.5, line_style: "dashed", description: "Bear flag 2 upper" });
output("rf2_m", line, overlay, { color: "#f87171", width: 1, line_style: "dotted", description: "Bear flag 2 mid" });
output("rf2_l", line, overlay, { color: "#f87171", width: 1.5, line_style: "dashed", description: "Bear flag 2 lower" });

let sw = new Swings(3, 3);
let e21 = new Ema(21);
let e100 = new Ema(100);
let e144 = new Ema(144);
let e360 = new Ema(360);
let e667 = new Ema(667);
let e800 = new Ema(800);
let dayVwap = new Vwap("day");
let weekVwap = new Vwap("week");
let monthVwap = new Vwap("month");

let right: i32 = 3;
let fibTol: f64 = 0.10;
let keepBars: i32 = 220;
let flagPoleAtr: f64 = 1.8;
let bandMult: f64 = 1.0;
let pocLb: i32 = 96;
let vaPct: f64 = 70.0;
let eqRegLb: i32 = 48;
let idx: i32 = 0;

let p0px: f64 = NaN; let p0t: f64 = 0.0; let p0i: i32 = 0;
let p1px: f64 = NaN; let p1t: f64 = 0.0; let p1i: i32 = 0;
let p2px: f64 = NaN; let p2t: f64 = 0.0; let p2i: i32 = 0;
let p3px: f64 = NaN; let p3t: f64 = 0.0; let p3i: i32 = 0;
let p4px: f64 = NaN; let p4t: f64 = 0.0; let p4i: i32 = 0;
let p5px: f64 = NaN; let p5t: f64 = 0.0; let p5i: i32 = 0;
let pivN: i32 = 0;

let a0px: f64 = NaN; let a0t: f64 = 0.0; let a0i: i32 = -1;
let a1px: f64 = NaN; let a1t: f64 = 0.0; let a1i: i32 = -1;
let a2px: f64 = NaN; let a2t: f64 = 0.0; let a2i: i32 = -1;
let a3px: f64 = NaN; let a3t: f64 = 0.0; let a3i: i32 = -1;
let a4px: f64 = NaN; let a4t: f64 = 0.0; let a4i: i32 = -1;
let patN: i32 = 0;
let patKind: i32 = 0;
let patOn: bool = false;
let patDone: bool = false;
let patAge: i32 = 0;
let patBull: bool = true;

let atr: f64 = NaN;
let prevC: f64 = NaN;
let prevT: f64 = NaN;
let barDt: f64 = 60.0;

let dayOpen: f64 = NaN;
let weekOpen: f64 = NaN;
let monthOpen: f64 = NaN;
let lastDayKey: i32 = -1;
let lastWeekKey: i32 = -1;
let lastMonthKey: i32 = -1;

let dayHi: f64 = NaN;
let dayLo: f64 = NaN;
let prevDayEq: f64 = NaN;
let prevDayRange: f64 = NaN;
let curDayHi: f64 = NaN;
let curDayLo: f64 = NaN;

let bfU0: f64 = NaN; let bfM0: f64 = NaN; let bfL0: f64 = NaN; let bfA0: i32 = 9999;
let bfU1: f64 = NaN; let bfM1: f64 = NaN; let bfL1: f64 = NaN; let bfA1: i32 = 9999;
let rfU0: f64 = NaN; let rfM0: f64 = NaN; let rfL0: f64 = NaN; let rfA0: i32 = 9999;
let rfU1: f64 = NaN; let rfM1: f64 = NaN; let rfL1: f64 = NaN; let rfA1: i32 = 9999;

const FMAX: i32 = 48;
let fHi = new StaticArray<f64>(48);
let fLo = new StaticArray<f64>(48);
let fN: i32 = 0;
let fCur: i32 = 0;

const RMAX: i32 = 180;
let rHi = new StaticArray<f64>(180);
let rLo = new StaticArray<f64>(180);
let rCl = new StaticArray<f64>(180);
let rTyp = new StaticArray<f64>(180);
let rN: i32 = 0;
let rCur: i32 = 0;

function inR(x: f64, a: f64, b: f64, tol: f64): bool {
  const lo = a < b ? a : b;
  const hi = a < b ? b : a;
  return x >= lo * (1.0 - tol) && x <= hi * (1.0 + tol);
}

function dayKey(ts: f64): i32 { return i32(Math.floor(ts / 86400.0)); }
function weekKey(ts: f64): i32 { return i32(Math.floor(ts / 604800.0)); }
function monthKey(ts: f64): i32 { return i32(Math.floor(ts / 2592000.0)); }

function onStart(): void {
  right = i32(p_swing_len());
  if (right < 2) right = 2;
  if (right > 12) right = 12;
  sw = new Swings(right, right);
  e21 = new Ema(21); e100 = new Ema(100); e144 = new Ema(144);
  e360 = new Ema(360); e667 = new Ema(667); e800 = new Ema(800);
  dayVwap = new Vwap("day");
  weekVwap = new Vwap("week");
  monthVwap = new Vwap("month");
  fibTol = p_fib_tol();
  keepBars = i32(p_keep_bars());
  flagPoleAtr = p_flag_pole_atr();
  bandMult = p_band_mult();
  pocLb = i32(p_poc_lb());
  vaPct = p_va_pct();
  eqRegLb = i32(p_eq_reg_lb());
  pivN = 0; idx = 0; patOn = false; patDone = false; patAge = 0; patN = 0; patKind = 0;
  atr = NaN; prevC = NaN; prevT = NaN;
  dayOpen = NaN; weekOpen = NaN; monthOpen = NaN;
  lastDayKey = -1; lastWeekKey = -1; lastMonthKey = -1;
  dayHi = NaN; dayLo = NaN; prevDayEq = NaN; prevDayRange = NaN;
  curDayHi = NaN; curDayLo = NaN;
  bfA0 = 9999; bfA1 = 9999; rfA0 = 9999; rfA1 = 9999;
  fN = 0; fCur = 0; rN = 0; rCur = 0;
}

function onBar(): void {
  const h = bar.high(); const l = bar.low(); const c = bar.close(); const t = bar.time();
  const o = bar.open(); const vol = bar.volume(); const tsMs = t * 1000.0;

  const shEma = pb_show_ema();
  const shBox = pb_show_ema_box();
  const shVwap = pb_show_vwap();
  const shOpen = pb_show_open();
  const shBands = pb_show_bands();
  const shFlag = pb_show_flags();
  const shHarm = pb_show_harm();
  const shZz = pb_show_zz();
  const shPoc = pb_show_poc();
  const shEq = pb_show_eq();

  if (!isNaN(prevT) && t > prevT) barDt = t - prevT;
  prevT = t;
  const tr = isNaN(prevC) ? (h - l) : Math.max(h - l, Math.max(Math.abs(h - prevC), Math.abs(l - prevC)));
  atr = isNaN(atr) ? tr : atr + (tr - atr) * (1.0 / 14.0);
  prevC = c;

  const dk = dayKey(t);
  const wk = weekKey(t);
  const mk = monthKey(t);
  if (dk != lastDayKey) {
    if (!isNaN(curDayHi) && !isNaN(curDayLo)) {
      dayHi = curDayHi; dayLo = curDayLo;
      prevDayEq = (dayHi + dayLo) * 0.5;
      prevDayRange = dayHi - dayLo;
    }
    dayOpen = o;
    curDayHi = h; curDayLo = l;
    lastDayKey = dk;
  } else {
    if (isNaN(curDayHi) || h > curDayHi) curDayHi = h;
    if (isNaN(curDayLo) || l < curDayLo) curDayLo = l;
  }
  if (wk != lastWeekKey) { weekOpen = o; lastWeekKey = wk; }
  if (mk != lastMonthKey) { monthOpen = o; lastMonthKey = mk; }

  out_dopen(shOpen && !isNaN(dayOpen) ? dayOpen : NaN);
  out_wopen(shOpen && !isNaN(weekOpen) ? weekOpen : NaN);
  out_mopen(shOpen && !isNaN(monthOpen) ? monthOpen : NaN);

  if (shOpen && !isNaN(dayOpen) && !isNaN(prevDayRange) && prevDayRange > 0.0) {
    out_do_382(dayOpen + prevDayRange * 0.382);
    out_do_618(dayOpen + prevDayRange * 0.618);
    out_do_n382(dayOpen - prevDayRange * 0.382);
    out_do_n618(dayOpen - prevDayRange * 0.618);
  } else {
    out_do_382(NaN); out_do_618(NaN); out_do_n382(NaN); out_do_n618(NaN);
  }

  const dv = dayVwap.update(o, h, l, c, vol, tsMs);
  const wv = weekVwap.update(o, h, l, c, vol, tsMs);
  const mv = monthVwap.update(o, h, l, c, vol, tsMs);
  out_dvwap(shVwap && !isNaN(dv) ? dv : NaN);
  out_wvwap(shVwap && !isNaN(wv) ? wv : NaN);
  out_mvwap(shVwap && !isNaN(mv) ? mv : NaN);

  if (shBands && !isNaN(dv) && !isNaN(atr) && atr > 0.0 && dv > 0.0) {
    const m = bandMult;
    const a1 = atr * m;
    const a2 = atr * 2.0 * m;
    const half = dv * 0.0005;
    const tStart = t - barDt * 2.0;
    const tEnd = t + barDt * 8.0;
    out_band_span_at(0, (dv - a1) + half, (dv - a1) - half, tStart, tEnd, 0, 0, 0);
    out_band_span_at(1, (dv - a2) + half, (dv - a2) - half, tStart, tEnd, 1, 1, 0);
    out_band_span_at(2, (dv + a1) + half, (dv + a1) - half, tStart, tEnd, 2, 2, 0);
    out_band_span_at(3, (dv + a2) + half, (dv + a2) - half, tStart, tEnd, 3, 3, 0);
  } else {
    out_band_span_at(0, NaN, NaN, 0.0, 0.0, 0, 0, 0);
    out_band_span_at(1, NaN, NaN, 0.0, 0.0, 1, 1, 0);
    out_band_span_at(2, NaN, NaN, 0.0, 0.0, 2, 2, 0);
    out_band_span_at(3, NaN, NaN, 0.0, 0.0, 3, 3, 0);
  }

  rCur = (rCur + 1) % RMAX;
  rHi[rCur] = h; rLo[rCur] = l; rCl[rCur] = c;
  rTyp[rCur] = (h + l + c) / 3.0;
  if (rN < RMAX) rN += 1;

  if (shPoc && rN >= 8) {
    const n = pocLb < rN ? pocLb : rN;
    let sum: f64 = 0.0; let sumH: f64 = 0.0; let sumL: f64 = 0.0;
    for (let k = 0; k < n; k += 1) {
      const j = (rCur - k + RMAX * 4) % RMAX;
      sum += rTyp[j]; sumH += rHi[j]; sumL += rLo[j];
    }
    const mid = sum / f64(n);
    const avgRange = (sumH - sumL) / f64(n);
    const halfVa = avgRange * (vaPct / 200.0);
    out_poc(mid); out_vah(mid + halfVa); out_val(mid - halfVa);
  } else {
    out_poc(NaN); out_vah(NaN); out_val(NaN);
  }

  out_g_eq_hit(0.0);
  if (shEq && !isNaN(prevDayEq)) {
    out_eq(prevDayEq);
    let sigma: f64 = 0.0;
    if (rN >= 8) {
      const n = eqRegLb < rN ? eqRegLb : rN;
      let mean: f64 = 0.0;
      for (let k = 0; k < n; k += 1) {
        const j = (rCur - k + RMAX * 4) % RMAX;
        mean += rCl[j];
      }
      mean /= f64(n);
      let varSum: f64 = 0.0;
      for (let k = 0; k < n; k += 1) {
        const j = (rCur - k + RMAX * 4) % RMAX;
        const d = rCl[j] - mean;
        varSum += d * d;
      }
      sigma = Math.sqrt(varSum / f64(n));
      if (!isNaN(prevDayRange) && prevDayRange > 0.0) {
        const rSig = prevDayRange * 0.25;
        if (rSig > sigma) sigma = (sigma + rSig) * 0.5;
      }
    } else if (!isNaN(prevDayRange) && prevDayRange > 0.0) {
      sigma = prevDayRange * 0.25;
    }
    if (sigma > 0.0) {
      out_eq_u1(prevDayEq + sigma);
      out_eq_u2(prevDayEq + sigma * 2.0);
      out_eq_d1(prevDayEq - sigma);
      out_eq_d2(prevDayEq - sigma * 2.0);
    } else {
      out_eq_u1(NaN); out_eq_u2(NaN); out_eq_d1(NaN); out_eq_d2(NaN);
    }
    const hitTol = !isNaN(atr) && atr > 0.0 ? atr * 0.15 : (c * 0.0005);
    const hitEq = Math.abs(c - prevDayEq) <= hitTol || (l <= prevDayEq && h >= prevDayEq);
    let hitBand = false;
    if (sigma > 0.0) {
      const u2 = prevDayEq + sigma * 2.0;
      const d2 = prevDayEq - sigma * 2.0;
      hitBand = (l <= u2 && h >= u2) || (l <= d2 && h >= d2) ||
                Math.abs(c - u2) <= hitTol || Math.abs(c - d2) <= hitTol;
    }
    if (hitEq || hitBand) out_g_eq_hit(1.0);
  } else {
    out_eq(NaN);
    out_eq_u1(NaN); out_eq_u2(NaN); out_eq_d1(NaN); out_eq_d2(NaN);
  }

  const v21 = e21.update(c);
  const v100 = e100.update(c);
  const v144 = e144.update(c);
  const v360 = e360.update(c);
  const v667 = e667.update(c);
  const v800 = e800.update(c);
  out_ema21(shEma ? v21 : NaN);
  out_ema100(shEma ? v100 : NaN);
  out_ema144(shEma ? v144 : NaN);
  out_ema360(shEma ? v360 : NaN);
  out_ema667(shEma ? v667 : NaN);
  out_ema800(shEma ? v800 : NaN);

  const touch360 = shBox && !isNaN(v360) && l <= v360 * 1.001 && h >= v360 * 0.999;
  const touch800 = shBox && !isNaN(v800) && l <= v800 * 1.001 && h >= v800 * 0.999;
  if (touch360) {
    const band = Math.max(Math.abs(v360) * 0.002, (h - l) * 0.4);
    out_b360_t(v360 + band); out_b360_b(v360 - band); out_b360_l(1.0);
  } else {
    out_b360_t(NaN); out_b360_b(NaN); out_b360_l(0.0);
  }
  if (touch800) {
    const band = Math.max(Math.abs(v800) * 0.002, (h - l) * 0.4);
    out_b800_t(v800 + band); out_b800_b(v800 - band); out_b800_l(1.0);
  } else {
    out_b800_t(NaN); out_b800_b(NaN); out_b800_l(0.0);
  }

  sw.update(h, l);
  if (sw.newHigh()) {
    const px = sw.lastHigh();
    p0px = p1px; p0t = p1t; p0i = p1i;
    p1px = p2px; p1t = p2t; p1i = p2i;
    p2px = p3px; p2t = p3t; p2i = p3i;
    p3px = p4px; p3t = p4t; p3i = p4i;
    p4px = p5px; p4t = p5t; p4i = p5i;
    p5px = px; p5t = t; p5i = idx - right;
    if (pivN < 6) pivN += 1;
  }
  if (sw.newLow()) {
    const px = sw.lastLow();
    p0px = p1px; p0t = p1t; p0i = p1i;
    p1px = p2px; p1t = p2t; p1i = p2i;
    p2px = p3px; p2t = p3t; p2i = p3i;
    p3px = p4px; p3t = p4t; p3i = p4i;
    p4px = p5px; p4t = p5t; p4i = p5i;
    p5px = px; p5t = t; p5i = idx - right;
    if (pivN < 6) pivN += 1;
  }

  fCur = (fCur + 1) % FMAX;
  fHi[fCur] = h; fLo[fCur] = l;
  if (fN < FMAX) fN += 1;

  if (shFlag && fN >= 18 && !isNaN(atr) && atr > 0.0) {
    let maxH: f64 = -1e99; let minL: f64 = 1e99;
    for (let k = 0; k < 12; k += 1) {
      const j = (fCur - k + FMAX * 4) % FMAX;
      if (fHi[j] > maxH) maxH = fHi[j];
      if (fLo[j] < minL) minL = fLo[j];
    }
    let consH: f64 = -1e99; let consL: f64 = 1e99;
    for (let k = 0; k < 6; k += 1) {
      const j = (fCur - k + FMAX * 4) % FMAX;
      if (fHi[j] > consH) consH = fHi[j];
      if (fLo[j] < consL) consL = fLo[j];
    }
    const pole = maxH - minL;
    const cons = consH - consL;
    const mid = (consH + consL) * 0.5;
    if (pole >= atr * flagPoleAtr && cons <= pole * 0.45 && cons > 0.0) {
      const earlyJ = (fCur - 11 + FMAX * 4) % FMAX;
      const earlyMid = (fHi[earlyJ] + fLo[earlyJ]) * 0.5;
      if (mid > earlyMid) {
        bfU1 = bfU0; bfM1 = bfM0; bfL1 = bfL0; bfA1 = bfA0;
        bfU0 = consH; bfM0 = mid; bfL0 = consL; bfA0 = 0;
      } else {
        rfU1 = rfU0; rfM1 = rfM0; rfL1 = rfL0; rfA1 = rfA0;
        rfU0 = consH; rfM0 = mid; rfL0 = consL; rfA0 = 0;
      }
    }
  }
  if (bfA0 < 9000) bfA0 += 1;
  if (bfA1 < 9000) bfA1 += 1;
  if (rfA0 < 9000) rfA0 += 1;
  if (rfA1 < 9000) rfA1 += 1;
  if (bfA0 > 400) { bfU0 = NaN; bfM0 = NaN; bfL0 = NaN; bfA0 = 9999; }
  if (bfA1 > 400) { bfU1 = NaN; bfM1 = NaN; bfL1 = NaN; bfA1 = 9999; }
  if (rfA0 > 400) { rfU0 = NaN; rfM0 = NaN; rfL0 = NaN; rfA0 = 9999; }
  if (rfA1 > 400) { rfU1 = NaN; rfM1 = NaN; rfL1 = NaN; rfA1 = 9999; }

  out_bf1_u(shFlag ? bfU0 : NaN); out_bf1_m(shFlag ? bfM0 : NaN); out_bf1_l(shFlag ? bfL0 : NaN);
  out_bf2_u(shFlag ? bfU1 : NaN); out_bf2_m(shFlag ? bfM1 : NaN); out_bf2_l(shFlag ? bfL1 : NaN);
  out_rf1_u(shFlag ? rfU0 : NaN); out_rf1_m(shFlag ? rfM0 : NaN); out_rf1_l(shFlag ? rfL0 : NaN);
  out_rf2_u(shFlag ? rfU1 : NaN); out_rf2_m(shFlag ? rfM1 : NaN); out_rf2_l(shFlag ? rfL1 : NaN);

  out_g_a(0.0); out_g_b(0.0); out_g_c(0.0); out_g_d(0.0); out_g_x(0.0);
  out_g_near(0.0); out_g_done(0.0);
  out_g_bat_bull(0.0); out_g_bat_bear(0.0);
  out_g_fly_bull(0.0); out_g_fly_bear(0.0);
  out_g_gart_bull(0.0); out_g_gart_bear(0.0);
  out_g_crab_bull(0.0); out_g_crab_bear(0.0);
  out_g_cyph_bull(0.0); out_g_cyph_bear(0.0);
  out_g_shark_bull(0.0); out_g_shark_bear(0.0);
  out_g_abcd_bull(0.0); out_g_abcd_bear(0.0);
  out_g_wxy_bull(0.0); out_g_wxy_bear(0.0);

  out_zz_ray_at(0, NaN, NaN, 0.0, 0.0, 0, 0, 0);
  out_zz_ray_at(1, NaN, NaN, 0.0, 0.0, 1, 1, 0);
  out_zz_ray_at(2, NaN, NaN, 0.0, 0.0, 2, 2, 0);
  out_zz_ray_at(3, NaN, NaN, 0.0, 0.0, 3, 3, 0);
  out_zz_ray_at(4, NaN, NaN, 0.0, 0.0, 8, 4, 0);

  if (patOn) {
    patAge += 1;
    if (patAge > keepBars) { patOn = false; patDone = false; patN = 0; patKind = 0; }
  }

  if (shHarm && pivN >= 4) {
    let A = p2px; let B = p3px; let C = p4px; let D = p5px;
    let At = p2t; let Bt = p3t; let Ct = p4t; let Dt = p5t;
    let Ai = p2i; let Bi = p3i; let Ci = p4i; let Di = p5i;
    if (pivN == 4 || pivN == 5) {
      A = p1px; B = p2px; C = p3px; D = p4px;
      At = p1t; Bt = p2t; Ct = p3t; Dt = p4t;
      Ai = p1i; Bi = p2i; Ci = p3i; Di = p4i;
    }
    const ab = Math.abs(B - A);
    const bc = Math.abs(C - B);
    const cd = Math.abs(D - C);
    if (ab > 0.0 && bc > 0.0 && cd > 0.0) {
      const rBC = bc / ab;
      const rCD = cd / ab;
      const rYZ = cd / bc;
      const isAbcd = inR(rBC, 0.382, 0.886, fibTol) && inR(rCD, 0.90, 1.272, fibTol);
      const isWxy = inR(rBC, 0.382, 1.272, fibTol) && inR(rYZ, 0.618, 1.618, fibTol);
      if (isAbcd || isWxy) {
        patOn = true; patDone = true; patAge = 0; patN = 4;
        patKind = isAbcd ? 1 : 8;
        patBull = D < A;
        a0px = A; a0t = At; a0i = Ai;
        a1px = B; a1t = Bt; a1i = Bi;
        a2px = C; a2t = Ct; a2i = Ci;
        a3px = D; a3t = Dt; a3i = Di;
        a4px = NaN; a4i = -1;
      }
    }
  }

  if (shHarm && pivN >= 5) {
    let X = p1px; let A = p2px; let B = p3px; let C = p4px; let D = p5px;
    let Xt = p1t; let At = p2t; let Bt = p3t; let Ct = p4t; let Dt = p5t;
    let Xi = p1i; let Ai = p2i; let Bi = p3i; let Ci = p4i; let Di = p5i;
    const XA = Math.abs(A - X);
    const AB = Math.abs(B - A);
    const BC = Math.abs(C - B);
    const CD = Math.abs(D - C);
    const AD = Math.abs(D - A);
    if (XA > 0.0 && AB > 0.0 && BC > 0.0 && CD > 0.0) {
      const rAB = AB / XA;
      const rBC = BC / AB;
      const rAD = AD / XA;
      const isGartley = inR(rAB, 0.618, 0.618, fibTol) && inR(rBC, 0.382, 0.886, fibTol) && inR(rAD, 0.786, 0.786, fibTol);
      const isBat = inR(rAB, 0.382, 0.50, fibTol) && inR(rBC, 0.382, 0.886, fibTol) && inR(rAD, 0.886, 0.886, fibTol);
      const isFly = inR(rAB, 0.786, 0.786, fibTol) && inR(rBC, 0.382, 0.886, fibTol) && inR(rAD, 1.27, 1.27, fibTol);
      const isCrab = inR(rAB, 0.382, 0.618, fibTol) && inR(rBC, 0.382, 0.886, fibTol) && inR(rAD, 1.618, 1.618, fibTol);
      const isCypher = inR(rAB, 0.382, 0.618, fibTol) && inR(rBC, 1.13, 1.41, fibTol) && inR(rAD, 0.786, 0.786, fibTol);
      const isShark = inR(rAB, 0.382, 0.618, fibTol) && inR(rBC, 1.13, 1.618, fibTol) && inR(rAD, 0.886, 1.13, fibTol);
      let kind = 0;
      if (isBat) kind = 3;
      else if (isFly) kind = 4;
      else if (isGartley) kind = 2;
      else if (isCrab) kind = 5;
      else if (isCypher) kind = 6;
      else if (isShark) kind = 7;
      if (kind > 0) {
        patOn = true; patDone = true; patAge = 0; patN = 5; patKind = kind;
        patBull = D < A;
        a0px = X; a0t = Xt; a0i = Xi;
        a1px = A; a1t = At; a1i = Ai;
        a2px = B; a2t = Bt; a2i = Bi;
        a3px = C; a3t = Ct; a3i = Ci;
        a4px = D; a4t = Dt; a4i = Di;
      }
    }
  }

  if (patOn && (shHarm || shZz)) {
    const bull = patBull;
    if (!isNaN(a0px) && a0i >= 0 && idx - a0i < keepBars) {
      if (patN >= 5) out_g_x(1.0); else out_g_a(1.0);
    }
    if (!isNaN(a1px) && a1i >= 0 && idx - a1i < keepBars) {
      if (patN >= 5) out_g_a(1.0); else out_g_b(1.0);
    }
    if (!isNaN(a2px) && a2i >= 0 && idx - a2i < keepBars) {
      if (patN >= 5) out_g_b(1.0); else out_g_c(1.0);
    }
    if (!isNaN(a3px) && a3i >= 0 && idx - a3i < keepBars) {
      if (patN >= 5) out_g_c(1.0); else out_g_d(1.0);
    }
    if (patN >= 5 && !isNaN(a4px) && a4i >= 0 && idx - a4i < keepBars) out_g_d(1.0);

    if (patDone) out_g_done(1.0); else out_g_near(1.0);

    if (patKind == 3) { if (bull) out_g_bat_bull(1.0); else out_g_bat_bear(1.0); }
    if (patKind == 4) { if (bull) out_g_fly_bull(1.0); else out_g_fly_bear(1.0); }
    if (patKind == 2) { if (bull) out_g_gart_bull(1.0); else out_g_gart_bear(1.0); }
    if (patKind == 5) { if (bull) out_g_crab_bull(1.0); else out_g_crab_bear(1.0); }
    if (patKind == 6) { if (bull) out_g_cyph_bull(1.0); else out_g_cyph_bear(1.0); }
    if (patKind == 7) { if (bull) out_g_shark_bull(1.0); else out_g_shark_bear(1.0); }
    if (patKind == 1) { if (bull) out_g_abcd_bull(1.0); else out_g_abcd_bear(1.0); }
    if (patKind == 8) { if (bull) out_g_wxy_bull(1.0); else out_g_wxy_bear(1.0); }

    let w: i32 = 0;
    if (patKind == 1) w = 0;
    else if (patKind == 2) w = 1;
    else if (patKind == 3) w = 2;
    else if (patKind == 4) w = 3;
    else if (patKind == 5) w = 4;
    else if (patKind == 6) w = 5;
    else if (patKind == 7) w = 6;
    else if (patKind == 8) w = 7;

    if (shZz && patN >= 4) {
      if (!isNaN(a0px) && !isNaN(a1px)) out_zz_ray_at(0, a0px, a1px, a0t, a1t, w, 0, 0);
      if (!isNaN(a1px) && !isNaN(a2px)) out_zz_ray_at(1, a1px, a2px, a1t, a2t, w, 1, 0);
      if (!isNaN(a2px) && !isNaN(a3px)) out_zz_ray_at(2, a2px, a3px, a2t, a3t, w, 2, 0);
      if (patN >= 5 && !isNaN(a3px) && !isNaN(a4px)) out_zz_ray_at(3, a3px, a4px, a3t, a4t, w, 3, 0);
      let dPx = patN >= 5 ? a4px : a3px;
      let dTm = patN >= 5 ? a4t : a3t;
      let aPx = patN >= 5 ? a1px : a0px;
      if (!isNaN(dPx) && !isNaN(aPx)) {
        const ad = Math.abs(aPx - dPx);
        const t2 = bull ? (dPx + ad * 0.618) : (dPx - ad * 0.618);
        const tEnd = dTm + (barDt > 0.0 ? barDt * 24.0 : 3600.0);
        out_zz_ray_at(4, dPx, t2, dTm, tEnd, 8, 4, 0);
      }
    }
  }

  idx += 1;
}
