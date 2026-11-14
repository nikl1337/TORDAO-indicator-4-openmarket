# TORDAO indicator 4 — OpenMarket (wrun)

## Core

[`final-approved-by-openmarket.wrun.ts`](./final-approved-by-openmarket.wrun.ts) — zones, EMA, VWAP, POC, confluence.

Paste into Blank → keep `//@lang=wrun-ts` → Run.

## Companion (novaadd)

[`final-modules-sfp-htf-harmonics.wrun.ts`](./final-modules-sfp-htf-harmonics.wrun.ts)

Raw: https://raw.githubusercontent.com/nikl1337/TORDAO-indicator-4-openmarket/main/final-modules-sfp-htf-harmonics.wrun.ts

Second Blank indicator on the same chart.

### What it draws

| Module | Visual |
|---|---|
| **Hard key levels** | Horizontal dotted **rays** at swing highs/lows (extend right) |
| **Turn rays** | Dashed **rays** connecting successive highs (resistance) / lows (support) |
| **Manipulation** | Yellow **rectangles** (spans) when AB ≈ BC |
| **Clear pivot moves** | Blue/purple **circles** |
| **Liquidity grabs** | Teal/pink **diamonds with strong glow** (attention marks) |

### Liquidity grab logic

- **Bear grab:** price sweeps above a confirmed swing high, then closes back below within N bars  
- **Bull grab:** price sweeps below a confirmed swing low, then closes back above within N bars  

Toggles under **Modules**. No heavy handle budget (plot.rays / plot.spans + shapes).

## Install

1. Editor → New → Blank  
2. Keep line 1 `//@lang=wrun-ts`  
3. Raw → select all → paste  
4. Run  
