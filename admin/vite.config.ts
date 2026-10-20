import { defineConfig } from 'vite';
export default defineConfig(({command,mode})=>({base:'/admin/',define:{__IKONECTT_PREVIEW__:JSON.stringify(command==='serve'||mode==='review')},server:{host:'127.0.0.1',port:3013,proxy:{'/api':{target:process.env.IKONECTT_API_ORIGIN || 'http://127.0.0.1:4000',changeOrigin:true}}},build:{outDir:'dist',emptyOutDir:true}}));
