//@lang=wrun-ts
// XEROX-B OSC — history-safe MACD oscillator (both sides)
// Divergences, auction-zone confluence, MA cross white circles,
// HTF hit cubes (white/black), trap/SFP/candle confluence height

input("buy_vol", trades.volume, { side: "BUY", description: "Taker buy volume" });
input("sell_vol", trades.volume, { side: "SELL", description: "Taker sell volume" });

page("MACD");
param.number("macd_fast", 12, { min: 4, max: 40, label: "MACD fast EMA" });
param.number("macd_slow", 26, { min: 10, max: 80, label: "MACD slow EMA" });
param.number("macd_sig", 9, { min: 3, max: 30, label: "MACD signal" });
param.int("swing_len", 3, { min: 2, max: 30, label: "Swing length (div + SFP)" });
param.int("ema_a", 21, { min: 2, max: 100, label: "EMA A (cross)" });
param.int("ema_b", 50, { min: 2, max: 200, label: "EMA B (cross)" });
param.number("zone_h_atr", 0.35, { min: 0.1, max: 2, step: 0.05, label: "Auction zone height ATR" });

page("Show");
param.bool("show_hist", true, { label: "Confluence histogram" });
param.bool("show_div", true, { label: "Divergences" });
param.bool("show_cross", true, { label: "MA / MACD cross circles" });
param.bool("show_cubes", true, { label: "HTF hit cubes" });

// MACD lines + hist both sides
output("macd", line, lower, { color: "#38bdf8", width: 2, description: "MACD" });
output("macd_sig", line, lower, { color: "#f97316", width: 1, description: "Signal" });
output("hist_buy_hi", histogram, lower, { color: "#00ffd5", description: "High conf buy (neon teal)" });
output("hist_buy", histogram, lower, { color: "#5eead4", description: "Buy confluence" });
output("hist_soon", histogram, lower, { color: "#3b82f6", description: "Buy soon (blue)" });
output("hist_sell", histogram, lower, { color: "#f472b6", description: "Sell confluence" });
output("hist_sell_hi", histogram, lower, { color: "#ff2bd6", description: "High conf sell (neon pink)" });
output("hist_weak", histogram, lower, { color: "#64748b", description: "Weak / neutral" });

const gDivUp = output("g_div_up", none);
const gDivDn = output("g_div_dn", none);
const gCross = output("g_cross", none);
const gCubeW = output("g_cube_w", none);
const gCubeK = output("g_cube_k", none);
const gSfpB = output("g_sfp_b", none);
const gSfpS = output("g_sfp_s", none);

output("div_up", shape, lower, { color: "#00ffd5", shape_where: "g_div_up", shape: "triangle", location: "below_bar", glow: 8, description: "Bull div" });
output("div_dn", shape, lower, { color: "#ff2bd6", shape_where: "g_div_dn", shape: "triangle", location: "above_bar", glow: 8, description: "Bear div" });
output("ma_cross", shape, lower, { color: "#ffffff", shape_where: "g_cross", shape: "circle", location: "above_bar", glow: 10, description: "MA/MACD cross" });
output("cube_w", shape, lower, { color: "#ffffff", shape_where: "g_cube_w", shape: "square", location: "above_bar", glow: 6, description: "HTF green hit" });
output("cube_k", shape, lower, { color: "#0f172a", shape_where: "g_cube_k", shape: "square", location: "below_bar", glow: 6, description: "HTF red hit" });
output("sfp_b", shape, lower, { color: "#3b82f6", shape_where: "g_sfp_b", shape: "circle", location: "below_bar", glow: 6, description: "SFP buy" });
output("sfp_s", shape, lower, { color: "#3b82f6", shape_where: "g_sfp_s", shape: "circle", location: "above_bar", glow: 6, description: "SFP sell" });

output("ema_a", line, overlay, { color: "#94a3b8", width: 1, description: "EMA A" });
output("ema_b", line, overlay, { color: "#f59e0b", width: 1, description: "EMA B" });

alert("macd_cross", { title: "MACD cross", when: gCross });
alert("sfp_buy", { title: "SFP buy", when: gSfpB });
alert("sfp_sell", { title: "SFP sell", when: gSfpS });

const FMAX: i32 = 300;
let fCl = new Array<f64>(FMAX);
let fHi = new Array<f64>(FMAX);
let fLo = new Array<f64>(FMAX);
let fN: i32 = 0; let fCur: i32 = 0;

let pivPx = new Array<f64>(8);
let pivT = new Array<i32>(8);
let pivK = new Array<i32>(8);
let pivN: i32 = 0;

let idx: i32 = 0;
let atr: f64 = NaN;
let emaA: f64 = NaN;
let emaB: f64 = NaN;
let emaFast: f64 = NaN;
let emaSlow: f64 = NaN;
let sig: f64 = NaN;
let prevMacd: f64 = NaN;
let prevSig: f64 = NaN;
let prevEmaA: f64 = NaN;
let prevEmaB: f64 = NaN;
let prevC: f64 = NaN;

let lastSwingHi: f64 = NaN; let lastSwingLo: f64 = NaN;
let lastSwingHiIdx: i32 = 0; let lastSwingLoIdx: i32 = 0;
let lastPricePivot: f64 = NaN; let lastMacdPivot: f64 = NaN; let lastMacdPivotDir: i32 = 0;

let demTop: f64 = NaN; let demBot: f64 = NaN; let demOn: bool = false;
let supTop: f64 = NaN; let supBot: f64 = NaN; let supOn: bool = false;

let sw: Swings;
let right: i32 = 3;
let macdFastN: f64 = 12.0;
let macdSlowN: f64 = 26.0;
let macdSigN: f64 = 9.0;
let emaAn: i32 = 21;
let emaBn: i32 = 50;
let zoneHAtr: f64 = 0.35;

function pushPivot(px: f64, kind: i32): void {
  if (pivN < 8) {
    pivPx[pivN] = px; pivT[pivN] = idx; pivK[pivN] = kind; pivN += 1;
  } else {
    for (let i = 0; i < 7; i += 1) {
      pivPx[i] = pivPx[i + 1]; pivT[i] = pivT[i + 1]; pivK[i] = pivK[i + 1];
    }
    pivPx[7] = px; pivT[7] = idx; pivK[7] = kind;
  }
}

function onStart(): void {
  right = i32(p_swing_len());
  sw = new Swings(right, right);
  macdFastN = p_macd_fast();
  macdSlowN = p_macd_slow();
  macdSigN = p_macd_sig();
  emaAn = i32(p_ema_a());
  emaBn = i32(p_ema_b());
  zoneHAtr = p_zone_h_atr();
}

function onBar(): void {
  const o = bar.open();
  const h = bar.high();
  const l = bar.low();
  const c = bar.close();
  const shHist = pb_show_hist();
  const shDiv = pb_show_div();
  const shCross = pb_show_cross();
  const shCubes = pb_show_cubes();

  const tr = isNaN(prevC) ? (h - l) : Math.max(h - l, Math.max(Math.abs(h - prevC), Math.abs(l - prevC)));
  atr = isNaN(atr) ? tr : atr + (tr - atr) * (1.0 / 14.0);

  const kf = 2.0 / (macdFastN + 1.0);
  const ks = 2.0 / (macdSlowN + 1.0);
  const ksig = 2.0 / (macdSigN + 1.0);
  const ka = 2.0 / (f64(emaAn) + 1.0);
  const kb = 2.0 / (f64(emaBn) + 1.0);

  emaFast = isNaN(emaFast) ? c : emaFast + kf * (c - emaFast);
  emaSlow = isNaN(emaSlow) ? c : emaSlow + ks * (c - emaSlow);
  const macd = emaFast - emaSlow;
  sig = isNaN(sig) ? macd : sig + ksig * (macd - sig);
  const hist = macd - sig;

  prevEmaA = emaA; prevEmaB = emaB;
  emaA = isNaN(emaA) ? c : emaA + ka * (c - emaA);
  emaB = isNaN(emaB) ? c : emaB + kb * (c - emaB);

  out_macd(macd);
  out_macd_sig(sig);
  out_ema_a(emaA);
  out_ema_b(emaB);

  fCur = (fCur + 1) % FMAX;
  fCl[fCur] = c; fHi[fCur] = h; fLo[fCur] = l;
  if (fN < FMAX) fN += 1;

  sw.update(h, l);
  const shv = sw.high();
  const slv = sw.low();
  if (!isNaN(shv)) { lastSwingHi = shv; lastSwingHiIdx = idx - right; pushPivot(shv, 1); }
  if (!isNaN(slv)) { lastSwingLo = slv; lastSwingLoIdx = idx - right; pushPivot(slv, -1); }

  const zDepth = (isNaN(atr) ? (h - l) : atr) * zoneHAtr;
  if (!isNaN(slv)) { demBot = slv; demTop = slv + zDepth; demOn = true; }
  if (!isNaN(shv)) { supTop = shv; supBot = shv - zDepth; supOn = true; }
  let inDemand = demOn && l <= demTop && h >= demBot;
  let inSupply = supOn && h >= supBot && l <= supTop;

  let sfpBuy = false; let sfpSell = false;
  if (!isNaN(lastSwingLo) && l < lastSwingLo && c > lastSwingLo) sfpBuy = true;
  if (!isNaN(lastSwingHi) && h > lastSwingHi && c < lastSwingHi) sfpSell = true;
  out_g_sfp_b(sfpBuy ? 1.0 : 0.0);
  out_g_sfp_s(sfpSell ? 1.0 : 0.0);

  let conf = 1.0;
  if (inDemand || inSupply) conf += 0.55;
  if (sfpBuy || sfpSell) conf += 0.55;
  if (!isNaN(atr)) {
    const near = atr * 0.2;
    if (!isNaN(emaA) && l <= emaA + near && h >= emaA - near) conf += 0.2;
    if (!isNaN(emaB) && l <= emaB + near && h >= emaB - near) conf += 0.25;
  }
  if (!isNaN(prevC) && !isNaN(atr)) {
    const move = c - prevC;
    if (move > atr * 1.0 && c < o) conf += 0.35;
    if (move < -atr * 1.0 && c > o) conf += 0.35;
  }

  let hv = hist * conf;
  if (!shHist) {
    out_hist_buy_hi(NaN); out_hist_buy(NaN); out_hist_soon(NaN);
    out_hist_sell(NaN); out_hist_sell_hi(NaN); out_hist_weak(NaN);
  } else if (hist > 0.0 && macd > sig && conf >= 2.0) {
    out_hist_buy_hi(hv); out_hist_buy(NaN); out_hist_soon(NaN); out_hist_sell(NaN); out_hist_sell_hi(NaN); out_hist_weak(NaN);
  } else if (hist > 0.0 && macd > sig) {
    out_hist_buy_hi(NaN); out_hist_buy(hv); out_hist_soon(NaN); out_hist_sell(NaN); out_hist_sell_hi(NaN); out_hist_weak(NaN);
  } else if (hist > 0.0) {
    out_hist_buy_hi(NaN); out_hist_buy(NaN); out_hist_soon(hv); out_hist_sell(NaN); out_hist_sell_hi(NaN); out_hist_weak(NaN);
  } else if (hist < 0.0 && macd < sig && conf >= 2.0) {
    out_hist_buy_hi(NaN); out_hist_buy(NaN); out_hist_soon(NaN); out_hist_sell(NaN); out_hist_sell_hi(hv); out_hist_weak(NaN);
  } else if (hist < 0.0 && macd < sig) {
    out_hist_buy_hi(NaN); out_hist_buy(NaN); out_hist_soon(NaN); out_hist_sell(hv); out_hist_sell_hi(NaN); out_hist_weak(NaN);
  } else {
    out_hist_buy_hi(NaN); out_hist_buy(NaN); out_hist_soon(NaN); out_hist_sell(NaN); out_hist_sell_hi(NaN); out_hist_weak(hv);
  }

  let divUp = false; let divDn = false;
  if (shDiv) {
    if (!isNaN(slv) && !isNaN(lastPricePivot) && !isNaN(lastMacdPivot)) {
      if (slv < lastPricePivot && macd > lastMacdPivot && lastMacdPivotDir == -1) divUp = true;
    }
    if (!isNaN(shv) && !isNaN(lastPricePivot) && !isNaN(lastMacdPivot)) {
      if (shv > lastPricePivot && macd < lastMacdPivot && lastMacdPivotDir == 1) divDn = true;
    }
    if (!isNaN(slv)) { lastPricePivot = slv; lastMacdPivot = macd; lastMacdPivotDir = -1; }
    if (!isNaN(shv)) { lastPricePivot = shv; lastMacdPivot = macd; lastMacdPivotDir = 1; }
  }
  out_g_div_up(divUp ? 1.0 : 0.0);
  out_g_div_dn(divDn ? 1.0 : 0.0);

  let crossed = false;
  if (shCross && !isNaN(prevMacd) && !isNaN(prevSig)) {
    if ((prevMacd <= prevSig && macd > sig) || (prevMacd >= prevSig && macd < sig)) crossed = true;
  }
  if (shCross && !isNaN(prevEmaA) && !isNaN(prevEmaB) && !isNaN(emaA) && !isNaN(emaB)) {
    if ((prevEmaA <= prevEmaB && emaA > emaB) || (prevEmaA >= prevEmaB && emaA < emaB)) crossed = true;
  }
  out_g_cross(crossed ? 1.0 : 0.0);

  let cubeW = false; let cubeK = false;
  if (shCubes && pivN >= 4 && !isNaN(atr)) {
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
      const val = l1 + ((l1 - l0) / f64(i1 - i0)) * f64(idx - i1);
      if (Math.abs(c - val) <= atr * 0.25) cubeW = true;
    }
    if (!isNaN(h0) && !isNaN(h1) && j1 != j0) {
      const val = h1 + ((h1 - h0) / f64(j1 - j0)) * f64(idx - j1);
      if (Math.abs(c - val) <= atr * 0.25) cubeK = true;
    }
  }
  out_g_cube_w(cubeW ? 1.0 : 0.0);
  out_g_cube_k(cubeK ? 1.0 : 0.0);

  prevMacd = macd; prevSig = sig; prevC = c;
  idx += 1;
}
