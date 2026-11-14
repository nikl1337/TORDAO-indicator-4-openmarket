//@lang=wrun-ts
// MODULE: VERY HIGH TIMEFRAME LEVELS + TRENDLINES + CHANNELS + PATTERN LINES + D/W/M OPENS + DAILY EQ
// Standalone for now, to be merged later. Untested until Run in the OpenMarket editor.
// The HTF swings come from real weekly candles (candles stream), so every line is drawn in absolute time/price
// and shows on any chart timeframe, including 1m. To use another very high timeframe, change interval: "1w" below.

input("close", ohlcv.close); // primary input: the chart's own candles
input("wk", candles.cells, { interval: "1w", bars: 300, description: "Closed weekly candles (very high timeframe)" });

page("Show");
param.bool("show_levels", true, { label: "Exact HTF levels (last 3 swing highs and lows)" });
param.bool("show_trend", true, { label: "HTF trendlines" });
param.bool("show_channel", true, { label: "Parallel channels + middle lines" });
param.bool("show_pattern", true, { label: "Pattern line connecting the last HTF price points" });
param.bool("show_do", true, { label: "Daily open" });
param.bool("show_wo", true, { label: "Weekly open" });
param.bool("show_mo", true, { label: "Monthly open" });
param.bool("show_peq", true, { label: "EQ of previous day (neon green)" });
param.bool("show_ceq", true, { label: "EQ of current day (neon pink)" });
page("Settings");
param.int("htf_len", 3, { min: 2, max: 10, label: "Swing length in HTF candles (each side)" });
param.int("pattern_pts", 8, { min: 3, max: 24, label: "Price points joined by the pattern line" });

// Opens and EQs: thin dotted lines with their exact price tagged on the y axis
output("open_d", line, overlay, { color: "#ffffff", width: 1, line_style: "dotted", axis_label: true, description: "Daily open (UTC)" });
output("open_w", line, overlay, { color: "#ffffff", width: 1, line_style: "dotted", axis_label: true, description: "Weekly open (UTC, Monday)" });
output("open_m", line, overlay, { color: "#ffffff", width: 1, line_style: "dotted", axis_label: true, description: "Monthly open (UTC)" });
output("eq_prev", line, overlay, { color: "#39ff14", width: 1, line_style: "dotted", axis_label: true, description: "EQ of the previous day (neon green)" });
output("eq_cur", line, overlay, { color: "#ff2bd6", width: 1, line_style: "dotted", axis_label: true, description: "EQ of the current day, so far (neon pink)" });

// Trendlines, levels, channels: line handles, all white, thin, dotted, price pilled on the axis
handles.line({ color: "#ffffff", width: 1, line_style: "dotted", sticky_right: true, axis_label: "price" });
handles.polyline({ color: "#ffffff", width: 1, line_style: "dotted" });

const WHITE: i32 = rgba(255, 255, 255, 255);
const MAXP = 32;   // pivots kept
const CR = 64;     // candle times kept
const NLINES = 12;
function makeLines(first: i32, count: i32): LineHandle[] { const out: LineHandle[] = []; for (let i = 0; i < count; i += 1) out.push(draw.line(first + i)); return out; }
const lines = makeLines(0, NLINES);
const poly = draw.polyline(12);
const pxs = new StaticArray<f64>(MAXP);
const pts = new StaticArray<f64>(MAXP);
const pkind = new StaticArray<i32>(MAXP);
const ctimes = new StaticArray<f64>(CR);
const pbuf = new StaticArray<f64>(MAXP * 2);

let hs = new Swings(3, 3);
let htfLen: i32 = 3;
let patPts: i32 = 8;
let np: i32 = 0;
let ncandle: i32 = 0;
let day = new PeriodLevels("day");
let week = new PeriodLevels("week");
let month = new PeriodLevels("month");
let shLevels = true; let shTrend = true; let shChan = true; let shPat = true;
let shDo = true; let shWo = true; let shMo = true; let shPeq = true; let shCeq = true;

function addPivot(price: f64, time: f64, kind: i32): void {
  if (np == MAXP) {
    for (let i = 0; i < MAXP - 1; i++) { pxs[i] = pxs[i + 1]; pts[i] = pts[i + 1]; pkind[i] = pkind[i + 1]; }
    np = MAXP - 1;
  }
  pxs[np] = price; pts[np] = time; pkind[np] = kind; np += 1;
}

function styleLine(h: LineHandle, op: f64): void {
  h.style(LineStyle.Dotted).width(1).color(WHITE).extend(Extend.Right).opacity(op);
}

function drawLevel(slot: i32, k: i32, show: bool, t: f64): void {
  if (show && k >= 0) {
    const h = lines[slot];
    h.set(pts[k], pxs[k], t, pxs[k]);
    styleLine(h, 1.0);
  } else {
    lines[slot].delete();
  }
}

// One trendline through two pivots (ka older, kb newer) with its parallel channel line and the middle line between them.
function drawSlope(idMain: i32, idPar: i32, idMid: i32, ka: i32, kb: i32, isRes: bool, t: f64): void {
  if (ka < 0 || kb < 0 || pts[kb] <= pts[ka]) { lines[idMain].delete(); lines[idPar].delete(); lines[idMid].delete(); return; }
  const m = (pxs[kb] - pxs[ka]) / (pts[kb] - pts[ka]);
  const yNow = pxs[ka] + m * (t - pts[ka]);
  if (shTrend) {
    const h = lines[idMain];
    h.set(pts[ka], pxs[ka], t, yNow);
    styleLine(h, 1.0);
  } else lines[idMain].delete();
  // the channel: the parallel through the farthest opposite pivot since the first anchor
  let d: f64 = 0.0;
  let have = false;
  for (let k = ka; k < np; k++) {
    if (pkind[k] == (isRes ? -1 : 1)) {
      const dv = pxs[k] - (pxs[ka] + m * (pts[k] - pts[ka]));
      if (isRes) { if (!have || dv < d) { d = dv; have = true; } }
      else { if (!have || dv > d) { d = dv; have = true; } }
    }
  }
  const valid = have && ((isRes && d < 0.0) || (!isRes && d > 0.0));
  if (shChan && valid) {
    const p = lines[idPar];
    p.set(pts[ka], pxs[ka] + d, t, yNow + d);
    styleLine(p, 1.0);
    const md = lines[idMid];
    md.set(pts[ka], pxs[ka] + d * 0.5, t, yNow + d * 0.5);
    styleLine(md, 0.6);
  } else { lines[idPar].delete(); lines[idMid].delete(); }
}

function onStart(): void {
  htfLen = i32(p_htf_len());
  patPts = i32(p_pattern_pts());
  hs = new Swings(htfLen, htfLen);
  day = new PeriodLevels("day");
  week = new PeriodLevels("week");
  month = new PeriodLevels("month");
  shLevels = pb_show_levels(); shTrend = pb_show_trend(); shChan = pb_show_channel(); shPat = pb_show_pattern();
  shDo = pb_show_do(); shWo = pb_show_wo(); shMo = pb_show_mo(); shPeq = pb_show_peq(); shCeq = pb_show_ceq();
}

function onBar(): void {
  const t = bar.time();

  // ---- feed the closed weekly candles that arrived with this bar (the first bar carries the backlog)
  const n = in_wk_cells();
  if (n >= 6) {
    const cells = in_wk_view();
    for (let i = 0; i + 5 < n; i += 6) {
      ctimes[ncandle % CR] = t + cells[i] / 1000.0; // candle open = bar open + offset
      ncandle += 1;
      hs.update(cells[i + 2], cells[i + 3]);
      const pi = ncandle - 1 - htfLen; // the swing printed htfLen candles ago
      if (pi >= 0) {
        const pt = ctimes[pi % CR];
        if (hs.newHigh()) addPivot(hs.lastHigh(), pt, 1);
        if (hs.newLow()) addPivot(hs.lastLow(), pt, -1);
      }
    }
  }

  // ---- opens and EQs from the calendar levels (UTC)
  day.update(t, bar.open(), bar.high(), bar.low(), bar.close());
  week.update(t, bar.open(), bar.high(), bar.low(), bar.close());
  month.update(t, bar.open(), bar.high(), bar.low(), bar.close());
  const dHi = day.high(); const dLo = day.low();
  const pHi = day.prevHigh(); const pLo = day.prevLow();
  out_open_d(shDo ? day.open() : NaN);
  out_open_w(shWo ? week.open() : NaN);
  out_open_m(shMo ? month.open() : NaN);
  out_eq_prev(shPeq && !isNaN(pHi) && !isNaN(pLo) ? (pHi + pLo) * 0.5 : NaN);
  out_eq_cur(shCeq && !isNaN(dHi) && !isNaN(dLo) ? (dHi + dLo) * 0.5 : NaN);

  // ---- draw the HTF objects once, on the newest bar, from the finished state
  if (bar.isLast()) {
    let h1 = -1; let h2 = -1; let h3 = -1; let l1 = -1; let l2 = -1; let l3 = -1;
    for (let k = np - 1; k >= 0; k--) {
      if (pkind[k] == 1) { if (h1 < 0) h1 = k; else if (h2 < 0) h2 = k; else if (h3 < 0) h3 = k; }
      else { if (l1 < 0) l1 = k; else if (l2 < 0) l2 = k; else if (l3 < 0) l3 = k; }
    }
    drawLevel(0, h1, shLevels, t); drawLevel(1, h2, shLevels, t); drawLevel(2, h3, shLevels, t);
    drawLevel(3, l1, shLevels, t); drawLevel(4, l2, shLevels, t); drawLevel(5, l3, shLevels, t);
    drawSlope(6, 8, 9, h2, h1, true, t);   // resistance line: lower parallel + middle
    drawSlope(7, 10, 11, l2, l1, false, t); // support line: upper parallel + middle
    // pattern: one path through the last pattern_pts confirmed HTF pivots, then to the newest close
    let cnt = np < patPts ? np : patPts;
    if (shPat && cnt >= 2) {
      const start = np - cnt;
      for (let j = 0; j < cnt; j++) { pbuf[2 * j] = pts[start + j]; pbuf[2 * j + 1] = pxs[start + j]; }
      pbuf[2 * cnt] = t; pbuf[2 * cnt + 1] = bar.close();
      poly.setPoints(pbuf, cnt + 1);
      poly.style(LineStyle.Dotted).width(1).color(WHITE);
    } else poly.delete();
  }
}
