merge-0.1337 OpenMarket indicator
================================
Files:
  merge-0.1337.wrun.ts       — full single file (use this in kata)
  merge-0.1337-part1.wrun.ts — first half (concat with part2 if needed)
  merge-0.1337-part2.wrun.ts — second half

How to use:
  Copy merge-0.1337.wrun.ts into OpenMarket / kata as one indicator.
  Or: cat merge-0.1337-part1.wrun.ts merge-0.1337-part2.wrun.ts > merged.wrun.ts
  Remove the PART header comment lines if your loader requires //@lang on line 1.

Features:
  - Finite zigzag rays (extend=0), last leg ends at fib 0.618 TP
  - Big BAT / BUTTERFLY labels (glow 36 + circle glow 40)
  - Bullish target zones: teal 0.382-0.618 + pink 0.618-1.0 at 30% opacity
  - Daily VWAP +/- 2 ATR as 0.1% thick pink (resistance above) / teal (support below)
  - EMAs 21/100/144/360/667/800, red box@360 green@800
  - Indicator2: flags 3+3, regression channels 2R+2G, HTF levels
  - POC mid, VAH/VAL, extremes +/-0.2%, equalizer 2G/2R
