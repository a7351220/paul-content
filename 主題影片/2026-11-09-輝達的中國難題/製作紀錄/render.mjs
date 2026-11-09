import fs from 'node:fs/promises';
import path from 'node:path';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=path.resolve(import.meta.dirname,'..');
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(root,'輸出/輝達的中國難題-29頁.pptx')));
if(p.slides.items.length!==29)throw Error('Wrong slide count');
for(const i of Array.from({length:29},(_,i)=>i)){
const png=await p.export({slide:p.slides.items[i],format:'png',scale:0.65});
await fs.writeFile(path.join(root,'製圖預覽',`slide_${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));
}
console.log('Rendered all29 pages.');
