//@lang=wrun-ts
// TORDAO indicator 4: LIQUIDITY AUCTION ZONES + AUTO TRENDLINES
// Rebuilt from the setting list + feature text, not the original sources. Untested until Run in the OpenMarket editor.

param("swing_len", 5, { min: 2, max: 30, description: "Swing length (bars each side)" });
param("zone_atr", 0.6, { min: 0.1, max: 3, description: "Zone depth in ATR" });
param("near_atr", 1.5, { min: 0.3, max: 6, description: "Revisit-likely distance in ATR" });
param("max_touch", 3, { min: 1, max: 10, description: "Touches before a zone counts as worn out" });
param("allow_sfp", 1, { min: 0, max: 1, description: "Sweep and reclaim keeps the zone (1) or kills it (0)" });
param("tl_tol", 0.35, { min: 0.05, max: 2, description: "Trendline 3rd-touch tolerance in ATR" });
param("brk_buf", 0.1, { min: 0, max: 1, description: "Break buffer in ATR" });
param("retest_bars", 20, { min: 3, max: 100, description: "Bars to wait for a retest" });
param("fake_bars", 5, { min: 1, max: 30, description: "Close back inside within N bars = fake break" });

// Zone state ladder: 0 fresh, 1 revisit likely, 2 tested/held, 3 swept (SFP), 4 lost (ghost)
const dTop = output("d_top", none), dBot = output("d_bot", none), dLive = output("d_live", none), dState = output("d_state", none);
const sTop = output("s_top", none), sBot = output("s_bot", none), sLive = output("s_live", none), sState = output("s_state", none);
box("demand_zone", { top: dTop, bottom: dBot, when: dLive, colorBy: dState, borderWidth: 1, borderStyle: "solid", opacity: 0.22,
  colors: ["#22c55e", "#facc15", "#38bdf8", "#f97316", "#64748b"], borderColors: ["#22c55e", "#facc15", "#38bdf8", "#f97316", "#64748b"], borderColorBy: dState });
box("supply_zone", { top: sTop, bottom: sBot, when: sLive, colorBy: sState, borderWidth: 1, borderStyle: "solid", opacity: 0.22,
  colors: ["#ef4444", "#facc15", "#38bdf8", "#f97316", "#64748b"], borderColors: ["#ef4444", "#facc15", "#38bdf8", "#f97316", "#64748b"], borderColorBy: sState });

output("tl_res", line, overlay, { color: "#ef4444", width: 2, line_style: "dashed", description: "Descending 3-touch trendline" });
output("tl_sup", line, overlay, { color: "#22c55e", width: 2, line_style: "dashed", description: "Ascending 3-touch trendline" });
const gBU = output("g_brk_up", none), gBD = output("g_brk_dn", none), gRU = output("g_ret_up", none), gRD = output("g_ret_dn", none);
const gLost = output("g_zone_lost", none);
output("brk_up", shape, overlay, { color: "#16a34a", shape_where: "g_brk_up", shape: "triangle_up", location: "below_bar", description: "Breakout" });
output("brk_dn", shape, overlay, { color: "#dc2626", shape_where: "g_brk_dn", shape: "triangle_down", location: "above_bar", description: "Breakdown" });
output("ret_up", shape, overlay, { color: "#0ea5e9", shape_where: "g_ret_up", location: "below_bar", description: "Retest of broken resistance" });
output("ret_dn", shape, overlay, { color: "#f59e0b", shape_where: "g_ret_dn", location: "above_bar", description: "Retest of broken support" });
output("brk_price", none, overlay, { description: "Exact break price (line value on the break bar)", format: "price" });
output("fake_rate", none, lower, { description: "Fake-break rate", format: "%" });

alert("breakout", { when: gBU, message: "{{symbol}}: trendline BREAKOUT at {{close}}", description: "Trendline breakout" });
alert("breakdown", { when: gBD, message: "{{symbol}}: trendline BREAKDOWN at {{close}}", description: "Trendline breakdown" });
alert("retest_up", { when: gRU, message: "{{symbol}}: retest of broken resistance at {{close}}", description: "Retest (long)" });
alert("retest_dn", { when: gRD, message: "{{symbol}}: retest of broken support at {{close}}", description: "Retest (short)" });
alert("zone_lost", { when: gLost, message: "{{symbol}}: zone lost at {{close}}", description: "A zone was lost" });

let sw = new Swings(5, 5);
let right: i32 = 5;
let idx: i32 = 0;
let atr: f64 = NaN;
let pClose: f64 = NaN;
let dT: f64 = NaN; let dB: f64 = NaN; let dL: f64 = 0.0; let dS: f64 = 0.0; let dTouch: i32 = 0; let dGhost: i32 = 0;
let sT: f64 = NaN; let sB: f64 = NaN; let sL: f64 = 0.0; let sS: f64 = 0.0; let sTouch: i32 = 0; let sGhost: i32 = 0;
let hp1: f64 = NaN; let hp2: f64 = NaN; let hp3: f64 = NaN; let hi1: i32 = 0; let hi2: i32 = 0; let hi3: i32 = 0;
let lp1: f64 = NaN; let lp2: f64 = NaN; let lp3: f64 = NaN; let li1: i32 = 0; let li2: i32 = 0; let li3: i32 = 0;
let rOn = false; let rBase: f64 = 0; let rSlope: f64 = 0; let rX0: i32 = 0;
let uOn = false; let uBase: f64 = 0; let uSlope: f64 = 0; let uX0: i32 = 0;
let rBrokeAt: i32 = -1; let rBrokeLvl: f64 = NaN; let rRetested = false;
let uBrokeAt: i32 = -1; let uBrokeLvl: f64 = NaN; let uRetested = false;
let breaks: i32 = 0; let fakes: i32 = 0;

function onStart(): void {
  right = i32(p_swing_len());
  sw = new Swings(right, right);
}

function onBar(): void {
  const o = bar.open(), h = bar.high(), l = bar.low(), c = bar.close();
  const tr = isNaN(pClose) ? h - l : Math.max(h - l, Math.max(Math.abs(h - pClose), Math.abs(l - pClose)));
  atr = isNaN(atr) ? tr : (atr * 13.0 + tr) / 14.0;
  sw.update(h, l);
  const zd = p_zone_atr() * atr;
  const near = p_near_atr() * atr;
  const maxT = i32(p_max_touch());
  const sfpOk = p_allow_sfp() >= 1.0;
  let lost = 0.0;

  if (sw.newLow()) { dT = sw.lastLow() + zd; dB = sw.lastLow(); dL = 1.0; dS = 0.0; dTouch = 0; dGhost = 0; }
  if (sw.newHigh()) { sT = sw.lastHigh(); sB = sw.lastHigh() - zd; sL = 1.0; sS = 0.0; sTouch = 0; sGhost = 0; }

  if (dL == 1.0 && dS < 4.0) {
    if (l < dB && c > dB && sfpOk) { dS = 3.0; }
    else if (c < dB) { dS = 4.0; dGhost = 15; lost = 1.0; }
    else if (l <= dT && c > dB) { dTouch += 1; dS = dTouch >= maxT ? 4.0 : 2.0; if (dS == 4.0) { dGhost = 15; lost = 1.0; } }
    else if (c - dT <= near && c > dT && dS < 2.0) { dS = 1.0; }
  } else if (dS == 4.0) { dGhost -= 1; if (dGhost <= 0) dL = 0.0; }
  if (sL == 1.0 && sS < 4.0) {
    if (h > sT && c < sT && sfpOk) { sS = 3.0; }
    else if (c > sT) { sS = 4.0; sGhost = 15; lost = 1.0; }
    else if (h >= sB && c < sT) { sTouch += 1; sS = sTouch >= maxT ? 4.0 : 2.0; if (sS == 4.0) { sGhost = 15; lost = 1.0; } }
    else if (sB - c <= near && c < sB && sS < 2.0) { sS = 1.0; }
  } else if (sS == 4.0) { sGhost -= 1; if (sGhost <= 0) sL = 0.0; }

  const tol = p_tl_tol() * atr;
  if (sw.newHigh()) {
    hp3 = hp2; hi3 = hi2; hp2 = hp1; hi2 = hi1; hp1 = sw.lastHigh(); hi1 = idx - right;
    if (!isNaN(hp3) && hp3 > hp2 && hp2 > hp1 && hi1 > hi3) {
      const slope = (hp1 - hp3) / f64(hi1 - hi3);
      const mid = hp3 + slope * f64(hi2 - hi3);
      if (Math.abs(mid - hp2) <= tol) { rOn = true; rBase = hp1; rSlope = slope; rX0 = hi1; rBrokeAt = -1; rRetested = false; }
    }
  }
  if (sw.newLow()) {
    lp3 = lp2; li3 = li2; lp2 = lp1; li2 = li1; lp1 = sw.lastLow(); li1 = idx - right;
    if (!isNaN(lp3) && lp3 < lp2 && lp2 < lp1 && li1 > li3) {
      const slope = (lp1 - lp3) / f64(li1 - li3);
      const mid = lp3 + slope * f64(li2 - li3);
      if (Math.abs(mid - lp2) <= tol) { uOn = true; uBase = lp1; uSlope = slope; uX0 = li1; uBrokeAt = -1; uRetested = false; }
    }
  }
  const buf = p_brk_buf() * atr;
  const fb = i32(p_fake_bars());
  const rb = i32(p_retest_bars());
  let rv = NaN; let uv = NaN;
  let bu = 0.0; let bd = 0.0; let ru = 0.0; let rd = 0.0; let bp = NaN;

  if (rOn) {
    rv = rBase + rSlope * f64(idx - rX0);
    if (rBrokeAt < 0 && c > rv + buf) { rBrokeAt = idx; rBrokeLvl = rv; bu = 1.0; bp = rv; breaks += 1; }
    else if (rBrokeAt >= 0) {
      if (idx - rBrokeAt <= fb && c < rv) { fakes += 1; rOn = false; }
      else if (!rRetested && idx - rBrokeAt <= rb && idx > rBrokeAt && l <= rv + buf && c > rv) { rRetested = true; ru = 1.0; }
      else if (idx - rBrokeAt > rb) rOn = false;
    }
  }
  if (uOn) {
    uv = uBase + uSlope * f64(idx - uX0);
    if (uBrokeAt < 0 && c < uv - buf) { uBrokeAt = idx; uBrokeLvl = uv; bd = 1.0; bp = uv; breaks += 1; }
    else if (uBrokeAt >= 0) {
      if (idx - uBrokeAt <= fb && c > uv) { fakes += 1; uOn = false; }
      else if (!uRetested && idx - uBrokeAt <= rb && idx > uBrokeAt && h >= uv - buf && c < uv) { uRetested = true; rd = 1.0; }
      else if (idx - uBrokeAt > rb) uOn = false;
    }
  }

  out_d_top(dT); out_d_bot(dB); out_d_live(dL); out_d_state(dS);
  out_s_top(sT); out_s_bot(sB); out_s_live(sL); out_s_state(sS);
  out_tl_res(rOn ? rv : NaN);
  out_tl_sup(uOn ? uv : NaN);
  out_g_brk_up(bu); out_g_brk_dn(bd); out_g_ret_up(ru); out_g_ret_dn(rd);
  out_brk_up(l); out_brk_dn(h); out_ret_up(l); out_ret_dn(h);
  out_g_zone_lost(lost);
  out_brk_price(bp);
  out_fake_rate(breaks > 0 ? 100.0 * f64(fakes) / f64(breaks) : NaN);
  pClose = c;
  idx += 1;
}
