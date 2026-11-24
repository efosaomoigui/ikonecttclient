import {Body,Controller,Get,Module,Param,Patch,Post,Query} from '@nestjs/common';
import {randomUUID} from 'node:crypto';
import * as C from '../../../contracts';
import {Database,audit} from '../core/database';
import {Contract,present,ZodPipe} from '../core/http';
import {Actor,CurrentActor,Public,Require} from '../identity/access';
const notice='Service availability is indicated for this area. Your exact address requires feasibility confirmation.';
export const areaSearch=(name:string,aliases:string[])=>[name,...aliases].join(' ').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
async function list(db:Database,q:C.Input<typeof C.AdminServiceAreaQuery>,staff:boolean){
 const {offset,limit,search,active}=q;
 const terms=(search||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean);
 const where={...(staff?(active?{active:active==='true'}:{}):{active:true,displayPrimary:true}),...(terms.length?{AND:terms.map(term=>({searchText:{contains:term}}))}:{})};
 const [items,total]=await Promise.all([db.serviceArea.findMany({where,skip:offset,take:limit,orderBy:[{name:'asc'},{id:'asc'}]}),db.serviceArea.count({where})]);
 return {items:items.map(item=>({...item,notice})),total,offset,limit};
}
@Controller('coverage/service-areas')
export class PublicServiceAreasController{
 constructor(private db:Database){}
 @Public() @Get() @Contract(C.page(C.ServiceArea),undefined,C.ServiceAreaQuery)
 async list(@Query(new ZodPipe(C.ServiceAreaQuery)) q:C.Input<typeof C.ServiceAreaQuery>){return present(C.page(C.ServiceArea),await list(this.db,q,false))}
}
@Controller('admin/service-areas')
export class AdminServiceAreasController{
 constructor(private db:Database){}
 @Require('coverage.write') @Get() @Contract(C.page(C.AdminServiceArea),undefined,C.AdminServiceAreaQuery)
 async list(@Query(new ZodPipe(C.AdminServiceAreaQuery)) q:C.Input<typeof C.AdminServiceAreaQuery>){return present(C.page(C.AdminServiceArea),await list(this.db,q,true))}
 @Require('coverage.write') @Post() @Contract(C.AdminServiceArea,C.ServiceAreaInput)
 async create(@CurrentActor() a:Actor,@Body(new ZodPipe(C.ServiceAreaInput)) b:C.Input<typeof C.ServiceAreaInput>){return this.db.mutate(async tx=>{const r=await tx.serviceArea.create({data:{...b,sourceKey:'admin-'+randomUUID(),sourceName:b.name,searchText:areaSearch(b.name,b.aliases)}});await audit(tx,a.id,'service_area.created','ServiceArea',r.id);return present(C.AdminServiceArea,{...r,notice})})}
 @Require('coverage.write') @Patch(':id') @Contract(C.AdminServiceArea,C.ServiceAreaUpdate)
 async update(@CurrentActor() a:Actor,@Param('id',new ZodPipe(C.Id)) id:string,@Body(new ZodPipe(C.ServiceAreaUpdate)) b:C.Input<typeof C.ServiceAreaUpdate>){return this.db.mutate(async tx=>{const old=await tx.serviceArea.findUniqueOrThrow({where:{id}});const r=await tx.serviceArea.update({where:{id},data:{...b,searchText:areaSearch(b.name??old.name,b.aliases??old.aliases)}});await audit(tx,a.id,'service_area.updated','ServiceArea',id,{fields:Object.keys(b)});return present(C.AdminServiceArea,{...r,notice})})}
}
@Module({controllers:[PublicServiceAreasController,AdminServiceAreasController]})
export class ServiceAreasModule{}
