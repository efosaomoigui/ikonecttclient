import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const approved=JSON.parse(readFileSync(new URL('./approved-visuals.json',import.meta.url),'utf8'));
test('approved stylesheet content, logos and typography remain unchanged',()=>{
    for(const [path,hash] of Object.entries(approved.files)){
        const file=new URL(`../../${path}`,import.meta.url);
        const source=readFileSync(file);
        const comparable=path.endsWith('.css')?source.toString('utf8').replace(/\r\n/g,'\n'):source;
        assert.equal(createHash('sha256').update(comparable).digest('hex'),hash,path);
    }
});
