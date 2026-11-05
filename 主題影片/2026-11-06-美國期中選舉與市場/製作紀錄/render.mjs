import fs from 'node:fs/promises';
import path from 'node:path';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=path.resolve(import.meta.dirname,'..');
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(root,'輸出/美國期中選舉與市場-28頁.pptx')));
if(p.slides.items.length!==28)throw Error('Wrong slide count');
for(const i of [0,6,8,10,12,19,26,27]){
const png=await p.export({slide:p.slides.items[i],format:'png',scale:0.65});
await fs.writeFile(path.join(root,'製圖預覽',`slide_${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));
}
console.log('Rendered8 representative pages; imported28pages.');
