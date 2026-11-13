//@lang=wrun-ts
// TORDAO indicator 4: LIQUIDITY AUCTION ZONES + AUTO TRENDLINES + VWAPs + EMA RIBBON
// Rebuilt from the setting list + feature text, not the original sources. Untested until Run in the OpenMarket editor.

// ---- Toggles
param.bool("show_zones", true, { label: "Show auction zones" });
param.bool("show_tl", true, { label: "Show trendlines + break/retest marks" });
param.bool("show_vd", true, { label: "Show daily VWAP" });
param.bool("show_vw", true, { label: "Show weekly VWAP" });
param.bool("show_vm", true, { label: "Show monthly VWAP" });
param.bool("show_e1", true, { label: "Show EMA 1 (21)" });
param.bool("show_e2", true, { label: "Show EMA 2 (50)" });
param.bool("show_e3", true, { label: "Show EMA 3 (144)" });
param.bool("show_e4", true, { label: "Show EMA 4 (360)" });
param.bool("show_e5", true, { label: "Show EMA 5 (667)" });
param.bool("show_e6", true, { label: "Show EMA 6 (800)" });

// ---- Settings
param("swing_len", 5, { min: 2, max: 30, description: "Swing length (bars each side)" });
param("zone_atr", 0.6, { min: 0.1, max: 3, description: "Zone depth in ATR" });
param("near_atr", 1.5, { min: 0.3, max: 6, description: "Revisit-likely distance in ATR" });
param("max_touch", 3, { min: 1, max: 10, description: "Touches before a zone counts as worn out" });
param("allow_sfp", 1, { min: 0, max: 1, description: "Sweep and reclaim keeps the zone (1) or kills it (0)" });
param("tl_tol", 0.35, { min: 0.05, max: 2, description: "Trendline 3rd-touch tolerance in ATR" });
param("brk_buf", 0.1, { min: 0, max: 1, description: "Break buffer in ATR" });
param("retest_bars", 20, { min: 3, max: 100, description: "Bars to wait for a retest" });
param("fake_bars", 5, { min: 1, max: 30, description: "Close back inside within N bars = fake break" });
param("ema1", 21, { min: 2, max: 2000, description: "EMA 1 length" });
param("ema2", 50, { min: 2, max: 2000, description: "EMA 2 length" });
param("ema3", 144, { min: 2, max: 2000, description: "EMA 3 length" });
param("ema4", 360, { min: 2, max: 2000, description: "EMA 4 length" });
param("ema5", 667, { min: 2, max: 2000, description: "EMA 5 length" });
param("ema6", 800, { min: 2, max: 2000, description: "EMA 6 length" });

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

output("vwap_d", line, overlay, { color: "#38bdf8", width: 1, description: "Daily VWAP (UTC)" });
output("vwap_w", line, overlay, { color: "#f5a623", width: 2, description: "Weekly VWAP (UTC)" });
output("vwap_m", line, overlay, { color: "#c084fc", width: 2, description: "Monthly VWAP (UTC)" });

output("ema_1", line, overlay, { color: "#fde047", width: 1, description: "EMA 21" });
output("ema_2", line, overlay, { color: "#fb923c", width: 1, description: "EMA 50" });
output("ema_3", line, overlay, { color: "#f43f5e", width: 2, description: "EMA 144" });
output("ema_4", line, overlay, { color: "#a855f7", width: 2, description: "EMA 360" });
output("ema_5", line, overlay, { color: "#3b82f6", width: 2, description: "EMA 667" });
output("ema_6", line, overlay, { color: "#e2e8f0", width: 3, description: "EMA 800" });

alert("breakout", { when: gBU, message: "{{symbol}}: trendline BREAKOUT at {{close}}", description: "Trendline breakout" });
alert("breakdown", { when: gBD, message: "{{symbol}}: trendline BREAKDOWN at {{close}}", description: "Trendline breakdown" });
alert("retest_up", { when: gRU, message: "{{symbol}}: retest of broken resistance at {{close}}", description: "Retest (long)" });
alert("retest_dn", { when: gRD, message: "{{symbol}}: retest of broken support at {{close}}", description: "Retest (short)" });
alert("zone_lost", { when: gLost, message: "{{symbol}}: zone lost at {{close}}", description: "A zone was lost" });

let sw = new Swings(5, 5);
let vD = new Vwap("day", "hlc3");
let vW = new Vwap("week", "hlc3");
let vM = new Vwap("month", "hlc3");
let e1 = new Ema(21);
let e2 = new Ema(50);
let e3 = new Ema(144);
let e4 = new Ema(360);
let e5 = new Ema(667);
let e6 = new Ema(800);
let right: i32 = 5;
let idx: i32 = 0;
let atr: f64 = NaN;
let pClose: f64 = NaN;
let shZones = true; let shTl = true;
let shVd = true; let shVw = true; let shVm = true;
let shE1 = true; let shE2 = true; let shE3 = true; let shE4 = true; let shE5 = true; let shE6 = true;
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
  vD = new Vwap("day", "hlc3");
  vW = new Vwap("week", "hlc3");
  vM = new Vwap("month", "hlc3");
  e1 = new Ema(i32(p_ema1()));
  e2 = new Ema(i32(p_ema2()));
  e3 = new Ema(i32(p_ema3()));
  e4 = new Ema(i32(p_ema4()));
  e5 = new Ema(i32(p_ema5()));
  e6 = new Ema(i32(p_ema6()));
  shZones = pb_show_zones(); shTl = pb_show_tl();
  shVd = pb_show_vd(); shVw = pb_show_vw(); shVm = pb_show_vm();
  shE1 = pb_show_e1(); shE2 = pb_show_e2(); shE3 = pb_show_e3();
  shE4 = pb_show_e4(); shE5 = pb_show_e5(); shE6 = pb_show_e6();
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

  // VWAPs and EMAs: always update (state stays correct), only the drawing is toggled
  const vol = bar.volume();
  const t = bar.time();
  const vdv = vD.update(o, h, l, c, vol, t);
  const vwv = vW.update(o, h, l, c, vol, t);
  const vmv = vM.update(o, h, l, c, vol, t);
  const v1 = e1.update(c); const v2 = e2.update(c); const v3 = e3.update(c);
  const v4 = e4.update(c); const v5 = e5.update(c); const v6 = e6.update(c);
  out_vwap_d(shVd ? vdv : NaN);
  out_vwap_w(shVw ? vwv : NaN);
  out_vwap_m(shVm ? vmv : NaN);
  out_ema_1(shE1 ? v1 : NaN);
  out_ema_2(shE2 ? v2 : NaN);
  out_ema_3(shE3 ? v3 : NaN);
  out_ema_4(shE4 ? v4 : NaN);
  out_ema_5(shE5 ? v5 : NaN);
  out_ema_6(shE6 ? v6 : NaN);

  // Zones and trendlines: logic always runs, outputs gated by the toggles
  out_d_top(dT); out_d_bot(dB); out_d_live(shZones ? dL : 0.0); out_d_state(dS);
  out_s_top(sT); out_s_bot(sB); out_s_live(shZones ? sL : 0.0); out_s_state(sS);
  out_tl_res(shTl && rOn ? rv : NaN);
  out_tl_sup(shTl && uOn ? uv : NaN);
  out_g_brk_up(shTl ? bu : 0.0); out_g_brk_dn(shTl ? bd : 0.0);
  out_g_ret_up(shTl ? ru : 0.0); out_g_ret_dn(shTl ? rd : 0.0);
  out_brk_up(l); out_brk_dn(h); out_ret_up(l); out_ret_dn(h);
  out_g_zone_lost(shZones ? lost : 0.0);
  out_brk_price(shTl ? bp : NaN);
  out_fake_rate(shTl && breaks > 0 ? 100.0 * f64(fakes) / f64(breaks) : NaN);
  pClose = c;
  idx += 1;
}
