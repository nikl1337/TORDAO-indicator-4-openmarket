//@lang=wrun-ts
// merge-0.1337 — UWUWORT-Z + indicator2 + daily VWAP±2ATR bands
// Harmonics 10% fib, finite zigzag ending at fib TP, big BAT/BUTTERFLY
// EMA 21/100/144/360/667/800; red@360 green@800 boxes
// Bull targets: teal 0.382-0.618 + pink 0.618-1.0 @30%
// Daily VWAP ± 2 ATR as 0.1% thick pink (res) / teal (sup) zones
// Flags 3+3, regression channels, HTF levels, SFP/dbl/manip

page("Display");
param.bool("show_zz", true, { label: "Pattern zigzag" });
param.bool("show_harm", true, { label: "Harmonics 10% tol" });
param.bool("show_ext", true, { label: "Extreme ±0.2%" });
param.bool("show_poc", true, { label: "POC mid" });
param.bool("show_va", true, { label: "VAH / VAL" });
param.bool("show_eq", true, { label: "Equalizer 2G / 2R" });
param.bool("show_ema", true, { label: "EMA ribbon" });
param.bool("show_ema_box", true, { label: "Boxes red@360 green@800" });
param.bool("show_tz", true, { label: "Bull targets: teal 0.382-0.618 + pink 0.618-1.0 (30%)" });
param.bool("show_flags", true, { label: "Bull/Bear flags 3+3 (from indicator 2)" });
param.bool("show_ch", true, { label: "Regression channels" });
param.bool("show_htf", true, { label: "HTF levels 2 teal / 2 pink" });
param.bool("show_sfp", true, { label: "SFP labels (kata-bozo-2)" });
param.bool("show_dbl", true, { label: "Double top / bottom" });
param.bool("show_manip", true, { label: "Manipulation zone" });
param.bool("show_vwap", true, { label: "Daily VWAP ±2 ATR (0.1% pink/teal)" });

page("Logic");
param.int("swing_len", 3, { min: 2, max: 12, label: "Swing length each side" });
param.number("fib_tol", 0.10, { min: 0.02, max: 0.25, step: 0.01, label: "Fib tol", when: "show_harm" });
param.int("poc_lb", 96, { min: 16, max: 300, label: "POC lookback", when: "show_poc" });
param.number("va_pct", 70, { min: 50, max: 90, step: 1, label: "VA %", when: "show_va" });
param.int("keep_bars", 200, { min: 40, max: 500, label: "Keep pattern bars" });
param.number("flag_pole_atr", 1.8, { min: 0.8, max: 6, step: 0.1, label: "Flag min pole ATR", when: "show_flags" });
param.int("ch_lb1", 34, { min: 10, max: 120, label: "Channel 1 lookback", when: "show_ch" });
param.int("ch_lb2", 89, { min: 20, max: 180, label: "Channel 2 lookback", when: "show_ch" });
param.int("sfp_bars", 3, { min: 1, max: 8, label: "SFP bars to close back", when: "show_sfp" });
param.number("sfp_min_atr", 0.05, { min: 0, max: 2, step: 0.01, label: "SFP min sweep in ATR", when: "show_sfp" });
param.int("htf_min", 240, { min: 15, max: 10080, label: "Double-top min minutes apart", when: "show_dbl" });
param.number("dbl_tol", 0.3, { min: 0.05, max: 3, step: 0.05, label: "Double-top peak match %", when: "show_dbl" });
param.number("dbl_depth", 0.8, { min: 0.1, max: 20, step: 0.1, label: "Double-top min depth %", when: "show_dbl" });
param.number("manip_lo", 90, { min: 50, max: 100, step: 1, label: "Manipulation AB min % of BC", when: "show_manip" });
param.number("manip_hi", 110, { min: 100, max: 200, step: 1, label: "Manipulation AB max % of BC", when: "show_manip" });

PLACEHOLDER_FULL_CONTENT