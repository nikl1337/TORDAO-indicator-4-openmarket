//@lang=wrun-ts
// TORDAO INDICATOR 3: candles, trendline rays, traps, hammer labels,
// 4 confluence zones (2 red above / 2 green below) with NY-open weight,
// hit zones turn grey and are replaced. Swing length default 3.

input("buy_vol", trades.volume, { side: "BUY", description: "Taker buy volume per bar, in coins" });
input("sell_vol", trades.volume, { side: "SELL", description: "Taker sell volume per bar, in coins" });

param.bool("show_candles", true, { label: "Highlight hammer, shooting star, doji" });
param.bool("show_stars", true, { label: "Highlight morning star and evening star" });
param.bool("show_trend", true, { label: "Auto trendline rays (never disappear)" });
param.bool("show_traps", true, { label: "Trapped longs / shorts boxes with delta" });
param.bool("show_conf", true, { label: "Green HAMMER / red INV HAMMER text vs EMA 21" });
param.bool("show_ema50", true, { label: "White circle when price touches EMA 50" });
param.bool("show_zones", true, { label: "4 confluence pump/dump zones (NY open weighted)" });
param.number("zone_h_atr", 0.35, { min: 0.1, max: 2, step: 0.05, label: "Zone height in ATR", when: "show_zones" });
param.bool("show_dvwap_dot", true, { label: "Orange dot when daily VWAP is touched or smashed" });
param.bool("show_lines", true, { label: "Show daily VWAP and EMA 21 lines" });
param.bool("en_dvwap_alert", true, { label: "Alert: daily VWAP touched or smashed (once per 15m candle)" });
param.bool("en_ema21_alert", true, { label: "Alert: EMA 21 touched or smashed" });
param.bool("tl_trend_only", true, { label: "Trendlines: only falling resistance and rising support" });
param.int("swing_len", 3, { min: 2, max: 30, label: "Swing length (bars each side)" });
// NOTE: truncated mid-push - full file continues in next commit if needed
function onBar(): void {}
