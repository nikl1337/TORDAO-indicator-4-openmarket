//@lang=wrun-ts
// TORDAO INDICATOR 3: candles, trendline rays, trapped zones (+20% pad),
// confluence circles (red top / green bottom), daily VWAP + EMA 21.
// Swing length default 3. No emoji arrows.

input("buy_vol", trades.volume, { side: "BUY", description: "Taker buy volume per bar, in coins" });
input("sell_vol", trades.volume, { side: "SELL", description: "Taker sell volume per bar, in coins" });

param.bool("show_candles", true, { label: "Highlight hammer, shooting star, doji" });
param.bool("show_stars", true, { label: "Highlight morning star and evening star" });
param.bool("show_trend", true, { label: "Auto trendline rays (never disappear)" });
param.bool("show_traps", true, { label: "Trapped longs / shorts boxes with delta" });
param.bool("show_conf", true, { label: "Confluence circles at swing points" });
param.bool("show_dvwap_dot", true, { label: "Orange dot when daily VWAP is touched or smashed" });
param.bool("show_lines", true, { label: "Show daily VWAP and EMA 21 lines" });
param.bool("en_dvwap_alert", true, { label: "Alert: daily VWAP touched or smashed (once per 15m candle)" });
param.bool("en_ema21_alert", true, { label: "Alert: EMA 21 touched or smashed" });
param.bool("tl_trend_only", true, { label: "Trendlines: only falling resistance and rising support" });
param.int("swing_len", 3, { min: 2, max: 30, label: "Swing length (bars each side)" });
param.int("tl_lookback", 600, { min: 50, max: 900, label: "Trendlines: max bars between the two anchor swings" });
param.number("tl_tol", 0.1, { min: 0, max: 1, step: 0.05, label: "Trendlines: tolerance in ATR when checking the line was not violated" });
param.number("doji_pct", 10, { min: 1, max: 30, step: 1, label: "Doji: body at most this percent of the range" });
param.number("wick_mult", 2, { min: 1, max: 5, step: 0.1, label: "Hammer: long wick at least this many bodies" });
param.number("small_wick", 15, { min: 0, max: 40, step: 1, label: "Hammer: opposite wick at most this percent of the range" });
param.number("cand_min_atr", 0.5, { min: 0, max: 3, step: 0.1, label: "Candles: min range in ATR" });
param.int("trend_n", 5, { min: 2, max: 12, label: "Candles: prior trend lookback in bars" });
param.number("star_small", 30, { min: 5, max: 80, step: 1, label: "Stars: middle body at most this percent of the first body" });
param.number("star_depth", 50, { min: 20, max: 100, step: 1, label: "Stars: third candle closes this percent into the first body" });
param.int("trap_span", 1, { min: 0, max: 2, label: "Traps: bars each side of the swing used for the delta", when: "show_traps" });
param.number("trap_min_pct", 10, { min: 1, max: 80, step: 1, label: "Traps: min |delta| as percent of the volume in that window", when: "show_traps" });
param.number("zone_pad", 20, { min: 0, max: 50, step: 1, label: "Trap zones: extra height percent", when: "show_traps" });
param.number("conf_tol", 0.35, { min: 0.05, max: 3, step: 0.05, label: "Confluence: level within this many ATR of the pivot", when: "show_conf" });
param.number("conf_min", 50, { min: 1, max: 100, step: 1, label: "Confluence: min score for a circle", when: "show_conf" });
param.number("w_vwap", 12, { min: 0, max: 100, step: 1, label: "Weight: each VWAP (daily, weekly, monthly)", when: "show_conf" });
param.number("w_ema", 8, { min: 0, max: 100, step: 1, label: "Weight: each EMA", when: "show_conf" });
param.number("w_open", 8, { min: 0, max: 100, step: 1, label: "Weight: each open (daily, weekly, monthly)", when: "show_conf" });
param.number("w_eq", 6, { min: 0, max: 100, step: 1, label: "Weight: each daily EQ (previous, current)", when: "show_conf" });
param.number("w_tl", 14, { min: 0, max: 100, step: 1, label: "Weight: a trendline ray at the pivot", when: "show_conf" });
param.number("dot_qty", 6, { min: 1, max: 16, step: 1, label: "Orange dot size (1 small, 16 huge)" });
param.int("ema1", 21, { min: 2, max: 2000, label: "EMA 1 length (touch alert uses this one)" });
param.int("ema2", 50, { min: 2, max: 2000, label: "EMA 2 length" });
param.int("ema3", 144, { min: 2, max: 2000, label: "EMA 3 length" });
param.int("ema4", 360, { min: 2, max: 2000, label: "EMA 4 length" });
param.int("ema5", 667, { min: 2, max: 2000, label: "EMA 5 length" });
param.int("ema6", 800, { min: 2, max: 2000, label: "EMA 6 length" });

output("vwap_d", line, overlay, { color: "#ff8c00", width: 1, description: "Daily VWAP (UTC)" });
output("ema_21", line, overlay, { color: "#fde047", width: 1, description: "EMA 1 (21) of the chart timeframe" });
const gDv = output("g_dvwap", none);
const gE21 = output("g_ema21", none);
const gHam = output("g_hammer", none);
const gShoot = output("g_shoot", none);
const gDoji = output("g_doji", none);
const gMs = output("g_mstar", none);
const gEs = output("g_estar", none);
const gTop = output("g_cyc_top", none);
const gBot = output("g_cyc_bot", none);
output("hammer", shape, overlay, { color: "#00ffd5", shape_where: "g_hammer", shape: "triangle_up", location: "below_bar", glow: 8, description: "Hammer (bottom)" });
output("shooting", shape, overlay, { color: "#ff2bd6", shape_where: "g_shoot", shape: "triangle_down", location: "above_bar", glow: 8, description: "Shooting star (top)" });
output("doji", shape, overlay, { color: "#ffffff", shape_where: "g_doji", shape: "diamond", location: "above_bar", glow: 8, description: "Doji" });
output("mstar", shape, overlay, { color: "#39ff14", shape_where: "g_mstar", shape: "diamond", location: "below_bar", glow: 10, description: "Morning star (bottom reversal)" });
output("estar", shape, overlay, { color: "#ff2bd6", shape_where: "g_estar", shape: "diamond", location: "above_bar", glow: 10, description: "Evening star (top reversal)" });
output("cyc_top", shape, overlay, { color: "#ef4444", shape_where: "g_cyc_top", shape: "circle", location: "above_bar", glow: 16, description: "Possible top reversal (red circle)" });
output("cyc_bot", shape, overlay, { color: "#22c55e", shape_where: "g_cyc_bot", shape: "circle", location: "below_bar", glow: 16, description: "Possible bottom reversal (green circle)" });

plot.rays({ name: "tl", slots: 2, colors: ["#ff2bd6", "#00ffd5"], width: 1.5, line_style: "solid", opacity: 0.9, words: ["Resistance ray", "Support ray"], tooltip: "{{word}}", panel: "overlay" });
plot.spans({ name: "trap", slots: 2, colors: ["#ff2bd6", "#00ffd5"], opacity: 0.22, border: { width: 1, opacity: 0.9 }, words: ["Trapped longs", "Trapped shorts"], tooltip: "{{word}} {{bottom}} to {{top}}", panel: "overlay" });
plot.marks({ name: "dvw", slots: 1, size: { law: "sqrt", unit: 1, scale: 10 }, opacity_pct: 80, look: 0, text: { mode: 0 }, colors: ["#ff8c00", "#ff8c00"], tooltip: "Daily VWAP touched at {{price}}", panel: "overlay" });

alert("dvwap_touch", { when: gDv, message: "{{symbol}}: daily VWAP touched or smashed at {{close}}", title: "Daily VWAP", description: "Price touched or crossed the daily VWAP (once per 15m candle)" });
alert("ema21_touch", { when: gE21, message: "{{symbol}}: EMA 21 touched or smashed at {{close}}", title: "EMA 21", description: "Price touched or crossed the EMA 21 of the chart timeframe" });
alert("cyc_top_alert", { when: gTop, message: "{{symbol}}: possible TOP reversal", title: "Top circle", description: "Red circle: confluence swing high" });
alert("cyc_bot_alert", { when: gBot, message: "{{symbol}}: possible BOTTOM reversal", title: "Bottom circle", description: "Green circle: confluence swing low" });

string("tag", { max_bytes: 48 });
handles.label({ size: 12 });
const TEAL: i32 = rgba(0, 255, 213, 255);
const PINK: i32 = rgba(255, 43, 214, 255);
const GREEN: i32 = rgba(34, 197, 94, 255);
const RED: i32 = rgba(239, 68, 68, 255);
const STAR: i32 = rgba(57, 255, 20, 255);

const lab0 = draw.label(0); const lab1 = draw.label(1); const lab2 = draw.label(2); const lab3 = draw.label(3);
const lab4 = draw.label(4); const lab5 = draw.label(5); const lab6 = draw.label(6); const lab7 = draw.label(7);
const lab8 = draw.label(8); const lab9 = draw.label(9); const lab10 = draw.label(10); const lab11 = draw.label(11);
const lab12 = draw.label(12); const lab13 = draw.label(13); const lab14 = draw.label(14); const lab15 = draw.label(15);
const lab20 = draw.label(20); const lab21 = draw.label(21); const lab22 = draw.label(22); const lab23 = draw.label(23);
const lab24 = draw.label(24); const lab25 = draw.label(25); const lab26 = draw.label(26); const lab27 = draw.label(27);
const lab28 = draw.label(28); const lab29 = draw.label(29); const lab30 = draw.label(30); const lab31 = draw.label(31);
const lab32 = draw.label(32); const lab33 = draw.label(33); const lab34 = draw.label(34); const lab35 = draw.label(35);
const lab40 = draw.label(40); const lab41 = draw.label(41); const lab42 = draw.label(42);
const lab43 = draw.label(43); const lab44 = draw.label(44); const lab45 = draw.label(45);

function trapHiLab(i: i32): LabelHandle {
  const k = i % 8;
  if (k == 0) return lab0; if (k == 1) return lab1; if (k == 2) return lab2; if (k == 3) return lab3;
  if (k == 4) return lab4; if (k == 5) return lab5; if (k == 6) return lab6; return lab7;
}
function trapLoLab(i: i32): LabelHandle {
  const k = i % 8;
  if (k == 0) return lab8; if (k == 1) return lab9; if (k == 2) return lab10; if (k == 3) return lab11;
  if (k == 4) return lab12; if (k == 5) return lab13; if (k == 6) return lab14; return lab15;
}
function confUpLab(i: i32): LabelHandle {
  const k = i % 8;
  if (k == 0) return lab20; if (k == 1) return lab21; if (k == 2) return lab22; if (k == 3) return lab23;
  if (k == 4) return lab24; if (k == 5) return lab25; if (k == 6) return lab26; return lab27;
}
function confDnLab(i: i32): LabelHandle {
  const k = i % 8;
  if (k == 0) return lab28; if (k == 1) return lab29; if (k == 2) return lab30; if (k == 3) return lab31;
  if (k == 4) return lab32; if (k == 5) return lab33; if (k == 6) return lab34; return lab35;
}
function starLabAt(i: i32): LabelHandle {
  const k = i % 6;
  if (k == 0) return lab40; if (k == 1) return lab41; if (k == 2) return lab42;
  if (k == 3) return lab43; if (k == 4) return lab44; return lab45;
}

const TR = 1024;
const NL = 14;
const aO = new StaticArray<f64>(TR);
const aH = new StaticArray<f64>(TR);
const aL = new StaticArray<f64>(TR);
const aC = new StaticArray<f64>(TR);
const aT = new StaticArray<f64>(TR);
const aD = new StaticArray<f64>(TR);
const aV = new StaticArray<f64>(TR);
const aLev = new StaticArray<f64>(14336);
const emaV = new StaticArray<f64>(6);
const emaK = new StaticArray<f64>(6);

let sw = new Swings(3, 3);
let right: i32 = 3;
let idx: i32 = 0;
let atr: f64 = NaN;
let pClose: f64 = NaN;
let emaSeeded = false;
let emaWarm: i32 = 21;
let prevETouch = false;
let lastDvBucket: i32 = -1;
let dayKey: i32 = -1; let weekKey: i32 = -1; let monKey: i32 = -1;
let dayOpen: f64 = NaN; let weekOpen: f64 = NaN; let monOpen: f64 = NaN;
let dayHi: f64 = NaN; let dayLo: f64 = NaN; let pdHi: f64 = NaN; let pdLo: f64 = NaN;
let dSumPV: f64 = 0.0; let dSumV: f64 = 0.0; let wSumPV: f64 = 0.0; let wSumV: f64 = 0.0; let mSumPV: f64 = 0.0; let mSumV: f64 = 0.0;
let hiIdx1: i32 = -1; let hiPx1: f64 = NaN; let loIdx1: i32 = -1; let loPx1: f64 = NaN;
let rOn = false; let rI0: i32 = 0; let rP0: f64 = 0.0; let rM: f64 = 0.0;
let sOn = false; let sI0: i32 = 0; let sP0: f64 = 0.0; let sM: f64 = 0.0;
let nTrapHi: i32 = 0; let nTrapLo: i32 = 0; let nConfUp: i32 = 0; let nConfDn: i32 = 0; let nStar: i32 = 0;
let shCandles = true; let shStars = true; let shTrend = true; let shTraps = true; let shConf = true; let shDot = true; let shLines = true;
let enDvAlert = true; let enEmaAlert = true; let tlTrendOnly = true;
let tlLook: i32 = 600; let tlTol: f64 = 0.1;
let dojiPct: f64 = 10.0; let wickMult: f64 = 2.0; let smallWick: f64 = 15.0; let candMinAtr: f64 = 0.5; let trendN: i32 = 5;
let starSmall: f64 = 30.0; let starDepth: f64 = 50.0;
let trapSpan: i32 = 1; let trapMin: f64 = 10.0; let zonePad: f64 = 20.0;
let confTol: f64 = 0.35; let confMin: f64 = 50.0;
let wVwap: f64 = 12.0; let wEma: f64 = 8.0; let wOpen: f64 = 8.0; let wEq: f64 = 6.0; let wTl: f64 = 14.0;
let dotQty: f64 = 6.0;
let cycTop = 0.0;
let cycBot = 0.0;

function monthKeyOf(days: i32): i32 {
  const z: i32 = days + 719468;
  const era: i32 = z / 146097;
  const doe: i32 = z - era * 146097;
  const yoe: i32 = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
  const y: i32 = yoe + era * 400;
  const doy: i32 = doe - (365 * yoe + yoe / 4 - yoe / 100);
  const mp: i32 = (5 * doy + 2) / 153;
  const m: i32 = mp < 10 ? mp + 3 : mp - 9;
  const yy: i32 = m <= 2 ? y + 1 : y;
  return yy * 12 + m;
}

function fmtDelta(v: f64): void {
  const a = Math.abs(v);
  if (v < 0.0) sb_text("-"); else sb_text("+");
  if (a >= 1000000.0) { sb_int(i32(Math.floor(a / 1000000.0 + 0.5))); sb_text("M"); }
  else if (a >= 1000.0) { sb_int(i32(Math.floor(a / 1000.0 + 0.5))); sb_text("K"); }
  else if (a >= 100.0) { sb_int(i32(Math.floor(a + 0.5))); }
  else {
    let ip = i32(Math.floor(a));
    let fp = i32(Math.floor((a - f64(ip)) * 10.0 + 0.5));
    if (fp >= 10) { ip += 1; fp = 0; }
    sb_int(ip); sb_text("."); sb_int(fp);
  }
}

function processPivot(isHigh: bool, px: f64, pIdx: i32, atrNow: f64, tNow: f64): void {
  const ps = pIdx % TR;
  const pt = aT[ps];
  if (shConf) {
    const lb = ps * NL;
    const tol = confTol * atrNow;
    let s = 0.0;
    for (let i = 0; i < NL; i += 1) {
      const v = aLev[lb + i];
      if (!isNaN(v) && Math.abs(v - px) <= tol) {
        if (i < 3) s += wVwap; else if (i < 9) s += wEma; else if (i < 12) s += wOpen; else s += wEq;
      }
    }
    if (rOn && Math.abs(rP0 + rM * f64(pIdx - rI0) - px) <= tol) s += wTl;
    if (sOn && Math.abs(sP0 + sM * f64(pIdx - sI0) - px) <= tol) s += wTl;
    if (s > 100.0) s = 100.0;
    if (s >= confMin) {
      sb_clear();
      sb_int(i32(s));
      if (isHigh) {
        cycTop = 1.0;
        confDnLab(nConfDn).set(pt, px + 0.7 * atrNow).text(str_tag_sb).color(RED);
        nConfDn += 1;
      } else {
        cycBot = 1.0;
        confUpLab(nConfUp).set(pt, px - 0.7 * atrNow).text(str_tag_sb).color(GREEN);
        nConfUp += 1;
      }
    }
  }
  if (isHigh) {
    if (hiIdx1 >= 0 && pIdx > hiIdx1 && pIdx - hiIdx1 <= tlLook && (!tlTrendOnly || px < hiPx1)) {
      const m = (px - hiPx1) / f64(pIdx - hiIdx1);
      let ok = true;
      for (let k = hiIdx1 + 1; k <= idx; k += 1) {
        if (aH[k % TR] > hiPx1 + m * f64(k - hiIdx1) + tlTol * atrNow) { ok = false; break; }
      }
      if (ok) {
        if (shTrend) out_tl_ray_at(0, hiPx1, px, aT[hiIdx1 % TR], pt, 0, 0, 1);
        rOn = true; rI0 = hiIdx1; rP0 = hiPx1; rM = m;
      }
    }
    hiIdx1 = pIdx; hiPx1 = px;
  } else {
    if (loIdx1 >= 0 && pIdx > loIdx1 && pIdx - loIdx1 <= tlLook && (!tlTrendOnly || px > loPx1)) {
      const m = (px - loPx1) / f64(pIdx - loIdx1);
      let ok = true;
      for (let k = loIdx1 + 1; k <= idx; k += 1) {
        if (aL[k % TR] < loPx1 + m * f64(k - loIdx1) - tlTol * atrNow) { ok = false; break; }
      }
      if (ok) {
        if (shTrend) out_tl_ray_at(1, loPx1, px, aT[loIdx1 % TR], pt, 1, 1, 1);
        sOn = true; sI0 = loIdx1; sP0 = loPx1; sM = m;
      }
    }
    loIdx1 = pIdx; loPx1 = px;
  }
  if (shTraps) {
    let dsum = 0.0; let vsum = 0.0;
    const sp = trapSpan < right ? trapSpan : right;
    let k0 = pIdx - sp; if (k0 < 0) k0 = 0;
    let k1 = pIdx + sp; if (k1 > idx) k1 = idx;
    for (let k = k0; k <= k1; k += 1) { dsum += aD[k % TR]; vsum += aV[k % TR]; }
    if (vsum > 0.0 && Math.abs(dsum) / vsum * 100.0 >= trapMin) {
      const mid = (aO[ps] + aC[ps]) * 0.5;
      const frac = zonePad / 100.0;
      if (isHigh && dsum > 0.0) {
        let bot = mid;
        if (px - bot < 0.3 * atrNow) bot = px - 0.3 * atrNow;
        const pad = (px - bot) * frac;
        out_trap_span_at(0, px + pad, bot - pad, pt, tNow, 0, 0, 0);
        sb_clear(); sb_text("Longs trapped, delta "); fmtDelta(dsum);
        trapHiLab(nTrapHi).set(pt, px + pad + 0.3 * atrNow).text(str_tag_sb).color(PINK);
        nTrapHi += 1;
      } else if (!isHigh && dsum < 0.0) {
        let top = mid;
        if (top - px < 0.3 * atrNow) top = px + 0.3 * atrNow;
        const pad = (top - px) * frac;
        out_trap_span_at(1, top + pad, px - pad, pt, tNow, 1, 1, 0);
        sb_clear(); sb_text("Shorts trapped, delta "); fmtDelta(dsum);
        trapLoLab(nTrapLo).set(pt, px - pad - 0.3 * atrNow).text(str_tag_sb).color(TEAL);
        nTrapLo += 1;
      }
    }
  }
}

function onStart(): void {
  right = i32(p_swing_len());
  sw = new Swings(right, right);
  shCandles = pb_show_candles(); shStars = pb_show_stars(); shTrend = pb_show_trend(); shTraps = pb_show_traps();
  shConf = pb_show_conf(); shDot = pb_show_dvwap_dot(); shLines = pb_show_lines();
  enDvAlert = pb_en_dvwap_alert(); enEmaAlert = pb_en_ema21_alert(); tlTrendOnly = pb_tl_trend_only();
  tlLook = i32(p_tl_lookback()); tlTol = p_tl_tol();
  dojiPct = p_doji_pct(); wickMult = p_wick_mult(); smallWick = p_small_wick(); candMinAtr = p_cand_min_atr(); trendN = i32(p_trend_n());
  starSmall = p_star_small(); starDepth = p_star_depth();
  trapSpan = i32(p_trap_span()); trapMin = p_trap_min_pct(); zonePad = p_zone_pad();
  confTol = p_conf_tol(); confMin = p_conf_min();
  wVwap = p_w_vwap(); wEma = p_w_ema(); wOpen = p_w_open(); wEq = p_w_eq(); wTl = p_w_tl();
  dotQty = p_dot_qty();
  emaK[0] = 2.0 / (f64(i32(p_ema1())) + 1.0); emaK[1] = 2.0 / (f64(i32(p_ema2())) + 1.0); emaK[2] = 2.0 / (f64(i32(p_ema3())) + 1.0);
  emaK[3] = 2.0 / (f64(i32(p_ema4())) + 1.0); emaK[4] = 2.0 / (f64(i32(p_ema5())) + 1.0); emaK[5] = 2.0 / (f64(i32(p_ema6())) + 1.0);
  emaWarm = i32(p_ema1());
}

function onBar(): void {
  const o = bar.open();
  const h = bar.high();
  const l = bar.low();
  const c = bar.close();
  const t = bar.time();
  const vol = bar.volume();
  const tr = isNaN(pClose) ? h - l : Math.max(h - l, Math.max(Math.abs(h - pClose), Math.abs(l - pClose)));
  atr = isNaN(atr) ? tr : (atr * 13.0 + tr) / 14.0;
  cycTop = 0.0;
  cycBot = 0.0;

  const slot = idx % TR;
  aO[slot] = o; aH[slot] = h; aL[slot] = l; aC[slot] = c; aT[slot] = t;
  let bv = in_buy_vol(); let sv = in_sell_vol();
  if (isNaN(bv)) bv = 0.0;
  if (isNaN(sv)) sv = 0.0;
  aD[slot] = bv - sv; aV[slot] = bv + sv;

  const dKey = i32(Math.floor(t / 86400.0));
  const wKey = i32(Math.floor((t - 345600.0) / 604800.0));
  const mKey = monthKeyOf(dKey);
  if (dKey != dayKey) { pdHi = dayHi; pdLo = dayLo; dayHi = h; dayLo = l; dayOpen = o; dSumPV = 0.0; dSumV = 0.0; dayKey = dKey; }
  else { if (h > dayHi) dayHi = h; if (l < dayLo) dayLo = l; }
  if (wKey != weekKey) { weekOpen = o; wSumPV = 0.0; wSumV = 0.0; weekKey = wKey; }
  if (mKey != monKey) { monOpen = o; mSumPV = 0.0; mSumV = 0.0; monKey = mKey; }
  const hlc = (h + l + c) / 3.0;
  if (!isNaN(vol) && vol > 0.0) {
    dSumPV += hlc * vol; dSumV += vol; wSumPV += hlc * vol; wSumV += vol; mSumPV += hlc * vol; mSumV += vol;
  }
  const vD = dSumV > 0.0 ? dSumPV / dSumV : NaN;
  const vW = wSumV > 0.0 ? wSumPV / wSumV : NaN;
  const vM = mSumV > 0.0 ? mSumPV / mSumV : NaN;
  if (!emaSeeded) { for (let i = 0; i < 6; i += 1) emaV[i] = c; emaSeeded = true; }
  else { for (let i = 0; i < 6; i += 1) emaV[i] += emaK[i] * (c - emaV[i]); }

  const lb = slot * NL;
  aLev[lb] = vD; aLev[lb + 1] = vW; aLev[lb + 2] = vM;
  for (let i = 0; i < 6; i += 1) aLev[lb + 3 + i] = emaV[i];
  aLev[lb + 9] = dayOpen; aLev[lb + 10] = weekOpen; aLev[lb + 11] = monOpen;
  aLev[lb + 12] = (isNaN(pdHi) || isNaN(pdLo)) ? NaN : (pdHi + pdLo) * 0.5;
  aLev[lb + 13] = (dayHi + dayLo) * 0.5;

  sw.update(h, l);
  if (sw.newHigh()) processPivot(true, sw.lastHigh(), idx - right, atr, t);
  if (sw.newLow()) processPivot(false, sw.lastLow(), idx - right, atr, t);

  let fHam = 0.0; let fShoot = 0.0; let fDoji = 0.0; let fMs = 0.0; let fEs = 0.0;
  const range = h - l;
  if (range > 0.0 && range >= candMinAtr * atr && idx > trendN + 2) {
    const body = Math.abs(c - o);
    const upW = h - Math.max(o, c);
    const loW = Math.min(o, c) - l;
    const cPrev = aC[(idx - 1) % TR];
    const cBack = aC[(idx - 1 - trendN) % TR];
    const down = cPrev < cBack;
    const up = cPrev > cBack;
    if (body <= dojiPct / 100.0 * range) fDoji = 1.0;
    else if (body > 0.0) {
      if (loW >= wickMult * body && upW <= smallWick / 100.0 * range && down) fHam = 1.0;
      else if (upW >= wickMult * body && loW <= smallWick / 100.0 * range && up) fShoot = 1.0;
    }
    const o1 = aO[(idx - 1) % TR]; const c1 = aC[(idx - 1) % TR];
    const o2 = aO[(idx - 2) % TR]; const c2 = aC[(idx - 2) % TR];
    const b2 = Math.abs(o2 - c2); const b1 = Math.abs(o1 - c1);
    const cBack2 = aC[(idx - 2 - trendN) % TR];
    if (b2 >= candMinAtr * atr && b1 <= starSmall / 100.0 * b2) {
      const mid2 = (o2 + c2) * 0.5;
      if (c2 < o2 && c2 < cBack2 && Math.max(o1, c1) <= mid2 && c > o && c >= c2 + starDepth / 100.0 * (o2 - c2)) fMs = 1.0;
      if (c2 > o2 && c2 > cBack2 && Math.min(o1, c1) >= mid2 && c < o && c <= c2 - starDepth / 100.0 * (c2 - o2)) fEs = 1.0;
    }
  }
  if (shStars && fMs == 1.0) {
    sb_clear(); sb_text("MORNING STAR");
    starLabAt(nStar).set(t, l - 0.5 * atr).text(str_tag_sb).color(STAR); nStar += 1;
  }
  if (shStars && fEs == 1.0) {
    sb_clear(); sb_text("EVENING STAR");
    starLabAt(nStar).set(t, h + 0.5 * atr).text(str_tag_sb).color(PINK); nStar += 1;
  }

  let fDv = 0.0;
  if (!isNaN(vD) && l <= vD && h >= vD) {
    const b15 = i32(Math.floor(t / 900.0));
    if (b15 != lastDvBucket) {
      lastDvBucket = b15;
      if (enDvAlert) fDv = 1.0;
      if (shDot) out_dvw_mark(0, vD, dotQty, 0, 1, 0);
    }
  }

  const e21 = emaV[0];
  const eTouch = l <= e21 && h >= e21;
  const fE = (eTouch && !prevETouch && enEmaAlert && idx >= emaWarm) ? 1.0 : 0.0;
  prevETouch = eTouch;

  out_vwap_d(shLines ? vD : NaN);
  out_ema_21(shLines ? e21 : NaN);
  out_g_dvwap(fDv);
  out_g_ema21(fE);
  out_g_hammer(shCandles ? fHam : 0.0);
  out_g_shoot(shCandles ? fShoot : 0.0);
  out_g_doji(shCandles ? fDoji : 0.0);
  out_g_mstar(shStars ? fMs : 0.0);
  out_g_estar(shStars ? fEs : 0.0);
  out_hammer(l); out_shooting(h); out_doji(h); out_mstar(l); out_estar(h);
  out_g_cyc_top(shConf ? cycTop : 0.0);
  out_g_cyc_bot(shConf ? cycBot : 0.0);
  out_cyc_top(h);
  out_cyc_bot(l);
  pClose = c;
  idx += 1;
}
