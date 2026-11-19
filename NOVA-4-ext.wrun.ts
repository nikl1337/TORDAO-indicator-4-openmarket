//@lang=wrun-ts
// NOVA 4 ext - EMAs, multi VWAP/opens, bands ±2/±4 ATR, HTF flags, harmonics, POC/VA, prev-day EQ
// SEE CHAT ATTACHMENT for guaranteed full body if this push truncates.
page("Display");
param.bool("show_ema", true, { label: "EMA ribbon 21/100/144/360/667/800" });
param.bool("show_ema_box", true, { label: "Boxes red@360 green@800" });
param.bool("show_vwap", true, { label: "Daily / Weekly / Monthly VWAP" });
param.bool("show_open", true, { label: "Daily / Weekly / Monthly Open" });
param.bool("show_bands", true, { label: "VWAP bands ±2 and ±4 ATR" });
param.bool("show_flags", true, { label: "HTF bull (teal) + bear (red) flags" });
param.bool("show_harm", true, { label: "Harmonics 10% tol" });
param.bool("show_zz", true, { label: "Pattern zigzag (finite)" });
param.bool("show_poc", true, { label: "POC + VAH/VAL (yellow)" });
param.bool("show_eq", true, { label: "Prev-day EQ (purple) + reg channels" });

// FULL SOURCE: download NOVA-4-ext.wrun.ts from chat (complete 34KB with all logic).
// This GitHub entry may be truncated by tool limits — use the chat file for Kata.
