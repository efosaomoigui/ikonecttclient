import { defineConfig } from 'vite';
const demoCsp = "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'none'; form-action 'none'; base-uri 'none'";
export default defineConfig(({command,mode})=>{
    const demo=mode==='demo';
    return {
        base:'/admin/',
        define:{__IKONECTT_PREVIEW__:JSON.stringify(command==='serve'||mode==='review'||demo),__IKONECTT_STANDALONE_DEMO__:JSON.stringify(demo)},
        plugins:demo?[{name:'standalone-demo-policy',transformIndexHtml(){return [
            {tag:'meta',attrs:{name:'robots',content:'noindex, nofollow, noarchive'},injectTo:'head-prepend'},
            {tag:'meta',attrs:{'http-equiv':'Content-Security-Policy',content:demoCsp},injectTo:'head-prepend'},
        ];}}]:[],
        server:{host:'127.0.0.1',port:3013,...(!demo?{proxy:{'/api':{target:process.env.IKONECTT_API_ORIGIN || 'http://127.0.0.1:4000',changeOrigin:true}}}:{})},
        build:{outDir:demo?'dist-demo/admin':'dist',emptyOutDir:true},
    };
});
