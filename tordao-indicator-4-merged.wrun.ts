//@lang=wrun-ts
// TORDAO indicator 4 MERGED — drawing budget 57 (OpenMarket max 64).
//
// The full fixed source is ready in the Grok chat as a downloadable file:
//   tordao-indicator-4-merged-FIXED.wrun.ts
// OpenMarket has no GitHub install: paste that file into the chart Editor and press Run.
// Keep this first line as //@lang=wrun-ts when you paste.
//
// What changed vs the old merge: score tags 4+4, ABCD label at D only,
// no XABCD point labels, 4 reversal tags per TF, keep_n max 4.

input("close", ohlcv.close);
output("ready", none, overlay, { description: "Stub — paste the FIXED file from Grok chat" });
function onBar(): void {
  out_ready(1.0);
}
