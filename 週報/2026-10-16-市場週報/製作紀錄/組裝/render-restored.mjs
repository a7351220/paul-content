import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root='/Users/xieminghua/Documents/保羅內容/週報/2026-10-16-市場週報';
const p=await PresentationFile.importPptx(await FileBlob.load(`${root}/.build/template-restored.pptx`));
for (const i of [0,1,14]) {
 const blob=await p.export({slide:p.slides.items[i],format:'png',scale:1});
 await fs.writeFile(`${root}/.build/restored-${i+1}.png`,new Uint8Array(await blob.arrayBuffer()));
}
const ref=await PresentationFile.importPptx(await FileBlob.load('/Users/xieminghua/Documents/保羅內容/週報/2026-10-09-市場週報/輸出/市場週報-固定格式重製版-固定開場.pptx'));
for (const i of [0,1]) {
 const blob=await ref.export({slide:ref.slides.items[i],format:'png',scale:0.75});
 await fs.writeFile(`${root}/.build/previous-${i+1}.png`,new Uint8Array(await blob.arrayBuffer()));
}
console.log('原版與修正版已渲染。');
