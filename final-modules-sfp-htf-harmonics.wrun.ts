//@lang=wrun-ts
// TORDAO companion (novaadd): SFP, HTF double, ABCD, bat/fly, opens/EQ,
// 2+2 auto trendlines, 1h+4h order blocks, reverse squares + breakout circles.
// Second indicator beside final-approved-by-openmarket.wrun.ts
// Handles: 4 polylines. Polyline API: setPoints(buffer, pointCount).

input("close", ohlcv.close);

page("Modules");
param.bool("en_sfp", true, { label: "SFP signals" });
param.bool("en_dbl", true, { label: "HTF double top / bottom" });
param.bool("en_abcd", true, { label: "ABCD pattern" });
param.bool("en_harm", true, { label: "Bat / butterfly" });
param.bool("en_opens", true, { label: "Day / week / month open + EQ" });
param.bool("en_tl2", true, { label: "2 up + 2 down auto trendlines" });
param.bool("en_ob", true, { label: "1h + 4h order blocks" });
param.bool("en_marks", true, { label: "Reverse squares + breakout circles" });

page("Logic");
param("swing_len", 5, { min: 2, max: 30, description: "Swing length" });
param("sfp_bars", 1, { min: 1, max: 5, description: "SFP bars to reclaim" });
param("sfp_min_atr", 0.05, { min: 0, max: 2, description: "SFP min sweep ATR" });
param("htf_min", 240, { min: 5, max: 10080, description: "Double top/bottom TF minutes" });
param("htf_len", 3, { min: 2, max: 10, description: "HTF swing length" });
param("dbl_tol", 0.3, { min: 0.05, max: 3, description: "Peak match tolerance %" });
param("dbl_depth", 0.8, { min: 0.1, max: 20, description: "Min depth between peaks %" });
param("dbl_gap_min", 4, { min: 2, max: 100, description: "Min HTF bars between peaks" });
param("dbl_gap_max", 60, { min: 5, max: 400, description: "Max HTF bars between peaks" });
param("abcd_ret_lo", 38.2, { min: 10, max: 100, description: "ABCD BC retrace min % of AB" });
param("abcd_ret_hi", 88.6, { min: 10, max: 100, description: "ABCD BC retrace max % of AB" });
param("abcd_cd_lo", 90, { min: 50, max: 200, description: "ABCD CD min % of AB" });
param("abcd_cd_hi", 110, { min: 50, max: 300, description: "ABCD CD max % of AB" });
param("abcd_min_atr", 1.5, { min: 0, max: 20, description: "ABCD min AB in ATR" });
param("harm_tol", 8, { min: 1, max: 25, description: "Harmonic ratio tolerance %" });
param("tl2_tol", 0.35, { min: 0.05, max: 2, description: "Trendline 3rd-touch tol ATR" });
param("ob_body", 0.55, { min: 0.2, max: 0.95, description: "OB impulse min body/range" });

const gSfpBear = output("g_sfp_bear", none);
const gSfpBull = output("g_sfp_bull", none);
const gDt = output("g_dt", none);
const gDb = output("g_db", none);
const gAbcdBull = output("g_abcd_bull", none);
const gAbcdBear = output("g_abcd_bear", none);
const gBat = output("g_bat", none);
const gFly = output("g_fly", none);
const gRevUp = output("g_rev_up", none);
const gRevDn = output("g_rev_dn", none);
const gBrkUp = output("g_brk_up", none);
const gBrkDn = output("g_brk_dn", none);

output("sfp_bear", shape, overlay, { color: "#f43f5e", shape_where: "g_sfp_bear", shape: "triangle_down", location: "above_bar", glow: 8, description: "Bearish SFP" });
output("sfp_bull", shape, overlay, { color: "#22d3ee", shape_where: "g_sfp_bull", shape: "triangle_up", location: "below_bar", glow: 8, description: "Bullish SFP" });
output("dbl_top", shape, overlay, { color: "#fb7185", shape_where: "g_dt", shape: "diamond", location: "above_bar", glow: 8, description: "HTF double top" });
output("dbl_bot", shape, overlay, { color: "#4ade80", shape_where: "g_db", shape: "diamond", location: "below_bar", glow: 8, description: "HTF double bottom" });
output("abcd_bull", shape, overlay, { color: "#00ffd5", shape_where: "g_abcd_bull", shape: "triangle_up", location: "below_bar", description: "Bullish ABCD D" });
output("abcd_bear", shape, overlay, { color: "#ff2bd6", shape_where: "g_abcd_bear", shape: "triangle_down", location: "above_bar", description: "Bearish ABCD D" });
output("bat_mark", shape, overlay, { color: "#a78bfa", shape_where: "g_bat", shape: "circle", location: "below_bar", description: "Bat at D" });
output("fly_mark", shape, overlay, { color: "#f472b6", shape_where: "g_fly", shape: "circle", location: "above_bar", description: "Butterfly at D" });
output("rev_up", shape, overlay, { color: "#fbbf24", shape_where: "g_rev_up", shape: "square", location: "below_bar", glow: 6, description: "Probable reverse up" });
output("rev_dn", shape, overlay, { color: "#f97316", shape_where: "g_rev_dn", shape: "square", location: "above_bar", glow: 6, description: "Probable reverse down" });
output("brk_up", shape, overlay, { color: "#38bdf8", shape_where: "g_brk_up", shape: "circle", location: "below_bar", glow: 6, description: "Probable breakout / continuation up" });
output("brk_dn", shape, overlay, { color: "#c084fc", shape_where: "g_brk_dn", shape: "circle", location: "above_bar", glow: 6, description: "Probable breakout / continuation down" });
output("dbl_neck", none, overlay, { description: "Neckline", format: "price" });
output("abcd_cd", none, lower, { description: "CD % of AB", format: "0" });
output("pat_dir", none, overlay, { description: "+1 bull / -1 bear pattern" });

output("open_d", line, overlay, { color: "#94a3b8", width: 1, step: true, line_style: "dotted", description: "Daily open UTC" });
output("open_w", line, overlay, { color: "#64748b", width: 1, step: true, line_style: "dotted", description: "Weekly open UTC" });
output("open_m", line, overlay, { color: "#475569", width: 1, step: true, line_style: "dotted", description: "Monthly open UTC" });
output("eq_prev", line, overlay, { color: "#39ff14", width: 1, step: true, line_style: "dotted", description: "Previous day EQ" });
output("eq_cur", line, overlay, { color: "#ff2bd6", width: 1, step: true, line_style: "dotted", description: "Current day EQ so far" });

output("tl_res_1", line, overlay, { color: "#ef4444", width: 2, line_style: "dashed", description: "Resistance TL 1" });
output("tl_res_2", line, overlay, { color: "#f87171", width: 1, line_style: "dotted", description: "Resistance TL 2" });
output("tl_sup_1", line, overlay, { color: "#22c55e", width: 2, line_style: "dashed", description: "Support TL 1" });
output("tl_sup_2", line, overlay, { color: "#4ade80", width: 1, line_style: "dotted", description: "Support TL 2" });

const ob1hBullTop = output("ob1h_bull_top", none);
const ob1hBullBot = output("ob1h_bull_bot", none);
const ob1hBullLive = output("ob1h_bull_live", none);
const ob1hBearTop = output("ob1h_bear_top", none);
const ob1hBearBot = output("ob1h_bear_bot", none);
const ob1hBearLive = output("ob1h_bear_live", none);
const ob4hBullTop = output("ob4h_bull_top", none);
const ob4hBullBot = output("ob4h_bull_bot", none);
const ob4hBullLive = output("ob4h_bull_live", none);
const ob4hBearTop = output("ob4h_bear_top", none);
const ob4hBearBot = output("ob4h_bear_bot", none);
const ob4hBearLive = output("ob4h_bear_live", none);
box("ob_1h_bull", { top: ob1hBullTop, bottom: ob1hBullBot, when: ob1hBullLive, color: "#22c55e", opacity: 0.18, borderColor: "#16a34a", borderWidth: 1, borderStyle: "solid" });
box("ob_1h_bear", { top: ob1hBearTop, bottom: ob1hBearBot, when: ob1hBearLive, color: "#ef4444", opacity: 0.18, borderColor: "#dc2626", borderWidth: 1, borderStyle: "solid" });
box("ob_4h_bull", { top: ob4hBullTop, bottom: ob4hBullBot, when: ob4hBullLive, color: "#4ade80", opacity: 0.22, borderColor: "#22c55e", borderWidth: 1, borderStyle: "dashed" });
box("ob_4h_bear", { top: ob4hBearTop, bottom: ob4hBearBot, when: ob4hBearLive, color: "#f87171", opacity: 0.22, borderColor: "#ef4444", borderWidth: 1, borderStyle: "dashed" });

alert("sfp_bear_alert", { when: gSfpBear, message: "{{symbol}}: BEARISH SFP at {{close}}", description: "Bearish SFP" });
alert("sfp_bull_alert", { when: gSfpBull, message: "{{symbol}}: BULLISH SFP at {{close}}", description: "Bullish SFP" });
alert("double_top", { when: gDt, message: "{{symbol}}: HTF DOUBLE TOP", description: "Double top" });
alert("double_bottom", { when: gDb, message: "{{symbol}}: HTF DOUBLE BOTTOM", description: "Double bottom" });
alert("abcd_bull_alert", { when: gAbcdBull, message: "{{symbol}}: bullish ABCD at D", description: "ABCD bull" });
alert("abcd_bear_alert", { when: gAbcdBear, message: "{{symbol}}: bearish ABCD at D", description: "ABCD bear" });
alert("bat", { when: gBat, message: "{{symbol}}: BAT completed", description: "Bat" });
alert("butterfly", { when: gFly, message: "{{symbol}}: BUTTERFLY completed", description: "Butterfly" });
alert("rev_up_alert", { when: gRevUp, message: "{{symbol}}: probable REVERSE UP", description: "Reverse up square" });
alert("rev_dn_alert", { when: gRevDn, message: "{{symbol}}: probable REVERSE DOWN", description: "Reverse down square" });
alert("brk_up_alert", { when: gBrkUp, message: "{{symbol}}: probable BREAKOUT UP", description: "Breakout up circle" });
alert("brk_dn_alert", { when: gBrkDn, message: "{{symbol}}: probable BREAKOUT DOWN", description: "Breakout down circle" });

handles.polyline({ width: 2 });
const polyAbcdB = draw.polyline(0);
const polyAbcdS = draw.polyline(1);
const polyBat = draw.polyline(2);
const polyFly = draw.polyline(3);
const pbuf = new StaticArray<f64>(10);

const HR = 512;
const hiRing = new StaticArray<f64>(HR);
const loRing = new StaticArray<f64>(HR);

let sw = new Swings(5, 5);
let hs = new Swings(3, 3);
let right: i32 = 5;
let htfLen: i32 = 3;
let htfSec: f64 = 14400.0;
let idx: i32 = 0;
let atr: f64 = NaN;
let pClose: f64 = NaN;
let t: f64 = NaN;
let prevT: f64 = NaN;
let width: f64 = NaN;
let enSfp = true; let enDbl = true; let enAbcd = true; let enHarm = true;
let enOpens = true; let enTl2 = true; let enOb = true; let enMarks = true;
let sfpBars: i32 = 1; let sfpMin: f64 = 0.05;
let dblTol: f64 = 0.3; let dblDepth: f64 = 0.8; let gapMin: i32 = 4; let gapMax: i32 = 60;
let rLo: f64 = 38.2; let rHi: f64 = 88.6; let cLo: f64 = 90.0; let cHi: f64 = 110.0; let cdMin: f64 = 1.5;
let harmTol: f64 = 8.0; let tlTol: f64 = 0.35; let obBody: f64 = 0.55;

let lvlH: f64 = NaN; let hActive = false; let hDone = false; let hStart: i32 = 0; let hExt: f64 = NaN;
let lvlL: f64 = NaN; let lActive = false; let lDone = false; let lStart: i32 = 0; let lExt: f64 = NaN;
let bucket: f64 = NaN; let curH: f64 = NaN; let curL: f64 = NaN; let htfCount: i32 = 0;
let pH: f64 = NaN; let pHi: i32 = 0; let pL: f64 = NaN; let pLi: i32 = 0;
let pa: f64 = NaN; let pb: f64 = NaN; let pc: f64 = NaN; let pd: f64 = NaN;
let ta: f64 = NaN; let tb: f64 = NaN; let tc: f64 = NaN; let td: f64 = NaN;
let cHigh = false; let nPiv: i32 = 0;
const hx = new StaticArray<f64>(5); const ht = new StaticArray<f64>(5); const hk = new StaticArray<i32>(5);
let nH: i32 = 0;
let dayKey: i32 = -1; let weekKey: i32 = -1; let monthKey: i32 = -1;
let openD: f64 = NaN; let openW: f64 = NaN; let openM: f64 = NaN;
let dayHi: f64 = NaN; let dayLo: f64 = NaN; let prevEq: f64 = NaN; let curEq: f64 = NaN;
let hPx0: f64 = NaN; let hPx1: f64 = NaN; let hPx2: f64 = NaN; let hPx3: f64 = NaN;
let hIx0: i32 = 0; let hIx1: i32 = 0; let hIx2: i32 = 0; let hIx3: i32 = 0;
let lPx0: f64 = NaN; let lPx1: f64 = NaN; let lPx2: f64 = NaN; let lPx3: f64 = NaN;
let lIx0: i32 = 0; let lIx1: i32 = 0; let lIx2: i32 = 0; let lIx3: i32 = 0;
let r1b: f64 = 0; let r1s: f64 = 0; let r1x: i32 = 0; let r1on = false;
let r2b: f64 = 0; let r2s: f64 = 0; let r2x: i32 = 0; let r2on = false;
let u1b: f64 = 0; let u1s: f64 = 0; let u1x: i32 = 0; let u1on = false;
let u2b: f64 = 0; let u2s: f64 = 0; let u2x: i32 = 0; let u2on = false;
let b1h: f64 = NaN; let o1h: f64 = NaN; let h1h: f64 = NaN; let l1h: f64 = NaN; let c1h: f64 = NaN;
let pO1h: f64 = NaN; let pH1h: f64 = NaN; let pL1h: f64 = NaN; let pC1h: f64 = NaN;
let b4h: f64 = NaN; let o4h: f64 = NaN; let h4h: f64 = NaN; let l4h: f64 = NaN; let c4h: f64 = NaN;
let pO4h: f64 = NaN; let pH4h: f64 = NaN; let pL4h: f64 = NaN; let pC4h: f64 = NaN;
let ob1hBuT: f64 = NaN; let ob1hBuB: f64 = NaN; let ob1hBuL: f64 = 0.0;
let ob1hBeT: f64 = NaN; let ob1hBeB: f64 = NaN; let ob1hBeL: f64 = 0.0;
let ob4hBuT: f64 = NaN; let ob4hBuB: f64 = NaN; let ob4hBuL: f64 = 0.0;
let ob4hBeT: f64 = NaN; let ob4hBeB: f64 = NaN; let ob4hBeL: f64 = 0.0;

function inR(v: f64, lo: f64, hi: f64, tol: f64): bool { return v >= lo - tol && v <= hi + tol; }
function nearLine(y1: f64, x1: i32, y2: f64, x2: i32, y3: f64, x3: i32, tol: f64): bool {
  if (x2 == x1) return false;
  const slope = (y2 - y1) / f64(x2 - x1);
  return Math.abs(y1 + slope * f64(x3 - x1) - y3) <= tol;
}
function drawPoly(poly: PolylineHandle, n: i32): void { poly.setPoints(pbuf, n); }
function pushPivot(px: f64, ts: f64, isHigh: bool): void {
  if (nPiv == 0) { pa = px; ta = ts; cHigh = isHigh; nPiv = 1; return; }
  if (isHigh == cHigh) {
    if (isHigh) { if (px > pd) { pd = px; td = ts; } }
    else { if (px < pd) { pd = px; td = ts; } }
    return;
  }
  if (nPiv == 1) { pb = px; tb = ts; cHigh = isHigh; nPiv = 2; }
  else if (nPiv == 2) { pc = px; tc = ts; cHigh = isHigh; nPiv = 3; }
  else if (nPiv == 3) { pd = px; td = ts; cHigh = isHigh; nPiv = 4; }
  else { pa = pb; ta = tb; pb = pc; tb = tc; pc = pd; tc = td; pd = px; td = ts; cHigh = isHigh; }
}
function pushHarm(px: f64, ts: f64, isHigh: bool): void {
  const k: i32 = isHigh ? 1 : -1;
  if (nH > 0 && hk[nH - 1] == k) {
    if (isHigh && px > hx[nH - 1]) { hx[nH - 1] = px; ht[nH - 1] = ts; }
    if (!isHigh && px < hx[nH - 1]) { hx[nH - 1] = px; ht[nH - 1] = ts; }
    return;
  }
  if (nH < 5) { hx[nH] = px; ht[nH] = ts; hk[nH] = k; nH += 1; }
  else {
    for (let i = 0; i < 4; i += 1) { hx[i] = hx[i + 1]; ht[i] = ht[i + 1]; hk[i] = hk[i + 1]; }
    hx[4] = px; ht[4] = ts; hk[4] = k;
  }
}
function tryOb(pO: f64, pH: f64, pL: f64, pC: f64, cO: f64, cH: f64, cL: f64, cC: f64, bodyMin: f64): i32 {
  if (isNaN(pO) || isNaN(cO)) return 0;
  const cRange = cH - cL;
  if (cRange <= 0.0) return 0;
  if (Math.abs(cC - cO) / cRange < bodyMin) return 0;
  if (cC > cO && pC < pO) return 1;
  if (cC < cO && pC > pO) return -1;
  return 0;
}

function onStart(): void {
  right = i32(p_swing_len()); sw = new Swings(right, right);
  htfLen = i32(p_htf_len()); hs = new Swings(htfLen, htfLen); htfSec = p_htf_min() * 60.0;
  sfpBars = i32(p_sfp_bars()); sfpMin = p_sfp_min_atr();
  dblTol = p_dbl_tol(); dblDepth = p_dbl_depth();
  gapMin = i32(p_dbl_gap_min()); gapMax = i32(p_dbl_gap_max());
  rLo = p_abcd_ret_lo(); rHi = p_abcd_ret_hi(); cLo = p_abcd_cd_lo(); cHi = p_abcd_cd_hi(); cdMin = p_abcd_min_atr();
  harmTol = p_harm_tol(); tlTol = p_tl2_tol(); obBody = p_ob_body();
  enSfp = pb_en_sfp(); enDbl = pb_en_dbl(); enAbcd = pb_en_abcd(); enHarm = pb_en_harm();
  enOpens = pb_en_opens(); enTl2 = pb_en_tl2(); enOb = pb_en_ob(); enMarks = pb_en_marks();
}

function onBar(): void {
  const o = bar.open(); const h = bar.high(); const l = bar.low(); const c = bar.close();
  t = bar.time(); if (!isNaN(prevT)) width = t - prevT; prevT = t;
  const tr = isNaN(pClose) ? h - l : Math.max(h - l, Math.max(Math.abs(h - pClose), Math.abs(l - pClose)));
  atr = isNaN(atr) ? tr : (atr * 13.0 + tr) / 14.0; sw.update(h, l);

  let sb = 0.0; let su = 0.0; let dt = 0.0; let db = 0.0; let neck = NaN;
  let abcdBull = false; let abcdBear = false; let cdRatio = NaN;
  let batFire = false; let flyFire = false; let patDir = 0.0;
  let revUp = 0.0; let revDn = 0.0; let brkUp = 0.0; let brkDn = 0.0;

  if (sw.newHigh()) { lvlH = sw.lastHigh(); hActive = false; hDone = false; hExt = NaN; }
  if (sw.newLow()) { lvlL = sw.lastLow(); lActive = false; lDone = false; lExt = NaN; }
  if (!isNaN(lvlH) && !hDone) {
    if (h > lvlH) { if (!hActive) { hActive = true; hStart = idx; hExt = h; } else if (h > hExt) hExt = h; }
    if (hActive) {
      if (c < lvlH) { if (hExt - lvlH >= sfpMin * atr) sb = 1.0; hActive = false; hDone = true; }
      else if (idx - hStart + 1 >= sfpBars) { hActive = false; hDone = true; }
    }
  }
  if (!isNaN(lvlL) && !lDone) {
    if (l < lvlL) { if (!lActive) { lActive = true; lStart = idx; lExt = l; } else if (l < lExt) lExt = l; }
    if (lActive) {
      if (c > lvlL) { if (lvlL - lExt >= sfpMin * atr) su = 1.0; lActive = false; lDone = true; }
      else if (idx - lStart + 1 >= sfpBars) { lActive = false; lDone = true; }
    }
  }

  const b = Math.floor(t / htfSec);
  if (isNaN(bucket)) { bucket = b; curH = h; curL = l; }
  else if (b != bucket) {
    const slot = htfCount % HR; hiRing[slot] = curH; loRing[slot] = curL;
    htfCount += 1; hs.update(curH, curL); const sIdx = htfCount - 1 - htfLen;
    if (hs.newHigh()) {
      const px = hs.lastHigh();
      if (!isNaN(pH) && sIdx - pHi >= gapMin && sIdx - pHi <= gapMax && Math.abs(px - pH) / pH * 100.0 <= dblTol) {
        let mn = 1e100; for (let k = pHi; k <= sIdx; k += 1) { const v = loRing[k % HR]; if (v < mn) mn = v; }
        const top = Math.min(px, pH); if ((top - mn) / top * 100.0 >= dblDepth) { dt = 1.0; neck = mn; }
      }
      pH = px; pHi = sIdx;
    }
    if (hs.newLow()) {
      const px = hs.lastLow();
      if (!isNaN(pL) && sIdx - pLi >= gapMin && sIdx - pLi <= gapMax && Math.abs(px - pL) / pL * 100.0 <= dblTol) {
        let mx = -1e100; for (let k = pLi; k <= sIdx; k += 1) { const v = hiRing[k % HR]; if (v > mx) mx = v; }
        const bot = Math.max(px, pL); if ((mx - bot) / bot * 100.0 >= dblDepth) { db = 1.0; neck = mx; }
      }
      pL = px; pLi = sIdx;
    }
    bucket = b; curH = h; curL = l;
  } else { if (h > curH) curH = h; if (l < curL) curL = l; }

  const tp = isNaN(width) ? t : t - width * f64(right);
  if (sw.newHigh()) { pushPivot(sw.lastHigh(), tp, true); pushHarm(sw.lastHigh(), tp, true); }
  if (sw.newLow()) { pushPivot(sw.lastLow(), tp, false); pushHarm(sw.lastLow(), tp, false); }

  if (nPiv >= 4 && !isNaN(pa) && !isNaN(pb) && !isNaN(pc) && !isNaN(pd)) {
    const ab = Math.abs(pb - pa); const bc = Math.abs(pc - pb); const cd = Math.abs(pd - pc);
    if (ab > 0.0 && ab >= cdMin * atr) {
      const ret = bc / ab * 100.0; const ext = cd / ab * 100.0;
      if (ret >= rLo && ret <= rHi && ext >= cLo && ext <= cHi) {
        const bull = !cHigh && pd < pb && pc < pa; const bear = cHigh && pd > pb && pc > pa;
        if (bull || bear) {
          cdRatio = ext; if (bull) abcdBull = true; else abcdBear = true;
          pbuf[0] = ta; pbuf[1] = pa; pbuf[2] = tb; pbuf[3] = pb; pbuf[4] = tc; pbuf[5] = pc; pbuf[6] = td; pbuf[7] = pd;
          if (enAbcd) { if (bull) drawPoly(polyAbcdB, 4); else drawPoly(polyAbcdS, 4); }
        }
      }
    }
  }

  if (nH >= 5) {
    const X = hx[0]; const A = hx[1]; const B = hx[2]; const C = hx[3]; const D = hx[4];
    const XA = Math.abs(A - X);
    if (XA > 0.0) {
      const AB = Math.abs(B - A) / XA * 100.0; const AD = Math.abs(D - A) / XA * 100.0;
      const bat = inR(AB, 38.0, 50.0, harmTol) && inR(AD, 85.0, 92.0, harmTol);
      const fly = inR(AB, 70.0, 88.0, harmTol) && inR(AD, 120.0, 141.0, harmTol);
      if (bat || fly) {
        patDir = hk[4] == -1 ? 1.0 : -1.0;
        pbuf[0] = ht[0]; pbuf[1] = X; pbuf[2] = ht[1]; pbuf[3] = A; pbuf[4] = ht[2]; pbuf[5] = B; pbuf[6] = ht[3]; pbuf[7] = C; pbuf[8] = ht[4]; pbuf[9] = D;
        if (bat) { batFire = true; if (enHarm) drawPoly(polyBat, 5); }
        if (fly) { flyFire = true; if (enHarm) drawPoly(polyFly, 5); }
      }
    }
  }

  const sec = i32(t);
  const dKey = sec / 86400; const wKey = (sec - 345600) / 604800; const mKey = (sec / 86400) / 30;
  if (dKey != dayKey) {
    if (!isNaN(dayHi) && !isNaN(dayLo)) prevEq = (dayHi + dayLo) / 2.0;
    dayKey = dKey; openD = o; dayHi = h; dayLo = l;
  } else { if (h > dayHi) dayHi = h; if (l < dayLo) dayLo = l; }
  curEq = (dayHi + dayLo) / 2.0;
  if (wKey != weekKey) { weekKey = wKey; openW = o; }
  if (mKey != monthKey) { monthKey = mKey; openM = o; }

  const tolPx = tlTol * atr;
  if (sw.newHigh()) {
    hPx3 = hPx2; hIx3 = hIx2; hPx2 = hPx1; hIx2 = hIx1; hPx1 = hPx0; hIx1 = hIx0;
    hPx0 = sw.lastHigh(); hIx0 = idx - right;
    if (!isNaN(hPx2) && hPx2 > hPx1 && hPx1 > hPx0 && hIx0 > hIx2) {
      if (nearLine(hPx2, hIx2, hPx0, hIx0, hPx1, hIx1, tolPx)) { r1on = true; r1b = hPx0; r1s = (hPx0 - hPx2) / f64(hIx0 - hIx2); r1x = hIx0; }
    }
    if (!isNaN(hPx3) && hPx3 > hPx0 && hIx0 > hIx3) {
      const midOk = !isNaN(hPx1) && nearLine(hPx3, hIx3, hPx0, hIx0, hPx1, hIx1, tolPx * 1.5);
      if (midOk || hPx3 > hPx1) { r2on = true; r2b = hPx0; r2s = (hPx0 - hPx3) / f64(hIx0 - hIx3); r2x = hIx0; }
    }
  }
  if (sw.newLow()) {
    lPx3 = lPx2; lIx3 = lIx2; lPx2 = lPx1; lIx2 = lIx1; lPx1 = lPx0; lIx1 = lIx0;
    lPx0 = sw.lastLow(); lIx0 = idx - right;
    if (!isNaN(lPx2) && lPx2 < lPx1 && lPx1 < lPx0 && lIx0 > lIx2) {
      if (nearLine(lPx2, lIx2, lPx0, lIx0, lPx1, lIx1, tolPx)) { u1on = true; u1b = lPx0; u1s = (lPx0 - lPx2) / f64(lIx0 - lIx2); u1x = lIx0; }
    }
    if (!isNaN(lPx3) && lPx3 < lPx0 && lIx0 > lIx3) {
      const midOk = !isNaN(lPx1) && nearLine(lPx3, lIx3, lPx0, lIx0, lPx1, lIx1, tolPx * 1.5);
      if (midOk || lPx3 < lPx1) { u2on = true; u2b = lPx0; u2s = (lPx0 - lPx3) / f64(lIx0 - lIx3); u2x = lIx0; }
    }
  }
  let res1 = r1on ? r1b + r1s * f64(idx - r1x) : NaN;
  let res2 = r2on ? r2b + r2s * f64(idx - r2x) : NaN;
  let sup1 = u1on ? u1b + u1s * f64(idx - u1x) : NaN;
  let sup2 = u2on ? u2b + u2s * f64(idx - u2x) : NaN;
  if (r1on && c > res1 + 0.15 * atr) { brkUp = 1.0; r1on = false; }
  if (r2on && c > res2 + 0.15 * atr) { brkUp = 1.0; r2on = false; }
  if (u1on && c < sup1 - 0.15 * atr) { brkDn = 1.0; u1on = false; }
  if (u2on && c < sup2 - 0.15 * atr) { brkDn = 1.0; u2on = false; }
  res1 = r1on ? r1b + r1s * f64(idx - r1x) : NaN; res2 = r2on ? r2b + r2s * f64(idx - r2x) : NaN;
  sup1 = u1on ? u1b + u1s * f64(idx - u1x) : NaN; sup2 = u2on ? u2b + u2s * f64(idx - u2x) : NaN;

  const k1h = Math.floor(t / 3600.0); const k4h = Math.floor(t / 14400.0);
  if (isNaN(b1h)) { b1h = k1h; o1h = o; h1h = h; l1h = l; c1h = c; }
  else if (k1h != b1h) {
    const kind = tryOb(pO1h, pH1h, pL1h, pC1h, o1h, h1h, l1h, c1h, obBody);
    if (kind == 1) { ob1hBuT = Math.max(pO1h, pC1h); ob1hBuB = pL1h; ob1hBuL = 1.0; }
    else if (kind == -1) { ob1hBeT = pH1h; ob1hBeB = Math.min(pO1h, pC1h); ob1hBeL = 1.0; }
    pO1h = o1h; pH1h = h1h; pL1h = l1h; pC1h = c1h; b1h = k1h; o1h = o; h1h = h; l1h = l; c1h = c;
  } else { if (h > h1h) h1h = h; if (l < l1h) l1h = l; c1h = c; }
  if (isNaN(b4h)) { b4h = k4h; o4h = o; h4h = h; l4h = l; c4h = c; }
  else if (k4h != b4h) {
    const kind = tryOb(pO4h, pH4h, pL4h, pC4h, o4h, h4h, l4h, c4h, obBody);
    if (kind == 1) { ob4hBuT = Math.max(pO4h, pC4h); ob4hBuB = pL4h; ob4hBuL = 1.0; }
    else if (kind == -1) { ob4hBeT = pH4h; ob4hBeB = Math.min(pO4h, pC4h); ob4hBeL = 1.0; }
    pO4h = o4h; pH4h = h4h; pL4h = l4h; pC4h = c4h; b4h = k4h; o4h = o; h4h = h; l4h = l; c4h = c;
  } else { if (h > h4h) h4h = h; if (l < l4h) l4h = l; c4h = c; }

  if (ob1hBuL == 1.0) { if (l <= ob1hBuT && c > ob1hBuB && c > o) revUp = 1.0; if (c < ob1hBuB) { brkDn = 1.0; ob1hBuL = 0.0; } }
  if (ob1hBeL == 1.0) { if (h >= ob1hBeB && c < ob1hBeT && c < o) revDn = 1.0; if (c > ob1hBeT) { brkUp = 1.0; ob1hBeL = 0.0; } }
  if (ob4hBuL == 1.0) { if (l <= ob4hBuT && c > ob4hBuB && c > o) revUp = 1.0; if (c < ob4hBuB) { brkDn = 1.0; ob4hBuL = 0.0; } }
  if (ob4hBeL == 1.0) { if (h >= ob4hBeB && c < ob4hBeT && c < o) revDn = 1.0; if (c > ob4hBeT) { brkUp = 1.0; ob4hBeL = 0.0; } }

  if (su == 1.0 || abcdBull || (batFire && patDir > 0.0) || db == 1.0) revUp = 1.0;
  if (sb == 1.0 || abcdBear || (flyFire && patDir < 0.0) || dt == 1.0) revDn = 1.0;

  out_g_sfp_bear(enSfp ? sb : 0.0); out_g_sfp_bull(enSfp ? su : 0.0); out_sfp_bear(h); out_sfp_bull(l);
  out_g_dt(enDbl ? dt : 0.0); out_g_db(enDbl ? db : 0.0); out_dbl_top(h); out_dbl_bot(l); out_dbl_neck(enDbl ? neck : NaN);
  out_g_abcd_bull(enAbcd && abcdBull ? 1.0 : 0.0); out_g_abcd_bear(enAbcd && abcdBear ? 1.0 : 0.0);
  out_abcd_bull(l); out_abcd_bear(h); out_abcd_cd(enAbcd && (abcdBull || abcdBear) ? cdRatio : NaN);
  out_g_bat(enHarm && batFire ? 1.0 : 0.0); out_g_fly(enHarm && flyFire ? 1.0 : 0.0); out_bat_mark(l); out_fly_mark(h); out_pat_dir(patDir);
  out_g_rev_up(enMarks ? revUp : 0.0); out_g_rev_dn(enMarks ? revDn : 0.0);
  out_g_brk_up(enMarks ? brkUp : 0.0); out_g_brk_dn(enMarks ? brkDn : 0.0);
  out_rev_up(l); out_rev_dn(h); out_brk_up(l); out_brk_dn(h);
  out_open_d(enOpens ? openD : NaN); out_open_w(enOpens ? openW : NaN); out_open_m(enOpens ? openM : NaN);
  out_eq_prev(enOpens ? prevEq : NaN); out_eq_cur(enOpens ? curEq : NaN);
  out_tl_res_1(enTl2 && r1on ? res1 : NaN); out_tl_res_2(enTl2 && r2on ? res2 : NaN);
  out_tl_sup_1(enTl2 && u1on ? sup1 : NaN); out_tl_sup_2(enTl2 && u2on ? sup2 : NaN);
  out_ob1h_bull_top(ob1hBuT); out_ob1h_bull_bot(ob1hBuB); out_ob1h_bull_live(enOb ? ob1hBuL : 0.0);
  out_ob1h_bear_top(ob1hBeT); out_ob1h_bear_bot(ob1hBeB); out_ob1h_bear_live(enOb ? ob1hBeL : 0.0);
  out_ob4h_bull_top(ob4hBuT); out_ob4h_bull_bot(ob4hBuB); out_ob4h_bull_live(enOb ? ob4hBuL : 0.0);
  out_ob4h_bear_top(ob4hBeT); out_ob4h_bear_bot(ob4hBeB); out_ob4h_bear_live(enOb ? ob4hBeL : 0.0);
  pClose = c; idx += 1;
}
