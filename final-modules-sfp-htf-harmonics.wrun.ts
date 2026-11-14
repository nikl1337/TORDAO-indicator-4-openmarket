//@lang=wrun-ts
// TORDAO companion — harmonics, ABCD, same-length, fib hits, targets (1.618),
// teal bull / pink bear projections, orange Fib/Gann centers, key levels, liq grabs.

input("close", ohlcv.close);

page("Modules");
param.bool("en_levels", true, { label: "Hard key levels" });
param.bool("en_harm", true, { label: "Harmonics + ABCD + same-length" });
param.bool("en_fib", true, { label: "Fibonacci exact-hit markers" });
param.bool("en_liq", true, { label: "Liquidity grab marks" });
param.bool("en_pivots", true, { label: "Clear pivot circles" });
param.bool("en_targets", true, { label: "Fib price targets (1.618 focus)" });
param.bool("en_gann", true, { label: "Fib/Gann center dots" });

page("Logic");
param("swing_len", 5, { min: 2, max: 30, description: "Swing length" });
param("level_n", 6, { min: 2, max: 8, description: "Key levels count" });
param("lookback", 3000, { min: 200, max: 3000, description: "Max bars for patterns" });
param("harm_tol", 6, { min: 1, max: 20, description: "Harmonic ratio tol %" });
param("abcd_min_atr", 1.0, { min: 0, max: 20, description: "Min AB size in ATR" });
param("same_tol", 8, { min: 1, max: 25, description: "Same-length tol %" });
param("fib_tol", 0.35, { min: 0.05, max: 2, description: "Fib hit tol in ATR" });
param("liq_bars", 2, { min: 1, max: 8, description: "Liq reclaim bars" });
param("liq_min_atr", 0.08, { min: 0, max: 2, description: "Liq min sweep ATR" });
param("pivot_min_atr", 0.8, { min: 0.1, max: 10, description: "Clear pivot min ATR" });
param("tgt_ext", 1.618, { min: 1.0, max: 4.0, description: "Primary target extension (1.618)" });

const gLiqBull = output("g_liq_bull", none);
const gLiqBear = output("g_liq_bear", none);
output("liq_bull", shape, overlay, { color: "#00ffd5", shape_where: "g_liq_bull", shape: "diamond", location: "below_bar", glow: 14, description: "Liq grab bull" });
output("liq_bear", shape, overlay, { color: "#ff2bd6", shape_where: "g_liq_bear", shape: "diamond", location: "above_bar", glow: 14, description: "Liq grab bear" });

const gPivUp = output("g_piv_up", none);
const gPivDn = output("g_piv_dn", none);
output("piv_up", shape, overlay, { color: "#38bdf8", shape_where: "g_piv_up", shape: "circle", location: "below_bar", glow: 8, description: "Clear up pivot" });
output("piv_dn", shape, overlay, { color: "#c084fc", shape_where: "g_piv_dn", shape: "circle", location: "above_bar", glow: 8, description: "Clear down pivot" });

const gAbcdB = output("g_abcd_b", none);
const gAbcdS = output("g_abcd_s", none);
const gBat = output("g_bat", none);
const gFly = output("g_fly", none);
const gGart = output("g_gart", none);
const gSame = output("g_same", none);
output("abcd_b", shape, overlay, { color: "#00ffd5", shape_where: "g_abcd_b", shape: "triangle_up", location: "below_bar", glow: 10, description: "ABCD bull D" });
output("abcd_s", shape, overlay, { color: "#ff2bd6", shape_where: "g_abcd_s", shape: "triangle_down", location: "above_bar", glow: 10, description: "ABCD bear D" });
output("bat_m", shape, overlay, { color: "#a78bfa", shape_where: "g_bat", shape: "circle", location: "below_bar", glow: 8, description: "Bat" });
output("fly_m", shape, overlay, { color: "#f472b6", shape_where: "g_fly", shape: "circle", location: "above_bar", glow: 8, description: "Butterfly" });
output("gart_m", shape, overlay, { color: "#fbbf24", shape_where: "g_gart", shape: "diamond", location: "below_bar", glow: 8, description: "Gartley" });
output("same_m", shape, overlay, { color: "#94a3b8", shape_where: "g_same", shape: "square", location: "below_bar", glow: 6, description: "Same-length move" });

const gFib382 = output("g_fib382", none);
const gFib5 = output("g_fib5", none);
const gFib618 = output("g_fib618", none);
const gFib667 = output("g_fib667", none);
const gFib786 = output("g_fib786", none);
const gFib882 = output("g_fib882", none);
output("fib382", shape, overlay, { color: "#fde047", shape_where: "g_fib382", shape: "square", location: "below_bar", glow: 12, description: "0.382 hit" });
output("fib5", shape, overlay, { color: "#facc15", shape_where: "g_fib5", shape: "square", location: "below_bar", glow: 12, description: "0.50 hit" });
output("fib618", shape, overlay, { color: "#eab308", shape_where: "g_fib618", shape: "square", location: "below_bar", glow: 12, description: "0.618 hit" });
output("fib667", shape, overlay, { color: "#ca8a04", shape_where: "g_fib667", shape: "square", location: "below_bar", glow: 12, description: "0.667 hit" });
output("fib786", shape, overlay, { color: "#a16207", shape_where: "g_fib786", shape: "square", location: "below_bar", glow: 12, description: "0.786 hit" });
output("fib882", shape, overlay, { color: "#f97316", shape_where: "g_fib882", shape: "square", location: "below_bar", glow: 14, description: "0.882 hit" });

const gGann = output("g_gann", none);
output("gann_dot", shape, overlay, {
  color: "#fb923c", shape_where: "g_gann", shape: "circle",
  location: "below_bar", glow: 16, description: "Fib/Gann center"
});

output("tgt_1272", line, overlay, { color: "#2dd4bf", width: 1, step: true, line_style: "dotted", description: "Target 1.272" });
output("tgt_1414", line, overlay, { color: "#14b8a6", width: 1, step: true, line_style: "dotted", description: "Target 1.414" });
output("tgt_1618", line, overlay, { color: "#00ffd5", width: 2, step: true, line_style: "solid", description: "Target 1.618 (primary)" });
output("tgt_2000", line, overlay, { color: "#5eead4", width: 1, step: true, line_style: "dotted", description: "Target 2.0" });
output("tgt_2618", line, overlay, { color: "#99f6e4", width: 1, step: true, line_style: "dotted", description: "Target 2.618" });
output("tgtb_1272", line, overlay, { color: "#f9a8d4", width: 1, step: true, line_style: "dotted", description: "Bear target 1.272" });
output("tgtb_1414", line, overlay, { color: "#f472b6", width: 1, step: true, line_style: "dotted", description: "Bear target 1.414" });
output("tgtb_1618", line, overlay, { color: "#ff2bd6", width: 2, step: true, line_style: "solid", description: "Bear target 1.618 (primary)" });
output("tgtb_2000", line, overlay, { color: "#e879f9", width: 1, step: true, line_style: "dotted", description: "Bear target 2.0" });
output("tgtb_2618", line, overlay, { color: "#d946ef", width: 1, step: true, line_style: "dotted", description: "Bear target 2.618" });

alert("liq_bull_alert", { when: gLiqBull, message: "{{symbol}}: LIQ GRAB BULL", description: "Liq bull" });
alert("liq_bear_alert", { when: gLiqBear, message: "{{symbol}}: LIQ GRAB BEAR", description: "Liq bear" });
alert("abcd_bull", { when: gAbcdB, message: "{{symbol}}: ABCD bull D", description: "ABCD bull" });
alert("abcd_bear", { when: gAbcdS, message: "{{symbol}}: ABCD bear D", description: "ABCD bear" });
alert("bat", { when: gBat, message: "{{symbol}}: BAT", description: "Bat" });
alert("butterfly", { when: gFly, message: "{{symbol}}: BUTTERFLY", description: "Butterfly" });
alert("gartley", { when: gGart, message: "{{symbol}}: GARTLEY", description: "Gartley" });
alert("same_len", { when: gSame, message: "{{symbol}}: same-length move", description: "Same length" });
alert("fib_382", { when: gFib382, message: "{{symbol}}: Fib 0.382", description: "0.382" });
alert("fib_667", { when: gFib667, message: "{{symbol}}: Fib 0.667", description: "0.667" });
alert("fib_882", { when: gFib882, message: "{{symbol}}: Fib 0.882", description: "0.882" });
alert("gann_center", { when: gGann, message: "{{symbol}}: Fib/Gann center", description: "Gann/fib center" });

handles.polyline({ width: 2 });
const polyAbcdB = draw.polyline(8);
const polyAbcdS = draw.polyline(9);
const polyBat = draw.polyline(10);
const polyFly = draw.polyline(11);
const polyGart = draw.polyline(12);
const polySame = draw.polyline(13);
const pbuf = new StaticArray<f64>(12);

handles.label({ style: "knockout", size: 12, font_weight: "bold", align: "left" });
const labPat = draw.label(14);
const labFib = draw.label(15);
const labFib2 = draw.label(16);
string("pat_txt", { max_bytes: 48 });
string("fib_txt", { max_bytes: 24 });
string("fib2_txt", { max_bytes: 24 });

handles.line({ width: 1, line_style: "dotted", extend: "right", sticky_right: true, axis_label: "price" });
const RED: i32 = rgba(239, 68, 68, 255);
const GREEN: i32 = rgba(34, 197, 94, 255);
const NLV = 8;
const ln0 = draw.line(0); const ln1 = draw.line(1); const ln2 = draw.line(2); const ln3 = draw.line(3);
const ln4 = draw.line(4); const ln5 = draw.line(5); const ln6 = draw.line(6); const ln7 = draw.line(7);
function lvlLine(i: i32): LineHandle {
  if (i == 0) return ln0;
  if (i == 1) return ln1;
  if (i == 2) return ln2;
  if (i == 3) return ln3;
  if (i == 4) return ln4;
  if (i == 5) return ln5;
  if (i == 6) return ln6;
  return ln7;
}

const MAXP = 64;
const px = new StaticArray<f64>(MAXP);
const pt = new StaticArray<f64>(MAXP);
const pk = new StaticArray<i32>(MAXP);
let nP: i32 = 0;

let sw = new Swings(5, 5);
let right: i32 = 5;
let idx: i32 = 0;
let atr: f64 = NaN;
let pClose: f64 = NaN;
let t: f64 = NaN;
let prevT: f64 = NaN;
let width: f64 = NaN;
let lookback: i32 = 3000;
let harmTol: f64 = 6.0;
let abcdMin: f64 = 1.0;
let sameTol: f64 = 8.0;
let fibTol: f64 = 0.35;
let liqBars: i32 = 2;
let liqMin: f64 = 0.08;
let pivMin: f64 = 0.8;
let levelN: i32 = 6;
let enLevels = true;
let enHarm = true;
let enFib = true;
let enLiq = true;
let enPivots = true;
let enTargets = true;
let enGann = true;
let tgtExt: f64 = 1.618;

let lvlH: f64 = NaN; let hActive = false; let hDone = false; let hStart: i32 = 0; let hExt: f64 = NaN;
let lvlL: f64 = NaN; let lActive = false; let lDone = false; let lStart: i32 = 0; let lExt: f64 = NaN;
let prevH: f64 = NaN; let prevL: f64 = NaN;

const keyPx = new StaticArray<f64>(NLV);
const keyT0 = new StaticArray<f64>(NLV);
let keyN: i32 = 0;
let keyCur: i32 = 0;

let legA: f64 = NaN;
let legB: f64 = NaN;
let legIsUp = false;
let bullTgt = false;
let bearTgt = false;
let t1272: f64 = NaN;
let t1414: f64 = NaN;
let t1618: f64 = NaN;
let t2000: f64 = NaN;
let t2618: f64 = NaN;

function inR(v: f64, lo: f64, hi: f64, tol: f64): bool {
  return v >= lo - tol && v <= hi + tol;
}
function drawPoly(poly: PolylineHandle, n: i32): void {
  poly.setPoints(pbuf, n);
}
function pushPivot(price: f64, ts: f64, isHigh: bool): void {
  const k: i32 = isHigh ? 1 : -1;
  if (nP > 0 && pk[nP - 1] == k) {
    if (isHigh && price > px[nP - 1]) { px[nP - 1] = price; pt[nP - 1] = ts; }
    if (!isHigh && price < px[nP - 1]) { px[nP - 1] = price; pt[nP - 1] = ts; }
    return;
  }
  if (nP < MAXP) {
    px[nP] = price; pt[nP] = ts; pk[nP] = k; nP += 1;
  } else {
    for (let i = 0; i < MAXP - 1; i += 1) {
      px[i] = px[i + 1]; pt[i] = pt[i + 1]; pk[i] = pk[i + 1];
    }
    px[MAXP - 1] = price; pt[MAXP - 1] = ts; pk[MAXP - 1] = k;
  }
}

function onStart(): void {
  right = i32(p_swing_len());
  sw = new Swings(right, right);
  levelN = i32(p_level_n());
  if (levelN > NLV) levelN = NLV;
  if (levelN < 2) levelN = 2;
  lookback = i32(p_lookback());
  harmTol = p_harm_tol();
  abcdMin = p_abcd_min_atr();
  sameTol = p_same_tol();
  fibTol = p_fib_tol();
  liqBars = i32(p_liq_bars());
  liqMin = p_liq_min_atr();
  pivMin = p_pivot_min_atr();
  tgtExt = p_tgt_ext();
  enLevels = pb_en_levels();
  enHarm = pb_en_harm();
  enFib = pb_en_fib();
  enLiq = pb_en_liq();
  enPivots = pb_en_pivots();
  enTargets = pb_en_targets();
  enGann = pb_en_gann();
}

function pushLevel(price: f64, t0: f64): void {
  for (let i = 0; i < keyN; i += 1) {
    if (!isNaN(keyPx[i]) && Math.abs(keyPx[i] - price) <= 0.05 * atr) return;
  }
  if (keyN < levelN) {
    keyPx[keyN] = price; keyT0[keyN] = t0; keyN += 1;
  } else {
    keyPx[keyCur] = price; keyT0[keyCur] = t0;
    keyCur = (keyCur + 1) % levelN;
  }
}

function paintLevels(price: f64, tNow: f64): void {
  if (!enLevels) {
    for (let i = 0; i < NLV; i += 1) lvlLine(i).delete();
    return;
  }
  const n = keyN < levelN ? keyN : levelN;
  for (let i = 0; i < NLV; i += 1) {
    if (i < n && !isNaN(keyPx[i])) {
      const y = keyPx[i];
      lvlLine(i).set(keyT0[i], y, tNow, y);
      if (y > price) lvlLine(i).color(RED);
      else lvlLine(i).color(GREEN);
    } else {
      lvlLine(i).delete();
    }
  }
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

  let liqBull = 0.0; let liqBear = 0.0;
  let pivUp = 0.0; let pivDn = 0.0;
  let abcdB = false; let abcdS = false;
  let batFire = false; let flyFire = false; let gartFire = false; let sameFire = false;
  let f382 = 0.0; let f5 = 0.0; let f618 = 0.0; let f667 = 0.0; let f786 = 0.0; let f882 = 0.0;
  let newHigh = false; let newLow = false;
  let labelY = c;
  let fibLabelY = c;
  let fib2Y = c;
  let showPat = false;
  let showFib = false;
  let showFib2 = false;
  let gannFire = 0.0;

  if (sw.newHigh()) {
    lvlH = sw.lastHigh(); hActive = false; hDone = false; hExt = NaN; newHigh = true;
  }
  if (sw.newLow()) {
    lvlL = sw.lastLow(); lActive = false; lDone = false; lExt = NaN; newLow = true;
  }
  if (!isNaN(lvlH) && !hDone) {
    if (h > lvlH) {
      if (!hActive) { hActive = true; hStart = idx; hExt = h; }
      else if (h > hExt) hExt = h;
    }
    if (hActive) {
      if (c < lvlH) {
        if (hExt - lvlH >= liqMin * atr) liqBear = 1.0;
        hActive = false; hDone = true;
      } else if (idx - hStart + 1 >= liqBars) { hActive = false; hDone = true; }
    }
  }
  if (!isNaN(lvlL) && !lDone) {
    if (l < lvlL) {
      if (!lActive) { lActive = true; lStart = idx; lExt = l; }
      else if (l < lExt) lExt = l;
    }
    if (lActive) {
      if (c > lvlL) {
        if (lvlL - lExt >= liqMin * atr) liqBull = 1.0;
        lActive = false; lDone = true;
      } else if (idx - lStart + 1 >= liqBars) { lActive = false; lDone = true; }
    }
  }

  const tp = isNaN(width) ? t : t - width * f64(right);

  if (newHigh) {
    pushPivot(sw.lastHigh(), tp, true);
    pushLevel(sw.lastHigh(), t);
    if (!isNaN(prevH) && sw.lastHigh() - prevH >= pivMin * atr) pivDn = 1.0;
    if (!isNaN(prevL) && sw.lastHigh() - prevL >= pivMin * atr) pivUp = 1.0;
    prevH = sw.lastHigh();
    if (!isNaN(prevL)) { legA = prevL; legB = sw.lastHigh(); legIsUp = true; }
  }
  if (newLow) {
    pushPivot(sw.lastLow(), tp, false);
    pushLevel(sw.lastLow(), t);
    if (!isNaN(prevL) && prevL - sw.lastLow() >= pivMin * atr) pivUp = 1.0;
    if (!isNaN(prevH) && prevH - sw.lastLow() >= pivMin * atr) pivDn = 1.0;
    prevL = sw.lastLow();
    if (!isNaN(prevH)) { legA = prevH; legB = sw.lastLow(); legIsUp = false; }
  }

  paintLevels(c, t);

  if (enFib && !isNaN(legA) && !isNaN(legB) && !isNaN(atr) && atr > 0.0) {
    const span = Math.abs(legB - legA);
    if (span > 0.0) {
      const tol = fibTol * atr;
      for (let fi = 0; fi < 6; fi += 1) {
        let r = 0.382;
        if (fi == 1) r = 0.5;
        else if (fi == 2) r = 0.618;
        else if (fi == 3) r = 0.667;
        else if (fi == 4) r = 0.786;
        else if (fi == 5) r = 0.882;
        const y = legIsUp ? legB - span * r : legB + span * r;
        if (l <= y && h >= y) {
          const near = Math.min(Math.abs(c - y), Math.min(Math.abs(h - y), Math.abs(l - y)));
          if (near <= tol) {
            if (fi == 0) { f382 = 1.0; fibLabelY = y; showFib = true; }
            else if (fi == 1) { f5 = 1.0; fibLabelY = y; showFib = true; }
            else if (fi == 2) { f618 = 1.0; fibLabelY = y; showFib = true; }
            else if (fi == 3) { f667 = 1.0; fib2Y = y; showFib2 = true; }
            else if (fi == 4) { f786 = 1.0; fibLabelY = y; showFib = true; }
            else if (fi == 5) { f882 = 1.0; fib2Y = y; showFib2 = true; }
          }
        }
      }
    }
  }

  if (enHarm && nP >= 4) {
    if (nP >= 5) {
      const X = px[nP - 5]; const A = px[nP - 4]; const B = px[nP - 3]; const C = px[nP - 2]; const D = px[nP - 1];
      const tX = pt[nP - 5]; const tA = pt[nP - 4]; const tB = pt[nP - 3]; const tC = pt[nP - 2]; const tD = pt[nP - 1];
      const XA = Math.abs(A - X);
      if (XA > 0.0) {
        const AB = Math.abs(B - A) / XA * 100.0;
        const AD = Math.abs(D - A) / XA * 100.0;
        const tol = harmTol;
        const bat = inR(AB, 38.0, 50.0, tol) && inR(AD, 85.0, 92.0, tol);
        const fly = inR(AB, 70.0, 88.6, tol) && inR(AD, 120.0, 161.8, tol);
        const gart = inR(AB, 56.0, 68.0, tol) && inR(AD, 74.0, 84.0, tol);
        if (bat || fly || gart) {
          pbuf[0] = tX; pbuf[1] = X; pbuf[2] = tA; pbuf[3] = A; pbuf[4] = tB; pbuf[5] = B;
          pbuf[6] = tC; pbuf[7] = C; pbuf[8] = tD; pbuf[9] = D;
          if (bat) { batFire = true; drawPoly(polyBat, 5); }
          if (fly) { flyFire = true; drawPoly(polyFly, 5); }
          if (gart) { gartFire = true; drawPoly(polyGart, 5); }
          showPat = true; labelY = D;
          sb_clear();
          if (bat) sb_text("BAT ");
          if (fly) sb_text("BUTTERFLY ");
          if (gart) sb_text("GARTLEY ");
          sb_text("AD "); sb_f64(AD, 1); sb_text("%");
          str_pat_txt_sb();
        }
      }
    }
    if (nP >= 4) {
      const A = px[nP - 4]; const B = px[nP - 3]; const C = px[nP - 2]; const D = px[nP - 1];
      const tA = pt[nP - 4]; const tB = pt[nP - 3]; const tC = pt[nP - 2]; const tD = pt[nP - 1];
      const ab = Math.abs(B - A);
      const bc = Math.abs(C - B);
      const cd = Math.abs(D - C);
      if (ab > 0.0 && ab >= abcdMin * atr) {
        const ret = bc / ab * 100.0;
        const ext = cd / ab * 100.0;
        if (ret >= 38.0 && ret <= 88.6 && ((ext >= 90.0 && ext <= 110.0) || (ext >= 120.0 && ext <= 165.0))) {
          const bull = pk[nP - 1] == -1 && D < B;
          const bear = pk[nP - 1] == 1 && D > B;
          if (bull || bear) {
            pbuf[0] = tA; pbuf[1] = A; pbuf[2] = tB; pbuf[3] = B; pbuf[4] = tC; pbuf[5] = C; pbuf[6] = tD; pbuf[7] = D;
            if (bull) { abcdB = true; drawPoly(polyAbcdB, 4); } else { abcdS = true; drawPoly(polyAbcdS, 4); }
            showPat = true; labelY = D;
            sb_clear();
            sb_text(bull ? "ABCD bull " : "ABCD bear ");
            sb_text("CD "); sb_f64(ext, 0); sb_text("% AB");
            str_pat_txt_sb();
          }
        }
        if (Math.abs(cd - ab) / ab * 100.0 <= sameTol) {
          pbuf[0] = tA; pbuf[1] = A; pbuf[2] = tB; pbuf[3] = B; pbuf[4] = tC; pbuf[5] = C; pbuf[6] = tD; pbuf[7] = D;
          sameFire = true; drawPoly(polySame, 4);
          if (!showPat) {
            showPat = true; labelY = D;
            sb_clear(); sb_text("SAME LEN "); sb_f64(cd / ab * 100.0, 0); sb_text("%");
            str_pat_txt_sb();
          }
        }
      }
    }
  }

  // measured fib targets — analyst confluence, 1.618 primary (teal bull / pink bear)
  if (enTargets && !isNaN(legA) && !isNaN(legB)) {
    const span = Math.abs(legB - legA);
    if (span > 0.0) {
      if (legIsUp) {
        bullTgt = true; bearTgt = false;
        t1272 = legB + span * 1.272;
        t1414 = legB + span * 1.414;
        t1618 = legB + span * (tgtExt > 0.0 ? tgtExt : 1.618);
        t2000 = legB + span * 2.0;
        t2618 = legB + span * 2.618;
      } else {
        bullTgt = false; bearTgt = true;
        t1272 = legB - span * 1.272;
        t1414 = legB - span * 1.414;
        t1618 = legB - span * (tgtExt > 0.0 ? tgtExt : 1.618);
        t2000 = legB - span * 2.0;
        t2618 = legB - span * 2.618;
      }
    }
  }

  // Fib/Gann center = midpoint of impulse (0.5) — big orange dot
  if (enGann && !isNaN(legA) && !isNaN(legB) && !isNaN(atr) && atr > 0.0) {
    const mid = (legA + legB) / 2.0;
    const tolG = fibTol * atr;
    if (l <= mid && h >= mid) {
      const near = Math.min(Math.abs(c - mid), Math.min(Math.abs(h - mid), Math.abs(l - mid)));
      if (near <= tolG) {
        gannFire = 1.0;
        f5 = 1.0;
        fibLabelY = mid;
        showFib = true;
      }
    }
  }

  if (showPat) {
    labPat.set(t, labelY).text(str_pat_txt_sb).color(rgba(255, 255, 255, 255));
  }
  if (showFib) {
    sb_clear();
    if (f882 == 1.0) sb_text("0.882");
    else if (f786 == 1.0) sb_text("0.786");
    else if (f667 == 1.0) sb_text("0.667");
    else if (f618 == 1.0) sb_text("0.618");
    else if (f5 == 1.0) sb_text("0.50");
    else if (f382 == 1.0) sb_text("0.382");
    str_fib_txt_sb();
    labFib.set(t, fibLabelY).text(str_fib_txt_sb).color(rgba(253, 224, 71, 255));
  }
  if (showFib2) {
    sb_clear();
    if (f882 == 1.0) sb_text("0.882");
    else if (f667 == 1.0) sb_text("0.667");
    str_fib2_txt_sb();
    labFib2.set(t, fib2Y).text(str_fib2_txt_sb).color(rgba(249, 115, 22, 255));
  }

  out_g_liq_bull(enLiq ? liqBull : 0.0);
  out_g_liq_bear(enLiq ? liqBear : 0.0);
  out_liq_bull(l); out_liq_bear(h);
  out_g_piv_up(enPivots ? pivUp : 0.0);
  out_g_piv_dn(enPivots ? pivDn : 0.0);
  out_piv_up(l); out_piv_dn(h);
  out_g_abcd_b(enHarm && abcdB ? 1.0 : 0.0);
  out_g_abcd_s(enHarm && abcdS ? 1.0 : 0.0);
  out_abcd_b(l); out_abcd_s(h);
  out_g_bat(enHarm && batFire ? 1.0 : 0.0);
  out_g_fly(enHarm && flyFire ? 1.0 : 0.0);
  out_g_gart(enHarm && gartFire ? 1.0 : 0.0);
  out_g_same(enHarm && sameFire ? 1.0 : 0.0);
  out_bat_m(l); out_fly_m(h); out_gart_m(l); out_same_m(l);
  out_g_fib382(enFib ? f382 : 0.0);
  out_g_fib5(enFib ? f5 : 0.0);
  out_g_fib618(enFib ? f618 : 0.0);
  out_g_fib667(enFib ? f667 : 0.0);
  out_g_fib786(enFib ? f786 : 0.0);
  out_g_fib882(enFib ? f882 : 0.0);
  out_fib382(l); out_fib5(l); out_fib618(l); out_fib667(l); out_fib786(l); out_fib882(l);

  out_g_gann(enGann ? gannFire : 0.0);
  out_gann_dot(enGann && gannFire == 1.0 ? ((legA + legB) / 2.0) : l);

  if (enTargets && bullTgt) {
    out_tgt_1272(t1272); out_tgt_1414(t1414); out_tgt_1618(t1618); out_tgt_2000(t2000); out_tgt_2618(t2618);
    out_tgtb_1272(NaN); out_tgtb_1414(NaN); out_tgtb_1618(NaN); out_tgtb_2000(NaN); out_tgtb_2618(NaN);
  } else if (enTargets && bearTgt) {
    out_tgt_1272(NaN); out_tgt_1414(NaN); out_tgt_1618(NaN); out_tgt_2000(NaN); out_tgt_2618(NaN);
    out_tgtb_1272(t1272); out_tgtb_1414(t1414); out_tgtb_1618(t1618); out_tgtb_2000(t2000); out_tgtb_2618(t2618);
  } else {
    out_tgt_1272(NaN); out_tgt_1414(NaN); out_tgt_1618(NaN); out_tgt_2000(NaN); out_tgt_2618(NaN);
    out_tgtb_1272(NaN); out_tgtb_1414(NaN); out_tgtb_1618(NaN); out_tgtb_2000(NaN); out_tgtb_2618(NaN);
  }

  pClose = c;
  idx += 1;
}
