"""Create A-H 02 review pages from A-H 01's actual-template review context.
Only writes review files. Does not edit photographs or application files.
"""
from pathlib import Path
import re

HERE=Path(__file__).resolve().parent
replacements={
 'a-h01-residential-woman-desktop-v1.png':'a-h02-connected-family-desktop-v3.png',
 'a-h01-residential-woman-medium-v3.png':'a-h02-connected-family-medium-v1.png',
 'a-h01-residential-woman-mobile-v2.png':'a-h02-connected-family-mobile-v1.png',
 'A-H 01':'A-H 02',
 'a-h01':'a-h02',
 'Illustrative AI-generated scene of a woman laughing while using a laptop at home':'Illustrative AI-generated family sharing a tablet at home',
}

def replace_all(text):
 for old,new in replacements.items():
  text=text.replace(old,new)
 return text

hero=replace_all((HERE/'hero-preview.html').read_text(encoding='utf-8'))
hero=hero.replace('href="index.html"','href="a-h02-review.html"')
hero=hero.replace("mode==='proposal'?'A-H 02 · PROPOSED mobile image-above-copy layout · Not installed · '","mode==='proposal'&&innerWidth<768?'A-H 02 image pending · A-H 01 approved mobile arrangement · Not installed · '")
(HERE/'a-h02-hero-preview.html').write_text(hero,encoding='utf-8')

index=replace_all((HERE/'index.html').read_text(encoding='utf-8'))
index=index.replace('A-H 02 — a warmer welcome home.','A-H 02 — together at home.')
index=index.replace('A Nigerian woman sharing a natural moment of laughter over her laptop. One scene, independently composed for desktop, tablet and mobile.','A Nigerian family sharing one tablet and a natural moment of delight. Independently composed for desktop, tablet and mobile, with the approved A-H 01 photographic grade.')
index=re.sub(r'<div class="status">.*?</div>','<div class="status"><strong>A-H 02 visual package approved.</strong> A-H 01 and A-H 02 are visually approved; nothing is installed. Native source-resolution targets remain outstanding. <a href="index.html">View approved A-H 01</a>. <a href="a-h03-review.html">Review A-H 03</a>.</div>',index,count=1)
index=index.replace('hero-preview.html?mode=', 'a-h02-hero-preview.html?mode=')
index=index.replace('Proposed image-above-copy · mobile','A-H 01 approved mobile arrangement')
index=index.replace('At 768px, review the fitted photograph fading into charcoal with the existing copy positions. At 390px and 320px, compare the unchanged layout with the proposal. The existing text overlaps the portrait; the proposal keeps the photograph above the same heading, body and actions. It requires separate layout approval.','Review the family within the existing desktop copy positions, the tablet background fit and the mobile arrangement approved with A-H 01. The original mobile copy placement is retained as a comparison; no layout has been installed on the website.')
index=index.replace('woman and laptop on the right, calm shadowed room on the left','family and shared tablet on the right, calm shadowed room on the left')
index=index.replace('Naturally dark left field; woman and laptop right.','Naturally dark left field; family and shared tablet right.')
index=index.replace('Recomposed shadowed room without the foreground table; upper-right face and related photographic grade.','Independent 4:3 family composition retaining all three faces and the shared tablet.')
index=index.replace('Portrait original showing the woman and laptop with quiet charcoal foreground below','Portrait original showing the family and shared tablet with quiet charcoal foreground below')
index=index.replace('Independently composed; revised to retain the laptop edge. Not a desktop crop.','Independently composed to retain all three faces and the shared tablet. Not a desktop crop.')
index=index.replace('Review the woman, expression, residential setting and photographic grade.','Review the family, natural interaction, shared activity, residential setting and photographic grade.')
index=index.replace('For mobile, approve or revise the labelled image-above-copy proposal. The unchanged layout is retained for comparison; the image-above-copy direction is visually approved.','Review how this family fits the mobile arrangement already approved with A-H 01; retain all faces and the shared tablet.')
index=index.replace('A-H 02 is the next separate review. Business and supporting photography remain deferred. No slideshow code is included.','A-H 01 remains visually approved. A-H 03 business and supporting photography remain deferred. No slideshow code is included.')
index=index.replace('../../../docs/PHASE_2D_TEMPLATE_A_IMAGE_APPROVAL.md','../../../docs/PHASE_2D_TEMPLATE_A_IMAGE_APPROVAL.md#a-h-02--connected-family-review')
index=index.replace("?'PROPOSED mobile layout — approval needed':'existing text positions'", "?'approved mobile arrangement · family image pending':'existing text positions'")
index=index.replace("window.addEventListener('resize',update);update();", "window.addEventListener('resize',update);mode.value='proposal';update();")
(HERE/'a-h02-review.html').write_text(index,encoding='utf-8')
print('Built A-H 02 review pages. A-H 01 photographic files and application files unchanged.')
