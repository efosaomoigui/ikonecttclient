// Authoritative people-photo source: client-maintained newimages folder.
// Originals are preserved. Export records identify the source and every resize.
export const clientImageAssets={
  "family-tablet-1": {
    "width": 1376,
    "height": 768,
    "widths": [
      480,
      800,
      1280,
      1376
    ],
    "alt": "A family sharing a tablet in a bright living room with red cushions.",
    "position": "76% 45%",
    "source": "Ikonectt_Connectivity_Image_Library/newimages/Family_using_tablet_together_1ab2422c.jpg"
  },
  "family-tablet-2": {
    "width": 1376,
    "height": 768,
    "widths": [
      480,
      800,
      1280,
      1376
    ],
    "alt": "Parents and children enjoying a tablet together on a sofa.",
    "position": "80% 45%",
    "source": "Ikonectt_Connectivity_Image_Library/newimages/Family_using_tablet_together_1b1ddf84.jpg"
  },
  "family-gaming": {
    "width": 2048,
    "height": 1536,
    "widths": [
      480,
      800,
      1280,
      1600,
      2048
    ],
    "alt": "A family enjoying video games together in their living room.",
    "position": "52% 0%",
    "source": "Ikonectt_Connectivity_Image_Library/newimages/image.png_5d67509c.jpg"
  },
  "conference-room": {
    "width": 1376,
    "height": 768,
    "widths": [
      480,
      800,
      1280,
      1376
    ],
    "alt": "A business professional beside colleagues taking part in a video conference.",
    "position": "48% 40%",
    "source": "Ikonectt_Connectivity_Image_Library/newimages/make_the_stand_suit_guys_20261027180922.jpg"
  },
  "friends-gaming": {
    "width": 1376,
    "height": 768,
    "widths": [
      480,
      800,
      1280,
      1376
    ],
    "alt": "Two friends playing video games on a sofa with red cushions.",
    "position": "50% 42%",
    "source": "Ikonectt_Connectivity_Image_Library/newimages/Men_playing_video_games_together_467cdb85.jpg"
  },
  "red-emblem": {
    "width": 1376,
    "height": 768,
    "widths": [
      480,
      800,
      1280,
      1376
    ],
    "alt": "A photographed red acrylic emblem standing on a dark table.",
    "position": "50% 50%",
    "source": "Ikonectt_Connectivity_Image_Library/newimages/Red_acrylic_emblem_on_table_22960efd.jpg"
  },
  "everyday-couple": {
    "width": 1513,
    "height": 823,
    "widths": [
      480,
      800,
      1280,
      1513
    ],
    "alt": "A couple sharing a tablet in a bright living room overlooking the city.",
    "position": "68% 45%",
    "source": "Ikonectt_Connectivity_Image_Library/newimages/image.png_76191433.jpg"
  },
  "rooftop-network": {
    "width": 1376,
    "height": 768,
    "widths": [
      480,
      800,
      1280,
      1376
    ],
    "alt": "Telecommunications equipment on an office rooftop at dusk.",
    "position": "62% 50%",
    "source": "Ikonectt_Connectivity_Image_Library/newimages/Satellite_dish_on_office_rooftop_c8b8cffa.jpg"
  }
};
export const clientImageURL=(key,width=clientImageAssets[key].width)=>new URL(`../assets/visual-library/client-library/${key}-${width}.webp`,import.meta.url).href;
export const clientImageSrcSet=key=>clientImageAssets[key].widths.map(width=>clientImageURL(key,width)+' '+width+'w').join(', ');
export const clientPortraitURL=width=>new URL(`../assets/visual-library/client-library/family-tablet-1-portrait-${width}.webp`,import.meta.url).href;
export function clientPicture(key,{decorative=false,priority=false,sizes='(max-width:767px) 100vw,60vw',className='ik-visual-picture',campaign=false}={}){
 const asset=clientImageAssets[key];
 return '<picture class="'+className+'" data-client-image="'+key+'"'+(campaign?' data-campaign="family"':'')+' style="--client-photo-position:'+asset.position+'"><img src="'+clientImageURL(key)+'" srcset="'+clientImageSrcSet(key)+'" sizes="'+sizes+'" width="'+asset.width+'" height="'+asset.height+'" alt="'+(decorative?'':asset.alt)+'" loading="'+(priority?'eager':'lazy')+'" decoding="async"'+(priority?' fetchpriority="high"':'')+'></picture>';
}
