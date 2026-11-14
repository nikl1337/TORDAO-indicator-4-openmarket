# TORDAO indicator 4 — OpenMarket (wrun)

**Status:** Core + companion run on OpenMarket (browser indicators).

## Install

OpenMarket has **no GitHub one-click install**. Paste into the chart Editor.

### 1) Core

1. Chart → **Editor** → **New indicator** → **Blank**
2. Keep `//@lang=wrun-ts`
3. Raw → copy all → paste:
   - [`final-approved-by-openmarket.wrun.ts`](./final-approved-by-openmarket.wrun.ts)
4. **Run**

Zones, EMA ribbon, VWAP, POC, core trendlines, confluence.

### 2) Companion (novaadd)

Second Blank tab, same steps, file:

- [`final-modules-sfp-htf-harmonics.wrun.ts`](./final-modules-sfp-htf-harmonics.wrun.ts)

Raw: https://raw.githubusercontent.com/nikl1337/TORDAO-indicator-4-openmarket/main/final-modules-sfp-htf-harmonics.wrun.ts

## Companion features (toggles under Modules)

| Module | What it draws |
|---|---|
| SFP | Bull/bear swing failure triangles |
| HTF double | Double top/bottom diamonds + neckline |
| ABCD | Completion shapes + polylines |
| Bat / butterfly | Harmonic marks + polylines |
| Opens / EQ | Day/week/month open, prev/current day EQ |
| **2+2 auto trendlines** | 2 resistance + 2 support on extreme pivots |
| **1h + 4h order blocks** | Bull/bear OB boxes (solid 1h, dashed 4h) |
| **Reverse squares** | Yellow/orange **squares** = probable reverse |
| **Breakout circles** | Blue/purple **circles** = probable breakout / continuation |

### Mark logic (short)

- **Square (reverse):** SFP, ABCD/bat/fly completion, double top/bottom, rejection at live order block  
- **Circle (breakout/continue):** Close through a trendline or through an order block  

Handles: **4 polylines** only (under the 64 cap).

## Bug fixes (history)

| Issue | Fix |
|---|---|
| Handle not bound | One `const x = output(...)` per line |
| `vpPoc` missing | Local helpers in core |
| `++` / `--` | `+= 1` / `-= 1` |
| Polyline API | `setPoints(buffer, pointCount)` |
| Paste truncated | Keep files compact |

## License

Same as the repository owner’s choice for this repo.
