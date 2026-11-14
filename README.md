# TORDAO indicator 4 openmarket

A wrun indicator for OpenMarket (https://openmarket.xyz/wrun/llms.txt).

**Main file: `tordao-indicator-4-merged.wrun.ts`** (everything below in one indicator). The `module-*.wrun.ts` files and `tordao-indicator-4.wrun.ts` are the earlier standalone pieces, kept for reference.

## What is in it

1. Auction zones, one colour per state: fresh, revisit likely, tested and held, swept (SFP), lost.
2. Auto 3-touch trendlines with break/retest marks, exact break prices, fake-break rate, alerts.
3. Daily / weekly / monthly VWAP and EMA 21 / 50 / 144 / 360 / 667 / 800.
4. Point of control from the chart's volume profile (follows the timeframe).
5. Neon teal (buy) / neon pink (sell) zone reactions with a 1-100 confluence score (adjustable weights; last 4 labels per side with score >= 60 stay on screen).
6. Swing failure pattern, higher-timeframe double top / bottom, ABC correction (yellow boxes A B C).
7. Weekly-candle levels, trendlines, parallel channels with middle lines and a pattern line (white, thin, dotted).
8. Daily / weekly / monthly open (white dotted), EQ of previous day (neon green), EQ of current day (neon pink).
9. Butterfly and bat patterns; 15m and 1h doji / hammer / shooting star marked TOP or BOTTOM REVERSAL.

## Sound

All signals are declared alerts. In the indicator settings open Chart > Sounds, turn on Play sounds, pick a sound per signal. Each signal also has an on/off switch under Signals.

## Status

Rebuilt from setting lists and feature text, not from the original indicators. Not yet compiled in the OpenMarket editor: expect to fix a few compile errors on the first Run.
