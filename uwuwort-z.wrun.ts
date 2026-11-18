//@lang=wrun-ts
// UWUWORT-Z — single overlay: zigzag + ABCD/WXYZ/harmonics (10% fib tol),
// letters at swings, purple done-circle, extreme levels ±0.2%,
// chart-TF POC (yellow) + mid, VAH (pink) / VAL (teal). No lower panel.

page("Display");
param.bool("show_zz", true, { label: "Zigzag lines + swing letters" });
param.bool("show_harm", true, { label: "ABCD / WXYZ / harmonics (10% tol)" });
param.bool("show_ext", true, { label: "Extreme levels ±0.2% (pink high / teal low)" });
param.bool("show_poc", true, { label: "Yellow POC zone + mid" });
param.bool("show_va", true, { label: "Value Area High (pink) / Low (teal)" });

page("Logic");
param.int("swing_len", 3, { min: 2, max: 20, label: "Swing length (bars each side)" });
param.number("fib_tol", 0.10, { min: 0.02, max: 0.25, step: 0.01, label: "Fib ratio tolerance (0.10 = 10%)", when: "show_harm" });
param.int("poc_lb", 96, { min: 16, max: 400, label: "POC / Value Area lookback bars", when: "show_poc" });
param.number("va_pct", 70, { min: 50, max: 90, step: 1, label: "Value Area volume %", when: "show_va" });

plot.rays({
  name: "zz",
  slots: 8,
  colors: ["#a78bfa", "#c4b5fd", "#a78bfa", "#c4b5fd", "#a78bfa", "#c4b5fd", "#a78bfa", "#c4b5fd"],
  width: 1.5,
  line_style: "solid",
  opacity: 0.95,
  words: ["ZZ1", "ZZ2", "ZZ3", "ZZ4", "ZZ5", "ZZ6", "ZZ7", "ZZ8"],
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
const gW = output("g_w", none);
const gX = output("g_x", none);
const gY = output("g_y", none);
const gZ = output("g_z", none);
const gDone = output("g_done", none);

output("lab_a", shape, overlay, { color: "#e879f9", shape_where: "g_a", shape: "char", location: "above_bar", glow: 6, description: "A" });
output("lab_b", shape, overlay, { color: "#e879f9", shape_where: "g_b", shape: "char", location: "below_bar", glow: 6, description: "B" });
output("lab_c", shape, overlay, { color: "#e879f9", shape_where: "g_c", shape: "char", location: "above_bar", glow: 6, description: "C" });
output("lab_d", shape, overlay, { color: "#e879f9", shape_where: "g_d", shape: "char", location: "below_bar", glow: 6, description: "D" });
output("lab_w", shape, overlay, { color: "#38bdf8", shape_where: "g_w", shape: "char", location: "above_bar", glow: 6, description: "W" });
output("lab_x", shape, overlay, { color: "#38bdf8", shape_where: "g_x", shape: "char", location: "below_bar", glow: 6, description: "X" });
output("lab_y", shape, overlay, { color: "#38bdf8", shape_where: "g_y", shape: "char", location: "above_bar", glow: 6, description: "Y" });
output("lab_z", shape, overlay, { color: "#38bdf8", shape_where: "g_z", shape: "char", location: "below_bar", glow: 6, description: "Z" });
output("done", shape, overlay, { color: "#a855f7", shape_where: "g_done", shape: "circle", location: "above_bar", glow: 18, description: "Pattern complete" });

const PMAX: i32 = 16;
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

let idx: i32 = 0;
let lastHi: f64 = NaN;
let lastLo: f64 = NaN;

let fireA: i32 = -1;
let fireB: i32 = -1;
let fireC: i32 = -1;
let fireD: i32 = -1;
let fireW: i32 = -1;
let fireX: i32 = -1;
let fireY: i32 = -1;
let fireZ: i32 = -1;
let fireDone: i32 = -1;

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

function onStart(): void {
  right = i32(p_swing_len());
  sw = new Swings(right, right);
  fibTol = p_fib_tol();
  pocLb = i32(p_poc_lb());
  vaPct = p_va_pct();
  pivN = 0;
  fN = 0;
  fCur = 0;
  idx = 0;
  lastHi = NaN;
  lastLo = NaN;
  fireA = -1; fireB = -1; fireC = -1; fireD = -1;
  fireW = -1; fireX = -1; fireY = -1; fireZ = -1;
  fireDone = -1;
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

  fCur = (fCur + 1) % FMAX;
  fHi[fCur] = h;
  fLo[fCur] = l;
  fCl[fCur] = c;
  fVol[fCur] = v;
  if (fN < FMAX) fN += 1;

  sw.update(h, l);
  if (sw.newHigh()) {
    const px = sw.lastHigh();
    lastHi = px;
    pushPivot(px, t, 1);
  }
  if (sw.newLow()) {
    const px = sw.lastLow();
    lastLo = px;
    pushPivot(px, t, -1);
  }

  for (let s = 0; s < 8; s += 1) {
    out_zz_ray_at(s, NaN, NaN, 0.0, 0.0, s, s, 0);
  }
  if (shZz && pivN >= 2) {
    const nLegs = pivN - 1 < 8 ? pivN - 1 : 8;
    const start = pivN - 1 - nLegs;
    for (let i = 0; i < nLegs; i += 1) {
      const a = start + i;
      const b = a + 1;
      out_zz_ray_at(i, pivPx[a], pivPx[b], pivT[a], pivT[b], i, i, 1);
    }
  }

  if (shExt && !isNaN(lastHi)) {
    out_ext_hi(lastHi * 1.002);
  } else {
    out_ext_hi(NaN);
  }
  if (shExt && !isNaN(lastLo)) {
    out_ext_lo(lastLo * 0.998);
  } else {
    out_ext_lo(NaN);
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
          } else {
            break;
          }
        } else {
          if (loB > 0) {
            loB -= 1;
            acc += counts[loB];
          } else if (hiB < bins - 1) {
            hiB += 1;
            acc += counts[hiB];
          } else {
            break;
          }
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

  let showA = false;
  let showB = false;
  let showC = false;
  let showD = false;
  let showW = false;
  let showX = false;
  let showY = false;
  let showZ = false;
  let showDone = false;

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
      const abcdOk = inR(rBC, 0.382, 0.886, fibTol) && inR(rCD, 0.90, 1.272, fibTol);
      const rYZ = cd / bc;
      const wxyOk = inR(rBC, 0.382, 1.272, fibTol) && inR(rYZ, 0.618, 1.618, fibTol);

      if (abcdOk || wxyOk) {
        const confBar = pivIdx[i0 + 3] + right;
        if (idx == confBar) {
          fireA = pivIdx[i0] + right;
          fireB = pivIdx[i0 + 1] + right;
          fireC = pivIdx[i0 + 2] + right;
          fireD = pivIdx[i0 + 3] + right;
          fireDone = confBar;
          if (wxyOk && !abcdOk) {
            fireW = fireA;
            fireX = fireB;
            fireY = fireC;
            fireZ = fireD;
            fireA = -1;
            fireB = -1;
            fireC = -1;
            fireD = -1;
          }
        }
      }
    }
  }

  if (shHarm && pivN >= 5) {
    const X = pivPx[pivN - 5];
    const A = pivPx[pivN - 4];
    const B = pivPx[pivN - 3];
    const C = pivPx[pivN - 2];
    const D = pivPx[pivN - 1];
    const xa = Math.abs(A - X);
    const ab = Math.abs(B - A);
    const bc = Math.abs(C - B);
    const xd = Math.abs(D - X);
    if (xa > 0.0 && ab > 0.0 && bc > 0.0) {
      const rAB = ab / xa;
      const rBC = bc / ab;
      const rXD = xd / xa;
      const bat = inR(rAB, 0.382, 0.50, fibTol) && inR(rBC, 0.382, 0.886, fibTol) && inR(rXD, 0.786, 0.986, fibTol);
      const fly = inR(rAB, 0.786, 0.886, fibTol) && inR(rBC, 0.382, 0.886, fibTol) && inR(rXD, 1.272, 1.618, fibTol);
      if (bat || fly) {
        const confBar = pivIdx[pivN - 1] + right;
        if (idx == confBar) {
          fireA = pivIdx[pivN - 4] + right;
          fireB = pivIdx[pivN - 3] + right;
          fireC = pivIdx[pivN - 2] + right;
          fireD = pivIdx[pivN - 1] + right;
          fireDone = confBar;
        }
      }
    }
  }

  if (idx == fireA) showA = true;
  if (idx == fireB) showB = true;
  if (idx == fireC) showC = true;
  if (idx == fireD) showD = true;
  if (idx == fireW) showW = true;
  if (idx == fireX) showX = true;
  if (idx == fireY) showY = true;
  if (idx == fireZ) showZ = true;
  if (idx == fireDone) showDone = true;

  out_g_a(shHarm && showA ? 1.0 : 0.0);
  out_g_b(shHarm && showB ? 1.0 : 0.0);
  out_g_c(shHarm && showC ? 1.0 : 0.0);
  out_g_d(shHarm && showD ? 1.0 : 0.0);
  out_g_w(shHarm && showW ? 1.0 : 0.0);
  out_g_x(shHarm && showX ? 1.0 : 0.0);
  out_g_y(shHarm && showY ? 1.0 : 0.0);
  out_g_z(shHarm && showZ ? 1.0 : 0.0);
  out_g_done(shHarm && showDone ? 1.0 : 0.0);

  idx += 1;
}
