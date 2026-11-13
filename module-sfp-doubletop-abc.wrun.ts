//@lang=wrun-ts
// MODULE: SWING FAILURE PATTERN + HIGHER-TIMEFRAME DOUBLE TOP/BOTTOM + ABC CORRECTION
// Standalone for now, to be merged into the main indicator once it compiles. Untested until Run in the OpenMarket editor.

note("Sound: open this indicator's settings, Chart tab, Sounds. Turn on Play sounds and pick a sound per signal. The switches below turn a signal off completely (no mark, no alert, no sound).");
page("Signals");
param.bool("en_sfp", true, { label: "Swing failure pattern signals" });
param.bool("en_dbl", true, { label: "Higher-timeframe double top / bottom signals" });
param.bool("en_abc", true, { label: "ABC correction boxes + signal" });
page("SFP");
param.int("swing_len", 5, { min: 2, max: 30, label: "Swing length (bars each side)" });
param.int("sfp_bars", 1, { min: 1, max: 5, label: "Bars allowed to close back inside" });
param.number("sfp_min_atr", 0.05, { min: 0, max: 2, step: 0.01, label: "Min sweep depth in ATR" });
page("Double top / bottom");
param.int("htf_min", 240, { min: 5, max: 10080, label: "Higher timeframe in minutes (240 = 4h, 1440 = 1d)" });
param.int("htf_len", 3, { min: 2, max: 10, label: "Swing length in higher-timeframe candles" });
param.number("dbl_tol", 0.3, { min: 0.05, max: 3, step: 0.05, label: "Peak match tolerance in percent" });
param.number("dbl_depth", 0.8, { min: 0.1, max: 20, step: 0.1, label: "Min depth between the peaks in percent" });
param.int("dbl_gap_min", 4, { min: 2, max: 100, label: "Min higher-timeframe candles between peaks" });
param.int("dbl_gap_max", 60, { min: 5, max: 400, label: "Max higher-timeframe candles between peaks" });
page("ABC");
param.number("abc_lo", 90, { min: 50, max: 100, step: 1, label: "AB must be at least this percent of BC" });
param.number("abc_hi", 110, { min: 100, max: 200, step: 1, label: "AB must be at most this percent of BC" });
param.number("abc_min_atr", 1.5, { min: 0, max: 20, step: 0.1, label: "Min leg size in ATR (filters noise)" });

const gSfpBear = output("g_sfp_bear", none);
const gSfpBull = output("g_sfp_bull", none);
const gDt = output("g_dt", none);
const gDb = output("g_db", none);
const gAbc = output("g_abc", none);
output("sfp_bear", shape, overlay, { color: "#f43f5e", shape_where: "g_sfp_bear", shape: "triangle_down", location: "above_bar", glow: 8, description: "Bearish SFP: swing high swept, close back below" });
output("sfp_bull", shape, overlay, { color: "#22d3ee", shape_where: "g_sfp_bull", shape: "triangle_up", location: "below_bar", glow: 8, description: "Bullish SFP: swing low swept, close back above" });
output("dbl_top", shape, overlay, { color: "#fb7185", shape_where: "g_dt", shape: "diamond", location: "above_bar", glow: 8, description: "Higher-timeframe double top confirmed" });
output("dbl_bot", shape, overlay, { color: "#4ade80", shape_where: "g_db", shape: "diamond", location: "below_bar", glow: 8, description: "Higher-timeframe double bottom confirmed" });
output("dbl_neck", none, overlay, { description: "Neckline price of the double top/bottom", format: "price" });
output("abc_ratio", none, lower, { description: "AB length as percent of BC", format: "0" });
output("abc_dir", none, lower, { description: "+1 when C is a low (bullish), -1 when C is a high (bearish)" });

// Declared in order of importance: when two signals rise together, the first one declared plays.
alert("sfp_bear", { when: gSfpBear, message: "{{symbol}}: BEARISH swing failure (SFP) at {{close}}", title: "SFP bearish", description: "Auction failed above a swing high" });
alert("sfp_bull", { when: gSfpBull, message: "{{symbol}}: BULLISH swing failure (SFP) at {{close}}", title: "SFP bullish", description: "Auction failed below a swing low" });
alert("double_top", { when: gDt, message: "{{symbol}}: higher-timeframe DOUBLE TOP, neckline {{dbl_neck}}", title: "HTF double top", description: "Double top confirmed on the higher timeframe" });
alert("double_bottom", { when: gDb, message: "{{symbol}}: higher-timeframe DOUBLE BOTTOM, neckline {{dbl_neck}}", title: "HTF double bottom", description: "Double bottom confirmed on the higher timeframe" });
alert("abc", { when: gAbc, message: "{{symbol}}: ABC correction, AB is {{abc_ratio}}% of BC", title: "ABC correction", description: "AB is within the set percent of BC" });

string("tag", { max_bytes: 8 });
handles.box({ color: "#facc15", opacity: 0.18, borderWidth: 1 });
handles.label({ size: 13 });
const RING = 6;
const YELLOW: i32 = rgba(250, 204, 21, 255);
function makeBoxes(first: i32, count: i32): BoxHandle[] { const out: BoxHandle[] = []; for (let i = 0; i < count; i += 1) out.push(draw.box(first + i)); return out; }
function makeLabels(first: i32, count: i32): LabelHandle[] { const out: LabelHandle[] = []; for (let i = 0; i < count; i += 1) out.push(draw.label(first + i)); return out; }
const abcBoxes = makeBoxes(0, RING);
const abcLabels = makeLabels(10, RING * 3);

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
let t: f64 = NaN; let prevT: f64 = NaN; let width: f64 = NaN;
let enSfp = true; let enDbl = true; let enAbc = true;
let sfpBars: i32 = 1; let sfpMin: f64 = 0.05;
let dblTol: f64 = 0.3; let dblDepth: f64 = 0.8; let gapMin: i32 = 4; let gapMax: i32 = 60;
let abcLo: f64 = 90.0; let abcHi: f64 = 110.0; let abcMin: f64 = 1.5;
// SFP state
let lvlH: f64 = NaN; let hActive = false; let hDone = false; let hStart: i32 = 0; let hExt: f64 = NaN;
let lvlL: f64 = NaN; let lActive = false; let lDone = false; let lStart: i32 = 0; let lExt: f64 = NaN;
// higher-timeframe bucket state
let bucket: f64 = NaN; let curH: f64 = NaN; let curL: f64 = NaN; let htfCount: i32 = 0;
let pH: f64 = NaN; let pHi: i32 = 0; let pL: f64 = NaN; let pLi: i32 = 0;
// ABC state: last three alternating pivots
let pa: f64 = NaN; let pb: f64 = NaN; let pc: f64 = NaN;
let ta: f64 = NaN; let tb: f64 = NaN; let tc: f64 = NaN;
let cHigh = false; let nPiv: i32 = 0; let abcN: i32 = 0;
let abcFire = false; let abcRatio: f64 = NaN; let abcDir: f64 = NaN;

function drawAbc(): void {
  if (isNaN(ta) || isNaN(tb) || isNaN(tc)) return;
  const top = Math.max(pa, Math.max(pb, pc));
  const bot = Math.min(pa, Math.min(pb, pc));
  const slot = abcN % RING;
  abcN += 1;
  abcBoxes[slot].set(ta, top, tc, bot);
  sb_clear(); sb_text("A");
  abcLabels[slot * 3].set(ta, pa).text(str_tag_sb).color(YELLOW);
  sb_clear(); sb_text("B");
  abcLabels[slot * 3 + 1].set(tb, pb).text(str_tag_sb).color(YELLOW);
  sb_clear(); sb_text("C");
  abcLabels[slot * 3 + 2].set(tc, pc).text(str_tag_sb).color(YELLOW);
}

function pushPivot(px: f64, ts: f64, isHigh: bool, atrNow: f64): void {
  if (nPiv > 0 && cHigh == isHigh) {
    // two pivots of the same kind in a row: keep the more extreme one
    if (isHigh) { if (px > pc) { pc = px; tc = ts; } }
    else { if (px < pc) { pc = px; tc = ts; } }
    return;
  }
  pa = pb; ta = tb; pb = pc; tb = tc; pc = px; tc = ts; cHigh = isHigh; nPiv += 1;
  if (nPiv < 3) return;
  const ab = Math.abs(pb - pa);
  const bc = Math.abs(pc - pb);
  if (bc <= 0.0 || ab <= 0.0) return;
  const r = ab / bc * 100.0;
  if (r >= abcLo && r <= abcHi && ab >= abcMin * atrNow && bc >= abcMin * atrNow) {
    abcFire = true;
    abcRatio = r;
    abcDir = cHigh ? -1.0 : 1.0;
    if (enAbc) drawAbc();
  }
}

function onStart(): void {
  right = i32(p_swing_len());
  sw = new Swings(right, right);
  htfLen = i32(p_htf_len());
  hs = new Swings(htfLen, htfLen);
  htfSec = f64(i32(p_htf_min())) * 60.0;
  enSfp = pb_en_sfp(); enDbl = pb_en_dbl(); enAbc = pb_en_abc();
  sfpBars = i32(p_sfp_bars()); sfpMin = p_sfp_min_atr();
  dblTol = p_dbl_tol(); dblDepth = p_dbl_depth(); gapMin = i32(p_dbl_gap_min()); gapMax = i32(p_dbl_gap_max());
  abcLo = p_abc_lo(); abcHi = p_abc_hi(); abcMin = p_abc_min_atr();
}

function onBar(): void {
  const h = bar.high(), l = bar.low(), c = bar.close();
  prevT = t;
  t = bar.time();
  if (!isNaN(prevT) && t > prevT && (isNaN(width) || t - prevT < width)) width = t - prevT;
  const tr = isNaN(pClose) ? h - l : Math.max(h - l, Math.max(Math.abs(h - pClose), Math.abs(l - pClose)));
  atr = isNaN(atr) ? tr : (atr * 13.0 + tr) / 14.0;
  sw.update(h, l);
  let sb = 0.0; let su = 0.0; let dt = 0.0; let db = 0.0; let neck = NaN;
  abcFire = false; abcRatio = NaN; abcDir = NaN;

  // ---- SFP: a confirmed swing level is swept by a wick and the close comes back inside within sfp_bars
  if (sw.newHigh()) { lvlH = sw.lastHigh(); hActive = false; hDone = false; }
  if (sw.newLow()) { lvlL = sw.lastLow(); lActive = false; lDone = false; }
  if (!isNaN(lvlH) && !hDone) {
    if (h > lvlH) { if (!hActive) { hActive = true; hStart = idx; hExt = h; } else if (h > hExt) hExt = h; }
    if (hActive) {
      if (c < lvlH) { if (hExt - lvlH >= sfpMin * atr) sb = 1.0; hActive = false; hDone = true; }
      else if (idx - hStart + 1 >= sfpBars) { hActive = false; hDone = true; }
    }
  }
  if (!isNaN(lvlL) && !lDone) {
    if (l < lvlL) { if (!lActive) { lActive = true; lStart = idx; lExt = l; } else if (l < lExt) lExt = l; }
    if (lActive) {
      if (c > lvlL) { if (lvlL - lExt >= sfpMin * atr) su = 1.0; lActive = false; lDone = true; }
      else if (idx - lStart + 1 >= sfpBars) { lActive = false; lDone = true; }
    }
  }

  // ---- Higher-timeframe double top / bottom: fold chart bars into closed HTF candles (no repaint)
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
        let mn = Infinity;
        for (let k = pHi; k <= sIdx; k++) { const v = loRing[k % HR]; if (v < mn) mn = v; }
        const top = Math.min(px, pH);
        if ((top - mn) / top * 100.0 >= dblDepth) { dt = 1.0; neck = mn; }
      }
      pH = px; pHi = sIdx;
    }
    if (hs.newLow()) {
      const px = hs.lastLow();
      if (!isNaN(pL) && sIdx - pLi >= gapMin && sIdx - pLi <= gapMax && Math.abs(px - pL) / pL * 100.0 <= dblTol) {
        let mx = -Infinity;
        for (let k = pLi; k <= sIdx; k++) { const v = hiRing[k % HR]; if (v > mx) mx = v; }
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

  // ---- ABC: three alternating confirmed pivots, AB between abc_lo and abc_hi percent of BC
  const tp = isNaN(width) ? NaN : t - width * f64(right);
  if (sw.newHigh()) pushPivot(sw.lastHigh(), tp, true, atr);
  if (sw.newLow()) pushPivot(sw.lastLow(), tp, false, atr);

  out_g_sfp_bear(enSfp ? sb : 0.0);
  out_g_sfp_bull(enSfp ? su : 0.0);
  out_sfp_bear(h);
  out_sfp_bull(l);
  out_g_dt(enDbl ? dt : 0.0);
  out_g_db(enDbl ? db : 0.0);
  out_dbl_top(h);
  out_dbl_bot(l);
  out_dbl_neck(enDbl ? neck : NaN);
  out_g_abc(enAbc && abcFire ? 1.0 : 0.0);
  out_abc_ratio(enAbc && abcFire ? abcRatio : NaN);
  out_abc_dir(enAbc && abcFire ? abcDir : NaN);
  pClose = c;
  idx += 1;
}
