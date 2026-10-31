import fs from 'node:fs/promises';
import path from 'node:path';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=path.resolve(import.meta.dirname,'../..');
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(root,'輸出/2026-10-30市場週報-27頁.pptx')));
const selected=new Set(process.argv.slice(2).map(Number));
for(const[i,s]of p.slides.items.entries()){
 if(selected.size&&!selected.has(i+1))continue;
 const png=await p.export({slide:s,format:'png',scale:0.75});await fs.writeFile(path.join(root,'製圖預覽',`slide_${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));
}
console.log('Final PPTX rendered: '+(selected.size||p.slides.items.length)+' affected pages.');
