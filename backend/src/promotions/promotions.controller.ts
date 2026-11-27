import {BadRequestException,Body,Controller,Get,Module,Patch} from '@nestjs/common';
import {randomUUID} from 'node:crypto';
import * as C from '../../../contracts';
import {Database,audit} from '../core/database';
import {Contract,present,ZodPipe} from '../core/http';
import {Actor,CurrentActor,Public,Require} from '../identity/access';
export function validateBanner(value:string|null){
 if(!value)return;
 const [header,encoded]=value.split(',');const data=Buffer.from(encoded||'','base64');
 const valid=header==='data:image/png;base64'?data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):header==='data:image/jpeg;base64'?data[0]===255&&data[1]===216&&data[2]===255:header==='data:image/webp;base64'?data.toString('ascii',0,4)==='RIFF'&&data.toString('ascii',8,12)==='WEBP':false;
 if(!valid||data.length<20||data.length>1048576||data.toString('base64')!==encoded)throw new BadRequestException('Use a valid PNG, JPEG or WebP banner up to 1 MB.');
}
@Controller()
export class PromotionsController{
 constructor(private db:Database){}
 @Public() @Get('promotions/active') @Contract(C.PublicPromotion)
 async active(){const row=await this.db.websitePromotion.findUnique({where:{id:'main'}});if(!row)return {promotion:null};const promotion=present(C.PromotionSettings,{...(row.payload as object),version:row.version,updatedAt:row.updatedAt});const now=Date.now();return {promotion:promotion.published&&(!promotion.startsAt||Date.parse(promotion.startsAt)<=now)&&(!promotion.endsAt||Date.parse(promotion.endsAt)>now)?promotion:null};}
 @Require('staff.manage') @Get('admin/promotion') @Contract(C.PromotionSettings)
 async settings(){const row=await this.db.websitePromotion.findUnique({where:{id:'main'}});return present(C.PromotionSettings,row?{...(row.payload as object),version:row.version,updatedAt:row.updatedAt}:{...C.PromotionFields.parse({}),version:'00000000-0000-4000-a000-000000000000',updatedAt:new Date(0)});}
 @Require('staff.manage') @Patch('admin/promotion') @Contract(C.PromotionSettings,C.PromotionInput)
 async save(@CurrentActor() actor:Actor,@Body(new ZodPipe(C.PromotionInput)) input:C.Input<typeof C.PromotionInput>){validateBanner(input.imageData);const row=await this.db.mutate(async tx=>{const data={payload:input,version:randomUUID()};const result=await tx.websitePromotion.upsert({where:{id:'main'},create:{id:'main',...data},update:data});await audit(tx,actor.id,'promotion.updated','WebsitePromotion','main',{published:input.published,version:result.version});return result;});return present(C.PromotionSettings,{...(row.payload as object),version:row.version,updatedAt:row.updatedAt});}
}
@Module({controllers:[PromotionsController]})
export class PromotionsModule{}
