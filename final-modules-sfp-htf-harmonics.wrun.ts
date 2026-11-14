//@lang=wrun-ts
// TORDAO companion (novaadd) — key levels, turn rays, manip rectangles,
// pivot circles, liquidity-grab attention marks.
// Second indicator beside final-approved-by-openmarket.wrun.ts

input("close", ohlcv.close);

page("Modules");
param.bool("en_levels", true, { label: "Hard key levels (horizontal)" });
param.bool("en_rays", true, { label: "Up / down turn rays" });
param.bool("en_manip", true, { label: "Manipulation rectangles" });
param.bool("en_pivots", true, { label: "Clear pivot move circles" });
param.bool("en_liq", true, { label: "Liquidity grab attention marks" });

page("Logic");
param("swing_len", 5, { min: 2, max: 30, description: "Swing length" });
param("level_n", 6, { min: 2, max: 12, description: "How many key levels to keep" });
param("liq_bars", 2, { min: 1, max: 8, description: "Bars allowed to reclaim after grab" });
param("liq_min_atr", 0.08, { min: 0, max: 2, description: "Min sweep depth in ATR" });
param("manip_lo", 90, { min: 50, max: 100, description: "Manip: AB min % of BC" });
param("manip_hi", 110, { min: 100, max: 200, description: "Manip: AB max % of BC" });
param("manip_min_atr", 1.2, { min: 0, max: 20, description: "Manip min leg ATR" });
param("pivot_min_atr", 0.8, { min: 0.1, max: 10, description: "Clear pivot move min ATR" });

const gLiqBull = output("g_liq_bull", none);
const gLiqBear = output("g_liq_bear", none);
output("liq_bull", shape, overlay, {
  color: "#00ffd5", shape_where: "g_liq_bull", shape: "diamond",
  location: "below_bar", glow: 14, description: "Liquidity grab bull (sweep low + reclaim)"
});
output("liq_bear", shape, overlay, {
  color: "#ff2bd6", shape_where: "g_liq_bear", shape: "diamond",
  location: "above_bar", glow: 14, description: "Liquidity grab bear (sweep high + reclaim)"
});

const gPivUp = output("g_piv_up", none);
const gPivDn = output("g_piv_dn", none);
output("piv_up", shape, overlay, {
  color: "#38bdf8", shape_where: "g_piv_up", shape: "circle",
  location: "below_bar", glow: 8, description: "Clear upward pivot move"
});
output("piv_dn", shape, overlay, {
  color: "#c084fc", shape_where: "g_piv_dn", shape: "circle",
  location: "above_bar", glow: 8, description: "Clear downward pivot move"
});

plot.rays({
  name: "key_lvls",
  slots: 8,
  colors: ["#ef4444", "#f87171", "#fb7185", "#fca5a5", "#22c55e", "#4ade80", "#86efac", "#bbf7d0"],
  width: 1,
  line_style: "dotted",
  opacity: 0.9,
  words: ["R1", "R2", "R3", "R4", "S1", "S2", "S3", "S4"],
  tooltip: "{{word}} {{y1}}",
  panel: "overlay"
});

plot.rays({
  name: "turns",
  slots: 4,
  colors: ["#ef4444", "#f87171", "#22c55e", "#4ade80"],
  width: 2,
  line_style: "dashed",
  opacity: 0.95,
  words: ["Res A", "Res B", "Sup A", "Sup B"],
  tooltip: "{{word}}",
  panel: "overlay"
});

plot.spans({
  name: "manip",
  slots: 2,
  colors: ["#facc15", "#f59e0b"],
  opacity: 0.2,
  border: true,
  words: ["Manip up", "Manip dn"],
  tooltip: "{{word}}",
  panel: "overlay"
});

alert("liq_bull_alert", { when: gLiqBull, message: "{{symbol}}: LIQUIDITY GRAB BULL at {{close}}", description: "Bullish liquidity grab" });
alert("liq_bear_alert", { when: gLiqBear, message: "{{symbol}}: LIQUIDITY GRAB BEAR at {{close}}", description: "Bearish liquidity grab" });
alert("piv_up_alert", { when: gPivUp, message: "{{symbol}}: clear pivot move UP", description: "Clear up pivot" });
alert("piv_dn_alert", { when: gPivDn, message: "{{symbol}}: clear pivot move DOWN", description: "Clear down pivot" });

let sw = new Swings(5, 5);
let right: i32 = 5;
let idx: i32 = 0;
let atr: f64 = NaN;
let pClose: f64 = NaN;
let enLevels = true;
let enRays = true;
let enManip = true;
let enPivots = true;
let enLiq = true;
let liqBars: i32 = 2;
let liqMin: f64 = 0.08;
let manipLo: f64 = 90.0;
let manipHi: f64 = 110.0;
let manipMin: f64 = 1.2;
let pivMin: f64 = 0.8;
let levelN: i32 = 6;

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

let h0: f64 = NaN; let h1: f64 = NaN; let h2: f64 = NaN;
let hi0: i32 = 0; let hi1: i32 = 0; let hi2: i32 = 0;
let l0: f64 = NaN; let l1: f64 = NaN; let l2: f64 = NaN;
let li0: i32 = 0; let li1: i32 = 0; let li2: i32 = 0;
let prevH: f64 = NaN;
let prevL: f64 = NaN;

const resLvl = new StaticArray<f64>(8);
const supLvl = new StaticArray<f64>(8);
let nRes: i32 = 0;
let nSup: i32 = 0;

function onStart(): void {
  right = i32(p_swing_len());
  sw = new Swings(right, right);
  levelN = i32(p_level_n());
  if (levelN > 8) levelN = 8;
  liqBars = i32(p_liq_bars());
  liqMin = p_liq_min_atr();
  manipLo = p_manip_lo();
  manipHi = p_manip_hi();
  manipMin = p_manip_min_atr();
  pivMin = p_pivot_min_atr();
  enLevels = pb_en_levels();
  enRays = pb_en_rays();
  enManip = pb_en_manip();
  enPivots = pb_en_pivots();
  enLiq = pb_en_liq();
}

function pushRes(px: f64): void {
  if (nRes < 8) { resLvl[nRes] = px; nRes += 1; }
  else { for (let i = 0; i < 7; i += 1) resLvl[i] = resLvl[i + 1]; resLvl[7] = px; }
}

function pushSup(px: f64): void {
  if (nSup < 8) { supLvl[nSup] = px; nSup += 1; }
  else { for (let i = 0; i < 7; i += 1) supLvl[i] = supLvl[i + 1]; supLvl[7] = px; }
}

function onBar(): void {
  const o = bar.open();
  const h = bar.high();
  const l = bar.low();
  const c = bar.close();
  const tr = isNaN(pClose) ? h - l : Math.max(h - l, Math.max(Math.abs(h - pClose), Math.abs(l - pClose)));
  atr = isNaN(atr) ? tr : (atr * 13.0 + tr) / 14.0;
  sw.update(h, l);

  let liqBull = 0.0;
  let liqBear = 0.0;
  let pivUp = 0.0;
  let pivDn = 0.0;
  let newHigh = false;
  let newLow = false;

  if (sw.newHigh()) {
    lvlH = sw.lastHigh();
    hActive = false; hDone = false; hExt = NaN;
    newHigh = true;
  }
  if (sw.newLow()) {
    lvlL = sw.lastLow();
    lActive = false; lDone = false; lExt = NaN;
    newLow = true;
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

  if (newHigh) {
    h2 = h1; hi2 = hi1; h1 = h0; hi1 = hi0;
    h0 = sw.lastHigh(); hi0 = idx - right;
    pushRes(h0);
    if (!isNaN(prevH) && h0 - prevH >= pivMin * atr) pivDn = 1.0;
    if (!isNaN(l0) && h0 - l0 >= pivMin * atr) pivUp = 1.0;
    prevH = h0;

    if (enLevels) {
      const slot = nRes > 0 ? (nRes - 1) % 4 : 0;
      out_key_lvls_ray(slot, h0, h0, 0, slot, 1, 1);
    }
    if (enRays && !isNaN(h1) && h0 < h1 && hi0 > hi1) {
      out_turns_ray(0, h1, h0, hi0 - hi1, 0, 1, 1);
    }
    if (enRays && !isNaN(h2) && h0 < h2 && hi0 > hi2) {
      out_turns_ray(1, h2, h0, hi0 - hi2, 1, 1, 1);
    }
  }

  if (newLow) {
    l2 = l1; li2 = li1; l1 = l0; li1 = li0;
    l0 = sw.lastLow(); li0 = idx - right;
    pushSup(l0);
    if (!isNaN(prevL) && prevL - l0 >= pivMin * atr) pivUp = 1.0;
    if (!isNaN(h0) && h0 - l0 >= pivMin * atr) pivDn = 1.0;
    prevL = l0;

    if (enLevels) {
      const slot = 4 + (nSup > 0 ? (nSup - 1) % 4 : 0);
      out_key_lvls_ray(slot, l0, l0, 0, slot, 1, 1);
    }
    if (enRays && !isNaN(l1) && l0 > l1 && li0 > li1) {
      out_turns_ray(2, l1, l0, li0 - li1, 2, 1, 1);
    }
    if (enRays && !isNaN(l2) && l0 > l2 && li0 > li2) {
      out_turns_ray(3, l2, l0, li0 - li2, 3, 1, 1);
    }
  }

  if (enManip && !isNaN(h0) && !isNaN(l0) && !isNaN(h1) && !isNaN(l1)) {
    const top = Math.max(h0, h1);
    const bot = Math.min(l0, l1);
    if (!isNaN(h2) && !isNaN(l2)) {
      const ab = Math.abs(h1 - l2);
      const bc = Math.abs(l1 - h1);
      if (ab > 0.0 && bc > 0.0 && ab >= manipMin * atr) {
        const pct = ab / bc * 100.0;
        if (pct >= manipLo && pct <= manipHi) {
          const bars = Math.max(1, Math.abs(hi0 - li2));
          out_manip_span(0, top, bot, bars, 0, 0, 0);
        }
      }
    }
    if (!isNaN(l2) && !isNaN(h1)) {
      const ab2 = Math.abs(l1 - h2);
      const bc2 = Math.abs(h0 - l1);
      if (ab2 > 0.0 && bc2 > 0.0 && ab2 >= manipMin * atr) {
        const pct2 = ab2 / bc2 * 100.0;
        if (pct2 >= manipLo && pct2 <= manipHi) {
          const bars2 = Math.max(1, Math.abs(li0 - hi2));
          out_manip_span(1, Math.max(h0, h1), Math.min(l0, l1), bars2, 1, 0, 0);
        }
      }
    }
  }

  out_g_liq_bull(enLiq ? liqBull : 0.0);
  out_g_liq_bear(enLiq ? liqBear : 0.0);
  out_liq_bull(l);
  out_liq_bear(h);
  out_g_piv_up(enPivots ? pivUp : 0.0);
  out_g_piv_dn(enPivots ? pivDn : 0.0);
  out_piv_up(l);
  out_piv_dn(h);

  pClose = c;
  idx += 1;
}
