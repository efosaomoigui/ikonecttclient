import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const script = readFileSync(new URL('../public/theme-init.js', import.meta.url), 'utf8');
const key = 'ikonectt.admin.theme';
function boot(saved?: string, systemDark = false, blocked = false) {
    const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {url:'http://localhost/admin/',runScripts:'outside-only'});
    let matches = systemDark;
    let listener = () => {};
    Object.defineProperty(dom.window, 'matchMedia', {value:()=>({get matches(){return matches;},addEventListener:(_name:string,fn:()=>void)=>listener=fn})});
    if (saved) dom.window.localStorage.setItem(key,saved);
    if (blocked) Object.defineProperty(dom.window,'localStorage',{get(){throw new Error('Storage blocked');}});
    dom.window.eval(script);
    const control = () => (dom.window as unknown as Window).ikonecttTheme;
    return {dom,root:dom.window.document.documentElement,control,system(value:boolean){matches=value;listener();}};
}

test('theme initializes synchronously before the app and defaults to approved light regardless of OS',()=>{
    const state=boot(undefined,true);
    try {
        assert.equal(state.root.dataset.theme,'light');
        assert.equal(state.root.dataset.themePreference,'light');
        assert.equal(state.root.style.backgroundColor,'rgb(245, 246, 248)');
        assert.equal(state.dom.window.document.querySelector('#app'),null);
        assert.equal(state.dom.window.localStorage.length,0);
        const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
        assert.ok(html.indexOf('src="/theme-init.js"') < html.indexOf('type="module"'));
        assert.doesNotMatch(html, /(?:async|defer)\s+src="\/theme-init/);
    } finally {state.dom.window.close();}
});

test('theme choices persist only a validated preference, restore before render, and reject injected values',()=>{
    const state=boot();
    try {
        for(const value of ['dark','system','light'] as const){
            state.control().setPreference(value);
            assert.equal(state.dom.window.localStorage.getItem(key),value);
            assert.equal(state.root.dataset.themePreference,value);
        }
        state.control().setPreference('unexpected-token' as any);
        assert.equal(state.dom.window.localStorage.length,1);
        assert.equal(state.dom.window.localStorage.getItem(key),'light');
        assert.equal(state.root.dataset.theme,'light');
    } finally {state.dom.window.close();}
    for(const [saved,expected] of [['dark','dark'],['light','light'],['invalid','light']] as const){
        const restored=boot(saved,true);
        assert.equal(restored.root.dataset.theme,expected);
        assert.equal(restored.root.style.colorScheme,expected);
        assert.equal(restored.root.style.backgroundColor,expected==='dark'?'rgb(17, 20, 24)':'rgb(245, 246, 248)');
        restored.dom.window.close();
    }
});

test('system theme follows changes only when explicitly selected',()=>{
    const state=boot('system',true);
    try {
        assert.equal(state.root.dataset.theme,'dark');
        state.system(false); assert.equal(state.root.dataset.theme,'light');
        state.control().setPreference('dark');
        state.system(false); assert.equal(state.root.dataset.theme,'dark');
        state.control().setPreference('light');
        state.system(true); assert.equal(state.root.dataset.theme,'light');
    } finally {state.dom.window.close();}
});

test('blocked browser storage does not prevent switching or startup',()=>{
    const state=boot(undefined,false,true);
    try {
        assert.equal(state.root.dataset.theme,'light');
        assert.doesNotThrow(()=>state.control().setPreference('dark'));
        assert.equal(state.root.dataset.theme,'dark');
        state.dom.window.dispatchEvent(new state.dom.window.StorageEvent('storage',{key,newValue:'light'}));
        assert.equal(state.root.dataset.theme,'light');
    } finally {state.dom.window.close();}
});

test('other Admin tabs synchronize theme changes and ignore unrelated storage',()=>{
    const state=boot('dark');
    try {
        state.dom.window.dispatchEvent(new state.dom.window.StorageEvent('storage',{key:'unrelated',newValue:'light'}));
        assert.equal(state.root.dataset.theme,'dark');
        state.dom.window.dispatchEvent(new state.dom.window.StorageEvent('storage',{key,newValue:'light',storageArea:state.dom.window.localStorage}));
        assert.equal(state.root.dataset.theme,'light');
        state.dom.window.dispatchEvent(new state.dom.window.StorageEvent('storage',{key,newValue:'invalid'}));
        assert.equal(state.root.dataset.themePreference,'light');
        state.control().setPreference('dark');
        state.dom.window.dispatchEvent(new state.dom.window.StorageEvent('storage',{key:null,newValue:null}));
        assert.equal(state.root.dataset.theme,'light');
    } finally {state.dom.window.close();}
});

test('dark text, statuses, primary action and focus tokens meet contrast thresholds',()=>{
    const css=readFileSync(new URL('../src/theme.css',import.meta.url),'utf8');
    const dark=css.match(/:root\[data-theme="dark"\]\s*\{([^}]+)\}/)![1];
    const tokens=Object.fromEntries([...dark.matchAll(/(--[\w-]+):\s*(#[\da-f]+);/gi)].map(m=>[m[1],m[2]]));
    function luminance(hex:string){
        const expanded=hex.length===4?'#'+[...hex.slice(1)].map(c=>c+c).join(''):hex;
        const rgb=[1,3,5].map(i=>parseInt(expanded.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
        return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
    }
    function contrast(a:string,b:string){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
    for(const text of ['--text-primary','--text-secondary','--text-supporting'])
        for(const surface of ['--app-background','--surface-primary','--surface-secondary','--surface-elevated','--surface-sidebar'])
            assert.ok(contrast(tokens[text],tokens[surface])>=4.5,`${text} on ${surface}`);
    for(const status of ['success','warning','error'])
        assert.ok(contrast(tokens[`--${status}-text`],tokens[`--${status}-background`])>=4.5,status);
    assert.ok(contrast('#fff','#d7202a')>=4.5,'brand primary action');
    assert.ok(contrast(tokens['--focus-ring'],tokens['--surface-primary'])>=3,'focus indicator');
});
