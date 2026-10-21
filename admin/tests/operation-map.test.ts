import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {modules} from '../src/modules';
import {API_VERSION} from '../vendor/contracts';
const spec=JSON.parse(readFileSync(new URL('../vendor/operations.json',import.meta.url),'utf8'));
test('all Admin module operations exist in the pinned canonical OpenAPI release',()=>{
    assert.equal(spec.version,API_VERSION);assert.equal(spec.operations.length,95);
    assert.equal(spec.sourceCommit,'d0a300a2b5a17d63c637e71c71b523b88046a78f');
    for(const [key,m] of Object.entries(modules)){
        assert.ok(spec.operations.includes(`GET /api/v1${m.path}`),`${key}: list`);
        if(m.input)assert.ok(spec.operations.includes(`POST /api/v1${m.path}`),`${key}: create`);
        if(m.update)assert.ok(spec.operations.includes(key==='provisioning'?`POST /api/v1${m.path}/{id}/result`:`PATCH /api/v1${m.path}/{id}`),`${key}: update`);
    }
    for(const operation of ['POST /api/v1/auth/staff/login','POST /api/v1/auth/staff/recovery','GET /api/v1/auth/session','POST /api/v1/auth/change-password','POST /api/v1/auth/reset-password','POST /api/v1/admin/customers/{id}/credentials','POST /api/v1/admin/payments/{id}/verify'])assert.ok(spec.operations.includes(operation),operation);
});
