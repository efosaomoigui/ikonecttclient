import publicContactSettings from '../../../shared/public-contact-settings.json';
import {BadRequestException,Injectable} from '@nestjs/common';
import {Database,audit} from '../core/database';
import {Config} from '../core/config';
import {decrypt,encrypt} from '../core/crypto';
import {Actor} from '../identity/access';
import * as C from '../../../contracts';
export const DEFAULT_WHATSAPP=publicContactSettings.whatsappUrl;
export interface Completion {text:string;inputTokens:number;outputTokens:number}
@Injectable()
export class OpenAiProvider {
 async complete(key:string,model:string,messages:Array<{role:string;content:string}>,limit:number):Promise<Completion>{
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8000);
  try{
   const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',signal:controller.signal,headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({model,input:messages,max_output_tokens:limit,store:false})});
   if(!response.ok)throw Error('PROVIDER_REJECTED');
   const body=await response.json() as any;const text=body.output?.filter((item:any)=>item.type==='message').flatMap((item:any)=>item.content||[]).filter((item:any)=>item.type==='output_text').map((item:any)=>item.text).join('');
   if(typeof text!=='string'||!text.trim()||text.length>4000)throw Error('INVALID_RESPONSE');
   return{text:text.trim(),inputTokens:Math.max(0,Math.min(100000,Number(body.usage?.input_tokens)||0)),outputTokens:Math.max(0,Math.min(100000,Number(body.usage?.output_tokens)||0))};
  }finally{clearTimeout(timer)}
 }
}
@Injectable()
export class AiSettingsService{
 constructor(private db:Database,private config:Config,private provider:OpenAiProvider){}
 async row(){return this.db.assistantSettings.upsert({where:{id:'main'},create:{id:'main',whatsappUrl:DEFAULT_WHATSAPP},update:{}})}
 async contacts(){const row=await this.row();return{whatsappUrl:row.whatsappUrl,customerCareEmail:'customercare@ikonectt.com' as const,portalUrl:'https://portal.ikonectt.com' as const}}
 private credential(row:Awaited<ReturnType<AiSettingsService['row']>>){
  if(row.encryptedCredential){if(!this.config.values.AI_ENCRYPTION_KEY)throw Error('MISSING_ENCRYPTION_KEY');return{key:decrypt(row.encryptedCredential,this.config.values.AI_ENCRYPTION_KEY).key as string,source:'encrypted' as const}}
  if(this.config.values.OPENAI_API_KEY&&!row.environmentRevoked)return{key:this.config.values.OPENAI_API_KEY,source:'environment' as const};
  return{key:null,source:'none' as const};
 }
 async view(){const row=await this.row();let source:'none'|'environment'|'encrypted'='none';try{source=this.credential(row).source}catch{}return{retrievalArticleLimit:row.retrievalArticleLimit,enabled:row.enabled,provider:'openai' as const,model:row.model,maxOutputTokens:row.maxOutputTokens,dailyRequestLimit:row.dailyRequestLimit,credentialConfigured:source!=='none',credentialSource:source,lastTestStatus:row.lastTestStatus,knowledgePublished:await this.db.knowledgeArticle.count({where:{published:true}}),usageToday:await this.db.assistantUsage.count({where:{day:new Date().toISOString().slice(0,10)}})}}
 async save(actor:Actor,input:C.Input<typeof C.AssistantSettingsInput>){
  const {apiKey,...data}=input;if(apiKey&&!this.config.values.AI_ENCRYPTION_KEY)throw new BadRequestException('Server AI encryption key must be configured before saving credentials');
  await this.db.mutate(async tx=>{await tx.assistantSettings.upsert({where:{id:'main'},create:{id:'main',...data,...(apiKey?{encryptedCredential:encrypt({key:apiKey},this.config.values.AI_ENCRYPTION_KEY!),environmentRevoked:true}:{}),lastTestStatus:'UNTESTED'},update:{...data,...(apiKey?{encryptedCredential:encrypt({key:apiKey},this.config.values.AI_ENCRYPTION_KEY!),environmentRevoked:true}:{}),lastTestStatus:'UNTESTED'}});await audit(tx,actor.id,'assistant.configured','AssistantSettings','main',{fields:Object.keys(input).filter(k=>k!=='apiKey'),credentialReplaced:!!apiKey})});return this.view();
 }
 async revoke(actor:Actor){await this.row();await this.db.mutate(async tx=>{await tx.assistantSettings.update({where:{id:'main'},data:{enabled:false,encryptedCredential:null,environmentRevoked:true,lastTestStatus:'REVOKED'}});await audit(tx,actor.id,'assistant.credential_revoked','AssistantSettings','main')});return this.view()}
 async setContacts(actor:Actor,input:C.Input<typeof C.ContactSettingsInput>){await this.row();await this.db.mutate(async tx=>{await tx.assistantSettings.update({where:{id:'main'},data:input});await audit(tx,actor.id,'contacts.updated','AssistantSettings','main',{fields:['whatsappUrl']})});return this.contacts()}
 async generate(messages:Array<{role:string;content:string}>,test=false){
  const row=await this.row();if(!test&&!row.enabled)throw Error('DISABLED');const {key}=this.credential(row);if(!key)throw Error('UNCONFIGURED');
  const day=new Date().toISOString().slice(0,10);const usage=await this.db.mutate(async tx=>{await tx.$queryRaw`SELECT id FROM "AssistantSettings" WHERE id='main' FOR UPDATE`;const current=await tx.assistantSettings.findUniqueOrThrow({where:{id:'main'}});if(current.updatedAt.getTime()!==row.updatedAt.getTime())throw Error('CONFIGURATION_CHANGED');if(await tx.assistantUsage.count({where:{day}})>=row.dailyRequestLimit)throw Error('LIMIT');return tx.assistantUsage.create({data:{day,status:'REQUESTED'}})});
  try{const result=await this.provider.complete(key,row.model,messages,test?64:row.maxOutputTokens);await this.db.assistantUsage.update({where:{id:usage.id},data:{status:test?'TEST_OK':'OK',inputTokens:result.inputTokens,outputTokens:result.outputTokens}});return result.text}catch{await this.db.assistantUsage.update({where:{id:usage.id},data:{status:'FAILED'}});throw Error('PROVIDER_UNAVAILABLE')}
 }
 async test(actor:Actor){let ok=false;try{const text=await this.generate([{role:'user',content:'Reply with exactly OK.'}],true);ok=text.trim()==='OK'}catch{}await this.row();await this.db.mutate(async tx=>{await tx.assistantSettings.update({where:{id:'main'},data:{lastTestStatus:ok?'CONNECTED':'FAILED'}});await audit(tx,actor.id,'assistant.connection_tested','AssistantSettings','main',{ok})});return{ok,status:ok?'CONNECTED':'FAILED',message:ok?'The saved model generated a valid response.':'Connection could not be verified. Check credentials, model access, billing, server encryption key and usage limit.'}}
}
