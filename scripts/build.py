#!/usr/bin/env python3
"""Regenerate the bundled protocol and reproducible installable ZIP. Python 3 only."""
from pathlib import Path
import json, zipfile
ROOT = Path(__file__).resolve().parents[1]
protocol = (ROOT / 'protocol/cognitiveslider.md').read_text(encoding='utf-8')
(ROOT / 'extension/protocol.js').write_text('globalThis.MCS_PROTOCOL = ' + json.dumps(protocol, ensure_ascii=False) + ';\n', encoding='utf-8')
files = sorted(p for p in (ROOT / 'extension').rglob('*') if p.is_file())
version = json.loads((ROOT / 'extension/manifest.json').read_text())['version']
output = ROOT / ('releases/cognitiveslider-extension-v' + version + '.zip')
output.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
    for path in files:
        info = zipfile.ZipInfo(path.relative_to(ROOT / 'extension').as_posix(), (2026, 10, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        archive.writestr(info, path.read_bytes())
print(output)
