// Rebuild only the photographic surroundings. Original people are never repainted.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {createRequire}=require('node:module');
const runtime=createRequire(process.env.IKONECTT_RUNTIME_PACKAGE||'C:/Users/Efe-Dev/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const sharp=runtime('sharp');
const review=path.resolve('assets/review/client-campaign');
const output=path.resolve('assets/visual-library/campaign');
const subjects=JSON.parse(fs.readFileSync(path.join(review,'exports.json')));
const specs=[
 {id:'family',width:640,height:320,left:0,top:77,widths:[320,480,640]},
 {id:'individual',width:480,height:330,left:100,top:40,widths:[320,480]},
];
(async()=>{
 const records=[];
 for(const spec of specs){
  const original=subjects.find(record=>record.id===spec.id);
  const subjectFile=path.join(review,`client-${spec.id}-v1.png`);
  const subject=await sharp(subjectFile).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const room=await sharp(path.join(review,`${spec.id}-room-plate.png`)).resize(spec.width,spec.height,{fit:'cover'}).removeAlpha().png().toBuffer();
  const final=await sharp(room).composite([{input:subjectFile,left:spec.left,top:spec.top}]).removeAlpha().png().toBuffer();
  const stem=`client-${spec.id}-scene-v2`;
  fs.writeFileSync(path.join(review,`${stem}.png`),final);
  const exports=[];
  for(const width of spec.widths){
   const target=path.join(output,`${stem}-${width}.webp`);
   await sharp(final).resize({width,withoutEnlargement:true}).webp({lossless:true,effort:6}).toFile(target);
   const metadata=await sharp(target).metadata();
   if(metadata.hasAlpha)throw Error('The installed image must be an opaque photograph');
   exports.push({path:path.relative(process.cwd(),target).replaceAll('\\','/'),width,bytes:fs.statSync(target).size,hasAlpha:false});
  }
  const pixels=await sharp(path.join(output,`${stem}-${spec.width}.webp`)).ensureAlpha().raw().toBuffer();
  let verified=0,changed=0;
  for(let y=0;y<subject.info.height;y++)for(let x=0;x<subject.info.width;x++){
   const i=(y*subject.info.width+x)*4,j=((y+spec.top)*spec.width+x+spec.left)*4;
   if(subject.data[i+3]===255){verified++;if(subject.data[i]!==pixels[j]||subject.data[i+1]!==pixels[j+1]||subject.data[i+2]!==pixels[j+2])changed++;}
  }
  if(changed)throw Error('Original subject pixels changed');
  records.push({id:spec.id,source:original.source,sourceDimensions:original.sourceDimensions,sourceSHA256:original.sourceSHA256,crop:original.crop,scene:{width:spec.width,height:spec.height,subjectLeft:spec.left,subjectTop:spec.top},opaquePixelsVerified:verified,changedOpaquePixels:changed,background:'Generated room-only plate, composited behind original visible subject pixels; no reconstructed people or hidden anatomy',exports});
 }
 fs.writeFileSync(path.join(review,'scene-exports.json'),JSON.stringify(records,null,2)+'\n');
 console.log(JSON.stringify(records,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
