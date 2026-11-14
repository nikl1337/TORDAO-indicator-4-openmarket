# TORDAO indicator 4 — OpenMarket (wrun)

**Status:** Core file runs on OpenMarket (browser indicator).

## Install (OpenMarket has no GitHub one-click install)

1. Open a chart on [openmarket.xyz](https://openmarket.xyz) (signed in).
2. Toolbar → **Editor**.
3. **New indicator** → **Blank indicator**.
4. Keep line 1 as: `//@lang=wrun-ts`
5. Open this file on GitHub → **Raw** → select all → copy:
   - [`final-approved-by-openmarket.wrun.ts`](./final-approved-by-openmarket.wrun.ts)
6. Paste under line 1 in the editor (if a second `//@lang=wrun-ts` appears, delete the duplicate).
7. Press **Run**.

You should see auction zones, EMA ribbon, VWAPs, POC, trendlines, and zone reaction marks.

## Companion modules (optional second indicator)

File: [`final-modules-sfp-htf-harmonics.wrun.ts`](./final-modules-sfp-htf-harmonics.wrun.ts)

Add as a **second** Blank indicator (same chart), paste, Run. Uses only **4 polylines**.

Includes:

- Swing failure patterns (SFP)
- HTF double top / bottom + neckline
- ABCD completion (shape + polyline)
- Bat / butterfly (shape + polyline)
- Daily / weekly / monthly open + previous/current day EQ

Toggles under **Modules** in settings.

## What the core file is

Single-file **core** TORDAO for OpenMarket wrun-ts:

- Auction demand / supply zones (state ladder)
- Auto trendlines + break / retest marks
- Daily / weekly / monthly VWAP
- EMA ribbon (21 / 50 / 144 / 360 / 667 / 800)
- Bar POC + developing POC (volume profile cells)
- Neon zone reactions + confluence score histograms
- Alerts for break, retest, zone lost, buy/sell reaction

Drawing budget stays under OpenMarket’s 64-handle limit.

## Bug fixes included

| Issue | Fix |
|---|---|
| Handle not bound | One `const x = output(...)` per line |
| `vpPoc` missing | Local helpers |
| `++` / `--` | `+= 1` / `-= 1` |
| Plain `param` + `when` | Removed |
| Paste truncated | Compact core (~18KB) |

## License

Same as the repository owner’s choice for this repo.
