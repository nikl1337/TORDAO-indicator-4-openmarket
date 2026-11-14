//@lang=wrun-ts
// MODULE: FINISHED BUTTERFLY + BAT PATTERNS, 15m / 1h DOJI + HAMMER (+ SHOOTING STAR) REVERSAL MARKS
// Standalone for now, to be merged later. Untested until Run in the OpenMarket editor.
// Handle ids 200-253 are reserved for this module so they do not collide with the other modules at merge time.
// Sound: Chart tab > Sounds in this indicator's settings (Play sounds + a sound per signal). The switches below turn a signal off completely.

input("close", ohlcv.close);
input("c15", candles.cells, { interval: "15m", bars: 8, max_cells: 64, description: "Closed 15m candles" });
input("c60", candles.cells, { interval: "1h", bars: 8, max_cells: 16, description: "Closed 1h candles" });

page("Signals");
param.bool("en_15", true, { label: "15m doji / hammer / shooting star reversals" });
param.bool("en_60", true, { label: "1h doji / hammer / shooting star reversals" });
param.bool("en_doji", true, { label: "Doji" });
param.bool("en_hammer", true, { label: "Hammer (bottom) and shooting star (top)" });
param.bool("en_bat", true, { label: "Bat pattern" });
param.bool("en_fly", true, { label: "Butterfly pattern" });
page("Candle rules");
param.number("doji_pct", 10, { min: 1, max: 30, step: 1, label: "Doji: body at most this percent of the range" });
param.number("wick_mult", 2, { min: 1, max: 5, step: 0.1, label: "Hammer / star: long wick at least this many bodies" });
param.number("small_wick", 15, { min: 0, max: 40, step: 1, label: "Hammer / star: opposite wick at most this percent of the range" });
param.number("min_range", 0.8, { min: 0, max: 3, step: 0.1, label: "Min candle range vs the average of the last 5" });
param.int("trend_n", 5, { min: 2, max: 12, label: "Prior trend: compare with the close this many candles back" });
page("Harmonics");
param.int("swing_len", 5, { min: 2, max: 30, label: "Swing length (bars each side)" });
param.number("fib_tol", 0.05, { min: 0.01, max: 0.15, step: 0.01, label: "Ratio tolerance (absolute)" });

const gR15 = output("g_r15", none);
const gR60 = output("g_r60", none);
const gBat = output("g_bat", none);
const gFly = output("g_fly", none);
output("pat_dir", none, overlay, { description: "+1 bullish, -1 bearish for the pattern that just finished" });

// Declared in order of importance: when two rise together, the first one plays.
alert("butterfly", { when: gFly, message: "{{symbol}}: finished BUTTERFLY pattern ({{pat_dir}}) at {{close}}", title: "Butterfly", description: "A butterfly pattern completed at D" });
alert("bat", { when: gBat, message: "{{symbol}}: finished BAT pattern ({{pat_dir}}) at {{close}}", title: "Bat", description: "A bat pattern completed at D" });
alert("rev_1h", { when: gR60, message: "{{symbol}}: 1h REVERSAL candle at {{close}}", title: "1h reversal candle", description: "1h doji / hammer / shooting star that fulfils the criteria" });
alert("rev_15m", { when: gR15, message: "{{symbol}}: 15m REVERSAL candle at {{close}}", title: "15m reversal candle", description: "15m doji / hammer / shooting star that fulfils the criteria" });

string("tag", { max_bytes: 48 });
handles.label({ size: 11 });
handles.polyline({ width: 2 });
const TEAL: i32 = rgba(0, 255, 213, 255);
const PINK: i32 = rgba(255, 43, 214, 255);
const FLY: i32 = rgba(192, 132, 252, 255);
const BAT: i32 = rgba(251, 146, 60, 255);
function makeLabels(first: i32, count: i32): LabelHandle[] { const out: LabelHandle[] = []; for (let i = 0; i < count; i += 1) out.push(draw.label(first + i)); return out; }
const lab15 = makeLabels(200, 8);
const lab60 = makeLabels(210, 8);
const polys: PolylineHandle[] = [draw.polyline(220), draw.polyline(221), draw.polyline(222), draw.polyline(223)];
const ptLabs = makeLabels(230, 20);
const nameLabs = makeLabels(250, 4);
let n15: i32 = 0; let n60: i32 = 0; let nPat: i32 = 0;

// ---- candle state per timeframe
class Tf {
  closes: StaticArray<f64> = new StaticArray<f64>(16);
  ranges: StaticArray<f64> = new StaticArray<f64>(5);
  nc: i32 = 0;
}
const s15 = new Tf();
const s60 = new Tf();

// 0 none, 1 doji bottom, 2 doji top, 3 hammer bottom, 4 shooting star top
function judge(s: Tf, o: f64, h: f64, l: f64, c: f64, trendN: i32, dojiPct: f64, wickMult: f64, smallWick: f64, minRange: f64, enDoji: bool, enHam: bool): i32 {
  const range = h - l;
  let code = 0;
  if (range > 0.0 && s.nc > trendN) {
    let avg = 0.0; let cnt = 0;
    for (let i = 0; i < 5; i++) { if (s.ranges[i] > 0.0) { avg += s.ranges[i]; cnt += 1; } }
    avg = cnt > 0 ? avg / f64(cnt) : range;
    if (range >= minRange * avg) {
      const prev = s.closes[(s.nc - 1) % 16];
      const back = s.closes[(s.nc - 1 - trendN) % 16];
      const up = prev > back; const down = prev < back;
      const body = Math.abs(c - o);
      const upW = h - Math.max(o, c);
      const loW = Math.min(o, c) - l;
      if (enDoji && body <= dojiPct / 100.0 * range) {
        if (down) code = 1; else if (up) code = 2;
      }
      if (code == 0 && enHam && body > 0.0) {
        if (loW >= wickMult * body && upW <= smallWick / 100.0 * range && down) code = 3;
        else if (upW >= wickMult * body && loW <= smallWick / 100.0 * range && up) code = 4;
      }
    }
  }
  s.closes[s.nc % 16] = c;
  s.ranges[s.nc % 5] = range;
  s.nc += 1;
  return code;
}

function nameOf(code: i32): string {
  if (code == 1 || code == 2) return "Doji";
  if (code == 3) return "Hammer";
  return "Shooting star";
}

function tagCandle(h: LabelHandle, tfName: string, code: i32, x: f64, hi: f64, lo: f64, atr: f64): void {
  const top = code == 2 || code == 4;
  sb_clear();
  sb_text(tfName); sb_text(" "); sb_text(nameOf(code)); sb_text(top ? ": TOP REVERSAL" : ": BOTTOM REVERSAL");
  if (top) h.set(x, hi + 0.4 * atr).text(str_tag_sb).color(PINK);
  else h.set(x, lo - 0.4 * atr).text(str_tag_sb).color(TEAL);
}

// ---- harmonic state: last five alternating pivots X A B C D
const px = new StaticArray<f64>(5);
const pt = new StaticArray<f64>(5);
const pk = new StaticArray<i32>(5);
const pbuf = new StaticArray<f64>(10);
let nPiv: i32 = 0;

function inR(v: f64, lo: f64, hi: f64, tol: f64): bool { return v >= lo - tol && v <= hi + tol; }

function drawPattern(isFly: bool): void {
  const slot = nPat % 4;
  nPat += 1;
  const bull = pk[4] == -1;
  for (let i = 0; i < 5; i++) { pbuf[2 * i] = pt[i]; pbuf[2 * i + 1] = px[i]; }
  polys[slot].setPoints(pbuf, 5);
  polys[slot].width(2).color(isFly ? FLY : BAT);
  const names = ["X", "A", "B", "C", "D"];
  for (let i = 0; i < 5; i++) {
    sb_clear(); sb_text(names[i]);
    ptLabs[slot * 5 + i].set(pt[i], px[i]).text(str_tag_sb).color(isFly ? FLY : BAT);
  }
  sb_clear(); sb_text(isFly ? "BUTTERFLY " : "BAT "); sb_text(bull ? "bullish" : "bearish");
  nameLabs[slot].set(pt[4], bull ? px[4] - 0.0 : px[4]).text(str_tag_sb).color(bull ? TEAL : PINK);
}

let sw = new Swings(5, 5);
let right: i32 = 5;
let fibTol: f64 = 0.05;
let atr: f64 = NaN; let pClose: f64 = NaN;
let t: f64 = NaN; let prevT: f64 = NaN; let width: f64 = NaN;
let en15 = true; let en60 = true; let enDoji = true; let enHam = true; let enBat = true; let enFly = true;
let trendN: i32 = 5; let dojiPct: f64 = 10.0; let wickMult: f64 = 2.0; let smallWick: f64 = 15.0; let minRange: f64 = 0.8;
let patFire: i32 = 0; let patDir: f64 = NaN;

function pushPivot(price: f64, time: f64, kind: i32): void {
  if (nPiv > 0 && pk[4] == kind) {
    if ((kind == 1 && price > px[4]) || (kind == -1 && price < px[4])) { px[4] = price; pt[4] = time; }
    return;
  }
  for (let i = 0; i < 4; i++) { px[i] = px[i + 1]; pt[i] = pt[i + 1]; pk[i] = pk[i + 1]; }
  px[4] = price; pt[4] = time; pk[4] = kind;
  nPiv += 1;
  if (nPiv < 5) return;
  const xa = Math.abs(px[1] - px[0]);
  const ab = Math.abs(px[2] - px[1]);
  const bc = Math.abs(px[3] - px[2]);
  const cd = Math.abs(px[4] - px[3]);
  const xd = Math.abs(px[4] - px[1]);
  if (xa <= 0.0 || ab <= 0.0 || bc <= 0.0) return;
  const rB = ab / xa; const rC = bc / ab; const rBC = cd / bc; const rD = xd / xa;
  const rcOk = inR(rC, 0.382, 0.886, fibTol);
  const projOk = inR(rBC, 1.618, 2.618, fibTol * 2.0);
  const dir = kind == -1 ? 1.0 : -1.0;
  if (enBat && rcOk && projOk && inR(rB, 0.382, 0.5, fibTol) && Math.abs(rD - 0.886) <= fibTol) { patFire = 1; patDir = dir; drawPattern(false); }
  else if (enFly && rcOk && projOk && inR(rB, 0.786, 0.786, fibTol) && inR(rD, 1.272, 1.618, fibTol)) { patFire = 2; patDir = dir; drawPattern(true); }
}

function onStart(): void {
  right = i32(p_swing_len());
  sw = new Swings(right, right);
  fibTol = p_fib_tol();
  en15 = pb_en_15(); en60 = pb_en_60(); enDoji = pb_en_doji(); enHam = pb_en_hammer(); enBat = pb_en_bat(); enFly = pb_en_fly();
  trendN = i32(p_trend_n()); dojiPct = p_doji_pct(); wickMult = p_wick_mult(); smallWick = p_small_wick(); minRange = p_min_range();
}

function onBar(): void {
  const h = bar.high(), l = bar.low(), c = bar.close();
  prevT = t; t = bar.time();
  if (!isNaN(prevT) && t > prevT && (isNaN(width) || t - prevT < width)) width = t - prevT;
  const tr = isNaN(pClose) ? h - l : Math.max(h - l, Math.max(Math.abs(h - pClose), Math.abs(l - pClose)));
  atr = isNaN(atr) ? tr : (atr * 13.0 + tr) / 14.0;
  patFire = 0; patDir = NaN;

  // ---- harmonics on confirmed swings of the chart timeframe
  sw.update(h, l);
  if (!isNaN(width)) {
    const tp = t - width * f64(right);
    if (sw.newHigh()) pushPivot(sw.lastHigh(), tp, 1);
    if (sw.newLow()) pushPivot(sw.lastLow(), tp, -1);
  }

  // ---- closed 15m and 1h candles that arrived with this bar
  let f15 = 0.0; let f60 = 0.0;
  const n1 = in_c15_cells();
  if (n1 >= 6) {
    const cells = in_c15_view();
    for (let i = 0; i + 5 < n1; i += 6) {
      const code = judge(s15, cells[i + 1], cells[i + 2], cells[i + 3], cells[i + 4], trendN, dojiPct, wickMult, smallWick, minRange, enDoji, enHam);
      if (code > 0 && en15) {
        const slot = n15 % 8; n15 += 1;
        tagCandle(lab15[slot], "15m", code, t + cells[i] / 1000.0, cells[i + 2], cells[i + 3], atr);
        if (i + 6 >= n1) f15 = 1.0;
      }
    }
  }
  const n2 = in_c60_cells();
  if (n2 >= 6) {
    const cells = in_c60_view();
    for (let i = 0; i + 5 < n2; i += 6) {
      const code = judge(s60, cells[i + 1], cells[i + 2], cells[i + 3], cells[i + 4], trendN, dojiPct, wickMult, smallWick, minRange, enDoji, enHam);
      if (code > 0 && en60) {
        const slot = n60 % 8; n60 += 1;
        tagCandle(lab60[slot], "1h", code, t + cells[i] / 1000.0, cells[i + 2], cells[i + 3], atr);
        if (i + 6 >= n2) f60 = 1.0;
      }
    }
  }

  out_g_r15(f15);
  out_g_r60(f60);
  out_g_bat(patFire == 1 ? 1.0 : 0.0);
  out_g_fly(patFire == 2 ? 1.0 : 0.0);
  out_pat_dir(patDir);
  pClose = c;
}
