import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolve, join } from 'node:path';
const {assertOwnedDevelopment}=require('../scripts/development-safety.cjs');
const directory=resolve('.local/development');
const state={port:55440,user:'ikonectt_development',database:'ikonectt_development',data:join(directory,'postgres')};
const environment={NODE_ENV:'development',DATABASE_URL:'postgresql://ikonectt_development:unused@127.0.0.1:55440/ikonectt_development'};
test('development tools accept only their own local persistent database',()=>{assert.ok(assertOwnedDevelopment(state,environment,directory));});
for(const [label,environmentChange,stateChange] of [
  ['production mode',{NODE_ENV:'production'},{}],
  ['remote host',{DATABASE_URL:environment.DATABASE_URL.replace('127.0.0.1','example.test')},{}],
  ['test database',{DATABASE_URL:environment.DATABASE_URL.replace(/\/ikonectt_development$/,'/ikonectt_test')},{}],
  ['unrelated role',{DATABASE_URL:environment.DATABASE_URL.replace('ikonectt_development:','another_project:')},{}],
  ['unrelated port',{DATABASE_URL:environment.DATABASE_URL.replace(':55440',':5432')},{}],
  ['outside workspace path',{}, {data:resolve('../unrelated')}],
  ['unsafe database name',{}, {database:"ikonectt_development'; DROP DATABASE other; --"}],
] as const) test(`development backup/reset refuses ${label}`,()=>{assert.throws(()=>assertOwnedDevelopment({...state,...stateChange},{...environment,...environmentChange},directory));});
