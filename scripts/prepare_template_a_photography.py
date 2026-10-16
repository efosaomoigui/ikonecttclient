"""Create native/downsampled WebP deliveries from the nine approved originals.

Requires Pillow with WebP support. Never enlarges or edits photographic content.
"""
from pathlib import Path
import hashlib
import json
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
REVIEW = ROOT / 'assets/review/template-a'
OUTPUT = ROOT / 'option-a/public/images/template-a'
OUTPUT.mkdir(parents=True, exist_ok=True)
exports = []
for asset in json.loads((REVIEW / 'asset-register.json').read_text(encoding='utf-8')):
    source = REVIEW / asset['file']
    assert asset['approvalStatus'].startswith('visual-package-approved'), source
    assert hashlib.sha256(source.read_bytes()).hexdigest() == asset['sha256'], source
    image = Image.open(source).convert('RGB')
    small = {'desktop': 1024, 'medium': 960, 'mobile': 640}[asset['profile']]
    for width in (image.width, small):
        assert width <= image.width
        photo = image if width == image.width else image.resize(
            (width, round(image.height * width / image.width)), Image.Resampling.LANCZOS)
        destination = OUTPUT / f'{source.stem}-{width}.webp'
        photo.save(destination, 'WEBP', quality=88, method=6)
        exports.append(dict(assetId=asset['assetId'], profile=asset['profile'],
                            source=asset['file'], file=destination.relative_to(ROOT).as_posix(),
                            width=photo.width, height=photo.height, bytes=destination.stat().st_size))
evidence = ROOT / 'docs/evidence/phase-2d-installation'
evidence.mkdir(parents=True, exist_ok=True)
(evidence / 'exports.json').write_text(json.dumps(exports, indent=2) + '\n', encoding='utf-8')
print(f'Prepared {len(exports)} WebP files; {sum(item["bytes"] for item in exports):,} bytes total.')
