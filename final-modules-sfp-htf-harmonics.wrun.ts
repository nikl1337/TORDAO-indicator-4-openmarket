//@lang=wrun-ts
// TORDAO modules companion: SFP, HTF double top/bottom, ABCD, opens/EQ, bat/butterfly.
// Run as a SECOND indicator beside final-approved-by-openmarket.wrun.ts.
// Handles: 4 polylines only (under OpenMarket 64 cap).

input("close", ohlcv.close);

page("Modules");
param.bool("en_sfp", true, { label: "SFP signals" });
param.bool("en_dbl", true, { label: "HTF double top / bottom" });
param.bool("en_abcd", true, { label: "ABCD pattern" });
param.bool("en_harm", true, { label: "Bat / butterfly" });
param.bool("en_opens", true, { label: "Day / week / month open + EQ" });

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

const gSfpBear = output("g_sfp_bear", none);
const gSfpBull = output("g_sfp_bull", none);
const gDt = output("g_dt", none);
const gDb = output("g_db", none);
const gAbcdBull = output("g_abcd_bull", none);
const gAbcdBear = output("g_abcd_bear", none);
const gBat = output("g_bat", none);
const gFly = output("g_fly", none);
output("sfp_bear", shape, overlay, { color: "#f43f5e", shape_where: "g_sfp_bear", shape: "triangle_down", location: "above_bar", glow: 8, description: "Bearish SFP" });
output("sfp_bull", shape, overlay, { color: "#22d3ee", shape_where: "g_sfp_bull", shape: "triangle_up", location: "below_bar", glow: 8, description: "Bullish SFP" });
output("dbl_top", shape, overlay, { color: "#fb7185", shape_where: "g_dt", shape: "diamond", location: "above_bar", glow: 8, description: "HTF double top" });
output("dbl_bot", shape, overlay, { color: "#4ade80", shape_where: "g_db", shape: "diamond", location: "below_bar", glow: 8, description: "HTF double bottom" });
output("abcd_bull", shape, overlay, { color: "#00ffd5", shape_where: "g_abcd_bull", shape: "triangle_up", location: "below_bar", description: "Bullish ABCD D" });
output("abcd_bear", shape, overlay, { color: "#ff2bd6", shape_where: "g_abcd_bear", shape: "triangle_down", location: "above_bar", description: "Bearish ABCD D" });
output("bat_mark", shape, overlay, { color: "#a78bfa", shape_where: "g_bat", shape: "circle", location: "below_bar", description: "Bat at D" });
output("fly_mark", shape, overlay, { color: "#f472b6", shape_where: "g_fly", shape: "circle", location: "above_bar", description: "Butterfly at D" });
output("dbl_neck", none, overlay, { description: "Neckline", format: "price" });
output("abcd_cd", none, lower, { description: "CD % of AB", format: "0" });
output("pat_dir", none, overlay, { description: "+1 bull / -1 bear pattern" });

output("open_d", line, overlay, { color: "#94a3b8", width: 1, step: true, line_style: "dotted", description: "Daily open UTC" });
output("open_w", line, overlay, { color: "#64748b", width: 1, step: true, line_style: "dotted", description: "Weekly open UTC" });
output("open_m", line, overlay, { color: "#475569", width: 1, step: true, line_style: "dotted", description: "Monthly open UTC" });
output("eq_prev", line, overlay, { color: "#39ff14", width: 1, step: true, line_style: "dotted", description: "Previous day EQ" });
output("eq_cur", line, overlay, { color: "#ff2bd6", width: 1, step: true, line_style: "dotted", description: "Current day EQ so far" });

alert("sfp_bear_alert", { when: gSfpBear, message: "{{symbol}}: BEARISH SFP at {{close}}", description: "Bearish SFP" });
alert("sfp_bull_alert", { when: gSfpBull, message: "{{symbol}}: BULLISH SFP at {{close}}", description: "Bullish SFP" });
alert("double_top", { when: gDt, message: "{{symbol}}: HTF DOUBLE TOP", description: "Double top" });
alert("double_bottom", { when: gDb, message: "{{symbol}}: HTF DOUBLE BOTTOM", description: "Double bottom" });
alert("abcd_bull_alert", { when: gAbcdBull, message: "{{symbol}}: bullish ABCD at D", description: "ABCD bull" });
alert("abcd_bear_alert", { when: gAbcdBear, message: "{{symbol}}: bearish ABCD at D", description: "ABCD bear" });
alert("bat", { when: gBat, message: "{{symbol}}: BAT completed", description: "Bat" });
alert("butterfly", { when: gFly, message: "{{symbol}}: BUTTERFLY completed", description: "Butterfly" });

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
let enSfp = true;
let enDbl = true;
let enAbcd = true;
let enHarm = true;
let enOpens = true;
let sfpBars: i32 = 1;
let sfpMin: f64 = 0.05;
let dblTol: f64 = 0.3;
let dblDepth: f64 = 0.8;
let gapMin: i32 = 4;
let gapMax: i32 = 60;
let rLo: f64 = 38.2;
let rHi: f64 = 88.6;
let cLo: f64 = 90.0;
let cHi: f64 = 110.0;
let cdMin: f64 = 1.5;
let harmTol: f64 = 8.0;

let lvlH: f64 = NaN;
let hActive = false;
let hDone = false;
let hStart: i32 = 0;
let hExt: f64 = NaN;
let lvlL: f64 = NaN;
let lActive = false;
let lDone = false;
let lStart: i32 = 0;
let lExt: f64 = NaN;

let bucket: f64 = NaN;
let curH: f64 = NaN;
let curL: f64 = NaN;
let htfCount: i32 = 0;
let pH: f64 = NaN;
let pHi: i32 = 0;
let pL: f64 = NaN;
let pLi: i32 = 0;

let pa: f64 = NaN; let pb: f64 = NaN; let pc: f64 = NaN; let pd: f64 = NaN;
let ta: f64 = NaN; let tb: f64 = NaN; let tc: f64 = NaN; let td: f64 = NaN;
let cHigh = false;
let nPiv: i32 = 0;

const hx = new StaticArray<f64>(5);
const ht = new StaticArray<f64>(5);
const hk = new StaticArray<i32>(5);
let nH: i32 = 0;

let dayKey: i32 = -1;
let weekKey: i32 = -1;
let monthKey: i32 = -1;
let openD: f64 = NaN;
let openW: f64 = NaN;
let openM: f64 = NaN;
let dayHi: f64 = NaN;
let dayLo: f64 = NaN;
let prevEq: f64 = NaN;
let curEq: f64 = NaN;

function inR(v: f64, lo: f64, hi: f64, tol: f64): bool {
  return v >= lo - tol && v <= hi + tol;
}

function drawPoly(poly: PolylineHandle, n: i32): void {
  poly.clear();
  for (let i = 0; i < n; i += 1) {
    poly.add(pbuf[i * 2], pbuf[i * 2 + 1]);
  }
  poly.commit();
}

function pushPivot(px: f64, ts: f64, isHigh: bool): void {
  if (nPiv == 0) {
    pa = px; ta = ts; cHigh = isHigh; nPiv = 1;
    return;
  }
  if (isHigh == cHigh) {
    if (isHigh) { if (px > pd) { pd = px; td = ts; } }
    else { if (px < pd) { pd = px; td = ts; } }
    return;
  }
  if (nPiv == 1) { pb = px; tb = ts; cHigh = isHigh; nPiv = 2; }
  else if (nPiv == 2) { pc = px; tc = ts; cHigh = isHigh; nPiv = 3; }
  else if (nPiv == 3) { pd = px; td = ts; cHigh = isHigh; nPiv = 4; }
  else {
    pa = pb; ta = tb;
    pb = pc; tb = tc;
    pc = pd; tc = td;
    pd = px; td = ts;
    cHigh = isHigh;
  }
}

function pushHarm(px: f64, ts: f64, isHigh: bool): void {
  const k: i32 = isHigh ? 1 : -1;
  if (nH > 0 && hk[nH - 1] == k) {
    if (isHigh && px > hx[nH - 1]) { hx[nH - 1] = px; ht[nH - 1] = ts; }
    if (!isHigh && px < hx[nH - 1]) { hx[nH - 1] = px; ht[nH - 1] = ts; }
    return;
  }
  if (nH < 5) {
    hx[nH] = px; ht[nH] = ts; hk[nH] = k; nH += 1;
  } else {
    for (let i = 0; i < 4; i += 1) {
      hx[i] = hx[i + 1]; ht[i] = ht[i + 1]; hk[i] = hk[i + 1];
    }
    hx[4] = px; ht[4] = ts; hk[4] = k;
  }
}

function onStart(): void {
  right = i32(p_swing_len());
  sw = new Swings(right, right);
  htfLen = i32(p_htf_len());
  hs = new Swings(htfLen, htfLen);
  htfSec = p_htf_min() * 60.0;
  sfpBars = i32(p_sfp_bars());
  sfpMin = p_sfp_min_atr();
  dblTol = p_dbl_tol();
  dblDepth = p_dbl_depth();
  gapMin = i32(p_dbl_gap_min());
  gapMax = i32(p_dbl_gap_max());
  rLo = p_abcd_ret_lo();
  rHi = p_abcd_ret_hi();
  cLo = p_abcd_cd_lo();
  cHi = p_abcd_cd_hi();
  cdMin = p_abcd_min_atr();
  harmTol = p_harm_tol();
  enSfp = pb_en_sfp();
  enDbl = pb_en_dbl();
  enAbcd = pb_en_abcd();
  enHarm = pb_en_harm();
  enOpens = pb_en_opens();
}

function onBar(): void {
  const o = bar.open();
  const h = bar.high();
  const l = bar.low();
  const c = bar.close();
  t = bar.time();
  if (!isNaN(prevT)) width = t - prevT;
  prevT = t;

  const tr = isNaN(pClose) ? h - l : Math.max(h - l, Math.max(Math.abs(h - pClose), Math.abs(l - pClose)));
  atr = isNaN(atr) ? tr : (atr * 13.0 + tr) / 14.0;
  sw.update(h, l);

  let sb = 0.0;
  let su = 0.0;
  let dt = 0.0;
  let db = 0.0;
  let neck = NaN;
  let abcdBull = false;
  let abcdBear = false;
  let cdRatio = NaN;
  let batFire = false;
  let flyFire = false;
  let patDir = 0.0;

  if (sw.newHigh()) {
    lvlH = sw.lastHigh();
    hActive = false; hDone = false; hExt = NaN;
  }
  if (sw.newLow()) {
    lvlL = sw.lastLow();
    lActive = false; lDone = false; lExt = NaN;
  }
  if (!isNaN(lvlH) && !hDone) {
    if (h > lvlH) {
      if (!hActive) { hActive = true; hStart = idx; hExt = h; }
      else if (h > hExt) hExt = h;
    }
    if (hActive) {
      if (c < lvlH) {
        if (hExt - lvlH >= sfpMin * atr) sb = 1.0;
        hActive = false; hDone = true;
      } else if (idx - hStart + 1 >= sfpBars) { hActive = false; hDone = true; }
    }
  }
  if (!isNaN(lvlL) && !lDone) {
    if (l < lvlL) {
      if (!lActive) { lActive = true; lStart = idx; lExt = l; }
      else if (l < lExt) lExt = l;
    }
    if (lActive) {
      if (c > lvlL) {
        if (lvlL - lExt >= sfpMin * atr) su = 1.0;
        lActive = false; lDone = true;
      } else if (idx - lStart + 1 >= sfpBars) { lActive = false; lDone = true; }
    }
  }

  const b = Math.floor(t / htfSec);
  if (isNaN(bucket)) { bucket = b; curH = h; curL = l; }
  else if (b != bucket) {
    const slot = htfCount % HR;
    hiRing[slot] = curH; loRing[slot] = curL;
    htfCount += 1;
    hs.update(curH, curL);
    const sIdx = htfCount - 1 - htfLen;
    if (hs.newHigh()) {
      const px = hs.lastHigh();
      if (!isNaN(pH) && sIdx - pHi >= gapMin && sIdx - pHi <= gapMax && Math.abs(px - pH) / pH * 100.0 <= dblTol) {
        let mn = 1e100;
        for (let k = pHi; k <= sIdx; k += 1) {
          const v = loRing[k % HR];
          if (v < mn) mn = v;
        }
        const top = Math.min(px, pH);
        if ((top - mn) / top * 100.0 >= dblDepth) { dt = 1.0; neck = mn; }
      }
      pH = px; pHi = sIdx;
    }
    if (hs.newLow()) {
      const px = hs.lastLow();
      if (!isNaN(pL) && sIdx - pLi >= gapMin && sIdx - pLi <= gapMax && Math.abs(px - pL) / pL * 100.0 <= dblTol) {
        let mx = -1e100;
        for (let k = pLi; k <= sIdx; k += 1) {
          const v = hiRing[k % HR];
          if (v > mx) mx = v;
        }
        const bot = Math.max(px, pL);
        if ((mx - bot) / bot * 100.0 >= dblDepth) { db = 1.0; neck = mx; }
      }
      pL = px; pLi = sIdx;
    }
    bucket = b; curH = h; curL = l;
  } else {
    if (h > curH) curH = h;
    if (l < curL) curL = l;
  }

  const tp = isNaN(width) ? t : t - width * f64(right);
  if (sw.newHigh()) { pushPivot(sw.lastHigh(), tp, true); pushHarm(sw.lastHigh(), tp, true); }
  if (sw.newLow()) { pushPivot(sw.lastLow(), tp, false); pushHarm(sw.lastLow(), tp, false); }

  if (nPiv >= 4 && !isNaN(pa) && !isNaN(pb) && !isNaN(pc) && !isNaN(pd)) {
    const ab = Math.abs(pb - pa);
    const bc = Math.abs(pc - pb);
    const cd = Math.abs(pd - pc);
    if (ab > 0.0 && ab >= cdMin * atr) {
      const ret = bc / ab * 100.0;
      const ext = cd / ab * 100.0;
      if (ret >= rLo && ret <= rHi && ext >= cLo && ext <= cHi) {
        const bull = !cHigh && pd < pb && pc < pa;
        const bear = cHigh && pd > pb && pc > pa;
        if (bull || bear) {
          cdRatio = ext;
          if (bull) abcdBull = true; else abcdBear = true;
          pbuf[0] = ta; pbuf[1] = pa;
          pbuf[2] = tb; pbuf[3] = pb;
          pbuf[4] = tc; pbuf[5] = pc;
          pbuf[6] = td; pbuf[7] = pd;
          if (enAbcd) {
            if (bull) drawPoly(polyAbcdB, 4);
            else drawPoly(polyAbcdS, 4);
          }
        }
      }
    }
  }

  if (nH >= 5) {
    const X = hx[0]; const A = hx[1]; const B = hx[2]; const C = hx[3]; const D = hx[4];
    const XA = Math.abs(A - X);
    if (XA > 0.0) {
      const AB = Math.abs(B - A) / XA * 100.0;
      const AD = Math.abs(D - A) / XA * 100.0;
      const tol = harmTol;
      const bat = inR(AB, 38.0, 50.0, tol) && inR(AD, 85.0, 92.0, tol);
      const fly = inR(AB, 70.0, 88.0, tol) && inR(AD, 120.0, 141.0, tol);
      if (bat || fly) {
        patDir = hk[4] == -1 ? 1.0 : -1.0;
        pbuf[0] = ht[0]; pbuf[1] = X;
        pbuf[2] = ht[1]; pbuf[3] = A;
        pbuf[4] = ht[2]; pbuf[5] = B;
        pbuf[6] = ht[3]; pbuf[7] = C;
        pbuf[8] = ht[4]; pbuf[9] = D;
        if (bat) { batFire = true; if (enHarm) drawPoly(polyBat, 5); }
        if (fly) { flyFire = true; if (enHarm) drawPoly(polyFly, 5); }
      }
    }
  }

  const sec = i32(t);
  const dKey = sec / 86400;
  const wKey = (sec - 345600) / 604800;
  const mKey = (sec / 86400) / 30;
  if (dKey != dayKey) {
    if (!isNaN(dayHi) && !isNaN(dayLo)) prevEq = (dayHi + dayLo) / 2.0;
    dayKey = dKey;
    openD = o;
    dayHi = h;
    dayLo = l;
  } else {
    if (h > dayHi) dayHi = h;
    if (l < dayLo) dayLo = l;
  }
  curEq = (dayHi + dayLo) / 2.0;
  if (wKey != weekKey) { weekKey = wKey; openW = o; }
  if (mKey != monthKey) { monthKey = mKey; openM = o; }

  out_g_sfp_bear(enSfp ? sb : 0.0);
  out_g_sfp_bull(enSfp ? su : 0.0);
  out_sfp_bear(h);
  out_sfp_bull(l);
  out_g_dt(enDbl ? dt : 0.0);
  out_g_db(enDbl ? db : 0.0);
  out_dbl_top(h);
  out_dbl_bot(l);
  out_dbl_neck(enDbl ? neck : NaN);
  out_g_abcd_bull(enAbcd && abcdBull ? 1.0 : 0.0);
  out_g_abcd_bear(enAbcd && abcdBear ? 1.0 : 0.0);
  out_abcd_bull(l);
  out_abcd_bear(h);
  out_abcd_cd(enAbcd && (abcdBull || abcdBear) ? cdRatio : NaN);
  out_g_bat(enHarm && batFire ? 1.0 : 0.0);
  out_g_fly(enHarm && flyFire ? 1.0 : 0.0);
  out_bat_mark(l);
  out_fly_mark(h);
  out_pat_dir(patDir);
  out_open_d(enOpens ? openD : NaN);
  out_open_w(enOpens ? openW : NaN);
  out_open_m(enOpens ? openM : NaN);
  out_eq_prev(enOpens ? prevEq : NaN);
  out_eq_cur(enOpens ? curEq : NaN);

  pClose = c;
  idx += 1;
}
