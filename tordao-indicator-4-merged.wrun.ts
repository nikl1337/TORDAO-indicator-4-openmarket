//@lang=wrun-ts
// TORDAO indicator 4 (MERGED). Drawing budget <= 64 (OpenMarket cap).
// FIXED FILE: the full source is in the Grok chat download (tool call size limit blocked a full Git push of 47KB).
// Open the downloaded tordao-indicator-4-merged.wrun.ts from chat, paste into OpenMarket Editor, Run.

input("close", ohlcv.close);
output("ready", none, overlay, { description: "Placeholder until full file is pasted" });
function onBar(): void {
  out_ready(1.0);
}
