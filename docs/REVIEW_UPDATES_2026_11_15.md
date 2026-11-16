# Client review updates — 15 November 2026

The canonical Option E site now has a red branded fibre router, a rotating desktop device row, red left-edge card styling across internal pages, scrollable residential/business plan catalogues without the homepage price ribbon, eight restored customer stories, and labelled social preview links. The homepage retains its red plan presentation.

Customer quotes, names, occupations, ratings and imagery were transcribed from the eight old-site image URLs supplied by the client in this chat. Original composite cards are retained under `option-e/images/customers/`; the portrait is displayed through a CSS viewport without modifying those originals. Ahmed Yusuf's source uses an illustration, which is preserved. The client requested these existing published stories for the new site. No fictional feedback is promoted to a customer endorsement. Source URLs are recorded per story in `option-e/customer-stories.js`.

Desktop testimonials show two cards; phones show one. Arrow buttons, touch scrolling and keyboard browsing are available. Automatic motion stops during interaction, while the page is hidden or the section is offscreen, and for reduced-motion preferences. Phones retain the device row's manual swipe interaction. The existing two-plan comparison grid is preserved while the residential and business catalogues use carousels.

Social destinations are explicitly labelled preview links and currently point to platform homepages. Replace them with verified profiles in `option-e/footer-contacts.js` when supplied.

Validation: `npm test` passed all 197 tests. Browser checks covered desktop, tablet and phone widths (1440, 768, 390 and 320px), internal plan navigation, original customer images, device rotation, reduced motion, footer links and homepage section order. No browser exceptions, failed asset responses or page overflow remained in the final check.

## Generated router

Built-in ImageGen edit mode was used with the original router and official white logo as references. Saved project asset: `option-e/images/devices/router-red.png`.

Final prompt:

> Use case: precise-object-edit. Create a polished website product cutout editing image 1. Preserve upright rounded tower fibre router silhouette, front three-quarter camera, scale and centered placement, vents, subtle contact shadow and isolated transparent background. Change the entire grey body and top to rich Ikonectt crimson red, satin premium material. Thin white trim around top and lower base seams, no grey panels. Embed the official white ikonectt wordmark from image 2 very small and discreetly on the lower front face, occupying only about 22% of router width. Under it, tiny white text 'FIBRE INTERNET'. Keep the branding understated, realistic printed onto device, not floating. Full object with breathing room, no surrounding props, no extra text, genuine transparent alpha background.
