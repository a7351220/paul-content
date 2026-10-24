import fs from 'node:fs/promises';
import {PresentationFile,FileBlob} from '@oai/artifact-tool';
const p=await PresentationFile.importPptx(await FileBlob.load('../../輸出/博通AI下一個最大贏家-全套重製20261014.pptx'));
for(const i of [1,2,7]){
const s=p.slides.items[i];
const b=await p.export({slide:s,format:'png',scale:1});
await fs.writeFile('reimport-'+(i+1)+'.png',new Uint8Array(await b.arrayBuffer()));
}

