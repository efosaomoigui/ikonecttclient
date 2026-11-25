import {AiSettingsService,OpenAiProvider} from './ai-settings.service';
import {AssistantOrchestration} from './orchestration.service';
import { Body, Controller, Get, Module, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { z } from 'zod';
import * as C from '../../../contracts';
import { Contract, paginated, present, ZodPipe } from '../core/http';
import { Database } from '../core/database';
import { Actor, CurrentActor, Public, Require } from '../identity/access';
import { Adapters } from '../integrations/adapters';
import { KnowledgeService } from './knowledge.service';

export interface AssistantProvider { guide(message: string): Promise<C.Input<typeof C.AssistantResponse>>; }
@ApiTags('Assistant and capabilities') @Controller()
export class AssistantController {
  constructor(private readonly adapters: Adapters, private readonly knowledge: KnowledgeService, private readonly db: Database, private readonly orchestration:AssistantOrchestration, private readonly settings:AiSettingsService) {}
  @Public() @Get('capabilities') @Contract(z.record(z.string()))
  async capabilities() {
    const settings = await this.settings.view();
    return {...this.adapters.capabilities(), ai: settings.enabled && settings.credentialConfigured ? 'configured-model-see-settings' : 'guidance-only-no-model'};
  }
  @Public() @Post('assistant/guidance') @Throttle({ default: { limit: 10, ttl: 60_000 } }) @Contract(C.AssistantResponse, C.AssistantRequest)
  guidance(@Body(new ZodPipe(C.AssistantRequest)) input: C.Input<typeof C.AssistantRequest>) { return this.orchestration.guidance(input); }
  @Public() @Get('knowledge') @Contract(C.page(C.KnowledgeArticle), undefined, C.ListQuery)
  async articles(@Query(new ZodPipe(C.ListQuery)) query: C.Input<typeof C.ListQuery>) {
    return present(C.page(C.KnowledgeArticle), await paginated(this.db.knowledgeArticle, query, { published: true }));
  }
}
@ApiTags('Admin knowledge') @ApiBearerAuth() @Controller('admin/knowledge')
export class AdminKnowledgeController {
  constructor(private readonly db: Database, private readonly knowledge: KnowledgeService) {}
  @Require('catalogue.write') @Get() @Contract(C.page(C.KnowledgeArticle), undefined, C.ListQuery)
  async list(@Query(new ZodPipe(C.ListQuery)) query: C.Input<typeof C.ListQuery>) {
    return present(C.page(C.KnowledgeArticle), await paginated(this.db.knowledgeArticle, query));
  }
  @Require('catalogue.write') @Post() @Contract(C.KnowledgeArticle, C.KnowledgeInput)
  async create(@CurrentActor() actor: Actor, @Body(new ZodPipe(C.KnowledgeInput)) input: C.Input<typeof C.KnowledgeInput>) { return present(C.KnowledgeArticle, await this.knowledge.create(actor, input)); }
  @Require('catalogue.write') @Patch(':id') @Contract(C.KnowledgeArticle, C.KnowledgeUpdate)
  async update(@CurrentActor() actor: Actor, @Param('id', new ZodPipe(C.Id)) id: string, @Body(new ZodPipe(C.KnowledgeUpdate)) input: C.Input<typeof C.KnowledgeUpdate>) { return present(C.KnowledgeArticle, await this.knowledge.update(actor, id, input)); }
}
@Controller()
export class AssistantSettingsController{
 constructor(private settings:AiSettingsService){}
 @Public() @Get('contact-settings') @Contract(C.ContactSettings)
 contacts(){return this.settings.contacts()}
 @Require('staff.manage') @Get('admin/contact-settings') @Contract(C.ContactSettings)
 adminContacts(){return this.settings.contacts()}
 @Require('staff.manage') @Patch('admin/contact-settings') @Contract(C.ContactSettings,C.ContactSettingsInput)
 setContacts(@CurrentActor() a:Actor,@Body(new ZodPipe(C.ContactSettingsInput)) b:C.Input<typeof C.ContactSettingsInput>){return this.settings.setContacts(a,b)}
 @Require('staff.manage') @Get('admin/assistant/settings') @Contract(C.AssistantSettingsView)
 view(){return this.settings.view()}
 @Require('staff.manage') @Patch('admin/assistant/settings') @Contract(C.AssistantSettingsView,C.AssistantSettingsInput)
 save(@CurrentActor() a:Actor,@Body(new ZodPipe(C.AssistantSettingsInput)) b:C.Input<typeof C.AssistantSettingsInput>){return this.settings.save(a,b)}
 @Require('staff.manage') @Post('admin/assistant/revoke') @Contract(C.AssistantSettingsView)
 revoke(@CurrentActor() a:Actor){return this.settings.revoke(a)}
 @Require('staff.manage') @Throttle({default:{limit:3,ttl:60000}}) @Post('admin/assistant/test') @Contract(C.AssistantConnectionResult)
 test(@CurrentActor() a:Actor){return this.settings.test(a)}
}
@Module({ controllers: [AssistantController, AdminKnowledgeController,AssistantSettingsController], providers: [KnowledgeService,AiSettingsService,OpenAiProvider,AssistantOrchestration] })
export class AssistantModule {}
