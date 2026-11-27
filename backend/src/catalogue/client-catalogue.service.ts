import {Global,HttpException,Injectable,Module,ConflictException} from '@nestjs/common';
import * as C from '../../../contracts';
import * as provider from '../../../server/client-catalogue';
@Injectable()
export class ClientCatalogue {
 get enabled(){return provider.enabled();}
 private async call<T>(operation:()=>Promise<T>):Promise<T>{try{return await operation();}catch(error:any){throw new HttpException({message:error.message,code:error.code||'CLIENT_CATALOGUE_UNAVAILABLE'},error.status||503);}}
 plans(query:{offset?:number;limit?:number}={}){return this.call(async()=>C.page(C.Plan).parse(await provider.plans(query)));}
 plan(id:string){return this.call(async()=>C.Plan.parse(await provider.plan(id)));}
 areas(query:{offset?:number;limit?:number;search?:string}={}){return this.call(async()=>C.page(C.AdminServiceArea).parse(await provider.areas(query)));}
 requireInternal(){if(this.enabled)throw new ConflictException('Plans and coverage are managed in the client CRM. Local editing is disabled.');}
}
@Global() @Module({providers:[ClientCatalogue],exports:[ClientCatalogue]})
export class ClientCatalogueModule{}
