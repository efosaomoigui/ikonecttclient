"""Read background-only browser screenshots; report conservative text-box contrast.
No image pixels are created, modified or exported by this script.
"""
from pathlib import Path
from PIL import Image
import json
import math

HERE=Path(__file__).resolve().parent
checks=json.loads((HERE/'responsive-checks.json').read_text(encoding='utf-8'))

def luminance(rgb):
    values=[x/255 for x in rgb]
    values=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in values]
    return .2126*values[0]+.7152*values[1]+.0722*values[2]

results=[]
for check, requested in zip(checks,[1440,1280,1024,768,390,320,390,320]):
    mode=check['mode']
    image=Image.open(HERE/f'previews/a-h01-background-{mode}-{requested}.png').convert('RGB')
    lines=[]
    for item in check['copy']:
        if item['tag']=='BUTTON':
            continue  # Existing button styling is unchanged; measure photographic text only.
        foreground=(255,97,106) if item['text'].startswith('Fibre internet') else (255,255,255)
        alpha=.9 if item['text'].startswith('Fibre broadband') else 1
        threshold=3 if item['tag']=='H1' else 4.5
        worst=100
        for rect in item['rects']:
            bounds=(max(0,math.floor(rect['left'])),max(0,math.floor(rect['top'])),min(image.width,math.ceil(rect['right'])),min(image.height,math.ceil(rect['bottom'])))
            for y in range(bounds[1],bounds[3]):
                for x in range(bounds[0],bounds[2]):
                    bg=image.getpixel((x,y))
                    fg=tuple(alpha*f+(1-alpha)*b for f,b in zip(foreground,bg))
                    a,b=luminance(fg),luminance(bg)
                    contrast=(max(a,b)+.05)/(min(a,b)+.05)
                    worst=min(worst,contrast)
        lines.append({'text':item['text'],'minimumAcrossTextRectangles':round(worst,2),'threshold':threshold,'pass':worst>=threshold})
    results.append({'mode':mode,'requestedWidth':requested,'screenshotSize':image.size,'photographicTextChecks':lines,'pass':all(x['pass'] for x in lines)})
(HERE/'contrast-checks.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
for result in results:
    print(result['mode'],result['requestedWidth'],[(x['minimumAcrossTextRectangles'],x['pass']) for x in result['photographicTextChecks']])
