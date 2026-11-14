//@lang=wrun-ts
// TORDAO indicator 4 (MERGED). Drawing budget <= 64 (OpenMarket cap). Sound: Chart > Sounds.
// Handles: 0-3 buy tags, 4-7 sell tags, 8-13 manip boxes, 14-19 manip labels, 20-23 abcd polys, 24-27 abcd labels,
// 28-39 HTF lines, 40 weekly path, 41-44 15m labels, 45-48 1h labels, 49-52 harmonic polys, 53-56 harmonic names.

input("close", ohlcv.close);
input("profile", volume_profile.cells, { max_cells: 8192, missing: "empty", description: "This bar's volume by price level" });
input("wk", candles.cells, { interval: "1w", bars: 300, description: "Closed weekly candles" });
input("c15", candles.cells, { interval: "15m", bars: 8, max_cells: 64, description: "Closed 15m candles" });
input("c60", candles.cells, { interval: "1h", bars: 8, max_cells: 16, description: "Closed 1h candles" });

param.bool("show_zones", true, { label: "Show auction zones" });
param("swing_len", 5, { min: 2, max: 30, description: "Swing length" });
output("sma", line, overlay, { color: "#2563eb", width: 2, description: "smoke test line" });
let ema = new Ema(20);
function onStart(): void { ema = new Ema(i32(p_swing_len())); }
function onBar(): void { out_sma(ema.update(bar.close())); }
