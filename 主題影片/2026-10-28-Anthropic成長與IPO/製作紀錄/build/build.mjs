import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const root=path.resolve(import.meta.dirname,'../..');
const notes=JSON.parse(await fs.readFile(path.join(root,'製作紀錄/slides.json'),'utf8'));
assert.equal(notes.length,28);
const p=Presentation.create({slideSize:{width:1920,height:1080}});
const content={left:60,top:170,width:1380,height:776.25};
const owl={left:1476,top:54,width:384,height:358.3122};
const video={left:1500,top:620,width:420,height:460};
function intersects(a,b){return a.left<b.left+b.width&&a.left+a.width>b.left&&a.top<b.top+b.height&&a.top+a.height>b.top;}
assert(!intersects(content,video));assert(!intersects(owl,video));
const owlBytes=await fs.readFile(path.join(import.meta.dirname,'owl-original.png'));
const horizontal=1+0.49059+0.42369, vertical=1+0.51381+0.53771;
const crop={left:0.49059/horizontal,right:0.42369/horizontal,top:0.51381/vertical,bottom:0.53771/vertical};
for(const item of notes){
 const slide=p.slides.add();slide.background.fill='#FFFFFF';
 if(item.index===11){
  const chart=await fs.readFile(path.join(root,'來源證據/morningstar-compute.png'));
  const frame={left:60,top:310,width:1380,height:417.05};
  slide.images.add({blob:chart,contentType:'image/png',alt:'Morningstar 原始算力效率圖；保留座標、數值及來源',fit:'contain',position:frame});
  const summary=slide.shapes.add({geometry:'textbox',position:{left:60,top:155,width:1380,height:115},fill:'none',line:{fill:'none',width:0}});
  summary.text='每 1 美元營收的算力費用：2.5 → 0.48 美元';summary.text.style={fontFamily:'Noto Sans CJK TC',fontSize:44,bold:true,color:'#0C1B2F'};
  const date=slide.shapes.add({geometry:'textbox',position:{left:60,top:790,width:1380,height:85},fill:'none',line:{fill:'none',width:0}});
  date.text='2025 Q1 → 2026 Q2　｜　2026 Q2 營業利益 9.74 億美元、利益率約 8%';date.text.style={fontFamily:'Noto Sans CJK TC',fontSize:30,color:'#0C1B2F'};
 }else{
  const image=await fs.readFile(path.join(root,'視覺素材',`slide_${String(item.index).padStart(2,'0')}.png`));
  slide.images.add({blob:image,contentType:'image/png',alt:`Slide ${item.index} 紙感墨線說明圖`,fit:'contain',position:content});
 }
 slide.images.add({blob:owlBytes,contentType:'image/png',alt:'保羅貓頭鷹原圖',fit:'cover',crop,position:owl});
 if(item.index===1){const title=slide.shapes.add({geometry:'textbox',position:{left:60,top:45,width:1380,height:92},fill:'none',line:{fill:'none',width:0}});title.text='Anthropic 成長速度有多驚人';title.text.style={fontFamily:'可画榜书',fontSize:62,bold:true,color:'#0C1B2F'};}
 slide.speakerNotes.text=item.notes;
}
const draft=path.join(import.meta.dirname,'draft.pptx');await(await PresentationFile.exportPptx(p)).save(draft);
await fs.writeFile(path.join(import.meta.dirname,'layout-contract.json'),JSON.stringify({slideSize:{width:1920,height:1080},content,owl,video,slideCount:28},null,2));
for(const [i,slide]of p.slides.items.entries()){
 const blob=await p.export({slide,format:'png',scale:0.75});await fs.writeFile(path.join(root,'製圖預覽',`slide_${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await blob.arrayBuffer()));
}
console.log('Draft exported with 28 exact notes, source chart and reserved video area.');
