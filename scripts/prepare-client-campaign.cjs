// Extract the visible source pixels; never reconstruct faces or hidden anatomy.
// The hand-traced vector mattes remove flyer artwork without generative repainting.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {createRequire}=require('node:module');
const runtime=createRequire(process.env.IKONECTT_RUNTIME_PACKAGE||'C:/Users/Efe-Dev/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const sharp=runtime('sharp');
const sourceDir=path.resolve('assets/review/client-campaign');
const outputDir=path.resolve('assets/visual-library/campaign');
const specs=[
 {id:'family',source:'family-flyer.png',crop:{left:8,top:157,width:532,height:243},
  // All four original heads, shoulders, both children and father's pointing hand.
  outline:'M 8 284 L 25 281 L 25 266 Q 28 255 39 254 Q 49 251 61 260 L 66 263 L 61 247 L 58 231 L 60 212 L 64 197 L 72 183 L 85 173 L 99 167 L 109 161 L 119 165 L 126 162 L 139 170 L 151 180 L 157 195 L 165 209 L 167 225 L 161 242 L 151 256 L 143 269 L 139 279 L 145 294 L 159 303 L 171 310 L 170 289 L 174 270 Q 183 251 203 248 Q 225 243 238 259 L 244 273 L 254 262 Q 273 252 286 265 L 298 280 L 303 276 L 298 263 L 292 252 L 288 239 L 285 222 L 288 209 L 295 198 L 308 191 L 321 187 L 334 189 L 345 196 L 353 207 L 357 221 L 358 237 L 364 248 L 360 263 L 362 269 L 380 266 L 396 262 L 414 266 L 435 267 L 452 264 L 467 258 L 480 251 L 493 247 L 502 240 L 514 234 L 521 233 L 525 237 L 523 241 L 530 245 L 531 251 L 526 254 L 530 262 L 526 268 L 516 275 L 505 287 L 488 301 L 475 308 L 460 316 L 450 320 L 450 335 L 460 357 L 476 384 L 482 400 L 8 400 Z'},
 {id:'individual',source:'individual-flyer.png',crop:{left:227,top:111,width:362,height:290},
  // Ends above the Home Plans block. Red circular back and visible seat survive.
  outline:'M 229 283 Q 230 270 243 265 L 263 264 L 280 270 L 299 279 L 319 288 L 329 266 L 341 241 L 349 222 Q 355 211 371 206 L 389 200 L 397 189 L 398 176 L 398 166 L 395 148 L 398 132 Q 400 118 412 115 Q 434 108 448 121 L 455 137 L 456 153 L 452 170 L 458 189 L 478 185 L 502 184 L 529 186 L 553 192 Q 574 187 579 201 L 577 214 L 564 224 Q 583 235 584 257 Q 587 281 574 301 L 555 315 L 565 319 Q 578 323 578 340 L 577 356 L 560 380 L 548 401 L 305 401 L 308 383 L 311 379 L 300 374 L 292 363 L 279 353 L 265 341 L 251 326 L 240 311 L 232 300 Z'},
];
(async()=>{
 fs.mkdirSync(outputDir,{recursive:true});
 const records=[];
 for(const spec of specs){
  const input=path.join(sourceDir,spec.source),meta=await sharp(input).metadata();
  const mask=`<svg xmlns="http://www.w3.org/2000/svg" width="${meta.width}" height="${meta.height}"><defs><filter id="edge"><feMorphology operator="erode" radius=".7"/><feGaussianBlur stdDeviation=".2"/></filter></defs><path d="${spec.outline}" fill="white" filter="url(#edge)"/></svg>`;
  fs.writeFileSync(path.join(sourceDir,`${spec.id}-matte.svg`),mask+'\n');
  const rgba=await sharp(input).ensureAlpha().composite([{input:Buffer.from(mask),blend:'dest-in'}]).png().toBuffer();
  const clean=await sharp(rgba).extract(spec.crop).png().toBuffer();
  const stem=`client-${spec.id}-v1`;
  fs.writeFileSync(path.join(sourceDir,`${stem}.png`),clean);
  const exports=[];
  for(const width of [320,spec.crop.width]){
   const target=path.join(outputDir,`${stem}-${width}.webp`);
   await sharp(clean).resize({width,withoutEnlargement:true}).webp({lossless:true,effort:6}).toFile(target);
   exports.push({path:path.relative(process.cwd(),target).replaceAll('\\','/'),width,bytes:fs.statSync(target).size});
  }
  const original=await sharp(input).extract(spec.crop).ensureAlpha().raw().toBuffer();
  const pixels=await sharp(path.join(outputDir,`${stem}-${spec.crop.width}.webp`)).ensureAlpha().raw().toBuffer();
  let opaque=0,differences=0;
  for(let i=0;i<pixels.length;i+=4)if(pixels[i+3]===255){opaque++;if(original[i]!==pixels[i]||original[i+1]!==pixels[i+1]||original[i+2]!==pixels[i+2])differences++;}
  if(differences)throw Error(`${spec.id}: ${differences} original opaque pixels changed`);
  records.push({id:spec.id,source:spec.source,sourceDimensions:[meta.width,meta.height],sourceSHA256:crypto.createHash('sha256').update(fs.readFileSync(input)).digest('hex'),crop:spec.crop,opaquePixelsVerified:opaque,changedOpaquePixels:differences,method:'Original pixels with a hand-traced alpha matte; cropped above advertising blocks; no reconstructed anatomy or facial retouching',exports});
 }
 fs.writeFileSync(path.join(sourceDir,'exports.json'),JSON.stringify(records,null,2)+'\n');
 console.log(JSON.stringify(records,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
