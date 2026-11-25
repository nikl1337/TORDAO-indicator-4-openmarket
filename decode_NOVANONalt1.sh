#!/bin/sh
# Decode full NOVANONalt1.wrun.ts from the base64 gzip on this repo
base64 -d NOVANONalt1.wrun.ts.gz.b64 | gzip -d > NOVANONalt1.wrun.ts
echo "Wrote NOVANONalt1.wrun.ts ($(wc -c < NOVANONalt1.wrun.ts) bytes)"
