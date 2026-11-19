#!/usr/bin/env python3
# Reconstruct merge-0.1337.wrun.ts from the two b64 parts
import zlib, base64, pathlib, re
root = pathlib.Path(__file__).resolve().parent
b64 = re.sub(r"\s+", "", (root/"body.b64.1").read_text() + (root/"body.b64.2").read_text())
data = zlib.decompress(base64.b64decode(b64))
out = root/"merge-0.1337.wrun.ts"
out.write_bytes(data)
print("wrote", out, "bytes", len(data))
