"""Build only A-H 03 review pages. No application or photographic pixels edited."""
from pathlib import Path
import re

HERE=Path(__file__).resolve().parent
replacements={
 'a-h02-connected-family-desktop-v3.png':'a-h03-business-collaboration-desktop-v3.png',
 'a-h02-connected-family-medium-v1.png':'a-h03-business-collaboration-medium-v2.png',
 'a-h02-connected-family-mobile-v1.png':'a-h03-business-collaboration-mobile-v2.png',
 'A-H 02':'A-H 03',
 'a-h02':'a-h03',
 'Illustrative AI-generated family sharing a tablet at home':'Illustrative AI-generated Nigerian professionals collaborating in a contemporary office',
}
def convert(text):
 for old,new in replacements.items():
  text=text.replace(old,new)
 return text

hero=convert((HERE/'a-h02-hero-preview.html').read_text(encoding='utf-8'))
hero=hero.replace('A-H 03 image pending','A-H 03 visually approved')
(HERE/'a-h03-hero-preview.html').write_text(hero,encoding='utf-8')

index=convert((HERE/'a-h02-review.html').read_text(encoding='utf-8'))
index=index.replace('A-H 03 — together at home.','A-H 03 — confidence at work.')
index=index.replace('A Nigerian family sharing one tablet and a natural moment of delight. Independently composed for desktop, tablet and mobile, with the approved A-H 01 photographic grade.','Two Nigerian professionals working together in a new glass-and-steel office. Cool daylight, a diagonal workspace view and different furniture distinguish this scene from the approved home images.')
index=re.sub(r'<div class="status">.*?</div>','<div class="status"><strong>A-H 03 visually approved.</strong> All three hero scenes are visually approved. Nothing is installed. Native source targets and production exports remain outstanding. <a href="index.html">View A-H 01</a> · <a href="a-h02-review.html">View A-H 02</a>.</div>',index,count=1)
index=index.replace('Review the family within the existing desktop copy positions, the tablet background fit and the mobile arrangement approved with A-H 01.','Review the office scene within the existing desktop copy positions, tablet background fit and mobile arrangement approved with A-H 01.')
index=index.replace('family and shared tablet on the right, calm shadowed room on the left','professionals, smartphone and shared display on the right, shadowed glass office foreground on the left')
index=index.replace('Naturally dark left field; family and shared tablet right.','Glass-office depth and naturally shaded foreground; professionals, smartphone and shared display right.')
index=index.replace('Independent 4:3 family composition retaining all three faces and the shared tablet.','Independent 4:3 office composition retaining both faces, smartphone and shared display.')
index=index.replace('Portrait original showing the family and shared tablet with quiet charcoal foreground below','Portrait original showing both professionals, smartphone and shared display above a quiet office foreground')
index=index.replace('Independently composed to retain all three faces and the shared tablet.','Independently composed to retain both faces, smartphone and full shared display.')
index=index.replace('Review the family, natural interaction, shared activity, residential setting and photographic grade.','Review the new commercial setting, distinct background, natural collaboration and photographic quality.')
index=index.replace('Review how this family fits the mobile arrangement already approved with A-H 01; retain all faces and the shared tablet.','Review both professionals, smartphone and shared display in the mobile arrangement already approved with A-H 01.')
index=index.replace('A-H 01 remains visually approved. A-H 03 business and supporting photography remain deferred. No slideshow code is included.','A-H 01 and A-H 02 remain visually approved. Supporting photography and slideshow implementation remain deferred.')
index=index.replace('A-H 03 business and supporting photography remain deferred.','This A-H 03 scene is visually approved; supporting photography remains deferred.')
index=index.replace('#a-h-02--connected-family-review','#a-h-03--business-collaboration-review')
index=index.replace('family image pending','business image approved')
index=index.replace('Approval decisions','Approved visual scope')
index=index.replace('a-h03-production-prompts.md','a-h03-smartphone-production-prompts.md')
index=index.replace('Cool daylight, a diagonal workspace view and different furniture distinguish this scene from the approved home images.','A smartphone and shared office display replace the laptop. Cool daylight and commercial architecture distinguish this scene from the approved home images.')
(HERE/'a-h03-review.html').write_text(index,encoding='utf-8')
print('Built A-H 03 static review. Application files and approved photographs unchanged.')
