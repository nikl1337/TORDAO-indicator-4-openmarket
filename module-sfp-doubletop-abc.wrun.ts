//@lang=wrun-ts
// MODULE: SFP + HTF DOUBLE TOP/BOTTOM + MANIPULATION (old ABC) + ABCD
// Sound: Chart tab > Sounds (Play sounds + one sound per signal). Switches below turn a signal off completely.

param.bool("en_sfp", true, { label: "Swing failure pattern signals" });
param.bool("en_dbl", true, { label: "Higher-timeframe double top / bottom signals" });
param.bool("en_manip", true, { label: "Manipulation boxes + signal" });
param.bool("en_abcd", true, { label: "ABCD pattern lines + signal" });
param.int("swing_len", 5, { min: 2, max: 30, label: "Swing length (bars each side)" });
param.int("sfp_bars", 1, { min: 1, max: 5, label: "SFP: bars allowed to close back inside" });
param.number("sfp_min_atr", 0.05, { min: 0, max: 2, step: 0.01, label: "SFP: min sweep depth in ATR" });
param.int("htf_min", 240, { min: 5, max: 10080, label: "Double top/bottom timeframe in minutes" });
param.int("htf_len", 3, { min: 2, max: 10, label: "Swing length in HTF candles" });
param.number("dbl_tol", 0.3, { min: 0.05, max: 3, step: 0.05, label: "Double top: peak match tolerance in percent" });
param.number("dbl_depth", 0.8, { min: 0.1, max: 20, step: 0.1, label: "Double top: min depth between peaks in percent" });
param.int("dbl_gap_min", 4, { min: 2, max: 100, label: "Double top: min HTF candles between peaks" });
param.int("dbl_gap_max", 60, { min: 5, max: 400, label: "Double top: max HTF candles between peaks" });
param.number("manip_lo", 90, { min: 50, max: 100, step: 1, label: "Manipulation: AB at least this percent of BC" });
param.number("manip_hi", 110, { min: 100, max: 200, step: 1, label: "Manipulation: AB at most this percent of BC" });
param.number("manip_min_atr", 1.5, { min: 0, max: 20, step: 0.1, label: "Manipulation: min leg size in ATR" });
param.number("abcd_ret_lo", 38.2, { min: 10, max: 100, step: 0.1, label: "ABCD: BC retraces at least this percent of AB" });
param.number("abcd_ret_hi", 88.6, { min: 10, max: 100, step: 0.1, label: "ABCD: BC retraces at most this percent of AB" });
param.number("abcd_cd_lo", 90, { min: 50, max: 200, step: 1, label: "ABCD: CD at least this percent of AB" });
param.number("abcd_cd_hi", 110, { min: 50, max: 300, step: 1, label: "ABCD: CD at most this percent of AB" });
param.number("abcd_min_atr", 1.5, { min: 0, max: 20, step: 0.1, label: "ABCD: min AB size in ATR" });

const gSfpBear = output("g_sfp_bear", none);
const gSfpBull = output("g_sfp_bull", none);
const gDt = output("g_dt", none);
const gDb = output("g_db", none);
const gManip = output("g_manip", none);
const gAbcdBull = output("g_abcd_bull", none);
const gAbcdBear = output("g_abcd_bear", none);
output("sfp_bear", shape, overlay, { color: "#f43f5e", shape_where: "g_sfp_bear", shape: "triangle_down", location: "above_bar", glow: 8, description: "Bearish SFP" });
output("sfp_bull", shape, overlay, { color: "#22d3ee", shape_where: "g_sfp_bull", shape: "triangle_up", location: "below_bar", glow: 8, description: "Bullish SFP" });
output("dbl_top", shape, overlay, { color: "#fb7185", shape_where: "g_dt", shape: "diamond", location: "above_bar", glow: 8, description: "HTF double top" });
output("dbl_bot", shape, overlay, { color: "#4ade80", shape_where: "g_db", shape: "diamond", location: "below_bar", glow: 8, description: "HTF double bottom" });
output("dbl_neck", none, overlay, { description: "Neckline price", format: "price" });
output("manip_ratio", none, lower, { description: "Manipulation: AB as percent of BC", format: "0" });
output("abcd_cd", none, lower, { description: "ABCD: CD as percent of AB", format: "0" });

alert("sfp_bear_alert", { when: gSfpBear, message: "{{symbol}}: BEARISH SFP at {{close}}", title: "SFP bearish", description: "Auction failed above a swing high" });
alert("sfp_bull_alert", { when: gSfpBull, message: "{{symbol}}: BULLISH SFP at {{close}}", title: "SFP bullish", description: "Auction failed below a swing low" });
alert("double_top", { when: gDt, message: "{{symbol}}: HTF DOUBLE TOP, neckline {{dbl_neck}}", title: "HTF double top", description: "Double top confirmed" });
alert("double_bottom", { when: gDb, message: "{{symbol}}: HTF DOUBLE BOTTOM, neckline {{dbl_neck}}", title: "HTF double bottom", description: "Double bottom confirmed" });
alert("manipulation", { when: gManip, message: "{{symbol}}: MANIPULATION, AB is {{manip_ratio}}% of BC", title: "Manipulation", description: "AB within the set percent of BC" });
alert("abcd_bull_alert", { when: gAbcdBull, message: "{{symbol}}: bullish ABCD completed at D, CD is {{abcd_cd}}% of AB", title: "ABCD bullish", description: "Bullish ABCD completed" });
alert("abcd_bear_alert", { when: gAbcdBear, message: "{{symbol}}: bearish ABCD completed at D, CD is {{abcd_cd}}% of AB", title: "ABCD bearish", description: "Bearish ABCD completed" });

string("tag", { max_bytes: 16 });
handles.box({ color: "#facc15", opacity: 0.18, borderWidth: 1 });
handles.label({ size: 12 });
handles.polyline({ width: 2 });
const RING = 6;
const YELLOW: i32 = rgba(250, 204, 21, 255);
const TEAL: i32 = rgba(0, 255, 213, 255);
const PINK: i32 = rgba(255, 43, 214, 255);
function makeBoxes(first: i32, count: i32): BoxHandle[] { const out: BoxHandle[] = []; for (let i = 0; i < count; i += 1) out.push(draw.box(first + i)); return out; }
function makeLabels(first: i32, count: i32): LabelHandle[] { const out: LabelHandle[] = []; for (let i = 0; i < count; i += 1) out.push(draw.label(first + i)); return out; }
const manBoxes = makeBoxes(0, RING);
const manLabels = makeLabels(10, RING);
const polys: PolylineHandle[] = [draw.polyline(30), draw.polyline(31), draw.polyline(32), draw.polyline(33)];
const cdLabels = makeLabels(40, 16);
const cdBuf = new StaticArray<f64>(8);

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
let enSfp = true; let enDbl = true; let enManip = true; let enAbcd = true;
let sfpBars: i32 = 1; let sfpMin: f64 = 0.05;
let dblTol: f64 = 0.3; let dblDepth: f64 = 0.8; let gapMin: i32 = 4; let gapMax: i32 = 60;
let manLo: f64 = 90.0; let manHi: f64 = 110.0; let manMin: f64 = 1.5;
let rLo: f64 = 38.2; let rHi: f64 = 88.6; let cLo: f64 = 90.0; let cHi: f64 = 110.0; let cdMin: f64 = 1.5;
let lvlH: f64 = NaN; let hActive = false; let hDone = false; let hStart: i32 = 0; let hExt: f64 = NaN;
let lvlL: f64 = NaN; let lActive = false; let lDone = false; let lStart: i32 = 0; let lExt: f64 = NaN;
let bucket: f64 = NaN; let curH: f64 = NaN; let curL: f64 = NaN; let htfCount: i32 = 0;
let pH: f64 = NaN; let pHi: i32 = 0; let pL: f64 = NaN; let pLi: i32 = 0;
let pa: f64 = NaN; let pb: f64 = NaN; let pc: f64 = NaN; let pd: f64 = NaN;
let ta: f64 = NaN; let tb: f64 = NaN; let tc: f64 = NaN; let td: f64 = NaN;
let cHigh = false; let nPiv: i32 = 0; let manN: i32 = 0; let cdN: i32 = 0;
let manFire = false; let manRatio: f64 = NaN;
let cdBull = false; let cdBear = false; let cdRatio: f64 = NaN;

function drawManip(): void {
  const top = Math.max(pb, Math.max(pc, pd));
  const bot = Math.min(pb, Math.min(pc, pd));
  const slot = manN % RING;
  manN += 1;
  manBoxes[slot].set(tb, top, td, bot);
  sb_clear(); sb_text("MANIPULATION");
  manLabels[slot].set(td, pd).text(str_tag_sb).color(YELLOW);
}

function drawAbcd(bull: bool): void {
  const slot = cdN % 4;
  cdN += 1;
  cdBuf[0] = ta; cdBuf[1] = pa; cdBuf[2] = tb; cdBuf[3] = pb;
  cdBuf[4] = tc; cdBuf[5] = pc; cdBuf[6] = td; cdBuf[7] = pd;
  polys[slot].setPoints(cdBuf, 4);
  polys[slot].width(2).color(bull ? TEAL : PINK);
  const base = slot * 4;
  sb_clear(); sb_text("A");
  cdLabels[base].set(ta, pa).text(str_tag_sb).color(bull ? TEAL : PINK);
  sb_clear(); sb_text("B");
  cdLabels[base + 1].set(tb, pb).text(str_tag_sb).color(bull ? TEAL : PINK);
  sb_clear(); sb_text("C");
  cdLabels[base + 2].set(tc, pc).text(str_tag_sb).color(bull ? TEAL : PINK);
  sb_clear(); sb_text(bull ? "D bullish" : "D bearish");
  cdLabels[base + 3].set(td, pd).text(str_tag_sb).color(bull ? TEAL : PINK);
}

function pushPivot(px: f64, ts: f64, isHigh: bool, atrNow: f64): void {
  if (nPiv > 0 && cHigh == isHigh) {
    if (isHigh) { if (px > pd) { pd = px; td = ts; } }
    else { if (px < pd) { pd = px; td = ts; } }
    return;
  }
  pa = pb; ta = tb; pb = pc; tb = tc; pc = pd; tc = td; pd = px; td = ts; cHigh = isHigh; nPiv += 1;
  if (nPiv < 3) return;
  // Manipulation: the last three pivots, AB between manip_lo and manip_hi percent of BC
  const mab = Math.abs(pc - pb);
  const mbc = Math.abs(pd - pc);
  if (mab > 0.0 && mbc > 0.0) {
    const r = mab / mbc * 100.0;
    if (r >= manLo && r <= manHi && mab >= manMin * atrNow && mbc >= manMin * atrNow) {
      manFire = true; manRatio = r;
      if (enManip) drawManip();
    }
  }
  if (nPiv < 4) return;
  // ABCD: BC retraces rLo..rHi percent of AB, CD is cLo..cHi percent of AB, D passes B
  const ab = Math.abs(pb - pa);
  const bc = Math.abs(pc - pb);
  const cd = Math.abs(pd - pc);
  if (ab <= 0.0 || ab < cdMin * atrNow) return;
  const ret = bc / ab * 100.0;
  const ext = cd / ab * 100.0;
  if (ret < rLo || ret > rHi || ext < cLo || ext > cHi) return;
  const bull = !cHigh && pd < pb && pc < pa;
  const bear = cHigh && pd > pb && pc > pa;
  if (!bull && !bear) return;
  cdRatio = ext;
  if (bull) cdBull = true; else cdBear = true;
  if (enAbcd) drawAbcd(bull);
}

function onStart(): void {
  right = i32(p_swing_len());
  sw = new Swings(right, right);
  htfLen = i32(p_htf_len());
  hs = new Swings(htfLen, htfLen);
  htfSec = f64(i32(p_htf_min())) * 60.0;
  enSfp = pb_en_sfp(); enDbl = pb_en_dbl(); enManip = pb_en_manip(); enAbcd = pb_en_abcd();
  sfpBars = i32(p_sfp_bars()); sfpMin = p_sfp_min_atr();
  dblTol = p_dbl_tol(); dblDepth = p_dbl_depth(); gapMin = i32(p_dbl_gap_min()); gapMax = i32(p_dbl_gap_max());
  manLo = p_manip_lo(); manHi = p_manip_hi(); manMin = p_manip_min_atr();
  rLo = p_abcd_ret_lo(); rHi = p_abcd_ret_hi(); cLo = p_abcd_cd_lo(); cHi = p_abcd_cd_hi(); cdMin = p_abcd_min_atr();
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
  manFire = false; manRatio = NaN; cdBull = false; cdBear = false; cdRatio = NaN;

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
  out_g_manip(enManip && manFire ? 1.0 : 0.0);
  out_manip_ratio(enManip && manFire ? manRatio : NaN);
  out_g_abcd_bull(enAbcd && cdBull ? 1.0 : 0.0);
  out_g_abcd_bear(enAbcd && cdBear ? 1.0 : 0.0);
  out_abcd_cd(enAbcd && (cdBull || cdBear) ? cdRatio : NaN);
  pClose = c;
  idx += 1;
}
