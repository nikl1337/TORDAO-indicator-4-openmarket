//@lang=wrun-ts
// UWUWORT 2 — structure patterns (history-safe)
// Flags 3+3, ABCD/Bat/Butterfly/WXYZ forming+done, regression 3R+3G, HTF 2G+2R

page("Display");
param.bool("show_flags", true, { label: "Bull/Bear flags 3+3" });
param.bool("show_harm", true, { label: "ABCD / Bat / Butterfly / WXYZ (forming + done)" });
param.bool("show_ch", true, { label: "Regression channels 3R+3G" });
param.bool("show_htf", true, { label: "HTF trendlines 2G+2R" });

page("Logic");
param.int("swing_len", 3, { min: 2, max: 30, label: "Swing length" });
param.number("flag_pole_atr", 1.8, { min: 0.8, max: 6, step: 0.1, label: "Flag min pole ATR", when: "show_flags" });
param.int("flag_max_bars", 400, { min: 100, max: 600, label: "Flag lookback", when: "show_flags" });
param.number("fib_tol", 0.05, { min: 0.01, max: 0.15, step: 0.01, label: "Fib ratio tolerance", when: "show_harm" });
param.int("ch_lb1", 34, { min: 10, max: 200, label: "Channel 1 LB", when: "show_ch" });
param.int("ch_lb2", 89, { min: 20, max: 300, label: "Channel 2 LB", when: "show_ch" });
param.int("ch_lb3", 200, { min: 50, max: 337, label: "Channel 3 LB", when: "show_ch" });

const gBat = output("g_bat", none);
const gFly = output("g_fly", none);
const gAbcd = output("g_abcd", none);
const gWxy = output("g_wxy", none);
const gForm = output("g_form", none);
output("bat", shape, overlay, { color: "#a78bfa", shape_where: "g_bat", shape: "diamond", location: "above_bar", glow: 16, description: "BAT done" });
output("fly", shape, overlay, { color: "#fbbf24", shape_where: "g_fly", shape: "diamond", location: "above_bar", glow: 16, description: "BUTTERFLY done" });
output("abcd", shape, overlay, { color: "#e879f9", shape_where: "g_abcd", shape: "diamond", location: "below_bar", glow: 14, description: "ABCD done" });
output("wxyz", shape, overlay, { color: "#38bdf8", shape_where: "g_wxy", shape: "diamond", location: "above_bar", glow: 14, description: "WXYZ done" });
output("form", shape, overlay, { color: "#c4b5fd", shape_where: "g_form", shape: "circle", location: "below_bar", glow: 8, description: "Harmonic forming" });
output("harm_pct", line, lower, { color: "#e879f9", width: 2, description: "Harmonic completion ratio %" });

output("rr1_hi", line, overlay, { color: "#ef4444", width: 3, description: "R1 hi" });
output("rr1_md", line, overlay, { color: "#ef4444", width: 1, line_style: "dotted", description: "R1 mid" });
output("rr1_lo", line, overlay, { color: "#ef4444", width: 3, description: "R1 lo" });
output("rr2_hi", line, overlay, { color: "#f87171", width: 3, description: "R2 hi" });
output("rr2_md", line, overlay, { color: "#f87171", width: 1, line_style: "dotted", description: "R2 mid" });
output("rr2_lo", line, overlay, { color: "#f87171", width: 3, description: "R2 lo" });
output("rr3_hi", line, overlay, { color: "#fca5a5", width: 3, description: "R3 hi" });
output("rr3_md", line, overlay, { color: "#fca5a5", width: 1, line_style: "dotted", description: "R3 mid" });
output("rr3_lo", line, overlay, { color: "#fca5a5", width: 3, description: "R3 lo" });
output("gg1_hi", line, overlay, { color: "#22c55e", width: 3, description: "G1 hi" });
output("gg1_md", line, overlay, { color: "#22c55e", width: 1, line_style: "dotted", description: "G1 mid" });
output("gg1_lo", line, overlay, { color: "#22c55e", width: 3, description: "G1 lo" });
output("gg2_hi", line, overlay, { color: "#4ade80", width: 3, description: "G2 hi" });
output("gg2_md", line, overlay, { color: "#4ade80", width: 1, line_style: "dotted", description: "G2 mid" });
output("gg2_lo", line, overlay, { color: "#4ade80", width: 3, description: "G2 lo" });
output("gg3_hi", line, overlay, { color: "#86efac", width: 3, description: "G3 hi" });
output("gg3_md", line, overlay, { color: "#86efac", width: 1, line_style: "dotted", description: "G3 mid" });
output("gg3_lo", line, overlay, { color: "#86efac", width: 3, description: "G3 lo" });

output("bf1_u", line, overlay, { color: "#16a34a", width: 2, description: "Bull1 upper" });
output("bf1_m", line, overlay, { color: "#16a34a", width: 1, line_style: "dashed", description: "Bull1 mid" });
output("bf1_l", line, overlay, { color: "#16a34a", width: 2, description: "Bull1 lower" });
output("bf2_u", line, overlay, { color: "#22c55e", width: 2, description: "Bull2 upper" });
output("bf2_m", line, overlay, { color: "#22c55e", width: 1, line_style: "dashed", description: "Bull2 mid" });
output("bf2_l", line, overlay, { color: "#22c55e", width: 2, description: "Bull2 lower" });
output("bf3_u", line, overlay, { color: "#4ade80", width: 2, description: "Bull3 upper" });
output("bf3_m", line, overlay, { color: "#4ade80", width: 1, line_style: "dashed", description: "Bull3 mid" });
output("bf3_l", line, overlay, { color: "#4ade80", width: 2, description: "Bull3 lower" });
output("rf1_u", line, overlay, { color: "#dc2626", width: 2, description: "Bear1 upper" });
output("rf1_m", line, overlay, { color: "#dc2626", width: 1, line_style: "dashed", description: "Bear1 mid" });
output("rf1_l", line, overlay, { color: "#dc2626", width: 2, description: "Bear1 lower" });
output("rf2_u", line, overlay, { color: "#ef4444", width: 2, description: "Bear2 upper" });
output("rf2_m", line, overlay, { color: "#ef4444", width: 1, line_style: "dashed", description: "Bear2 mid" });
output("rf2_l", line, overlay, { color: "#ef4444", width: 2, description: "Bear2 lower" });
output("rf3_u", line, overlay, { color: "#f87171", width: 2, description: "Bear3 upper" });
output("rf3_m", line, overlay, { color: "#f87171", width: 1, line_style: "dashed", description: "Bear3 mid" });
output("rf3_l", line, overlay, { color: "#f87171", width: 2, description: "Bear3 lower" });

output("ht_g0", line, overlay, { color: "#00ffd5", width: 2, description: "HTF green 0" });
output("ht_g1", line, overlay, { color: "#2dd4bf", width: 2, description: "HTF green 1" });
output("ht_r0", line, overlay, { color: "#ff2bd6", width: 2, description: "HTF red 0" });
output("ht_r1", line, overlay, { color: "#f472b6", width: 2, description: "HTF red 1" });

const RMAX: i32 = 337;
const FMAX: i32 = 400;
let rHi = new Array<f64>(RMAX);
let rLo = new Array<f64>(RMAX);
let rN: i32 = 0; let rCur: i32 = 0;
let fCl = new Array<f64>(FMAX);
let fHi = new Array<f64>(FMAX);
let fLo = new Array<f64>(FMAX);
let fN: i32 = 0; let fCur: i32 = 0;

let pivPx = new Array<f64>(10);
let pivT = new Array<i32>(10);
let pivK = new Array<i32>(10);
let pivN: i32 = 0;

let idx: i32 = 0;
let atr: f64 = NaN;
let prevC: f64 = NaN;

let bfU = new Array<f64>(3); let bfM = new Array<f64>(3); let bfL = new Array<f64>(3); let bfAge = new Array<i32>(3);
let rfU = new Array<f64>(3); let rfM = new Array<f64>(3); let rfL = new Array<f64>(3); let rfAge = new Array<i32>(3);

let sw = new Swings(3, 3);
let right: i32 = 3;
let flagPoleAtr: f64 = 1.8;
let flagMaxBars: i32 = 400;
let fibTol: f64 = 0.05;
let chLb1: i32 = 34; let chLb2: i32 = 89; let chLb3: i32 = 200;

function inR(x: f64, a: f64, b: f64, tol: f64): bool {
  const lo = a < b ? a : b;
  const hi = a < b ? b : a;
  return x >= lo - tol && x <= hi + tol;
}

function pushPivot(px: f64, kind: i32): void {
  if (pivN < 10) {
    pivPx[pivN] = px; pivT[pivN] = idx; pivK[pivN] = kind; pivN += 1;
  } else {
    for (let i = 0; i < 9; i += 1) {
      pivPx[i] = pivPx[i + 1]; pivT[i] = pivT[i + 1]; pivK[i] = pivK[i + 1];
    }
    pivPx[9] = px; pivT[9] = idx; pivK[9] = kind;
  }
}

function computeReg(n: i32, useHigh: bool): f64[] {
  const out = new Array<f64>(3);
  out[0] = NaN; out[1] = NaN; out[2] = NaN;
  if (rN < n || n < 5) return out;
  let sumX: f64 = 0.0; let sumY: f64 = 0.0; let sumXX: f64 = 0.0; let sumXY: f64 = 0.0;
  for (let k = 0; k < n; k += 1) {
    const j = (rCur - (n - 1 - k) + RMAX * 4) % RMAX;
    const y = useHigh ? rHi[j] : rLo[j];
    const x = f64(k);
    sumX += x; sumY += y; sumXX += x * x; sumXY += x * y;
  }
  const nf = f64(n);
  const den = nf * sumXX - sumX * sumX;
  if (Math.abs(den) < 1e-12) return out;
  const slope = (nf * sumXY - sumX * sumY) / den;
  const intercept = (sumY - slope * sumX) / nf;
  let maxUp: f64 = 0.0; let maxDn: f64 = 0.0;
  for (let k = 0; k < n; k += 1) {
    const j = (rCur - (n - 1 - k) + RMAX * 4) % RMAX;
    const y = useHigh ? rHi[j] : rLo[j];
    const reg = intercept + slope * f64(k);
    const d = y - reg;
    if (d > maxUp) maxUp = d;
    if (-d > maxDn) maxDn = -d;
  }
  const regNow = intercept + slope * f64(n - 1);
  out[1] = regNow; out[0] = regNow + maxUp; out[2] = regNow - maxDn;
  return out;
}

function onStart(): void {
  right = i32(p_swing_len());
  sw = new Swings(right, right);
  flagPoleAtr = p_flag_pole_atr();
  flagMaxBars = i32(p_flag_max_bars());
  fibTol = p_fib_tol();
  chLb1 = i32(p_ch_lb1()); chLb2 = i32(p_ch_lb2()); chLb3 = i32(p_ch_lb3());
  for (let i = 0; i < 3; i += 1) {
    bfU[i] = NaN; bfM[i] = NaN; bfL[i] = NaN; bfAge[i] = 9999;
    rfU[i] = NaN; rfM[i] = NaN; rfL[i] = NaN; rfAge[i] = 9999;
  }
}

function onBar(): void {
  const h = bar.high();
  const l = bar.low();
  const c = bar.close();
  const shFlag = pb_show_flags();
  const shHarm = pb_show_harm();
  const shCh = pb_show_ch();
  const shHtf = pb_show_htf();

  const tr = isNaN(prevC) ? (h - l) : Math.max(h - l, Math.max(Math.abs(h - prevC), Math.abs(l - prevC)));
  atr = isNaN(atr) ? tr : atr + (tr - atr) * (1.0 / 14.0);

  rCur = (rCur + 1) % RMAX;
  rHi[rCur] = h; rLo[rCur] = l;
  if (rN < RMAX) rN += 1;
  fCur = (fCur + 1) % FMAX;
  fCl[fCur] = c; fHi[fCur] = h; fLo[fCur] = l;
  if (fN < FMAX) fN += 1;

  sw.update(h, l);
  if (sw.newHigh()) pushPivot(sw.lastHigh(), 1);
  if (sw.newLow()) pushPivot(sw.lastLow(), -1);

  let batFire = false; let flyFire = false; let abcdFire = false; let wxyFire = false; let formFire = false; let harmRatio = NaN;
  if (shHarm && pivN >= 4) {
    const P0 = pivPx[pivN - 4]; const P1 = pivPx[pivN - 3]; const P2 = pivPx[pivN - 2]; const P3 = pivPx[pivN - 1];
    const leg01 = Math.abs(P1 - P0); const leg12 = Math.abs(P2 - P1); const leg23 = Math.abs(P3 - P2);
    if (leg01 > 0.0 && leg12 > 0.0) {
      const r12 = leg12 / leg01;
      const r23 = leg23 / leg12;
      if (inR(r12, 0.382, 0.886, fibTol * 1.5) || inR(r23, 0.382, 1.272, fibTol * 1.5)) {
        formFire = true;
        harmRatio = r23 * 100.0;
      }
    }
  }
  if (shHarm && pivN >= 5) {
    const X = pivPx[pivN - 5]; const A = pivPx[pivN - 4]; const B = pivPx[pivN - 3];
    const C = pivPx[pivN - 2]; const D = pivPx[pivN - 1];
    const xa = Math.abs(A - X); const ab = Math.abs(B - A); const bc = Math.abs(C - B);
    const cd = Math.abs(D - C); const xd = Math.abs(D - X); const ad = Math.abs(D - A);
    if (xa > 0.0 && ab > 0.0 && bc > 0.0 && cd > 0.0) {
      const rAB = ab / xa; const rBC = bc / ab; const rCD = cd / bc; const rXD = xd / xa; const rAD = ad / xa;
      harmRatio = rXD * 100.0;
      if (inR(rCD, 0.9, 1.272, fibTol) && inR(rBC, 0.382, 0.886, fibTol)) { abcdFire = true; formFire = false; }
      if (inR(rAB, 0.382, 0.5, fibTol) && inR(rBC, 0.382, 0.886, fibTol) && Math.abs(rXD - 0.886) <= fibTol * 1.2) { batFire = true; formFire = false; }
      if (inR(rAB, 0.786, 0.886, fibTol) && inR(rBC, 0.382, 0.886, fibTol) && inR(rXD, 1.272, 1.618, fibTol)) { flyFire = true; formFire = false; }
      if (inR(rAB, 0.382, 0.886, fibTol) && inR(rBC, 0.382, 1.272, fibTol) && inR(rCD, 0.618, 1.618, fibTol) && inR(rAD, 0.786, 1.618, fibTol)) {
        wxyFire = true; formFire = false; harmRatio = rAD * 100.0;
      }
    }
  }
  out_g_bat(batFire ? 1.0 : 0.0);
  out_g_fly(flyFire ? 1.0 : 0.0);
  out_g_abcd(abcdFire ? 1.0 : 0.0);
  out_g_wxy(wxyFire ? 1.0 : 0.0);
  out_g_form(formFire ? 1.0 : 0.0);
  out_harm_pct((batFire || flyFire || abcdFire || wxyFire || formFire) && !isNaN(harmRatio) ? harmRatio : NaN);

  if (shCh) {
    const r1 = computeReg(chLb1, true); const r2 = computeReg(chLb2, true); const r3 = computeReg(chLb3, true);
    const g1 = computeReg(chLb1, false); const g2 = computeReg(chLb2, false); const g3 = computeReg(chLb3, false);
    out_rr1_hi(r1[0]); out_rr1_md(r1[1]); out_rr1_lo(r1[2]);
    out_rr2_hi(r2[0]); out_rr2_md(r2[1]); out_rr2_lo(r2[2]);
    out_rr3_hi(r3[0]); out_rr3_md(r3[1]); out_rr3_lo(r3[2]);
    out_gg1_hi(g1[0]); out_gg1_md(g1[1]); out_gg1_lo(g1[2]);
    out_gg2_hi(g2[0]); out_gg2_md(g2[1]); out_gg2_lo(g2[2]);
    out_gg3_hi(g3[0]); out_gg3_md(g3[1]); out_gg3_lo(g3[2]);
  } else {
    out_rr1_hi(NaN); out_rr1_md(NaN); out_rr1_lo(NaN);
    out_rr2_hi(NaN); out_rr2_md(NaN); out_rr2_lo(NaN);
    out_rr3_hi(NaN); out_rr3_md(NaN); out_rr3_lo(NaN);
    out_gg1_hi(NaN); out_gg1_md(NaN); out_gg1_lo(NaN);
    out_gg2_hi(NaN); out_gg2_md(NaN); out_gg2_lo(NaN);
    out_gg3_hi(NaN); out_gg3_md(NaN); out_gg3_lo(NaN);
  }

  if (shFlag && fN > 30 && !isNaN(atr)) {
    for (let i = 0; i < 3; i += 1) {
      bfAge[i] += 1; rfAge[i] += 1;
      if (bfAge[i] > flagMaxBars) { bfU[i] = NaN; bfM[i] = NaN; bfL[i] = NaN; }
      if (rfAge[i] > flagMaxBars) { rfU[i] = NaN; rfM[i] = NaN; rfL[i] = NaN; }
    }
    let poleLow = fLo[fCur]; let poleHigh = fHi[fCur];
    for (let k = 1; k < 12; k += 1) {
      const j = (fCur - k + FMAX) % FMAX;
      if (fLo[j] < poleLow) poleLow = fLo[j];
      if (fHi[j] > poleHigh) poleHigh = fHi[j];
    }
    const poleSize = poleHigh - poleLow;
    let cHi = fHi[fCur]; let cLo = fLo[fCur];
    for (let k = 1; k < 6; k += 1) {
      const j = (fCur - k + FMAX) % FMAX;
      if (fHi[j] > cHi) cHi = fHi[j];
      if (fLo[j] < cLo) cLo = fLo[j];
    }
    const cons = cHi - cLo;
    if (poleSize >= atr * flagPoleAtr && cons > 0.0 && cons <= poleSize * 0.45) {
      const j12 = (fCur - 12 + FMAX) % FMAX;
      const upPole = c > fCl[j12];
      if (upPole) {
        let slot = 0; let oldest = bfAge[0];
        for (let i = 0; i < 3; i += 1) {
          if (isNaN(bfU[i])) { slot = i; break; }
          if (bfAge[i] > oldest) { oldest = bfAge[i]; slot = i; }
        }
        bfU[slot] = cHi; bfL[slot] = cLo; bfM[slot] = (cHi + cLo) * 0.5; bfAge[slot] = 0;
      } else {
        let slot = 0; let oldest = rfAge[0];
        for (let i = 0; i < 3; i += 1) {
          if (isNaN(rfU[i])) { slot = i; break; }
          if (rfAge[i] > oldest) { oldest = rfAge[i]; slot = i; }
        }
        rfU[slot] = cHi; rfL[slot] = cLo; rfM[slot] = (cHi + cLo) * 0.5; rfAge[slot] = 0;
      }
    }
  }
  out_bf1_u(shFlag ? bfU[0] : NaN); out_bf1_m(shFlag ? bfM[0] : NaN); out_bf1_l(shFlag ? bfL[0] : NaN);
  out_bf2_u(shFlag ? bfU[1] : NaN); out_bf2_m(shFlag ? bfM[1] : NaN); out_bf2_l(shFlag ? bfL[1] : NaN);
  out_bf3_u(shFlag ? bfU[2] : NaN); out_bf3_m(shFlag ? bfM[2] : NaN); out_bf3_l(shFlag ? bfL[2] : NaN);
  out_rf1_u(shFlag ? rfU[0] : NaN); out_rf1_m(shFlag ? rfM[0] : NaN); out_rf1_l(shFlag ? rfL[0] : NaN);
  out_rf2_u(shFlag ? rfU[1] : NaN); out_rf2_m(shFlag ? rfM[1] : NaN); out_rf2_l(shFlag ? rfL[1] : NaN);
  out_rf3_u(shFlag ? rfU[2] : NaN); out_rf3_m(shFlag ? rfM[2] : NaN); out_rf3_l(shFlag ? rfL[2] : NaN);

  if (shHtf && pivN >= 4) {
    let l0 = NaN; let l1 = NaN; let i0 = 0; let i1 = 0;
    let h0 = NaN; let h1 = NaN; let j0 = 0; let j1 = 0;
    for (let i = 0; i < pivN; i += 1) {
      if (pivK[i] == -1) {
        if (isNaN(l0)) { l0 = pivPx[i]; i0 = pivT[i]; } else { l1 = pivPx[i]; i1 = pivT[i]; }
      }
      if (pivK[i] == 1) {
        if (isNaN(h0)) { h0 = pivPx[i]; j0 = pivT[i]; } else { h1 = pivPx[i]; j1 = pivT[i]; }
      }
    }
    if (!isNaN(l0) && !isNaN(l1) && i1 != i0) {
      const slope = (l1 - l0) / f64(i1 - i0);
      out_ht_g0(l1 + slope * f64(idx - i1));
      out_ht_g1(l1 + slope * f64(idx - i1) + (isNaN(atr) ? 0.0 : atr * 0.5));
    } else { out_ht_g0(NaN); out_ht_g1(NaN); }
    if (!isNaN(h0) && !isNaN(h1) && j1 != j0) {
      const slope = (h1 - h0) / f64(j1 - j0);
      out_ht_r0(h1 + slope * f64(idx - j1));
      out_ht_r1(h1 + slope * f64(idx - j1) - (isNaN(atr) ? 0.0 : atr * 0.5));
    } else { out_ht_r0(NaN); out_ht_r1(NaN); }
  } else {
    out_ht_g0(NaN); out_ht_g1(NaN); out_ht_r0(NaN); out_ht_r1(NaN);
  }

  prevC = c;
  idx += 1;
}
