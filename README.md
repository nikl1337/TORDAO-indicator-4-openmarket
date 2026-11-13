# TORDAO indicator 4 openmarket

A wrun indicator for OpenMarket (https://openmarket.xyz/wrun/llms.txt).

## What is in it

1. **Auction zones** with a colour per state: fresh, revisit likely, tested and held, swept (SFP), lost.
2. **Auto 3-touch trendlines** with non-repainting break and retest marks, exact break prices, fake-break rate and alerts.
3. **Daily, weekly and monthly VWAP** (UTC anchors).
4. **EMA 21 / 50 / 144 / 360 / 667 / 800.**
5. **Point of control** from the chart's own volume profile, so it follows the timeframe: a dot on every bar plus a developing POC level.
6. **Neon zone reactions:** neon teal for a buy reaction in a demand zone, neon pink for a sell reaction in a supply zone.
7. **Confluence score 1-100** printed as a number on each reaction.

## Confluence score (max 100)

| Component | Points |
| --- | --- |
| Zone reaction (base) | 25 |
| POC inside the zone | 10 |
| VWAP daily / weekly / monthly | 5 / 7 / 8 |
| EMA 21 / 50 / 144 / 360 / 667 / 800 | 2 / 3 / 4 / 5 / 5 / 6 |
| Trendline at the zone | 12 (+8 on a break or retest) |

A level counts when it sits inside the zone widened by `conf_tol` ATR. Hidden (toggled off) lines do not score.

Status: work in progress, 2 of 5 planned components merged. Not yet compiled in the OpenMarket editor.
