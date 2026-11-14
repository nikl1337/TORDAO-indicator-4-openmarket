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

## What this file is

Single-file **core** TORDAO for OpenMarket wrun-ts:

- Auction demand / supply zones (state ladder)
- Auto trendlines + break / retest marks
- Daily / weekly / monthly VWAP
- EMA ribbon (21 / 50 / 144 / 360 / 667 / 800)
- Bar POC + developing POC (volume profile cells)
- Neon zone reactions + confluence score histograms
- Alerts for break, retest, zone lost, buy/sell reaction

Drawing budget stays under OpenMarket’s 64-handle limit (no score number labels in this build).

## Bug fixes included (vs early merges)

| Issue | Fix |
|---|---|
| `This indicator declares nothing` | Valid top-level `param` / `input` / `output` + `onBar` |
| Handle not bound (`dBot`, `gSell`, …) | One `const x = output(...)` **per line** (no comma chains) |
| `vpPoc` / `vpPocVolume` not found | Local helpers over `[low, high, buy, sell]` cells |
| `++` / `--` strict mode | Replaced with `+= 1` / `-= 1` |
| Plain `param` + `when` refused | Removed `when` from plain `param(...)` |
| Paste truncated mid-file | Compact file (~18KB) so full paste fits |
| Drawing limit 113 > 64 | Core build without extra label rings |

Soft Problems hints like *param is read only inside branches show_sig* are UI advice only; they do not block **Run**.

## Repo files

| File | Role |
|---|---|
| **`final-approved-by-openmarket.wrun.ts`** | **Use this** — working core |
| `kata-bozo-1-…` / modules | Earlier splits / experiments |
| `tordao-indicator-4-merged.wrun.ts` | May be stub or older; prefer the final file above |

## Optional next modules

SFP, double top/bottom, ABCD, HTF levels, bat/butterfly can be added later in separate tabs or a carefully slimmed merge (stay ≤ 64 drawings).

## License

Same as the repository owner’s choice for this repo.
