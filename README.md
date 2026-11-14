# TORDAO indicator 4 openmarket

A wrun indicator for OpenMarket ([wrun docs](https://openmarket.xyz/wrun/llms.txt)).

**Main file: `tordao-indicator-4-merged.wrun.ts`** (same content as `kata-bozo-5-ALL-IN-ONE-merged.wrun.ts`). Drawing handles are capped at **57** so the file stays under OpenMarket’s **64 drawings per indicator** limit.

The `module-*.wrun.ts`, `kata-bozo-1..4`, and `tordao-indicator-4.wrun.ts` files are the earlier standalone pieces (optional; not required if you use the merge).

## Install (OpenMarket chart)

1. Sign in on [openmarket.xyz](https://openmarket.xyz).
2. Chart toolbar → **Editor** (code icon; or **Panels**).
3. Explorer → **New indicator** → **Blank indicator**.
4. Open [`tordao-indicator-4-merged.wrun.ts`](./tordao-indicator-4-merged.wrun.ts) → **Raw** → select all → copy.
5. Paste over the blank tab. Keep the first line `//@lang=wrun-ts`.
6. Press **Run**.

There is no GitHub install button: one file, paste, Run.

## What is in the merge

1. Auction zones (fresh / revisit / held / swept / lost).
2. Auto 3-touch trendlines, break/retest marks, break price, fake-break rate, alerts.
3. Daily / weekly / monthly VWAP and EMA 21 / 50 / 144 / 360 / 667 / 800.
4. Point of control from the chart volume profile.
5. Neon buy/sell zone reactions with confluence score (up to 4 number labels per side).
6. SFP, HTF double top/bottom, manipulation boxes, ABCD (polyline + D label).
7. Weekly levels, trendlines, channels, pattern path.
8. Daily / weekly / monthly open, previous-day EQ, current-day EQ.
9. Bat / butterfly polylines + name at D; 15m and 1h reversal candle tags (last 4 each).

Drawing budget trade-offs vs the first merge draft: fewer score tags (4+4), ABCD marks only at D, no XABCD point labels on harmonics, 4 reversal tags per TF.

## Sound

All signals are declared alerts. Indicator settings → Chart → Sounds → enable Play sounds and pick a sound per signal. Each signal also has an on/off switch under Signals.

## Status

Drawing count is under the platform cap. First **Run** may still show compiler messages if the kit differs from this draft — paste **Problems** if something fails and iterate.
