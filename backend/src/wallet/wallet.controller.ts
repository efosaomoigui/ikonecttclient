import {Body,Controller,Get,Module,Param,Patch,Post,Query} from '@nestjs/common';
import {ApiBearerAuth,ApiTags} from '@nestjs/swagger';
import * as C from '../../../contracts';
import {Database} from '../core/database';
import {Contract,present,ZodPipe} from '../core/http';
import {Actor,CurrentActor,CustomerOnly,Require} from '../identity/access';
import {WalletService} from './wallet.service';
import {RenewalProvider} from './renewal.provider';
import {SettlementAdapter,DisabledSettlementAdapter} from './settlement.adapter';
import {SettlementService} from './settlement.service';

async function page(model:any,query:{offset:number;limit:number},where:any={}){
 const [items,total]=await Promise.all([model.findMany({where,skip:query.offset,take:query.limit,orderBy:[{createdAt:'desc'},{id:'desc'}]}),model.count({where})]);return {items,total,offset:query.offset,limit:query.limit};
}
@ApiTags('Customer wallet') @ApiBearerAuth() @CustomerOnly() @Controller('me/wallet')
export class CustomerWalletController{
 constructor(private readonly db:Database,private readonly wallets:WalletService){}
 @Get() @Contract(C.WalletSummary)
 async summary(@CurrentActor() a:Actor){return present(C.WalletSummary,await this.wallets.summary(a.customerId!))}
 @Get('transactions') @Contract(C.page(C.WalletEntry),undefined,C.ListQuery)
 async entries(@CurrentActor() a:Actor,@Query(new ZodPipe(C.ListQuery)) q:C.Input<typeof C.ListQuery>){return present(C.page(C.WalletEntry),await page(this.db.walletEntry,q,{customerId:a.customerId}))}
 @Get('top-ups') @Contract(C.page(C.WalletTopUp),undefined,C.ListQuery)
 async topUps(@CurrentActor() a:Actor,@Query(new ZodPipe(C.ListQuery)) q:C.Input<typeof C.ListQuery>){return present(C.page(C.WalletTopUp),await page(this.db.walletTopUp,q,{customerId:a.customerId}))}
 @Post('top-ups') @Contract(C.WalletTopUp,C.ReportWalletTopUpRequest)
 async report(@CurrentActor() a:Actor,@Body(new ZodPipe(C.ReportWalletTopUpRequest)) b:C.Input<typeof C.ReportWalletTopUpRequest>){return present(C.WalletTopUp,await this.wallets.report(a,b))}
 @Get('renewals') @Contract(C.page(C.WalletRenewal),undefined,C.ListQuery)
 async renewals(@CurrentActor() a:Actor,@Query(new ZodPipe(C.ListQuery)) q:C.Input<typeof C.ListQuery>){return present(C.page(C.WalletRenewal),await page(this.db.walletRenewal,q,{customerId:a.customerId}))}
 @Get('renewals/:id') @Contract(C.WalletRenewal)
 async renewal(@CurrentActor() a:Actor,@Param('id',new ZodPipe(C.Id)) id:string){return present(C.WalletRenewal,await this.db.walletRenewal.findFirstOrThrow({where:{id,customerId:a.customerId!}}))}
}
@ApiTags('Customer wallet renewals') @ApiBearerAuth() @CustomerOnly() @Controller('me/subscriptions')
export class CustomerWalletRenewalController{
 constructor(private readonly wallets:WalletService){}
 @Get(':id/renewal-eligibility') @Contract(C.RenewalEligibility)
 async eligibility(@CurrentActor() a:Actor,@Param('id',new ZodPipe(C.Id)) id:string){return present(C.RenewalEligibility,await this.wallets.eligibility(a.customerId!,id))}
 @Post(':id/wallet-renewals') @Contract(C.WalletRenewal,C.WalletRenewalRequest)
 async renew(@CurrentActor() a:Actor,@Param('id',new ZodPipe(C.Id)) id:string,@Body(new ZodPipe(C.WalletRenewalRequest)) b:C.Input<typeof C.WalletRenewalRequest>){return present(C.WalletRenewal,await this.wallets.reserve(a,id,b))}
}
@ApiTags('Admin customer wallets') @ApiBearerAuth() @Controller('admin/customers')
export class AdminWalletController{
 constructor(private readonly db:Database,private readonly wallets:WalletService){}
 @Require('wallet.read') @Get(':id/wallet') @Contract(C.WalletSummary)
 async summary(@Param('id',new ZodPipe(C.Id)) id:string){return present(C.WalletSummary,await this.wallets.summary(id))}
 @Require('wallet.read') @Get(':id/wallet/transactions') @Contract(C.page(C.WalletEntry),undefined,C.ListQuery)
 async entries(@Param('id',new ZodPipe(C.Id)) id:string,@Query(new ZodPipe(C.ListQuery)) q:C.Input<typeof C.ListQuery>){return present(C.page(C.WalletEntry),await page(this.db.walletEntry,q,{customerId:id}))}
 @Require('wallet.adjust') @Post(':id/wallet/adjustments') @Contract(C.WalletEntry,C.WalletAdjustmentRequest)
 async adjust(@CurrentActor() a:Actor,@Param('id',new ZodPipe(C.Id)) id:string,@Body(new ZodPipe(C.WalletAdjustmentRequest)) b:C.Input<typeof C.WalletAdjustmentRequest>){return present(C.WalletEntry,await this.wallets.adjust(a,id,b))}
}
@ApiTags('Finance wallet top-ups') @ApiBearerAuth() @Controller('admin/wallet-top-ups')
export class AdminTopUpController{
 constructor(private readonly db:Database,private readonly wallets:WalletService){}
 @Require('payments.verify') @Get() @Contract(C.page(C.AdminWalletTopUp),undefined,C.WalletTopUpQuery)
 async list(@Query(new ZodPipe(C.WalletTopUpQuery)) q:C.Input<typeof C.WalletTopUpQuery>){const{offset,limit,...where}=q;return present(C.page(C.AdminWalletTopUp),await page(this.db.walletTopUp,{offset,limit},where))}
 @Require('payments.verify') @Get(':id') @Contract(C.AdminWalletTopUp)
 async get(@Param('id',new ZodPipe(C.Id)) id:string){return present(C.AdminWalletTopUp,await this.db.walletTopUp.findUniqueOrThrow({where:{id}}))}
 @Require('payments.verify') @Post(':id/verify') @Contract(C.AdminWalletTopUp,C.VerifyPaymentRequest)
 async verify(@CurrentActor() a:Actor,@Param('id',new ZodPipe(C.Id)) id:string,@Body(new ZodPipe(C.VerifyPaymentRequest)) b:C.Input<typeof C.VerifyPaymentRequest>){return present(C.AdminWalletTopUp,await this.wallets.verify(a,id,b))}
}
@ApiTags('Finance wallet corrections') @ApiBearerAuth() @Controller('admin/wallet-transactions')
export class WalletCorrectionController{
 constructor(private readonly wallets:WalletService){}
 @Require('wallet.adjust') @Post(':id/reverse') @Contract(C.WalletEntry,C.WalletReversalRequest)
 async reverse(@CurrentActor() a:Actor,@Param('id',new ZodPipe(C.Id)) id:string,@Body(new ZodPipe(C.WalletReversalRequest)) b:C.Input<typeof C.WalletReversalRequest>){return present(C.WalletEntry,await this.wallets.reverse(a,id,b))}
}
@ApiTags('Admin wallet renewal operations') @ApiBearerAuth() @Controller('admin/wallet-renewals')
export class AdminRenewalController{
 constructor(private readonly db:Database,private readonly wallets:WalletService){}
 @Require('renewals.read') @Get() @Contract(C.page(C.AdminWalletRenewal),undefined,C.WalletRenewalQuery)
 async list(@Query(new ZodPipe(C.WalletRenewalQuery)) q:C.Input<typeof C.WalletRenewalQuery>){const{offset,limit,...where}=q;return present(C.page(C.AdminWalletRenewal),await page(this.db.walletRenewal,{offset,limit},where))}
 @Require('renewals.read') @Get(':id') @Contract(C.AdminWalletRenewal)
 async get(@Param('id',new ZodPipe(C.Id)) id:string){return present(C.AdminWalletRenewal,await this.db.walletRenewal.findUniqueOrThrow({where:{id}}))}
 @Require('provisioning.write') @Post(':id/process') @Contract(C.AdminWalletRenewal)
 async process(@CurrentActor() a:Actor,@Param('id',new ZodPipe(C.Id)) id:string){return present(C.AdminWalletRenewal,await this.wallets.process(a,id))}
 @Require('provisioning.write') @Post(':id/resolve') @Contract(C.AdminWalletRenewal,C.RenewalResolutionRequest)
 async resolve(@CurrentActor() a:Actor,@Param('id',new ZodPipe(C.Id)) id:string,@Body(new ZodPipe(C.RenewalResolutionRequest)) b:C.Input<typeof C.RenewalResolutionRequest>){return present(C.AdminWalletRenewal,await this.wallets.resolve(a,id,b))}
}
@ApiTags('Subscription renewal policy') @ApiBearerAuth() @Controller('admin/subscriptions')
export class RenewalPolicyController{
 constructor(private readonly wallets:WalletService){}
 @Require('provisioning.write') @Patch(':id/renewal-policy') @Contract(C.Subscription,C.RenewalPolicyRequest)
 async policy(@CurrentActor() a:Actor,@Param('id',new ZodPipe(C.Id)) id:string,@Body(new ZodPipe(C.RenewalPolicyRequest)) b:C.Input<typeof C.RenewalPolicyRequest>){return present(C.Subscription,await this.wallets.policy(a,id,b))}
}
@Module({controllers:[CustomerWalletController,CustomerWalletRenewalController,AdminWalletController,AdminTopUpController,WalletCorrectionController,AdminRenewalController,RenewalPolicyController],providers:[WalletService,RenewalProvider,SettlementService,{provide:SettlementAdapter,useClass:DisabledSettlementAdapter}],exports:[SettlementService]})
export class WalletModule{}
