import os
from PIL import Image
import numpy as np

src_path = r'assets\logos\ikonectt-official-logo.png'
im = Image.open(src_path).convert('RGBA')
arr = np.array(im)

print("Original image size:", im.size)
print("Channels:", arr.shape)

# Create transparent version (convert near-white background to transparent)
# Background is white/near-white (> 245 in RGB)
r = arr[:, :, 0]
g = arr[:, :, 1]
b = arr[:, :, 2]
a = arr[:, :, 3]

# Calculate whiteness
whiteness = np.minimum(r, np.minimum(g, b))
# Linear fade for anti-aliasing near edges:
# If whiteness >= 250 -> alpha = 0
# If whiteness <= 200 -> alpha = 255
# smooth in between
alpha_factor = np.clip((250.0 - whiteness) / 50.0, 0.0, 1.0)
arr_transparent = arr.copy()
arr_transparent[:, :, 3] = (a * alpha_factor).astype(np.uint8)

im_transparent = Image.fromarray(arr_transparent)
im_transparent.save(r'assets\logos\ikonectt_transparent.png')
print("Saved transparent logo:", r'assets\logos\ikonectt_transparent.png')

# Create inverted/white-on-dark version for dark themes/navbars
# In the original logo, the color is red (#ED101A / ~ (225-235, 16, 26))
# For dark navbar, the red logo can be used directly or a white version where the red text is white
arr_white = arr_transparent.copy()
# Wherever alpha > 0, set RGB to 255 (crisp white)
mask = arr_white[:, :, 3] > 10
arr_white[mask, 0] = 255
arr_white[mask, 1] = 255
arr_white[mask, 2] = 255
im_white = Image.fromarray(arr_white)
im_white.save(r'assets\logos\ikonectt_white_transparent.png')
print("Saved white transparent logo:", r'assets\logos\ikonectt_white_transparent.png')

# Distribute to option-a/public and option-b/public
dest_dirs = [
    r'option-a\public',
    r'option-b\public',
    r'option-b\src\assets'
]

for d in dest_dirs:
    os.makedirs(d, exist_ok=True)
    im.save(os.path.join(d, 'ikonectt-logo-raw.png'))
    im_transparent.save(os.path.join(d, 'ikonectt-logo.png'))
    im_white.save(os.path.join(d, 'ikonectt-logo-white.png'))
    print(f"Exported to {d}")

print("All logos prepared and distributed successfully!")
