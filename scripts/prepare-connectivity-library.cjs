// Encode supplied concepts only. Never generate, enlarge or overwrite originals.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {createRequire}=require('node:module');
const req=createRequire('C:/Users/Efe-Dev/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json'),sharp=req('sharp');
const source='Ikonectt_Connectivity_Image_Library',output='assets/visual-library/connectivity';
(async()=>{fs.mkdirSync(output,{recursive:true});const records=[];
for(const [index,name] of ['lagos-night-city','fibre-network-city','digital-coverage-map','abstract-network','digital-wave','connected-homes-businesses'].entries()){
 const stem=`${String(index+1).padStart(2,'0')}-${name}`,file=path.join(source,stem,stem+'.jpg'),bytes=fs.readFileSync(file),meta=await sharp(bytes).metadata();
 const record={id:name,source:file.replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(bytes).digest('hex'),width:meta.width,height:meta.height,exports:[]};
 if(index<5){
  // Remove only near-white concept-sheet separator rows, not photographic content.
  const {data,info}=await sharp(bytes).removeAlpha().raw().toBuffer({resolveWithObject:true});let trim=0;
  for(let y=info.height-1;y>info.height-6;y--){let white=0;for(let x=0;x<info.width;x++){let p=(y*info.width+x)*3;if(data[p]>240&&data[p+1]>240&&data[p+2]>240)white++;}if(white/info.width>.9)trim++;else break;}
  record.trimBottom=trim;record.exportHeight=meta.height-trim;
  for(const width of [320,480,640,832]){if(width>meta.width)throw Error('No upscaling');const target=path.join(output,`${name}-${width}.webp`);const result=await sharp(bytes).extract({left:0,top:0,width:meta.width,height:meta.height-trim}).resize({width,withoutEnlargement:true}).webp({quality:83,effort:6}).toFile(target);record.exports.push({path:target.replaceAll('\\','/'),width:result.width,height:result.height,bytes:result.size});}
 }
 records.push(record);
}
fs.mkdirSync('docs/evidence/connectivity-storytelling',{recursive:true});fs.writeFileSync('docs/evidence/connectivity-storytelling/assets.json',JSON.stringify(records,null,2)+'\n');console.log(records.map(r=>({id:r.id,width:r.width,height:r.height,trim:r.trimBottom,exports:r.exports.length})));
})().catch(e=>{console.error(e);process.exitCode=1;});
