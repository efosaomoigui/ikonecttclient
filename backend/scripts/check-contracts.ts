import 'reflect-metadata';
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { ModulesContainer } from '@nestjs/core';
import { Permission, ROLE_PERMISSIONS } from '../src/identity/access';
process.env.DATABASE_URL ||= 'postgresql://contract:unused@localhost:5432/contract';
process.env.NOTIFICATION_ENCRYPTION_KEY ||= '0'.repeat(64);
async function main() {
  const { createApp, openApi } = await import('../src/bootstrap');
  const { fixtures, developmentFixtures } = await import('../../contracts/fixtures');
  const app = await createApp(true);
  try {
    const live = openApi(app);
    const saved = JSON.parse(await readFile(resolve('../contracts/openapi.json'), 'utf8'));
    assert.deepEqual(saved, live, 'Published OpenAPI is stale; run npm run contracts');
    const actual = new Set<string>();
    const endpointRows: string[] = [];
    for (const module of app.get(ModulesContainer).values()) for (const controller of module.controllers.values()) {
      const type = controller.metatype;
      if (!type?.prototype) continue;
      const controllerPath = Reflect.getMetadata(PATH_METADATA, type) || '';
      for (const key of Object.getOwnPropertyNames(type.prototype)) {
        const handler: any = type.prototype[key];
        if (typeof handler !== 'function' || !Reflect.hasMetadata(METHOD_METADATA, handler)) continue;
        const route = Reflect.getMetadata(PATH_METADATA, handler) || '';
        const method = RequestMethod[Reflect.getMetadata(METHOD_METADATA, handler)].toLowerCase();
        const path = ['/api/v1',controllerPath,route].join('/').replace(/\/+/g,'/').replace(/\/$/,'').replace(/:([A-Za-z0-9_]+)/g,'{$1}');
        actual.add(`${method.toUpperCase()} ${path}`);
        const operation = (live.paths as any)[path]?.[method];
        assert.ok(operation, 'Undocumented implementation route: ' + method + ' ' + path);
        const anonymous: boolean | undefined = Reflect.getMetadata('public', handler) ?? Reflect.getMetadata('public', type);
        const permission = (Reflect.getMetadata('permission',handler) ?? Reflect.getMetadata('permission',type)) as Permission | undefined;
        const customerOnly = Reflect.getMetadata('customerOnly',handler) ?? Reflect.getMetadata('customerOnly',type);
        const staffOnly = Reflect.getMetadata('staffOnly',handler) ?? Reflect.getMetadata('staffOnly',type);
        const access = anonymous ? 'Public' : permission ? `${permission}; ${Object.entries(ROLE_PERMISSIONS).filter(([,permissions])=>permissions.includes(permission)).map(([role])=>role).join(', ')}` : customerOnly ? 'Customer; owned account only' : staffOnly ? 'Staff session' : 'Authenticated session';
        endpointRows.push(`| ${method.toUpperCase()} | \`${path}\` | ${access} |`);
        assert.deepEqual(operation.security, anonymous ? [] : [{ bearer: [] }], 'Security differs from guard metadata: ' + path);
        assert.ok(operation.responses['200']?.content?.['application/json']?.schema, 'Missing successful response schema: ' + path);
        assert.equal(operation.responses['413'].content['application/json'].schema.$ref, '#/components/schemas/ApiError');
      }
    }
    const documented = new Set(Object.entries(live.paths).flatMap(([path, operations]) => Object.keys(operations).filter(method => ['get','post','patch'].includes(method)).map(method => `${method.toUpperCase()} ${path}`)));
    assert.deepEqual(actual, documented, 'OpenAPI and actual route inventory differ');
    assert.equal(actual.size, 95); assert.equal(Object.keys(live.paths).length, 78);
    for (const path of ['/api/v1/admin/plans','/api/v1/me/payments']) {
      const field = path.endsWith('plans') ? 'priceMinor' : 'amountMinor';
      assert.equal((live.paths as any)[path].post.requestBody.content['application/json'].schema.properties[field].exclusiveMinimum, true);
    }
    assert.ok(fixtures.simulated && developmentFixtures.simulated);
    const mapping='# Canonical API v'+live.info.version+' endpoint and permission map\n\nGenerated from the actual NestJS route and guard metadata. All successful writes return HTTP 200.\nCustomer data ownership is checked inside the application in addition to route permissions.\nADMIN is the highest existing role; there is no separate SUPER_ADMIN bypass.\n\n| Method | Full API path | Access / action permission |\n| --- | --- | --- |\n'+endpointRows.sort().join('\n')+'\n';
    const mappingPath=resolve('../contracts/ENDPOINTS.md');
    if(process.argv.includes('--write-endpoints')) await writeFile(mappingPath,mapping);
    else assert.equal(await readFile(mappingPath,'utf8'),mapping,'Endpoint mapping is stale; run npm run contracts');
    console.log(JSON.stringify({ contract: live.info.version, paths: 78, operations: 95, routeParity: 'PASS', securityParity: 'PASS', errorSchemas: 'PASS', simulatedFixtures: 'PASS' }));
  } finally { await app.close(); }
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'Contract verification failed'); process.exitCode = 1; });
