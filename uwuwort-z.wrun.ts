//@lang=wrun-ts
// UWUWORT-Z — kit-based (Ema + Swings) like working TORDAO scripts
// Harmonics near/confirmed 10% fib, fixed-endpoint zigzag
// EMA 21/100/144/360/667/800; red box @360 touch, green @800 touch
// POC mid, VAH/VAL, extremes ±0.2%, equalizer lines

page("Display");
param.bool("show_zz", true, { label: "Pattern zigzag" });
param.bool("show_harm", true, { label: "Harmonics 10% tol" });
param.bool("show_ext", true, { label: "Extreme ±0.2%" });
param.bool("show_poc", true, { label: "POC mid" });
param.bool("show_va", true, { label: "VAH / VAL" });
param.bool("show_eq", true, { label: "Equalizer 2G / 2R" });
param.bool("show_ema", true, { label: "EMA ribbon" });
param.bool("show_ema_box", true, { label: "Boxes red@360 green@800" });

page("Logic");
param.int("swing_len", 3, { min: 2, max: 12, label: "Swing length each side" });
param.number("fib_tol", 0.10, { min: 0.02, max: 0.25, step: 0.01, label: "Fib tol", when: "show_harm" });
param.int("poc_lb", 96, { min: 16, max: 300, label: "POC lookback", when: "show_poc" });
param.number("va_pct", 70, { min: 50, max: 90, step: 1, label: "VA %", when: "show_va" });
param.int("keep_bars", 200, { min: 40, max: 500, label: "Keep pattern bars" });

plot.rays({
  name: "zz", slots: 4,
  colors: ["#a78bfa", "#c4b5fd", "#a78bfa", "#c4b5fd"],
  width: 2, line_style: "solid", opacity: 0.95,
  words: ["leg1", "leg2", "leg3", "leg4"], tooltip: "{{word}}", panel: "overlay"
});
plot.rays({
  name: "eq", slots: 4,
  colors: ["#22c55e", "#4ade80", "#ef4444", "#f87171"],
  width: 1.5, line_style: "solid", opacity: 0.9,
  words: ["EQ up 1", "EQ up 2", "EQ down 1", "EQ down 2"], tooltip: "{{word}}", panel: "overlay"
});

output("ext_hi", line, overlay, { color: "#ff2bd6", width: 2, description: "High +0.2%" });
output("ext_lo", line, overlay, { color: "#00ffd5", width: 2, description: "Low -0.2%" });

output("ema21", line, overlay, { color: "#fde047", width: 1, description: "EMA 21" });
output("ema100", line, overlay, { color: "#94a3b8", width: 1, description: "EMA 100" });
output("ema144", line, overlay, { color: "#a78bfa", width: 1, description: "EMA 144" });
output("ema360", line, overlay, { color: "#f97316", width: 2, description: "EMA 360" });
output("ema667", line, overlay, { color: "#38bdf8", width: 1, description: "EMA 667" });
output("ema800", line, overlay, { color: "#22c55e", width: 2, description: "EMA 800" });

output("poc_mid", line, overlay, { color: "#facc15", width: 2, description: "POC mid" });
output("vah", line, overlay, { color: "#ff2bd6", width: 1, line_style: "dashed", description: "VAH" });
output("val", line, overlay, { color: "#00ffd5", width: 1, line_style: "dashed", description: "VAL" });

const b360t = output("b360_t", none);
const b360b = output("b360_b", none);
const b360l = output("b360_l", none);
box("ema360_touch", {
  top: b360t, bottom: b360b, when: b360l,
  color: "#ef4444", opacity: 0.35, borderColor: "#ef4444", borderWidth: 1, z: 3
});
const b800t = output("b800_t", none);
const b800b = output("b800_b", none);
const b800l = output("b800_l", none);
box("ema800_touch", {
  top: b800t, bottom: b800b, when: b800l,
  color: "#22c55e", opacity: 0.35, borderColor: "#22c55e", borderWidth: 1, z: 3
});

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

let sw = new Swings(3, 3);
let e21 = new Ema(21);
let e100 = new Ema(100);
let e144 = new Ema(144);
let e360 = new Ema(360);
let e667 = new Ema(667);
let e800 = new Ema(800);

let right: i32 = 3;
let fibTol: f64 = 0.10;
let pocLb: i32 = 96;
let vaPct: f64 = 70.0;
let keepBars: i32 = 200;
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
let patOn: bool = false;
let patDone: bool = false;
let patAge: i32 = 0;

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

let typSum: f64 = 0.0;
let typN: i32 = 0;
let hiSum: f64 = 0.0;
let loSum: f64 = 0.0;

function inR(x: f64, a: f64, b: f64, tol: f64): bool {
  const lo = a < b ? a : b;
  const hi = a < b ? b : a;
  return x >= lo * (1.0 - tol) && x <= hi * (1.0 + tol);
}

function onStart(): void {
  right = i32(p_swing_len());
  if (right < 2) right = 2;
  if (right > 12) right = 12;
  sw = new Swings(right, right);
  e21 = new Ema(21);
  e100 = new Ema(100);
  e144 = new Ema(144);
  e360 = new Ema(360);
  e667 = new Ema(667);
  e800 = new Ema(800);
  fibTol = p_fib_tol();
  pocLb = i32(p_poc_lb());
  vaPct = p_va_pct();
  keepBars = i32(p_keep_bars());
  pivN = 0;
  idx = 0;
  typSum = 0.0; typN = 0; hiSum = 0.0; loSum = 0.0;
  lastHi = NaN; lastLo = NaN;
  patOn = false; patDone = false; patN = 0; patAge = 0;
  loA = NaN; loB = NaN; hiA = NaN; hiB = NaN;
  eqU0a = NaN; eqU0b = NaN; eqU1a = NaN; eqU1b = NaN;
  eqD0a = NaN; eqD0b = NaN; eqD1a = NaN; eqD1b = NaN;
  p0px = NaN; p1px = NaN; p2px = NaN; p3px = NaN; p4px = NaN; p5px = NaN;
  a0px = NaN; a1px = NaN; a2px = NaN; a3px = NaN; a4px = NaN;
  a0i = -1; a1i = -1; a2i = -1; a3i = -1; a4i = -1;
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
  const shEma = pb_show_ema();
  const shBox = pb_show_ema_box();

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

  if (shBox && !isNaN(v360) && l <= v360 && h >= v360) {
    const band = Math.abs(v360) * 0.001;
    out_b360_t(v360 + band);
    out_b360_b(v360 - band);
    out_b360_l(1.0);
  } else {
    out_b360_t(NaN); out_b360_b(NaN); out_b360_l(0.0);
  }
  if (shBox && !isNaN(v800) && l <= v800 && h >= v800) {
    const band = Math.abs(v800) * 0.001;
    out_b800_t(v800 + band);
    out_b800_b(v800 - band);
    out_b800_l(1.0);
  } else {
    out_b800_t(NaN); out_b800_b(NaN); out_b800_l(0.0);
  }

  sw.update(h, l);
  if (sw.newHigh()) {
    const px = sw.lastHigh();
    lastHi = px;
    p0px = p1px; p0t = p1t; p0i = p1i;
    p1px = p2px; p1t = p2t; p1i = p2i;
    p2px = p3px; p2t = p3t; p2i = p3i;
    p3px = p4px; p3t = p4t; p3i = p4i;
    p4px = p5px; p4t = p5t; p4i = p5i;
    p5px = px; p5t = t; p5i = idx - right;
    if (pivN < 6) pivN += 1;
    if (!isNaN(hiB) && !isNaN(hiA) && px < hiB) {
      eqD1a = hiA; eqD1at = hiAT; eqD1b = hiB; eqD1bt = hiBT;
    }
    if (!isNaN(hiB) && px < hiB) {
      eqD0a = hiB; eqD0at = hiBT; eqD0b = px; eqD0bt = t;
    }
    hiA = hiB; hiAT = hiBT;
    hiB = px; hiBT = t;
  }
  if (sw.newLow()) {
    const px = sw.lastLow();
    lastLo = px;
    p0px = p1px; p0t = p1t; p0i = p1i;
    p1px = p2px; p1t = p2t; p1i = p2i;
    p2px = p3px; p2t = p3t; p2i = p3i;
    p3px = p4px; p3t = p4t; p3i = p4i;
    p4px = p5px; p4t = p5t; p4i = p5i;
    p5px = px; p5t = t; p5i = idx - right;
    if (pivN < 6) pivN += 1;
    if (!isNaN(loB) && !isNaN(loA) && px > loB) {
      eqU1a = loA; eqU1at = loAT; eqU1b = loB; eqU1bt = loBT;
    }
    if (!isNaN(loB) && px > loB) {
      eqU0a = loB; eqU0at = loBT; eqU0b = px; eqU0bt = t;
    }
    loA = loB; loAT = loBT;
    loB = px; loBT = t;
  }

  if (shHarm && pivN >= 4) {
    let A = p2px; let B = p3px; let C = p4px; let D = p5px;
    let At = p2t; let Bt = p3t; let Ct = p4t; let Dt = p5t;
    let Ai = p2i; let Bi = p3i; let Ci = p4i; let Di = p5i;
    if (pivN == 4) {
      A = p0px; B = p1px; C = p2px; D = p3px;
      At = p0t; Bt = p1t; Ct = p2t; Dt = p3t;
      Ai = p0i; Bi = p1i; Ci = p2i; Di = p3i;
    } else if (pivN == 5) {
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
      if ((inR(rBC, 0.382, 0.886, fibTol) && inR(rCD, 0.90, 1.272, fibTol)) ||
          (inR(rBC, 0.382, 1.272, fibTol) && inR(rYZ, 0.618, 1.618, fibTol))) {
        patOn = true; patDone = true; patAge = 0; patN = 4;
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
    if (pivN == 5) {
      X = p0px; A = p1px; B = p2px; C = p3px; D = p4px;
      Xt = p0t; At = p1t; Bt = p2t; Ct = p3t; Dt = p4t;
      Xi = p0i; Ai = p1i; Bi = p2i; Ci = p3i; Di = p4i;
    }
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
      let hit = false;
      if (inR(rAB, 0.618, 0.618, fibTol) && inR(rBC, 0.382, 0.886, fibTol) && inR(rXD, 0.786, 0.786, fibTol)) hit = true;
      else if (inR(rAB, 0.382, 0.50, fibTol) && inR(rBC, 0.382, 0.886, fibTol) && inR(rXD, 0.886, 0.886, fibTol)) hit = true;
      else if (inR(rAB, 0.786, 0.786, fibTol) && inR(rBC, 0.382, 0.886, fibTol) && inR(rXD, 1.272, 1.618, fibTol)) hit = true;
      else if (inR(rAB, 0.382, 0.618, fibTol) && inR(rBC, 0.382, 0.886, fibTol) && inR(rXD, 1.618, 1.618, fibTol)) hit = true;
      else if (inR(rXC, 0.786, 0.886, fibTol) && inR(rBC, 1.13, 1.414, fibTol) && !isNaN(rCD) && inR(rCD, 1.272, 2.0, fibTol)) hit = true;
      else if (inR(rXC, 1.13, 1.618, fibTol) && !isNaN(rCD) && inR(rCD, 1.618, 2.24, fibTol)) hit = true;
      if (hit) {
        patOn = true; patDone = true; patAge = 0; patN = 5;
        a0px = X; a0t = Xt; a0i = Xi;
        a1px = A; a1t = At; a1i = Ai;
        a2px = B; a2t = Bt; a2i = Bi;
        a3px = C; a3t = Ct; a3i = Ci;
        a4px = D; a4t = Dt; a4i = Di;
      }
    }
  }

  if (shHarm && pivN >= 4 && (!patOn || !patDone)) {
    let X = p2px; let A = p3px; let B = p4px; let C = p5px;
    let Xt = p2t; let At = p3t; let Bt = p4t; let Ct = p5t;
    let Xi = p2i; let Ai = p3i; let Bi = p4i; let Ci = p5i;
    if (pivN == 4) {
      X = p0px; A = p1px; B = p2px; C = p3px;
      Xt = p0t; At = p1t; Bt = p2t; Ct = p3t;
      Xi = p0i; Ai = p1i; Bi = p2i; Ci = p3i;
    } else if (pivN == 5) {
      X = p1px; A = p2px; B = p3px; C = p4px;
      Xt = p1t; At = p2t; Bt = p3t; Ct = p4t;
      Xi = p1i; Ai = p2i; Bi = p3i; Ci = p4i;
    }
    const xa = Math.abs(A - X);
    const ab = Math.abs(B - A);
    const bc = Math.abs(C - B);
    const xc = Math.abs(C - X);
    if (xa > 0.0 && ab > 0.0 && bc > 0.0) {
      const rAB = ab / xa;
      const rBC = bc / ab;
      const rXC = xc / xa;
      let near = inR(rBC, 0.382, 0.886, fibTol);
      if (inR(rAB, 0.618, 0.618, fibTol) && inR(rBC, 0.382, 0.886, fibTol)) near = true;
      else if (inR(rAB, 0.382, 0.50, fibTol) && inR(rBC, 0.382, 0.886, fibTol)) near = true;
      else if (inR(rAB, 0.786, 0.786, fibTol) && inR(rBC, 0.382, 0.886, fibTol)) near = true;
      else if (inR(rXC, 0.786, 0.886, fibTol) && inR(rBC, 1.13, 1.414, fibTol)) near = true;
      else if (inR(rXC, 1.13, 1.618, fibTol)) near = true;
      if (near) {
        patOn = true; patDone = false; patAge = 0; patN = 4;
        a0px = X; a0t = Xt; a0i = Xi;
        a1px = A; a1t = At; a1i = Ai;
        a2px = B; a2t = Bt; a2i = Bi;
        a3px = C; a3t = Ct; a3i = Ci;
        a4px = NaN; a4i = -1;
      }
    }
  }

  if (patOn) {
    patAge += 1;
    if (patAge > keepBars) { patOn = false; patDone = false; patN = 0; }
  }

  out_zz_ray_at(0, NaN, NaN, 0.0, 0.0, 0, 0, 0);
  out_zz_ray_at(1, NaN, NaN, 0.0, 0.0, 1, 1, 0);
  out_zz_ray_at(2, NaN, NaN, 0.0, 0.0, 2, 2, 0);
  out_zz_ray_at(3, NaN, NaN, 0.0, 0.0, 3, 3, 0);
  if (shZz && patOn && patN >= 2) {
    if (!isNaN(a0px) && !isNaN(a1px)) out_zz_ray_at(0, a0px, a1px, a0t, a1t, 0, 0, 1);
    if (patN >= 3 && !isNaN(a1px) && !isNaN(a2px)) out_zz_ray_at(1, a1px, a2px, a1t, a2t, 1, 1, 1);
    if (patN >= 4 && !isNaN(a2px) && !isNaN(a3px)) out_zz_ray_at(2, a2px, a3px, a2t, a3t, 2, 2, 1);
    if (patN >= 5 && !isNaN(a3px) && !isNaN(a4px)) out_zz_ray_at(3, a3px, a4px, a3t, a4t, 3, 3, 1);
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

  out_eq_ray_at(0, NaN, NaN, 0.0, 0.0, 0, 0, 0);
  out_eq_ray_at(1, NaN, NaN, 0.0, 0.0, 1, 1, 0);
  out_eq_ray_at(2, NaN, NaN, 0.0, 0.0, 2, 2, 0);
  out_eq_ray_at(3, NaN, NaN, 0.0, 0.0, 3, 3, 0);
  if (shEq) {
    if (!isNaN(eqU0a) && !isNaN(eqU0b)) out_eq_ray_at(0, eqU0a, eqU0b, eqU0at, eqU0bt, 0, 0, 1);
    if (!isNaN(eqU1a) && !isNaN(eqU1b)) out_eq_ray_at(1, eqU1a, eqU1b, eqU1at, eqU1bt, 1, 1, 1);
    if (!isNaN(eqD0a) && !isNaN(eqD0b)) out_eq_ray_at(2, eqD0a, eqD0b, eqD0at, eqD0bt, 2, 2, 1);
    if (!isNaN(eqD1a) && !isNaN(eqD1b)) out_eq_ray_at(3, eqD1a, eqD1b, eqD1at, eqD1bt, 3, 3, 1);
  }

  const typ = (h + l + c) / 3.0;
  typSum += typ; hiSum += h; loSum += l; typN += 1;
  if (typN > pocLb) {
    const kk = f64(pocLb) / f64(typN);
    typSum *= kk; hiSum *= kk; loSum *= kk; typN = pocLb;
  }
  if ((shPoc || shVa) && typN >= 8) {
    const mid = typSum / f64(typN);
    const avgH = hiSum / f64(typN);
    const avgL = loSum / f64(typN);
    if (shPoc) out_poc_mid(mid); else out_poc_mid(NaN);
    const vaHalf = (avgH - avgL) * (vaPct / 200.0);
    if (shVa) { out_vah(mid + vaHalf); out_val(mid - vaHalf); }
    else { out_vah(NaN); out_val(NaN); }
  } else {
    out_poc_mid(NaN); out_vah(NaN); out_val(NaN);
  }

  idx += 1;
}
