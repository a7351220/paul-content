import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const [input,output]=process.argv.slice(2);
await fs.mkdir(output,{recursive:true});
const p=await PresentationFile.importPptx(await FileBlob.load(input));
console.log('slides',p.slides.items.length);
for(let i=0;i<p.slides.items.length;i++){
  const b=await p.slides.items[i].export({format:'png',scale:0.65});
  await fs.writeFile(`${output}/slide_${String(i+1).padStart(2,'0')}.png`,new Uint8Array(await b.arrayBuffer()));
}
console.log('rendered',output);
