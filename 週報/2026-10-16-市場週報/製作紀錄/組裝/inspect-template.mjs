import fs from 'node:fs/promises';
import {FileBlob, PresentationFile} from '@oai/artifact-tool';
const dir='/Users/xieminghua/Documents/保羅內容/週報/2026-10-16-市場週報/製作紀錄/組裝';
const p=await PresentationFile.importPptx(await FileBlob.load('/Users/xieminghua/.codex/skills/market-video-story/assets/template.pptx'));
console.log((await p.inspect({kind:'slide,textbox,shape,image,layout',maxChars:11000})).ndjson);
for(let i=0;i<p.slides.items.length;i++) {
 const png=await p.export({slide:p.slides.items[i],format:'png',scale:0.65});
 await fs.writeFile(`${dir}/template-${i+1}.png`,new Uint8Array(await png.arrayBuffer()));
}
