import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const root=path.resolve(import.meta.dirname,'../..');
const items=JSON.parse(await fs.readFile(path.join(root,'製作紀錄/slides.json'),'utf8'));
assert.equal(items.length,26);
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
const direct={2:'TRM-資產去向.png',4:'TRM-鏈上追蹤.jpeg'};
for(const item of items){
 const s=p.slides.add();s.background.fill='#FFFFFF';
 text(s,item.title,{left:60,top:45,width:1380,height:92},56,'可画榜书');
 if(item.index===1){
  text(s,'1. 幣安被駭，AI 攻防戰升級\n2. HYPE 搶進傳統金融市場\n3. AI 財報，市場追問錢在哪',{left:70,top:300,width:1370,height:500},56,'可画榜书');
 }else if(direct[item.index]){
  if(item.index===2){
   text(s,'駭客把失竊資金換幣、拆批分散',{left:60,top:170,width:1380,height:65},46);
   await image(s,'來源原圖/'+direct[item.index],{left:60,top:250,width:1380,height:600});
   text(s,'BTC 每批 100 或 1,000 枚　｜　穩定幣轉成 ETH',{left:60,top:880,width:1380,height:65},36);
  }else{
   text(s,'TRM 將攻擊歸因於北韓 TraderTraitor',{left:60,top:170,width:1380,height:65},43);
   await image(s,'來源原圖/'+direct[item.index],{left:60,top:260,width:1380,height:650});
  }
 }else if(item.index===5){
  await image(s,'來源原圖/CZ-公開貼文裁切.png',{left:60,top:205,width:1380,height:700});
 }else if(item.index===8){
  text(s,'麻吉帳戶：6 小時清算 8 次',{left:60,top:170,width:1380,height:65},46);
  await image(s,'來源原圖/Lookonchain-帳戶紀錄.jpg',{left:60,top:255,width:1380,height:570});
  text(s,'帳戶僅餘約 1.50 美元　｜　HYPE 消息後一度漲逾18%',{left:60,top:855,width:1380,height:70},36);
 }else if(item.index===11){
  await image(s,'來源原圖/Druckenmiller-公開貼文裁切.png',{left:60,top:185,width:1380,height:575});
  text(s,'Druckenmiller 宣布投資 TradeXYZ',{left:60,top:800,width:1380,height:70},44);
 }else if(item.index===16){
  text(s,'本季：營收 165 億美元、調整後 EPS 0.52 美元',{left:60,top:160,width:1380,height:65},38);
  await image(s,'來源原圖/Intel-官方Q4財測.png',{left:60,top:245,width:1380,height:690});
 }else if(item.index===20){
  text(s,'每月投逾 50 萬美元的廣告主，抱怨點擊品質',{left:60,top:170,width:1380,height:65},38);
  await image(s,'來源原圖/MaxAnderson-公開貼文節錄.png',{left:60,top:255,width:1380,height:620});
  text(s,'Max Anderson 原始貼文節錄｜2026/7/23',{left:60,top:895,width:1380,height:45},27);
 }else if(item.index===25){
  text(s,'2008 年底：14 檔大型持股，有 7 檔低於成本',{left:60,top:170,width:1380,height:65},40);
  await image(s,'來源原圖/Berkshire-2008持股表裁切.png',{left:60,top:260,width:1380,height:620});
  text(s,'波克夏 2008 年股東信｜康菲石油年底市值低於成本約37%',{left:60,top:905,width:1380,height:45},27);
 }else await image(s,`視覺素材/slide_${String(item.index).padStart(2,'0')}.png`);
 s.images.add({blob:owlBytes,contentType:'image/png',alt:'保羅貓頭鷹原圖',fit:'cover',crop,position:owl});
 s.speakerNotes.text=item.notes;
}
await(await PresentationFile.exportPptx(p)).save(path.join(import.meta.dirname,'draft.pptx'));
await fs.writeFile(path.join(import.meta.dirname,'layout-contract.json'),JSON.stringify({slideSize:{width:1920,height:1080},content,owl,video,slideCount:26},null,2));
for(const[i,s]of p.slides.items.entries()){
 const png=await p.export({slide:s,format:'png',scale:0.75});await fs.writeFile(path.join(root,'製圖預覽',`slide_${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));
}
console.log('26 slides exported; exact original notes, source images, editable titles and video whitespace.');
