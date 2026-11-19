//@lang=wrun-ts
// merge-0.1337 - finite harmonic rays to fib TP, big BAT/BUTTERFLY, indicator2, bull target zones, daily VWAP+/-2ATR 0.1% bands
page("Display");
param.bool("show_zz", true, { label: "Pattern zigzag" });
param.bool("show_harm", true, { label: "Harmonics 10% tol" });
param.bool("show_ext", true, { label: "Extreme +/-0.2%" });
param.bool("show_poc", true, { label: "POC mid" });
param.bool("show_va", true, { label: "VAH / VAL" });
param.bool("show_eq", true, { label: "Equalizer 2G / 2R" });
param.bool("show_ema", true, { label: "EMA ribbon" });
param.bool("show_ema_box", true, { label: "Boxes red@360 green@800" });
param.bool("show_tz", true, { label: "Bull target zones teal+pink" });
param.bool("show_flags", true, { label: "Flags 3+3" });
param.bool("show_ch", true, { label: "Regression channels 2R+2G" });
param.bool("show_htf", true, { label: "HTF 2G+2R" });
param.bool("show_vwap_band", true, { label: "Daily VWAP +/-2 ATR (0.1% pink/teal)" });

page("Logic");
param.int("swing_len", 3, { min: 2, max: 12, label: "Swing length each side" });
param.number("fib_tol", 0.10, { min: 0.02, max: 0.25, step: 0.01, label: "Fib tol", when: "show_harm" });
param.int("poc_lb", 96, { min: 16, max: 300, label: "POC lookback", when: "show_poc" });
param.number("va_pct", 70, { min: 50, max: 90, step: 1, label: "VA %", when: "show_va" });
param.int("keep_bars", 200, { min: 40, max: 500, label: "Keep pattern bars" });
param.number("flag_pole_atr", 1.8, { min: 0.8, max: 6, step: 0.1, label: "Flag min pole ATR", when: "show_flags" });
param.int("ch_lb1", 34, { min: 10, max: 120, label: "Channel 1 lookback", when: "show_ch" });
param.int("ch_lb2", 89, { min: 20, max: 180, label: "Channel 2 lookback", when: "show_ch" });

// PLACEHOLDER - content too large for single tool arg; using push_files next
