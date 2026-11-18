//@lang=wrun-ts
// UWUWORT-Z — overlay only
// Zigzag only when harmonic near-complete OR confirmed (stays).
// Harmonics: ABCD, Gartley, Bat, Butterfly, Crab, Cypher, Shark, WXYZ
// Fib tol 10%. Letters with char. Purple done / near circles.
// Extreme ±0.2%, yellow POC+mid, VAH pink / VAL teal.
// 4 equalizer trendlines: 2 green up, 2 red down.

page("Display");
param.bool("show_zz", true, { label: "Zigzag (near-complete + confirmed patterns)" });
param.bool("show_harm", true, { label: "Harmonics near-complete + confirmed" });
param.bool("show_ext", true, { label: "Extreme levels ±0.2% (pink high / teal low)" });
param.bool("show_poc", true, { label: "Yellow POC zone + mid" });
param.bool("show_va", true, { label: "Value Area High (pink) / Low (teal)" });
param.bool("show_eq", true, { label: "Equalizer trendlines 2 green up / 2 red down" });

page("Logic");
param.int("swing_len", 3, { min: 2, max: 20, label: "Swing length (bars each side)" });
param.number("fib_tol", 0.10, { min: 0.02, max: 0.25, step: 0.01, label: "Fib ratio tolerance (0.10 = 10%)", when: "show_harm" });
param.int("poc_lb", 96, { min: 16, max: 400, label: "POC / Value Area lookback bars", when: "show_poc" });
param.number("va_pct", 70, { min: 50, max: 90, step: 1, label: "Value Area volume %", when: "show_va" });
param.int("keep_bars", 200, { min: 40, max: 600, label: "Keep confirmed pattern this many bars" });

plot.rays({
  name: "zz",
  slots: 6,
  colors: ["#a78bfa", "#c4b5fd", "#a78bfa", "#c4b5fd", "#a78bfa", "#c4b5fd"],
  width: 1.8,
  line_style: "solid",
  opacity: 0.95,
  words: ["leg1", "leg2", "leg3", "leg4", "leg5", "leg6"],
  tooltip: "{{word}}",
  panel: "overlay"
});

plot.rays({
  name: "eq",
  slots: 4,
  colors: ["#22c55e", "#4ade80", "#ef4444", "#f87171"],
  width: 1.5,
  line_style: "solid",
  opacity: 0.9,
  words: ["EQ up 1", "EQ up 2", "EQ down 1", "EQ down 2"],
  tooltip: "{{word}}",
  panel: "overlay"
});

output("ext_hi", line, overlay, { color: "#ff2bd6", width: 2, description: "Last high +0.2%" });
output("ext_lo", line, overlay, { color: "#00ffd5", width: 2, description: "Last low -0.2%" });

const pocTop = output("poc_top", none);
const pocBot = output("poc_bot", none);
const pocLive = output("poc_live", none);
box("poc_zone", {
  top: pocTop,
  bottom: pocBot,
  when: pocLive,
  color: "#facc15",
  opacity: 0.18,
  borderColor: "#facc15",
  borderWidth: 1,
  z: 2
});
output("poc_mid", line, overlay, { color: "#facc15", width: 2, description: "POC mid price" });

output("vah", line, overlay, { color: "#ff2bd6", width: 1, line_style: "dashed", description: "Value Area High" });
output("val", line, overlay, { color: "#00ffd5", width: 1, line_style: "dashed", description: "Value Area Low" });

const gA = output("g_a", none);
const gB = output("g_b", none);
const gC = output("g_c", none);
const gD = output("g_d", none);
const gX = output("g_x", none);
const gW = output("g_w", none);
const gY = output("g_y", none);
const gZ = output("g_z", none);
const gDone = output("g_done", none);
const gNear = output("g_near", none);

output("lab_a", shape, overlay, { color: "#e879f9", shape_where: "g_a", shape: "char", char: "A", location: "above_bar", glow: 6, description: "A" });
output("lab_b", shape, overlay, { color: "#e879f9", shape_where: "g_b", shape: "char", char: "B", location: "below_bar", glow: 6, description: "B" });
output("lab_c", shape, overlay, { color: "#e879f9", shape_where: "g_c", shape: "char", char: "C", location: "above_bar", glow: 6, description: "C" });
output("lab_d", shape, overlay, { color: "#e879f9", shape_where: "g_d", shape: "char", char: "D", location: "below_bar", glow: 6, description: "D" });
output("lab_x", shape, overlay, { color: "#38bdf8", shape_where: "g_x", shape: "char", char: "X", location: "above_bar", glow: 6, description: "X" });
output("lab_w", shape, overlay, { color: "#38bdf8", shape_where: "g_w", shape: "char", char: "W", location: "above_bar", glow: 6, description: "W" });
output("lab_y", shape, overlay, { color: "#38bdf8", shape_where: "g_y", shape: "char", char: "Y", location: "below_bar", glow: 6, description: "Y" });
output("lab_z", shape, overlay, { color: "#38bdf8", shape_where: "g_z", shape: "char", char: "Z", location: "above_bar", glow: 6, description: "Z" });
output("done", shape, overlay, { color: "#a855f7", shape_where: "g_done", shape: "circle", location: "above_bar", glow: 18, description: "Pattern confirmed" });
output("near", shape, overlay, { color: "#c4b5fd", shape_where: "g_near", shape: "circle", location: "below_bar", glow: 10, description: "Near completion" });

const PMAX: i32 = 20;
let pivPx = new Array<f64>(PMAX);
let pivT = new Array<f64>(PMAX);
let pivIdx = new Array<i32>(PMAX);
let pivK = new Array<i32>(PMAX);
let pivN: i32 = 0;

const FMAX: i32 = 400;
let fHi = new Array<f64>(FMAX);
let fLo = new Array<f64>(FMAX);
let fCl = new Array<f64>(FMAX);
let fVol = new Array<f64>(FMAX);
let fN: i32 = 0;
let fCur: i32 = 0;

let sw = new Swings(3, 3);
let right: i32 = 3;
let fibTol: f64 = 0.10;
let pocLb: i32 = 96;
let vaPct: f64 = 70.0;
let keepBars: i32 = 200;

let idx: i32 = 0;
let lastHi: f64 = NaN;
let lastLo: f64 = NaN;

let eqUp0Px0: f64 = NaN; let eqUp0Px1: f64 = NaN; let eqUp0T0: f64 = 0.0; let eqUp0T1: f64 = 0.0;
let eqUp1Px0: f64 = NaN; let eqUp1Px1: f64 = NaN; let eqUp1T0: f64 = 0.0; let eqUp1T1: f64 = 0.0;
let eqDn0Px0: f64 = NaN; let eqDn0Px1: f64 = NaN; let eqDn0T0: f64 = 0.0; let eqDn0T1: f64 = 0.0;
let eqDn1Px0: f64 = NaN; let eqDn1Px1: f64 = NaN; let eqDn1T0: f64 = 0.0; let eqDn1T1: f64 = 0.0;
let loPxA: f64 = NaN; let loTA: f64 = 0.0; let loPxB: f64 = NaN; let loTB: f64 = 0.0;
let hiPxA: f64 = NaN; let hiTA: f64 = 0.0; let hiPxB: f64 = NaN; let hiTB: f64 = 0.0;

let patOn: bool = false;
let patDone: bool = false;
let patAge: i32 = 0;
let patKind: i32 = 0;
let patN: i32 = 0;
let patPx = new Array<f64>(6);
let patT = new Array<f64>(6);
let patI = new Array<i32>(6);

let fireX: i32 = -1;
let fireA: i32 = -1;
let fireB: i32 = -1;
let fireC: i32 = -1;
let fireD: i32 = -1;
let fireW: i32 = -1;
let fireY: i32 = -1;
let fireZ: i32 = -1;
let fireDone: i32 = -1;
let fireNear: i32 = -1;

function inR(x: f64, a: f64, b: f64, tol: f64): bool {
  const lo = a < b ? a : b;
  const hi = a < b ? b : a;
  return x >= lo * (1.0 - tol) && x <= hi * (1.0 + tol);
}

function pushPivot(px: f64, t: f64, kind: i32): void {
  if (pivN < PMAX) {
    pivPx[pivN] = px;
    pivT[pivN] = t;
    pivIdx[pivN] = idx - right;
    pivK[pivN] = kind;
    pivN += 1;
  } else {
    for (let i = 0; i < PMAX - 1; i += 1) {
      pivPx[i] = pivPx[i + 1];
      pivT[i] = pivT[i + 1];
      pivIdx[i] = pivIdx[i + 1];
      pivK[i] = pivK[i + 1];
    }
    pivPx[PMAX - 1] = px;
    pivT[PMAX - 1] = t;
    pivIdx[PMAX - 1] = idx - right;
    pivK[PMAX - 1] = kind;
  }
}

function setPat(kind: i32, nPts: i32, base: i32, done: bool): void {
  patOn = true;
  patDone = done;
  patAge = 0;
  patKind = kind;
  patN = nPts;
  for (let i = 0; i < nPts; i += 1) {
    patPx[i] = pivPx[base + i];
    patT[i] = pivT[base + i];
    patI[i] = pivIdx[base + i];
  }
  if (kind == 8) {
    fireW = patI[0] + right;
    fireX = patI[1] + right;
    fireY = patI[2] + right;
    fireZ = patI[3] + right;
    fireA = -1; fireB = -1; fireC = -1; fireD = -1;
  } else if (nPts == 5) {
    fireX = patI[0] + right;
    fireA = patI[1] + right;
    fireB = patI[2] + right;
    fireC = patI[3] + right;
    fireD = patI[4] + right;
    fireW = -1; fireY = -1; fireZ = -1;
  } else if (nPts == 4) {
    fireA = patI[0] + right;
    fireB = patI[1] + right;
    fireC = patI[2] + right;
    fireD = patI[3] + right;
    fireX = -1; fireW = -1; fireY = -1; fireZ = -1;
  } else {
    fireA = patI[0] + right;
    fireB = patI[1] + right;
    fireC = patI[2] + right;
    fireD = -1;
    fireX = -1; fireW = -1; fireY = -1; fireZ = -1;
  }
  if (done) {
    fireDone = patI[nPts - 1] + right;
    fireNear = -1;
  } else {
    fireNear = patI[nPts - 1] + right;
    fireDone = -1;
  }
}

function onStart(): void {
  right = i32(p_swing_len());
  sw = new Swings(right, right);
  fibTol = p_fib_tol();
  pocLb = i32(p_poc_lb());
  vaPct = p_va_pct();
  keepBars = i32(p_keep_bars());
  pivN = 0;
  fN = 0;
  fCur = 0;
  idx = 0;
  lastHi = NaN;
  lastLo = NaN;
  eqUp0Px0 = NaN; eqUp0Px1 = NaN; eqUp1Px0 = NaN; eqUp1Px1 = NaN;
  eqDn0Px0 = NaN; eqDn0Px1 = NaN; eqDn1Px0 = NaN; eqDn1Px1 = NaN;
  loPxA = NaN; loPxB = NaN; hiPxA = NaN; hiPxB = NaN;
  patOn = false;
  patDone = false;
  patAge = 0;
  patN = 0;
  fireX = -1; fireA = -1; fireB = -1; fireC = -1; fireD = -1;
  fireW = -1; fireY = -1; fireZ = -1;
  fireDone = -1; fireNear = -1;
}

function onBar(): void {
  const h = bar.high();
  const l = bar.low();
  const c = bar.close();
  const v = bar.volume();
  const t = bar.time();

  const shZz = pb_show_zz();
  const shHarm = pb_show_harm();
  const shExt = pb_show_ext();
  const shPoc = pb_show_poc();
  const shVa = pb_show_va();
  const shEq = pb_show_eq();

  fCur = (fCur + 1) % FMAX;
  fHi[fCur] = h;
  fLo[fCur] = l;
  fCl[fCur] = c;
  fVol[fCur] = v;
  if (fN < FMAX) fN += 1;

  sw.update(h, l);
  if (sw.newHigh()) {
    lastHi = sw.lastHigh();
    pushPivot(lastHi, t, 1);
    if (!isNaN(hiPxB) && !isNaN(hiPxA) && lastHi < hiPxB) {
      eqDn1Px0 = hiPxA; eqDn1T0 = hiTA; eqDn1Px1 = hiPxB; eqDn1T1 = hiTB;
    }
    if (!isNaN(hiPxB) && lastHi < hiPxB) {
      eqDn0Px0 = hiPxB; eqDn0T0 = hiTB; eqDn0Px1 = lastHi; eqDn0T1 = t;
    }
    hiPxA = hiPxB; hiTA = hiTB;
    hiPxB = lastHi; hiTB = t;
  }
  if (sw.newLow()) {
    lastLo = sw.lastLow();
    pushPivot(lastLo, t, -1);
    if (!isNaN(loPxB) && !isNaN(loPxA) && lastLo > loPxB) {
      eqUp1Px0 = loPxA; eqUp1T0 = loTA; eqUp1Px1 = loPxB; eqUp1T1 = loTB;
    }
    if (!isNaN(loPxB) && lastLo > loPxB) {
      eqUp0Px0 = loPxB; eqUp0T0 = loTB; eqUp0Px1 = lastLo; eqUp0T1 = t;
    }
    loPxA = loPxB; loTA = loTB;
    loPxB = lastLo; loTB = t;
  }

  if (shHarm && pivN >= 4) {
    const i0 = pivN - 4;
    const A = pivPx[i0];
    const B = pivPx[i0 + 1];
    const C = pivPx[i0 + 2];
    const D = pivPx[i0 + 3];
    const ab = Math.abs(B - A);
    const bc = Math.abs(C - B);
    const cd = Math.abs(D - C);
    if (ab > 0.0 && bc > 0.0 && cd > 0.0) {
      const rBC = bc / ab;
      const rCD = cd / ab;
      const abcdDone = inR(rBC, 0.382, 0.886, fibTol) && inR(rCD, 0.90, 1.272, fibTol);
      const rYZ = cd / bc;
      const wxyDone = inR(rBC, 0.382, 1.272, fibTol) && inR(rYZ, 0.618, 1.618, fibTol);
      if (abcdDone) setPat(1, 4, i0, true);
      else if (wxyDone) setPat(8, 4, i0, true);
    }
    if (pivN >= 3) {
      const j0 = pivN - 3;
      const A2 = pivPx[j0];
      const B2 = pivPx[j0 + 1];
      const C2 = pivPx[j0 + 2];
      const ab2 = Math.abs(B2 - A2);
      const bc2 = Math.abs(C2 - B2);
      if (ab2 > 0.0 && bc2 > 0.0) {
        const rBC2 = bc2 / ab2;
        if (inR(rBC2, 0.382, 0.886, fibTol)) {
          if (!patOn || !patDone) setPat(1, 3, j0, false);
        }
      }
    }
  }

  if (shHarm && pivN >= 5) {
    const base = pivN - 5;
    const X = pivPx[base];
    const A = pivPx[base + 1];
    const B = pivPx[base + 2];
    const C = pivPx[base + 3];
    const D = pivPx[base + 4];
    const xa = Math.abs(A - X);
    const ab = Math.abs(B - A);
    const bc = Math.abs(C - B);
    const cd = Math.abs(D - C);
    const xd = Math.abs(D - X);
    const xc = Math.abs(C - X);
    if (xa > 0.0 && ab > 0.0 && bc > 0.0) {
      const rAB = ab / xa;
      const rBC = bc / ab;
      const rXD = xd / xa;
      const rXC = xc / xa;
      const rCD = cd > 0.0 ? cd / bc : NaN;

      const gartley = inR(rAB, 0.618, 0.618, fibTol) && inR(rBC, 0.382, 0.886, fibTol) && inR(rXD, 0.786, 0.786, fibTol);
      const bat = inR(rAB, 0.382, 0.50, fibTol) && inR(rBC, 0.382, 0.886, fibTol) && inR(rXD, 0.886, 0.886, fibTol);
      const fly = inR(rAB, 0.786, 0.786, fibTol) && inR(rBC, 0.382, 0.886, fibTol) && inR(rXD, 1.272, 1.618, fibTol);
      const crab = inR(rAB, 0.382, 0.618, fibTol) && inR(rBC, 0.382, 0.886, fibTol) && inR(rXD, 1.618, 1.618, fibTol);
      const cypher = inR(rXC, 0.786, 0.886, fibTol) && inR(rBC, 1.13, 1.414, fibTol) && !isNaN(rCD) && inR(rCD, 1.272, 2.0, fibTol);
      const shark = inR(rXC, 1.13, 1.618, fibTol) && !isNaN(rCD) && inR(rCD, 1.618, 2.24, fibTol);

      if (gartley) setPat(2, 5, base, true);
      else if (bat) setPat(3, 5, base, true);
      else if (fly) setPat(4, 5, base, true);
      else if (crab) setPat(5, 5, base, true);
      else if (cypher) setPat(6, 5, base, true);
      else if (shark) setPat(7, 5, base, true);
    }
  }

  if (shHarm && pivN >= 4) {
    const base = pivN - 4;
    const X = pivPx[base];
    const A = pivPx[base + 1];
    const B = pivPx[base + 2];
    const C = pivPx[base + 3];
    const xa = Math.abs(A - X);
    const ab = Math.abs(B - A);
    const bc = Math.abs(C - B);
    const xc = Math.abs(C - X);
    if (xa > 0.0 && ab > 0.0 && bc > 0.0) {
      const rAB = ab / xa;
      const rBC = bc / ab;
      const rXC = xc / xa;
      const nearG = inR(rAB, 0.618, 0.618, fibTol) && inR(rBC, 0.382, 0.886, fibTol);
      const nearBat = inR(rAB, 0.382, 0.50, fibTol) && inR(rBC, 0.382, 0.886, fibTol);
      const nearFly = inR(rAB, 0.786, 0.786, fibTol) && inR(rBC, 0.382, 0.886, fibTol);
      const nearCrab = inR(rAB, 0.382, 0.618, fibTol) && inR(rBC, 0.382, 0.886, fibTol);
      const nearCy = inR(rXC, 0.786, 0.886, fibTol) && inR(rBC, 1.13, 1.414, fibTol);
      const nearShark = inR(rXC, 1.13, 1.618, fibTol);
      if (nearG || nearBat || nearFly || nearCrab || nearCy || nearShark) {
        if (!patOn || !patDone) {
          let k: i32 = 2;
          if (nearBat) k = 3;
          else if (nearFly) k = 4;
          else if (nearCrab) k = 5;
          else if (nearCy) k = 6;
          else if (nearShark) k = 7;
          setPat(k, 4, base, false);
        }
      }
    }
  }

  if (patOn) {
    patAge += 1;
    if (patAge > keepBars) {
      patOn = false;
      patDone = false;
      patN = 0;
    }
  }

  for (let s = 0; s < 6; s += 1) {
    out_zz_ray_at(s, NaN, NaN, 0.0, 0.0, s, s, 0);
  }
  if (shZz && patOn && patN >= 2) {
    const nLegs = patN - 1 < 6 ? patN - 1 : 6;
    for (let i = 0; i < nLegs; i += 1) {
      out_zz_ray_at(i, patPx[i], patPx[i + 1], patT[i], patT[i + 1], i, i, 1);
    }
  }

  if (shExt && !isNaN(lastHi)) out_ext_hi(lastHi * 1.002);
  else out_ext_hi(NaN);
  if (shExt && !isNaN(lastLo)) out_ext_lo(lastLo * 0.998);
  else out_ext_lo(NaN);

  for (let s = 0; s < 4; s += 1) {
    out_eq_ray_at(s, NaN, NaN, 0.0, 0.0, s, s, 0);
  }
  if (shEq) {
    if (!isNaN(eqUp0Px0) && !isNaN(eqUp0Px1))
      out_eq_ray_at(0, eqUp0Px0, eqUp0Px1, eqUp0T0, eqUp0T1, 0, 0, 1);
    if (!isNaN(eqUp1Px0) && !isNaN(eqUp1Px1))
      out_eq_ray_at(1, eqUp1Px0, eqUp1Px1, eqUp1T0, eqUp1T1, 1, 1, 1);
    if (!isNaN(eqDn0Px0) && !isNaN(eqDn0Px1))
      out_eq_ray_at(2, eqDn0Px0, eqDn0Px1, eqDn0T0, eqDn0T1, 2, 2, 1);
    if (!isNaN(eqDn1Px0) && !isNaN(eqDn1Px1))
      out_eq_ray_at(3, eqDn1Px0, eqDn1Px1, eqDn1T0, eqDn1T1, 3, 3, 1);
  }

  let pocMid = NaN;
  let vah = NaN;
  let val = NaN;
  let pocHalf = NaN;
  if ((shPoc || shVa) && fN >= 8) {
    const n = pocLb < fN ? pocLb : fN;
    let mn = fLo[fCur];
    let mx = fHi[fCur];
    for (let k = 0; k < n; k += 1) {
      const j = (fCur - k + FMAX) % FMAX;
      if (fLo[j] < mn) mn = fLo[j];
      if (fHi[j] > mx) mx = fHi[j];
    }
    if (mx > mn) {
      const bins: i32 = 40;
      let counts = new Array<f64>(40);
      let total: f64 = 0.0;
      for (let b = 0; b < bins; b += 1) counts[b] = 0.0;
      for (let k = 0; k < n; k += 1) {
        const j = (fCur - k + FMAX) % FMAX;
        let bi = i32(((fCl[j] - mn) / (mx - mn)) * f64(bins - 1));
        if (bi < 0) bi = 0;
        if (bi >= bins) bi = bins - 1;
        counts[bi] += fVol[j] > 0.0 ? fVol[j] : 1.0;
        total += fVol[j] > 0.0 ? fVol[j] : 1.0;
      }
      let best: i32 = 0;
      let bestV = counts[0];
      for (let b = 1; b < bins; b += 1) {
        if (counts[b] > bestV) {
          bestV = counts[b];
          best = b;
        }
      }
      const step = (mx - mn) / f64(bins);
      pocMid = mn + (f64(best) + 0.5) * step;
      pocHalf = step * 1.5;

      let need = total * (vaPct / 100.0);
      let acc = counts[best];
      let loB = best;
      let hiB = best;
      while (acc < need && (loB > 0 || hiB < bins - 1)) {
        const left = loB > 0 ? counts[loB - 1] : -1.0;
        const right = hiB < bins - 1 ? counts[hiB + 1] : -1.0;
        if (right >= left) {
          if (hiB < bins - 1) {
            hiB += 1;
            acc += counts[hiB];
          } else if (loB > 0) {
            loB -= 1;
            acc += counts[loB];
          } else break;
        } else {
          if (loB > 0) {
            loB -= 1;
            acc += counts[loB];
          } else if (hiB < bins - 1) {
            hiB += 1;
            acc += counts[hiB];
          } else break;
        }
      }
      val = mn + f64(loB) * step;
      vah = mn + f64(hiB + 1) * step;
    }
  }

  if (shPoc && !isNaN(pocMid) && !isNaN(pocHalf)) {
    out_poc_top(pocMid + pocHalf);
    out_poc_bot(pocMid - pocHalf);
    out_poc_live(1.0);
    out_poc_mid(pocMid);
  } else {
    out_poc_top(NaN);
    out_poc_bot(NaN);
    out_poc_live(0.0);
    out_poc_mid(NaN);
  }

  if (shVa && !isNaN(vah) && !isNaN(val)) {
    out_vah(vah);
    out_val(val);
  } else {
    out_vah(NaN);
    out_val(NaN);
  }

  out_g_a(shHarm && idx == fireA ? 1.0 : 0.0);
  out_g_b(shHarm && idx == fireB ? 1.0 : 0.0);
  out_g_c(shHarm && idx == fireC ? 1.0 : 0.0);
  out_g_d(shHarm && idx == fireD ? 1.0 : 0.0);
  out_g_x(shHarm && idx == fireX ? 1.0 : 0.0);
  out_g_w(shHarm && idx == fireW ? 1.0 : 0.0);
  out_g_y(shHarm && idx == fireY ? 1.0 : 0.0);
  out_g_z(shHarm && idx == fireZ ? 1.0 : 0.0);
  out_g_done(shHarm && idx == fireDone ? 1.0 : 0.0);
  out_g_near(shHarm && idx == fireNear ? 1.0 : 0.0);

  idx += 1;
}
