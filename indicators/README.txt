merge-0.1337 OpenMarket indicator
================================
Run: python3 decode_merge.py
That rebuilds merge-0.1337.wrun.ts from body.b64.1 + body.b64.2

Features:
- Finite zigzag rays (extend=0), last leg ends at fib 0.618 TP
- Big BAT / BUTTERFLY labels (glow 36 + circle glow 40)
- Bullish target zones: teal 0.382-0.618 + pink 0.618-1.0 at 30%
- Daily VWAP +/- 2 ATR as 0.1% thick pink (res above) / teal (sup below)
- EMAs 21/100/144/360/667/800, red box@360 green@800
- Indicator2: flags 3+3, regression channels 2R+2G, HTF levels
- POC mid, VAH/VAL, extremes +/-0.2%, equalizer 2G/2R
