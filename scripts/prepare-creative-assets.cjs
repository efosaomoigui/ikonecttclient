// Deterministic encoding and exact brand-symbol extraction; no generated logo.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {createRequire}=require('node:module');
const runtime=createRequire(process.env.IKONECTT_RUNTIME_PACKAGE||'C:/Users/Efe-Dev/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const sharp=runtime('sharp'),digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const review='assets/review/final-creative',output='assets/visual-library/creative';
(async()=>{
 fs.mkdirSync(output,{recursive:true});fs.mkdirSync('assets/brand',{recursive:true});
 const records=[];
 for(const [id,source,stem,widths] of [
  ['city','lagos-clean-v1.png','lagos-clean-v1',[480,800,1280,1600,1725]],
  ['architecture','commercial-architecture-v1.png','commercial-architecture-v1',[480,800,1086]],
 ]){
  const file=path.join(review,source),meta=await sharp(file).metadata(),exports=[];
  for(const width of widths){
   if(width>meta.width)throw Error('Never upscale a source photograph');
   const target=path.join(output,`${stem}-${width}.webp`),result=await sharp(file).resize({width,withoutEnlargement:true}).webp({quality:84,effort:6}).toFile(target);
   exports.push({path:target.replaceAll('\\','/'),width:result.width,height:result.height,bytes:result.size});
  }
  records.push({id,source:file.replaceAll('\\','/'),sourceSHA256:digest(fs.readFileSync(file)),width:meta.width,height:meta.height,exports});
 }
 const official='assets/logos/iKonectt Logo Color Variants.png';
 const crop={left:91,top:240,width:59,height:221};
 const {data,info}=await sharp(official).extract(crop).removeAlpha().raw().toBuffer({resolveWithObject:true});
 const mask=Buffer.alloc(info.width*info.height*4);
 for(let n=0;n<info.width*info.height;n++){
  mask[n*4]=255;mask[n*4+1]=255;mask[n*4+2]=255;
  // Red coverage isolates the supplied dot/lightning geometry from its white sheet.
  mask[n*4+3]=Math.min(255,Math.max(0,Math.round((data[n*3]-data[n*3+1])*1.1)));
 }
 const target='assets/brand/ikonectt-i-mask.png';
 await sharp(mask,{raw:{width:info.width,height:info.height,channels:4}}).png().toFile(target);
 records.push({id:'official-i-mask',source:official,sourceSHA256:digest(fs.readFileSync(official)),crop,method:'Extract original raster symbol; derive alpha from red coverage. No font substitution, redraw, skew or AI generation.',path:target,sha256:digest(fs.readFileSync(target))});
 fs.writeFileSync(path.join(review,'exports.json'),JSON.stringify(records,null,2)+'\n');
 console.log(records.map(r=>({id:r.id,width:r.width,height:r.height,exports:r.exports?.length,path:r.path})));
})().catch(e=>{console.error(e);process.exitCode=1;});
