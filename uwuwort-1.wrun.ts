//@lang=wrun-ts
// UWUWORT 1 — chart core (history-safe)
// 4 confluence zones, yellow POC+mid, trap top/bottom lines only (600),
// SFP blue (1337), candle patterns (600), dVWAP/EMA21/EMA50, touch circles, auction wick neon

input("buy_vol", trades.volume, { side: "BUY", description: "Taker buy volume" });
input("sell_vol", trades.volume, { side: "SELL", description: "Taker sell volume" });

page("Display");
param.bool("show_zones", true, { label: "4 confluence zones (2 red / 2 green)" });
param.bool("show_poc", true, { label: "Yellow chart-TF POC zone + mid" });
param.bool("show_traps", true, { label: "Trap top/bottom lines (600 bars)" });
param.bool("show_candles", true, { label: "Candle patterns (600 bars)" });
param.bool("show_sfp", true, { label: "SFP blue marks (1337 bars)" });
param.bool("show_lines", true, { label: "Daily VWAP + EMA21 + EMA50" });
param.bool("show_touches", true, { label: "Touch circles VWAP/EMA50" });
param.bool("show_wicks", true, { label: "Auction wick neon circles" });

page("Logic");
param.int("swing_len", 3, { min: 2, max: 30, label: "Swing length" });
param.number("zone_h_atr", 0.35, { min: 0.1, max: 2, step: 0.05, label: "Zone height ATR", when: "show_zones" });
param.int("poc_lookback", 48, { min: 8, max: 300, label: "POC lookback", when: "show_poc" });
param.int("trap_span", 1, { min: 0, max: 2, label: "Trap delta bars each side", when: "show_traps" });
param.number("trap_min_pct", 10, { min: 1, max: 80, step: 1, label: "Trap min |delta| % of volume", when: "show_traps" });
param.int("trap_bars", 600, { min: 100, max: 2000, label: "Trap/candle keep bars", when: "show_traps" });
param.int("sfp_bars", 1337, { min: 200, max: 3000, label: "SFP keep bars" });
param.number("doji_pct", 10, { min: 1, max: 30, step: 1, label: "Doji body % of range" });
param.number("wick_mult", 2, { min: 1, max: 5, step: 0.1, label: "Hammer wick vs body" });
param.number("small_wick", 15, { min: 0, max: 40, step: 1, label: "Hammer opposite wick max %" });
param.number("cand_min_atr", 0.5, { min: 0, max: 3, step: 0.1, label: "Candle min range ATR" });
param.int("ema1", 21, { min: 2, max: 500, label: "EMA 21" });
param.int("ema2", 50, { min: 2, max: 500, label: "EMA 50" });

output("vwap_d", line, overlay, { color: "#ff8c00", width: 1, description: "Daily VWAP" });
output("ema_21", line, overlay, { color: "#fde047", width: 1, description: "EMA 21" });
output("ema_50", line, overlay, { color: "#f59e0b", width: 1, description: "EMA 50" });
output("poc_mid", line, overlay, { color: "#facc15", width: 2, line_style: "solid", description: "POC mid price" });

const pocTop = output("poc_top", none);
const pocBot = output("poc_bot", none);
const pocLive = output("poc_live", none);
box("poc_zone", { top: pocTop, bottom: pocBot, when: pocLive, color: "#facc15", opacity: 0.16, borderColor: "#facc15", borderWidth: 1, z: 2 });

const z0t = output("z0_t", none); const z0b = output("z0_b", none); const z0l = output("z0_l", none); const z0s = output("z0_s", none);
const z1t = output("z1_t", none); const z1b = output("z1_b", none); const z1l = output("z1_l", none); const z1s = output("z1_s", none);
const z2t = output("z2_t", none); const z2b = output("z2_b", none); const z2l = output("z2_l", none); const z2s = output("z2_s", none);
const z3t = output("z3_t", none); const z3b = output("z3_b", none); const z3l = output("z3_l", none); const z3s = output("z3_s", none);
box("zone0", { top: z0t, bottom: z0b, when: z0l, colorBy: z0s, borderWidth: 1, opacity: 0.22, colors: ["#ff2bd6", "#9ca3af"] });
box("zone1", { top: z1t, bottom: z1b, when: z1l, colorBy: z1s, borderWidth: 1, opacity: 0.22, colors: ["#f472b6", "#9ca3af"] });
box("zone2", { top: z2t, bottom: z2b, when: z2l, colorBy: z2s, borderWidth: 1, opacity: 0.22, colors: ["#00ffd5", "#9ca3af"] });
box("zone3", { top: z3t, bottom: z3b, when: z3l, colorBy: z3s, borderWidth: 1, opacity: 0.22, colors: ["#2dd4bf", "#9ca3af"] });

output("trap_hi", line, overlay, { color: "#00ffd5", width: 2, line_style: "solid", description: "Trap upper (shorts trapped)" });
output("trap_lo", line, overlay, { color: "#00ffd5", width: 2, line_style: "solid", description: "Trap lower (shorts trapped)" });
output("trap_hi_l", line, overlay, { color: "#ff2bd6", width: 2, line_style: "solid", description: "Trap upper (longs trapped)" });
output("trap_lo_l", line, overlay, { color: "#ff2bd6", width: 2, line_style: "solid", description: "Trap lower (longs trapped)" });
output("trap_delta", line, lower, { color: "#94a3b8", width: 1, line_style: "dotted", description: "Trap delta" });

const gSfpB = output("g_sfp_b", none);
const gSfpS = output("g_sfp_s", none);
const gHam = output("g_ham", none);
const gStar = output("g_star", none);
const gDoji = output("g_doji", none);
const gEngB = output("g_eng_b", none);
const gEngS = output("g_eng_s", none);
const gTouchD = output("g_touch_d", none);
const gTouchE = output("g_touch_e", none);
const gWickB = output("g_wick_b", none);
const gWickS = output("g_wick_s", none);

output("sfp_b", shape, overlay, { color: "#3b82f6", shape_where: "g_sfp_b", shape: "circle", location: "below_bar", glow: 10, description: "SFP buy" });
output("sfp_s", shape, overlay, { color: "#3b82f6", shape_where: "g_sfp_s", shape: "circle", location: "above_bar", glow: 10, description: "SFP sell" });
output("ham", shape, overlay, { color: "#00ffd5", shape_where: "g_ham", shape: "triangle_up", location: "below_bar", glow: 8, description: "Hammer" });
output("star", shape, overlay, { color: "#ff2bd6", shape_where: "g_star", shape: "triangle_down", location: "above_bar", glow: 8, description: "Shooting star" });
output("doji", shape, overlay, { color: "#facc15", shape_where: "g_doji", shape: "circle", location: "below_bar", glow: 4, description: "Doji" });
output("eng_b", shape, overlay, { color: "#5eead4", shape_where: "g_eng_b", shape: "diamond", location: "below_bar", glow: 6, description: "Bull engulfer" });
output("eng_s", shape, overlay, { color: "#f472b6", shape_where: "g_eng_s", shape: "diamond", location: "above_bar", glow: 6, description: "Bear engulfer" });
output("touch_d", shape, overlay, { color: "#ff8c00", shape_where: "g_touch_d", shape: "circle", location: "below_bar", glow: 8, description: "dVWAP touch" });
output("touch_e", shape, overlay, { color: "#ffffff", shape_where: "g_touch_e", shape: "circle", location: "below_bar", glow: 8, description: "EMA50 touch" });
output("wick_b", shape, overlay, { color: "#00ffd5", shape_where: "g_wick_b", shape: "circle", location: "below_bar", glow: 16, description: "Auction wick buy" });
output("wick_s", shape, overlay, { color: "#ff2bd6", shape_where: "g_wick_s", shape: "circle", location: "above_bar", glow: 16, description: "Auction wick sell" });

alert("sfp_buy", { title: "SFP buy", when: gSfpB });
alert("sfp_sell", { title: "SFP sell", when: gSfpS });
alert("touch_dvwap", { title: "Daily VWAP touch", when: gTouchD });
alert("touch_ema50", { title: "EMA50 touch", when: gTouchE });

const FMAX: i32 = 400;
let fCl = new Array<f64>(FMAX);
let fHi = new Array<f64>(FMAX);
let fLo = new Array<f64>(FMAX);
let fBuy = new Array<f64>(FMAX);
let fSell = new Array<f64>(FMAX);
let fN: i32 = 0; let fCur: i32 = 0;

let idx: i32 = 0;
let atr: f64 = NaN;
let ema21: f64 = NaN;
let ema50: f64 = NaN;
let vdNum: f64 = 0.0; let vdDen: f64 = 0.0; let vdDay: i32 = -1;
let prevO: f64 = NaN; let prevH: f64 = NaN; let prevL: f64 = NaN; let prevC: f64 = NaN;
let lastSwingHi: f64 = NaN; let lastSwingLo: f64 = NaN;
let lastSwingHiIdx: i32 = 0; let lastSwingLoIdx: i32 = 0;

let zMid = new Array<f64>(4);
let zTop = new Array<f64>(4);
let zBot = new Array<f64>(4);
let zLive = new Array<i32>(4);
let zHits = new Array<i32>(4);
let zReady: bool = false;

let tSTop: f64 = NaN; let tSBot: f64 = NaN; let tSStart: i32 = 0; let tSDelta: f64 = 0.0; let tSOn: bool = false;
let tLTop: f64 = NaN; let tLBot: f64 = NaN; let tLStart: i32 = 0; let tLDelta: f64 = 0.0; let tLOn: bool = false;

let sw = new Swings(3, 3);
let right: i32 = 3;
let zoneHAtr: f64 = 0.35;
let pocLb: i32 = 48;
let trapSpan: i32 = 1;
let trapMin: f64 = 10.0;
let trapKeep: i32 = 600;
let sfpKeep: i32 = 1337;
let dojiPct: f64 = 10.0;
let wickMult: f64 = 2.0;
let smallWick: f64 = 15.0;
let candMinAtr: f64 = 0.5;
let ema1n: i32 = 21; let ema2n: i32 = 50;

function placeZones(c: f64, atrNow: f64): void {
  const half = zoneHAtr * atrNow * 0.5;
  const offs = new Array<f64>(4);
  offs[0] = c + atrNow * 0.6; offs[1] = c + atrNow * 1.4;
  offs[2] = c - atrNow * 0.6; offs[3] = c - atrNow * 1.4;
  for (let i = 0; i < 4; i += 1) {
    zMid[i] = offs[i];
    zTop[i] = offs[i] + half;
    zBot[i] = offs[i] - half;
    zLive[i] = 1;
    zHits[i] = 0;
  }
  zReady = true;
}

function onStart(): void {
  right = i32(p_swing_len());
  sw = new Swings(right, right);
  zoneHAtr = p_zone_h_atr();
  pocLb = i32(p_poc_lookback());
  trapSpan = i32(p_trap_span());
  trapMin = p_trap_min_pct();
  trapKeep = i32(p_trap_bars());
  sfpKeep = i32(p_sfp_bars());
  dojiPct = p_doji_pct();
  wickMult = p_wick_mult();
  smallWick = p_small_wick();
  candMinAtr = p_cand_min_atr();
  ema1n = i32(p_ema1()); ema2n = i32(p_ema2());
  for (let i = 0; i < 4; i += 1) zLive[i] = 0;
}

function onBar(): void {
  const o = bar.open();
  const h = bar.high();
  const l = bar.low();
  const c = bar.close();
  const v = bar.volume();
  const t = bar.time();
  const bv = buy_vol();
  const sv = sell_vol();

  const shZ = pb_show_zones();
  const shPoc = pb_show_poc();
  const shTrap = pb_show_traps();
  const shCand = pb_show_candles();
  const shSfp = pb_show_sfp();
  const shLines = pb_show_lines();
  const shTouch = pb_show_touches();
  const shWick = pb_show_wicks();

  const tr = isNaN(prevC) ? (h - l) : Math.max(h - l, Math.max(Math.abs(h - prevC), Math.abs(l - prevC)));
  atr = isNaN(atr) ? tr : atr + (tr - atr) * (1.0 / 14.0);

  const k1 = 2.0 / (f64(ema1n) + 1.0);
  const k2 = 2.0 / (f64(ema2n) + 1.0);
  ema21 = isNaN(ema21) ? c : ema21 + k1 * (c - ema21);
  ema50 = isNaN(ema50) ? c : ema50 + k2 * (c - ema50);

  fCur = (fCur + 1) % FMAX;
  fCl[fCur] = c; fHi[fCur] = h; fLo[fCur] = l; fBuy[fCur] = bv; fSell[fCur] = sv;
  if (fN < FMAX) fN += 1;

  const day = i32(t / 86400000);
  if (day != vdDay) { vdNum = 0.0; vdDen = 0.0; vdDay = day; }
  const typ = (h + l + c) / 3.0;
  vdNum += typ * v; vdDen += v;
  const vdv = vdDen > 0.0 ? vdNum / vdDen : NaN;

  out_vwap_d(shLines && !isNaN(vdv) ? vdv : NaN);
  out_ema_21(shLines && !isNaN(ema21) ? ema21 : NaN);
  out_ema_50(shLines && !isNaN(ema50) ? ema50 : NaN);

  let sh = NaN;
  let sl = NaN;
  sw.update(h, l);
  if (sw.newHigh()) { sh = sw.lastHigh(); lastSwingHi = sh; lastSwingHiIdx = idx - right; }
  if (sw.newLow()) { sl = sw.lastLow(); lastSwingLo = sl; lastSwingLoIdx = idx - right; }

  let sfpBuy = false; let sfpSell = false;
  if (!isNaN(lastSwingLo) && l < lastSwingLo && c > lastSwingLo && (idx - lastSwingLoIdx) < sfpKeep) sfpBuy = true;
  if (!isNaN(lastSwingHi) && h > lastSwingHi && c < lastSwingHi && (idx - lastSwingHiIdx) < sfpKeep) sfpSell = true;
  out_g_sfp_b(shSfp && sfpBuy ? 1.0 : 0.0);
  out_g_sfp_s(shSfp && sfpSell ? 1.0 : 0.0);

  if (shZ && !isNaN(atr) && atr > 0.0) {
    if (!zReady) placeZones(c, atr);
    for (let i = 0; i < 4; i += 1) {
      if (zLive[i] == 1) {
        if (l <= zTop[i] && h >= zBot[i]) {
          zHits[i] += 1;
          if (zHits[i] >= 2) zLive[i] = 0;
        }
      }
    }
    let need = false;
    for (let i = 0; i < 4; i += 1) if (zLive[i] == 0) need = true;
    if (need) placeZones(c, atr);
    out_z0_t(zLive[0] == 1 ? zTop[0] : NaN); out_z0_b(zLive[0] == 1 ? zBot[0] : NaN); out_z0_l(zLive[0] == 1 ? 1.0 : 0.0); out_z0_s(zHits[0] >= 1 ? 1.0 : 0.0);
    out_z1_t(zLive[1] == 1 ? zTop[1] : NaN); out_z1_b(zLive[1] == 1 ? zBot[1] : NaN); out_z1_l(zLive[1] == 1 ? 1.0 : 0.0); out_z1_s(zHits[1] >= 1 ? 1.0 : 0.0);
    out_z2_t(zLive[2] == 1 ? zTop[2] : NaN); out_z2_b(zLive[2] == 1 ? zBot[2] : NaN); out_z2_l(zLive[2] == 1 ? 1.0 : 0.0); out_z2_s(zHits[2] >= 1 ? 1.0 : 0.0);
    out_z3_t(zLive[3] == 1 ? zTop[3] : NaN); out_z3_b(zLive[3] == 1 ? zBot[3] : NaN); out_z3_l(zLive[3] == 1 ? 1.0 : 0.0); out_z3_s(zHits[3] >= 1 ? 1.0 : 0.0);
  } else {
    out_z0_t(NaN); out_z0_b(NaN); out_z0_l(0.0); out_z0_s(0.0);
    out_z1_t(NaN); out_z1_b(NaN); out_z1_l(0.0); out_z1_s(0.0);
    out_z2_t(NaN); out_z2_b(NaN); out_z2_l(0.0); out_z2_s(0.0);
    out_z3_t(NaN); out_z3_b(NaN); out_z3_l(0.0); out_z3_s(0.0);
  }

  let inPump = false; let inDump = false;
  if (zReady) {
    if (zLive[2] == 1 && l <= zTop[2] && h >= zBot[2]) inPump = true;
    if (zLive[3] == 1 && l <= zTop[3] && h >= zBot[3]) inPump = true;
    if (zLive[0] == 1 && l <= zTop[0] && h >= zBot[0]) inDump = true;
    if (zLive[1] == 1 && l <= zTop[1] && h >= zBot[1]) inDump = true;
  }
  out_g_wick_b(shWick && (inPump || sfpBuy) && c > o ? 1.0 : 0.0);
  out_g_wick_s(shWick && (inDump || sfpSell) && c < o ? 1.0 : 0.0);

  if (shPoc && fN >= 8) {
    let mn = fCl[fCur]; let mx = fCl[fCur];
    const n = pocLb < fN ? pocLb : fN;
    for (let k = 0; k < n; k += 1) {
      const j = (fCur - k + FMAX) % FMAX;
      if (fLo[j] < mn) mn = fLo[j];
      if (fHi[j] > mx) mx = fHi[j];
    }
    if (mx > mn) {
      const bins: i32 = 32;
      let counts = new Array<f64>(32);
      for (let b = 0; b < bins; b += 1) counts[b] = 0.0;
      for (let k = 0; k < n; k += 1) {
        const j = (fCur - k + FMAX) % FMAX;
        let bi = i32(((fCl[j] - mn) / (mx - mn)) * f64(bins - 1));
        if (bi < 0) bi = 0;
        if (bi >= bins) bi = bins - 1;
        counts[bi] += 1.0;
      }
      let best: i32 = 0; let bestV = counts[0];
      for (let b = 1; b < bins; b += 1) if (counts[b] > bestV) { bestV = counts[b]; best = b; }
      const step = (mx - mn) / f64(bins);
      const mid = mn + (f64(best) + 0.5) * step;
      out_poc_top(mid + step * 1.5);
      out_poc_bot(mid - step * 1.5);
      out_poc_live(1.0);
      out_poc_mid(mid);
    } else {
      out_poc_top(NaN); out_poc_bot(NaN); out_poc_live(0.0); out_poc_mid(NaN);
    }
  } else {
    out_poc_top(NaN); out_poc_bot(NaN); out_poc_live(0.0); out_poc_mid(NaN);
  }

  const range = h - l;
  const body = Math.abs(c - o);
  const upperW = h - (c > o ? c : o);
  const lowerW = (c < o ? c : o) - l;
  let isHam = false; let isStar = false; let isDoji = false; let isEngB = false; let isEngS = false;
  if (range > 0.0 && !isNaN(atr) && range >= atr * candMinAtr) {
    if (lowerW >= body * wickMult && upperW <= range * (smallWick / 100.0) && c >= o) isHam = true;
    if (upperW >= body * wickMult && lowerW <= range * (smallWick / 100.0) && c <= o) isStar = true;
    if (body <= range * (dojiPct / 100.0)) isDoji = true;
  }
  if (!isNaN(prevO) && !isNaN(prevC)) {
    if (prevC < prevO && c > o && c >= prevO && o <= prevC) isEngB = true;
    if (prevC > prevO && c < o && c <= prevO && o >= prevC) isEngS = true;
  }
  out_g_ham(shCand && isHam ? 1.0 : 0.0);
  out_g_star(shCand && isStar ? 1.0 : 0.0);
  out_g_doji(shCand && isDoji ? 1.0 : 0.0);
  out_g_eng_b(shCand && isEngB ? 1.0 : 0.0);
  out_g_eng_s(shCand && isEngS ? 1.0 : 0.0);

  if (shTrap && !isNaN(atr) && fN > trapSpan + 2) {
    if (!isNaN(sh)) {
      let dsum: f64 = 0.0; let vsum: f64 = 0.0;
      for (let k = -trapSpan; k <= trapSpan; k += 1) {
        const j = (fCur - right + k + FMAX * 4) % FMAX;
        dsum += fBuy[j] - fSell[j];
        vsum += fBuy[j] + fSell[j];
      }
      if (vsum > 0.0 && Math.abs(dsum) / vsum * 100.0 >= trapMin && dsum > 0.0) {
        tLTop = sh; tLBot = sh - atr * 0.4; tLStart = idx; tLDelta = dsum; tLOn = true;
      }
    }
    if (!isNaN(sl)) {
      let dsum: f64 = 0.0; let vsum: f64 = 0.0;
      for (let k = -trapSpan; k <= trapSpan; k += 1) {
        const j = (fCur - right + k + FMAX * 4) % FMAX;
        dsum += fBuy[j] - fSell[j];
        vsum += fBuy[j] + fSell[j];
      }
      if (vsum > 0.0 && Math.abs(dsum) / vsum * 100.0 >= trapMin && dsum < 0.0) {
        tSTop = sl + atr * 0.4; tSBot = sl; tSStart = idx; tSDelta = dsum; tSOn = true;
      }
    }
    if (tSOn && (idx - tSStart) > trapKeep) tSOn = false;
    if (tLOn && (idx - tLStart) > trapKeep) tLOn = false;
  }
  out_trap_hi(shTrap && tSOn ? tSTop : NaN);
  out_trap_lo(shTrap && tSOn ? tSBot : NaN);
  out_trap_hi_l(shTrap && tLOn ? tLTop : NaN);
  out_trap_lo_l(shTrap && tLOn ? tLBot : NaN);
  out_trap_delta(shTrap && (tSOn || tLOn) ? (tSOn ? tSDelta : tLDelta) : NaN);

  const near = isNaN(atr) ? range * 0.15 : atr * 0.15;
  out_g_touch_d(shTouch && !isNaN(vdv) && l <= vdv + near && h >= vdv - near ? 1.0 : 0.0);
  out_g_touch_e(shTouch && !isNaN(ema50) && l <= ema50 + near && h >= ema50 - near ? 1.0 : 0.0);

  prevO = o; prevH = h; prevL = l; prevC = c;
  idx += 1;
}
