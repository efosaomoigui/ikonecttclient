import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

names = [
    'Ikonectt1',
    'Ikonectt2',
    'ikonectt2',
    'Ikonnect2',
    'ikonnect2',
    'Ikonnectt2',
    'ikonnectt2',
    'Ikonect2',
    'ikonect2',
    'Ikonnect1',
    'ikonnect1'
]

for name in names:
    url = f"https://github.com/efosaomoigui/{name}"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=4) as resp:
            print(f"{name}: FOUND ({resp.status}) -> {url}")
    except urllib.error.HTTPError as e:
        print(f"{name}: {e.code}")
    except Exception as e:
        print(f"{name}: ERROR ({e})")
