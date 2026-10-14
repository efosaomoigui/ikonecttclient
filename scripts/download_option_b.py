import urllib.request
import zipfile
import io
import ssl
import subprocess
import os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}

urls = [
    "https://github.com/efosaomoigui/Ikonectt2/archive/refs/heads/main.zip",
    "https://github.com/efosaomoigui/Ikonectt2/archive/refs/heads/master.zip"
]

downloaded = False
for url in urls:
    try:
        print(f"Trying {url}...")
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
            data = resp.read()
            print(f"Downloaded {len(data)} bytes! Extracting to option-b...")
            z = zipfile.ZipFile(io.BytesIO(data))
            # Extract to temp then move
            temp_dir = "temp_option_b"
            z.extractall(temp_dir)
            extracted_subdirs = [os.path.join(temp_dir, d) for d in os.listdir(temp_dir) if os.path.isdir(os.path.join(temp_dir, d))]
            if extracted_subdirs:
                source = extracted_subdirs[0]
                os.rename(source, "option-b")
            else:
                os.rename(temp_dir, "option-b")
            if os.path.exists(temp_dir):
                import shutil
                shutil.rmtree(temp_dir, ignore_errors=True)
            print("Successfully extracted option-b via zip!")
            downloaded = True
            break
    except Exception as e:
        print(f"Failed {url}: {e}")

if not downloaded:
    print("Falling back to git clone...")
    res = subprocess.run(["git", "clone", "https://github.com/efosaomoigui/Ikonectt2.git", "option-b"], capture_output=True, text=True)
    print("Git clone output:", res.stdout, res.stderr)
