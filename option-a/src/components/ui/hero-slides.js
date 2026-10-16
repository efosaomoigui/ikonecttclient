const directory = `${import.meta.env?.BASE_URL || './'}images/template-a/`;
const profile = (name, width, height, small) => ({
  src: `${directory}${name}-${width}.webp`,
  srcSet: `${directory}${name}-${small}.webp ${small}w, ${directory}${name}-${width}.webp ${width}w`,
  width, height,
});

// Three approved stories, each with independent desktop, tablet and portrait originals.
export const heroSlides = [
  {name: 'Residential', desktop: profile('a-h01-residential-woman-desktop-v1',1672,941,1024), medium: profile('a-h01-residential-woman-medium-v3',1448,1086,960), mobile: profile('a-h01-residential-woman-mobile-v2',941,1672,640)},
  {name: 'Connected family', desktop: profile('a-h02-connected-family-desktop-v3',1672,941,1024), medium: profile('a-h02-connected-family-medium-v1',1448,1086,960), mobile: profile('a-h02-connected-family-mobile-v1',941,1672,640)},
  {name: 'Business collaboration', desktop: profile('a-h03-business-collaboration-desktop-v3',1672,941,1024), medium: profile('a-h03-business-collaboration-medium-v2',1448,1086,960), mobile: profile('a-h03-business-collaboration-mobile-v2',941,1672,640)},
];
