import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const root=path.resolve(import.meta.dirname,'../..');
const items=JSON.parse(await fs.readFile(path.join(root,'製作紀錄/slides.json'),'utf8'));
assert.equal(items.length,27);
const p=Presentation.create({slideSize:{width:1920,height:1080}});
const content={left:60,top:170,width:1380,height:776.25};
const owl={left:1476,top:54,width:384,height:358.3122};
const video={left:1500,top:620,width:420,height:460};
const crop={left:0.49059/(1+0.49059+0.42369),right:0.42369/(1+0.49059+0.42369),top:0.51381/(1+0.51381+0.53771),bottom:0.53771/(1+0.51381+0.53771)};
const owlBytes=await fs.readFile(path.join(import.meta.dirname,'owl-original.png'));
function text(s,value,box,size=38,font='Noto Sans CJK TC'){
 const v=s.shapes.add({geometry:'textbox',position:box,fill:'none',line:{fill:'none',width:0}});v.text=value;v.text.style={fontFamily:font,fontSize:size,bold:true,color:'#0C1B2F'};return v;
}
async function image(s,file,box=content){let bytes=await fs.readFile(path.join(root,file));s.images.add({blob:bytes,contentType:file.endsWith('.jpg')||file.endsWith('.jpeg')?'image/jpeg':'image/png',alt:path.basename(file),fit:'contain',position:box});}
const pageMap=JSON.parse(await fs.readFile(path.join(root,'製作紀錄/page-map.json'),'utf8'));
for(const item of items){
 const s=p.slides.add();s.background.fill='#FFFFFF';
 text(s,item.title,{left:60,top:45,width:1380,height:92},56,'可画榜书');
 if(item.index===1){
  text(s,"1. 幣安遭駭 63 億美元，宇宙交易所也守不住？\n2. 華爾街看上 Hyperliquid，HYPE 在漲什麼？\n3. 財報週天崩地裂：Intel 暴跌，Google 能抄底嗎？",{left:70,top:300,width:1370,height:500},56,'可画榜书');
 }else await image(s,pageMap.find(x=>x.index===item.index).asset);
 s.images.add({blob:owlBytes,contentType:'image/png',alt:'保羅貓頭鷹原圖',fit:'cover',crop,position:owl});
 s.speakerNotes.text=item.notes;
}
await(await PresentationFile.exportPptx(p)).save(path.join(import.meta.dirname,'draft.pptx'));
await fs.writeFile(path.join(import.meta.dirname,'layout-contract.json'),JSON.stringify({slideSize:{width:1920,height:1080},content,owl,video,slideCount:27},null,2));
for(const[i,s]of p.slides.items.entries()){
 const png=await p.export({slide:s,format:'png',scale:0.75});await fs.writeFile(path.join(root,'製圖預覽',`slide_${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));
}
console.log('27 slides exported; current notes, reference-derived generated images, editable titles and video whitespace.');
