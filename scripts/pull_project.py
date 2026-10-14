import os
import urllib.request
import ssl

# Create SSL context to handle downloads
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

def download_file(url, target_path):
    dirname = os.path.dirname(target_path)
    if dirname:
        os.makedirs(dirname, exist_ok=True)
    print(f"Downloading to {target_path}...")
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, context=ctx) as response:
        content = response.read()
        with open(target_path, 'wb') as f:
            f.write(content)
    print(f"Saved {target_path} ({len(content)} bytes)")

# Pages
pages = {
    "index.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1ZGI0ZTNkMTZjZGYwMjNiZGFkNjRhMDRiNjkxEgsSBxCA1OnKzRwYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjUyNzU5NTk1NTY3OTQ3OTM4OA&filename=&opi=89354086",
    "residential.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1ZGIzZmRjMWNiN2IwNDRmNWJjZGQwMTRlZDQ0EgsSBxCA1OnKzRwYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjUyNzU5NTk1NTY3OTQ3OTM4OA&filename=&opi=89354086",
    "business.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1ZGIzZmUyOGEyMmEwOTY4OGZhZjI3MmVjNGNhEgsSBxCA1OnKzRwYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjUyNzU5NTk1NTY3OTQ3OTM4OA&filename=&opi=89354086",
    "coverage.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1ZGIzZmY3NjNhNzQwNWYxMzJhMTc4MGE1OWZhEgsSBxCA1OnKzRwYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjUyNzU5NTk1NTY3OTQ3OTM4OA&filename=&opi=89354086",
}

# Assets / Logos
assets = {
    "assets/logo-red.svg": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1ZGE2MTM3MzM1NmEwMjNiYzE3ZDI1MDZlMjQ3EgsSBxCA1OnKzRwYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjUyNzU5NTk1NTY3OTQ3OTM4OA&filename=&opi=89354086",
    "assets/logo-white.svg": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1ZGE2MTgyY2Q5OWMwNDRmNWJjZGQwMTRlZDQ0EgsSBxCA1OnKzRwYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjUyNzU5NTk1NTY3OTQ3OTM4OA&filename=&opi=89354086",
    "assets/brand-logo-red.svg": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1ZGIzOGQyMmU0Y2MwMjNiZDNlNzkyMGIxOWRmEgsSBxCA1OnKzRwYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjUyNzU5NTk1NTY3OTQ3OTM4OA&filename=&opi=89354086",
    "assets/brand-logo-white.svg": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1ZGIzOGQ0NGIwMTAwNWYxMzJhMTc4MGE1OWZhEgsSBxCA1OnKzRwYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjUyNzU5NTk1NTY3OTQ3OTM4OA&filename=&opi=89354086",
    "docs/design.md": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1ZGEyM2NmZTAwNmQwNWYxMzJhMTc4MGE1OWZhEgsSBxCA1OnKzRwYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjUyNzU5NTk1NTY3OTQ3OTM4OA&filename=&opi=89354086",
    "assets/images/cityscape-night.jpg": "https://lh3.googleusercontent.com/aida/AEtjO1Xozj0Ucud2awT0ewSgHH7j5Ox--uZ0KHucBXujRx7Eg1hP3xzMOkYKK1EXFvtE97yct3W8ceSlZO6Xh1Uo6ipRf0DMe9EoC7_dleGNeAR9QwQHVQglm0XqZ7vFe-lveLOQHqqt_fP44ja1Bgm4XeovNvEddvVdN_agF_J6kyIFEXoxnYTbh6ESAdIZdWsZSOBEij5EGv24BWcvlpoYrri6bwi2MIlRH8zno6P5uSxR-Mv3miOflae6XXh1",
    "assets/images/phone-mockup.jpg": "https://lh3.googleusercontent.com/aida/AEtjO1Ujyesits4dxXo4ToAtpL55gAW1cs6g7JxF8zSM_J_OZK-dzUVOPOfpqgFgooUXrt3UkuObLsz4f72bCrJdsgy8HISvFTdiBc_3utbNXqNBvFKF4EsYEEblQ5br5qnmzqFD2HuNkcbQmi2pxqqvYSOyuikkhaZsP1lDp2K670_sj8iI48RBYRya2An-_aQ2h9TxtNe4MrR9QcLNzRWgJS0UEP57aPsrGOP7BmI0lqpLw0s7UakokUHZy7b3",
    "assets/images/phone-in-hand.jpg": "https://lh3.googleusercontent.com/aida/AEtjO1V8wVtCPIMPk8KbpsKwtwAwtAEXcSQdkXjncmZDsjs90OSifmiG99kVkVO9uWacilX8-Tjaq_c33Zo2Z7aNLEEGjmnfxkdM1Vdp4TcXnZTANqrNG_aCVWo8XqSH8KYkF6dpU9fTnLwkL7rQ72RUF21LihDNRI5iNeBzUaLdoDIhTIvYUDhyyZ67AActfl08sdKQTAfxy-2TGR7KDMzJKTvHHpY5LreTY_KCYr5DRvA_gVm6VIIaE-kdNwdU",
    "assets/images/coverage-map-bg.jpg": "https://lh3.googleusercontent.com/aida/AEtjO1V_yX7fA9uLMtOVeWcpA83BWJU7Ygqb-win0uPBRhjs2RL3LU6vZOInM67ZvOOJVUshXQ6s1_qSSDw3ieWWqmhTzgLI5FzzYPDaeKNBJrsOw8XwnAEXFOqwPNbelI78Fip-LSD2QwKgF5o-i11rI95i-pb72BGk3h1MsJFbx2-dHfM7O1GUPoz1pDpG31eNlZGia_U-kgvPTBVMAFVPlXXhTiQbKiuJSKUqrzm1RZKT8krF-Ho391DLAT_M",
    "assets/images/ikonect-full.png": "https://lh3.googleusercontent.com/aida/AEtjO1UP5mDmBFVJ6iKyBxWlJovlg3BxOw1eaAHXi_7qOxPV4kP-ZOH0svPdq6P4uXCruU4fvgeQD9XOC_uJZq1ye8ePrkwIClhvJHoBgeR7nnytqDiYoLrqg_lWDnxyAERAOwRMcLyXMBu3PucOhDlkpoteUb5xXRqcHz1vZXmxoTxrAeWqcikE6Gz91KJSShQCcG1LsgbSdWAKP3JLc0ePRcVK3mCtHYov-QescvVXEY5xS9cZo16uwjsBPzqMDwAEPfwTo4nJ3Xa47U4",
}

for path, url in pages.items():
    try:
        download_file(url, path)
    except Exception as e:
        print(f"Error downloading {path}: {e}")

for path, url in assets.items():
    try:
        download_file(url, path)
    except Exception as e:
        print(f"Error downloading {path}: {e}")

print("All downloads finished!")
