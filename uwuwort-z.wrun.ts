//@lang=wrun-ts
// UWUWORT-Z — history-safe overlay
// Fixed-endpoint zigzag only on near/confirmed patterns (10% fib tol)
// Letters + pattern name at endpoints. POC / VAH / VAL. Extreme ±0.2%.
// 4 equalizer lines (2 green up / 2 red down). No lower panel.
// No temp arrays in onBar, no Swings kit (manual pivots).

page("Display");
param.bool("show_zz", true, { label: "Pattern zigzag (fixed endpoints)" });
param.bool("show_harm", true, { label: "Harmonics near + confirmed (10% tol)" });
param.bool("show_ext", true, { label: "Extreme ±0.2% (pink high / teal low)" });
param.bool("show_poc", true, { label: "Yellow POC zone + mid" });
param.bool("show_va", true, { label: "VAH pink / VAL teal" });
param.bool("show_eq", true, { label: "Equalizer 2 green up / 2 red down" });

page("Logic");
param.int("swing_len", 3, { min: 2, max: 15, label: "Swing length each side" });
param.number("fib_tol", 0.10, { min: 0.02, max: 0.25, step: 0.01, label: "Fib tolerance (0.10 = 10%)", when: "show_harm" });
param.int("poc_lb", 96, { min: 16, max: 300, label: "POC / VA lookback", when: "show_poc" });
param.number("va_pct", 70, { min: 50, max: 90, step: 1, label: "Value Area %", when: "show_va" });
param.int("keep_bars", 200, { min: 40, max: 500, label: "Keep pattern bars" });

plot.rays({
  name: "zz",
  slots: 5,
  colors: ["#a78bfa", "#c4b5fd", "#a78bfa", "#c4b5fd", "#a78bfa"],
  width: 2,
  line_style: "solid",
  opacity: 0.95,
  words: ["leg1", "leg2", "leg3", "leg4", "leg5"],
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
output("poc_mid", line, overlay, { color: "#facc15", width: 2, description: "POC mid" });
output("vah", line, overlay, { color: "#ff2bd6", width: 1, line_style: "dashed", description: "VAH" });
output("val", line, overlay, { color: "#00ffd5", width: 1, line_style: "dashed", description: "VAL" });

const gA = output("g_a", none);
const gB = output("g_b", none);
const gC = output("g_c", none);
const gD = output("g_d", none);
const gX = output("g_x", none);
const gDone = output("g_done", none);
const gNear = output("g_near", none);
const gName = output("g_name", none);

output("lab_a", shape, overlay, { color: "#e879f9", shape_where: "g_a", shape: "char", char: "A", location: "above_bar", glow: 8, description: "A" });
output("lab_b", shape, overlay, { color: "#e879f9", shape_where: "g_b", shape: "char", char: "B", location: "below_bar", glow: 8, description: "B" });
output("lab_c", shape, overlay, { color: "#e879f9", shape_where: "g_c", shape: "char", char: "C", location: "above_bar", glow: 8, description: "C" });
output("lab_d", shape, overlay, { color: "#e879f9", shape_where: "g_d", shape: "char", char: "D", location: "below_bar", glow: 8, description: "D" });
output("lab_x", shape, overlay, { color: "#38bdf8", shape_where: "g_x", shape: "char", char: "X", location: "above_bar", glow: 8, description: "X" });
output("done", shape, overlay, { color: "#a855f7", shape_where: "g_done", shape: "circle", location: "above_bar", glow: 18, description: "CONFIRMED" });
output("near", shape, overlay, { color: "#c4b5fd", shape_where: "g_near", shape: "circle", location: "below_bar", glow: 10, description: "NEAR" });
output("pname", shape, overlay, { color: "#fbbf24", shape_where: "g_name", shape: "diamond", location: "above_bar", glow: 12, description: "Pattern" });

let rh0: f64 = NaN; let rh1: f64 = NaN; let rh2: f64 = NaN; let rh3: f64 = NaN;
let rh4: f64 = NaN; let rh5: f64 = NaN; let rh6: f64 = NaN; let rh7: f64 = NaN;
let rl0: f64 = NaN; let rl1: f64 = NaN; let rl2: f64 = NaN; let rl3: f64 = NaN;
let rl4: f64 = NaN; let rl5: f64 = NaN; let rl6: f64 = NaN; let rl7: f64 = NaN;

let typSum: f64 = 0.0;
let typN: i32 = 0;
let hiSum: f64 = 0.0;
let loSum: f64 = 0.0;

let p0px: f64 = NaN; let p0t: f64 = 0.0; let p0i: i32 = 0; let p0k: i32 = 0;
let p1px: f64 = NaN; let p1t: f64 = 0.0; let p1i: i32 = 0; let p1k: i32 = 0;
let p2px: f64 = NaN; let p2t: f64 = 0.0; let p2i: i32 = 0; let p2k: i32 = 0;
let p3px: f64 = NaN; let p3t: f64 = 0.0; let p3i: i32 = 0; let p3k: i32 = 0;
let p4px: f64 = NaN; let p4t: f64 = 0.0; let p4i: i32 = 0; let p4k: i32 = 0;
let p5px: f64 = NaN; let p5t: f64 = 0.0; let p5i: i32 = 0; let p5k: i32 = 0;
let pivN: i32 = 0;

let a0px: f64 = NaN; let a0t: f64 = 0.0; let a0i: i32 = -1;
let a1px: f64 = NaN; let a1t: f64 = 0.0; let a1i: i32 = -1;
let a2px: f64 = NaN; let a2t: f64 = 0.0; let a2i: i32 = -1;
let a3px: f64 = NaN; let a3t: f64 = 0.0; let a3i: i32 = -1;
let a4px: f64 = NaN; let a4t: f64 = 0.0; let a4i: i32 = -1;
let patN: i32 = 0;
let patOn: bool = false;
let patDone: bool = false;
let patAge: i32 = 0;
let patKind: i32 = 0;

let lastHi: f64 = NaN;
let lastLo: f64 = NaN;

let loA: f64 = NaN; let loAT: f64 = 0.0;
let loB: f64 = NaN; let loBT: f64 = 0.0;
let hiA: f64 = NaN; let hiAT: f64 = 0.0;
let hiB: f64 = NaN; let hiBT: f64 = 0.0;
let eqU0a: f64 = NaN; let eqU0at: f64 = 0.0; let eqU0b: f64 = NaN; let eqU0bt: f64 = 0.0;
let eqU1a: f64 = NaN; let eqU1at: f64 = 0.0; let eqU1b: f64 = NaN; let eqU1bt: f64 = 0.0;
let eqD0a: f64 = NaN; let eqD0at: f64 = 0.0; let eqD0b: f64 = NaN; let eqD0bt: f64 = 0.0;
let eqD1a: f64 = NaN; let eqD1at: f64 = 0.0; let eqD1b: f64 = NaN; let eqD1bt: f64 = 0.0;

let idx: i32 = 0;
let right: i32 = 3;
let fibTol: f64 = 0.10;
let pocLb: i32 = 96;
let vaPct: f64 = 70.0;
let keepBars: i32 = 200;

let sh0: f64 = NaN; let sh1: f64 = NaN; let sh2: f64 = NaN; let sh3: f64 = NaN;
let sh4: f64 = NaN; let sh5: f64 = NaN; let sh6: f64 = NaN;
let sl0: f64 = NaN; let sl1: f64 = NaN; let sl2: f64 = NaN; let sl3: f64 = NaN;
let sl4: f64 = NaN; let sl5: f64 = NaN; let sl6: f64 = NaN;
let swN: i32 = 0;

function inR(x: f64, a: f64, b: f64, tol: f64): bool {
  const lo = a < b ? a : b;
  const hi = a < b ? b : a;
  return x >= lo * (1.0 - tol) && x <= hi * (1.0 + tol);
}

function pushPivot(px: f64, t: f64, kind: i32): void {
  p0px = p1px; p0t = p1t; p0i = p1i; p0k = p1k;
  p1px = p2px; p1t = p2t; p1i = p2i; p1k = p2k;
  p2px = p3px; p2t = p3t; p2i = p3i; p2k = p3k;
  p3px = p4px; p3t = p4t; p3i = p4i; p3k = p4k;
  p4px = p5px; p4t = p5t; p4i = p5i; p4k = p5k;
  p5px = px; p5t = t; p5i = idx - right; p5k = kind;
  if (pivN < 6) pivN += 1;
}

function setPat(kind: i32, nPts: i32, done: bool): void {
  patOn = true;
  patDone = done;
  patAge = 0;
  patKind = kind;
  patN = nPts;
  a0px = NaN; a1px = NaN; a2px = NaN; a3px = NaN; a4px = NaN;
  a0i = -1; a1i = -1; a2i = -1; a3i = -1; a4i = -1;
  if (nPts == 5 && pivN >= 5) {
    if (pivN >= 6) {
      a0px = p1px; a0t = p1t; a0i = p1i;
      a1px = p2px; a1t = p2t; a1i = p2i;
      a2px = p3px; a2t = p3t; a2i = p3i;
      a3px = p4px; a3t = p4t; a3i = p4i;
      a4px = p5px; a4t = p5t; a4i = p5i;
    } else {
      a0px = p0px; a0t = p0t; a0i = p0i;
      a1px = p1px; a1t = p1t; a1i = p1i;
      a2px = p2px; a2t = p2t; a2i = p2i;
      a3px = p3px; a3t = p3t; a3i = p3i;
      a4px = p4px; a4t = p4t; a4i = p4i;
    }
  } else if (nPts == 4 && pivN >= 4) {
    if (pivN >= 6) {
      a0px = p2px; a0t = p2t; a0i = p2i;
      a1px = p3px; a1t = p3t; a1i = p3i;
      a2px = p4px; a2t = p4t; a2i = p4i;
      a3px = p5px; a3t = p5t; a3i = p5i;
    } else if (pivN == 5) {
      a0px = p1px; a0t = p1t; a0i = p1i;
      a1px = p2px; a1t = p2t; a1i = p2i;
      a2px = p3px; a2t = p3t; a2i = p3i;
      a3px = p4px; a3t = p4t; a3i = p4i;
    } else {
      a0px = p0px; a0t = p0t; a0i = p0i;
      a1px = p1px; a1t = p1t; a1i = p1i;
      a2px = p2px; a2t = p2t; a2i = p2i;
      a3px = p3px; a3t = p3t; a3i = p3i;
    }
  } else if (nPts == 3 && pivN >= 3) {
    if (pivN >= 6) {
      a0px = p3px; a0t = p3t; a0i = p3i;
      a1px = p4px; a1t = p4t; a1i = p4i;
      a2px = p5px; a2t = p5t; a2i = p5i;
    } else if (pivN == 5) {
      a0px = p2px; a0t = p2t; a0i = p2i;
      a1px = p3px; a1t = p3t; a1i = p3i;
      a2px = p4px; a2t = p4t; a2i = p4i;
    } else if (pivN == 4) {
      a0px = p1px; a0t = p1t; a0i = p1i;
      a1px = p2px; a1t = p2t; a1i = p2i;
      a2px = p3px; a2t = p3t; a2i = p3i;
    } else {
      a0px = p0px; a0t = p0t; a0i = p0i;
      a1px = p1px; a1t = p1t; a1i = p1i;
      a2px = p2px; a2t = p2t; a2i = p2i;
    }
  }
}

function onStart(): void {
  right = i32(p_swing_len());
  if (right > 3) right = 3;
  fibTol = p_fib_tol();
  pocLb = i32(p_poc_lb());
  vaPct = p_va_pct();
  keepBars = i32(p_keep_bars());
  pivN = 0;
  idx = 0;
  swN = 0;
  typSum = 0.0; typN = 0; hiSum = 0.0; loSum = 0.0;
  lastHi = NaN; lastLo = NaN;
  patOn = false; patDone = false; patN = 0; patAge = 0;
  loA = NaN; loB = NaN; hiA = NaN; hiB = NaN;
  eqU0a = NaN; eqU0b = NaN; eqU1a = NaN; eqU1b = NaN;
  eqD0a = NaN; eqD0b = NaN; eqD1a = NaN; eqD1b = NaN;
}

function onBar(): void {
  const h = bar.high();
  const l = bar.low();
  const c = bar.close();
  const t = bar.time();

  const shZz = pb_show_zz();
  const shHarm = pb_show_harm();
  const shExt = pb_show_ext();
  const shPoc = pb_show_poc();
  const shVa = pb_show_va();
  const shEq = pb_show_eq();

  sh6 = sh5; sh5 = sh4; sh4 = sh3; sh3 = sh2; sh2 = sh1; sh1 = sh0; sh0 = h;
  sl6 = sl5; sl5 = sl4; sl4 = sl3; sl3 = sl2; sl2 = sl1; sl1 = sl0; sl0 = l;
  if (swN < 7) swN += 1;

  const typ = (h + l + c) / 3.0;
  typSum += typ;
  hiSum += h;
  loSum += l;
  typN += 1;
  if (typN > pocLb) {
    const k = f64(pocLb) / f64(typN);
    typSum *= k;
    hiSum *= k;
    loSum *= k;
    typN = pocLb;
  }

  if (swN >= right * 2 + 1 && right == 3) {
    const cH = sh3;
    const cL = sl3;
    let isHi = cH >= sh0 && cH >= sh1 && cH >= sh2 && cH >= sh4 && cH >= sh5 && cH >= sh6;
    let isLo = cL <= sl0 && cL <= sl1 && cL <= sl2 && cL <= sl4 && cL <= sl5 && cL <= sl6;
    if (isHi && cH > sh2 && cH > sh4) {
      lastHi = cH;
      pushPivot(cH, t, 1);
      if (!isNaN(hiB) && !isNaN(hiA) && cH < hiB) {
        eqD1a = hiA; eqD1at = hiAT; eqD1b = hiB; eqD1bt = hiBT;
      }
      if (!isNaN(hiB) && cH < hiB) {
        eqD0a = hiB; eqD0at = hiBT; eqD0b = cH; eqD0bt = t;
      }
      hiA = hiB; hiAT = hiBT;
      hiB = cH; hiBT = t;
    }
    if (isLo && cL < sl2 && cL < sl4) {
      lastLo = cL;
      pushPivot(cL, t, -1);
      if (!isNaN(loB) && !isNaN(loA) && cL > loB) {
        eqU1a = loA; eqU1at = loAT; eqU1b = loB; eqU1bt = loBT;
      }
      if (!isNaN(loB) && cL > loB) {
        eqU0a = loB; eqU0at = loBT; eqU0b = cL; eqU0bt = t;
      }
      loA = loB; loAT = loBT;
      loB = cL; loBT = t;
    }
  }

  if (shHarm && pivN >= 4) {
    let A = p2px; let B = p3px; let C = p4px; let D = p5px;
    if (pivN == 4) { A = p0px; B = p1px; C = p2px; D = p3px; }
    else if (pivN == 5) { A = p1px; B = p2px; C = p3px; D = p4px; }
    const ab = Math.abs(B - A);
    const bc = Math.abs(C - B);
    const cd = Math.abs(D - C);
    if (ab > 0.0 && bc > 0.0 && cd > 0.0) {
      const rBC = bc / ab;
      const rCD = cd / ab;
      const rYZ = cd / bc;
      if (inR(rBC, 0.382, 0.886, fibTol) && inR(rCD, 0.90, 1.272, fibTol)) setPat(1, 4, true);
      else if (inR(rBC, 0.382, 1.272, fibTol) && inR(rYZ, 0.618, 1.618, fibTol)) setPat(8, 4, true);
    }
  }

  if (shHarm && pivN >= 5) {
    let X = p1px; let A = p2px; let B = p3px; let C = p4px; let D = p5px;
    if (pivN == 5) { X = p0px; A = p1px; B = p2px; C = p3px; D = p4px; }
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
      if (inR(rAB, 0.618, 0.618, fibTol) && inR(rBC, 0.382, 0.886, fibTol) && inR(rXD, 0.786, 0.786, fibTol)) setPat(2, 5, true);
      else if (inR(rAB, 0.382, 0.50, fibTol) && inR(rBC, 0.382, 0.886, fibTol) && inR(rXD, 0.886, 0.886, fibTol)) setPat(3, 5, true);
      else if (inR(rAB, 0.786, 0.786, fibTol) && inR(rBC, 0.382, 0.886, fibTol) && inR(rXD, 1.272, 1.618, fibTol)) setPat(4, 5, true);
      else if (inR(rAB, 0.382, 0.618, fibTol) && inR(rBC, 0.382, 0.886, fibTol) && inR(rXD, 1.618, 1.618, fibTol)) setPat(5, 5, true);
      else if (inR(rXC, 0.786, 0.886, fibTol) && inR(rBC, 1.13, 1.414, fibTol) && !isNaN(rCD) && inR(rCD, 1.272, 2.0, fibTol)) setPat(6, 5, true);
      else if (inR(rXC, 1.13, 1.618, fibTol) && !isNaN(rCD) && inR(rCD, 1.618, 2.24, fibTol)) setPat(7, 5, true);
    }
  }

  if (shHarm && pivN >= 4 && (!patOn || !patDone)) {
    let X = p2px; let A = p3px; let B = p4px; let C = p5px;
    if (pivN == 4) { X = p0px; A = p1px; B = p2px; C = p3px; }
    else if (pivN == 5) { X = p1px; A = p2px; B = p3px; C = p4px; }
    const xa = Math.abs(A - X);
    const ab = Math.abs(B - A);
    const bc = Math.abs(C - B);
    const xc = Math.abs(C - X);
    if (xa > 0.0 && ab > 0.0 && bc > 0.0) {
      const rAB = ab / xa;
      const rBC = bc / ab;
      const rXC = xc / xa;
      if (inR(rAB, 0.618, 0.618, fibTol) && inR(rBC, 0.382, 0.886, fibTol)) setPat(2, 4, false);
      else if (inR(rAB, 0.382, 0.50, fibTol) && inR(rBC, 0.382, 0.886, fibTol)) setPat(3, 4, false);
      else if (inR(rAB, 0.786, 0.786, fibTol) && inR(rBC, 0.382, 0.886, fibTol)) setPat(4, 4, false);
      else if (inR(rAB, 0.382, 0.618, fibTol) && inR(rBC, 0.382, 0.886, fibTol)) setPat(5, 4, false);
      else if (inR(rXC, 0.786, 0.886, fibTol) && inR(rBC, 1.13, 1.414, fibTol)) setPat(6, 4, false);
      else if (inR(rXC, 1.13, 1.618, fibTol)) setPat(7, 4, false);
      else if (inR(rBC, 0.382, 0.886, fibTol)) setPat(1, 3, false);
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

  for (let s = 0; s < 5; s += 1) {
    out_zz_ray_at(s, NaN, NaN, 0.0, 0.0, s, s, 0);
  }
  if (shZz && patOn && patN >= 2) {
    if (patN >= 2 && !isNaN(a0px) && !isNaN(a1px))
      out_zz_ray_at(0, a0px, a1px, a0t, a1t, 0, 0, 1);
    if (patN >= 3 && !isNaN(a1px) && !isNaN(a2px))
      out_zz_ray_at(1, a1px, a2px, a1t, a2t, 1, 1, 1);
    if (patN >= 4 && !isNaN(a2px) && !isNaN(a3px))
      out_zz_ray_at(2, a2px, a3px, a2t, a3t, 2, 2, 1);
    if (patN >= 5 && !isNaN(a3px) && !isNaN(a4px))
      out_zz_ray_at(3, a3px, a4px, a3t, a4t, 3, 3, 1);
  }

  let showA = false; let showB = false; let showC = false; let showD = false; let showX = false;
  let showDone = false; let showNear = false; let showName = false;
  if (shHarm && patOn) {
    if (patN == 5) {
      if (idx == a0i + right) showX = true;
      if (idx == a1i + right) showA = true;
      if (idx == a2i + right) showB = true;
      if (idx == a3i + right) showC = true;
      if (idx == a4i + right) { showD = true; showName = true; if (patDone) showDone = true; else showNear = true; }
    } else if (patN == 4) {
      if (idx == a0i + right) showA = true;
      if (idx == a1i + right) showB = true;
      if (idx == a2i + right) showC = true;
      if (idx == a3i + right) { showD = true; showName = true; if (patDone) showDone = true; else showNear = true; }
    } else if (patN == 3) {
      if (idx == a0i + right) showA = true;
      if (idx == a1i + right) showB = true;
      if (idx == a2i + right) { showC = true; showName = true; showNear = true; }
    }
  }
  out_g_a(showA ? 1.0 : 0.0);
  out_g_b(showB ? 1.0 : 0.0);
  out_g_c(showC ? 1.0 : 0.0);
  out_g_d(showD ? 1.0 : 0.0);
  out_g_x(showX ? 1.0 : 0.0);
  out_g_done(showDone ? 1.0 : 0.0);
  out_g_near(showNear ? 1.0 : 0.0);
  out_g_name(showName ? 1.0 : 0.0);

  if (shExt && !isNaN(lastHi)) out_ext_hi(lastHi * 1.002); else out_ext_hi(NaN);
  if (shExt && !isNaN(lastLo)) out_ext_lo(lastLo * 0.998); else out_ext_lo(NaN);

  for (let s = 0; s < 4; s += 1) out_eq_ray_at(s, NaN, NaN, 0.0, 0.0, s, s, 0);
  if (shEq) {
    if (!isNaN(eqU0a) && !isNaN(eqU0b)) out_eq_ray_at(0, eqU0a, eqU0b, eqU0at, eqU0bt, 0, 0, 1);
    if (!isNaN(eqU1a) && !isNaN(eqU1b)) out_eq_ray_at(1, eqU1a, eqU1b, eqU1at, eqU1bt, 1, 1, 1);
    if (!isNaN(eqD0a) && !isNaN(eqD0b)) out_eq_ray_at(2, eqD0a, eqD0b, eqD0at, eqD0bt, 2, 2, 1);
    if (!isNaN(eqD1a) && !isNaN(eqD1b)) out_eq_ray_at(3, eqD1a, eqD1b, eqD1at, eqD1bt, 3, 3, 1);
  }

  if ((shPoc || shVa) && typN >= 8) {
    const mid = typSum / f64(typN);
    const avgH = hiSum / f64(typN);
    const avgL = loSum / f64(typN);
    const half = (avgH - avgL) * 0.15;
    if (shPoc) {
      out_poc_top(mid + half);
      out_poc_bot(mid - half);
      out_poc_live(1.0);
      out_poc_mid(mid);
    } else {
      out_poc_top(NaN); out_poc_bot(NaN); out_poc_live(0.0); out_poc_mid(NaN);
    }
    const vaHalf = (avgH - avgL) * (vaPct / 200.0);
    if (shVa) {
      out_vah(mid + vaHalf);
      out_val(mid - vaHalf);
    } else {
      out_vah(NaN); out_val(NaN);
    }
  } else {
    out_poc_top(NaN); out_poc_bot(NaN); out_poc_live(0.0); out_poc_mid(NaN);
    out_vah(NaN); out_val(NaN);
  }

  idx += 1;
}
