#!/bin/sh
# Rebuild NOVANONalt1.wrun.ts from the 4 gzip+base64 parts
set -e
cd "$(dirname "$0")"
cat indicators/NOVANONalt1.b64.0 indicators/NOVANONalt1.b64.1 indicators/NOVANONalt1.b64.2 indicators/NOVANONalt1.b64.3 | base64 -d | gzip -d > NOVANONalt1.wrun.ts
echo "Wrote NOVANONalt1.wrun.ts ($(wc -c < NOVANONalt1.wrun.ts) bytes)"
head -3 NOVANONalt1.wrun.ts
