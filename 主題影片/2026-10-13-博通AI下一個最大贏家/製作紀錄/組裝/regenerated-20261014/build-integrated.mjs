import fs from 'node:fs/promises';
import path from 'node:path';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const ROOT='/Users/xieminghua/Documents/保羅內容/主題影片/2026-10-13-博通AI下一個最大贏家';
const BUILD=path.join(ROOT,'.build/regenerated-20261014');
const notes=JSON.parse(await fs.readFile(path.join(BUILD,'notes.json'),'utf8'));
const p=Presentation.create({slideSize:{width:1920,height:1080}});
const frame={left:3804729/9525,top:1208274/9525,width:14101225/9525,height:7870451/9525};
const owl={left:1091566/9525,top:6463917/9525,width:2994728/9525,height:2794383/9525};
async function img(s,file,pos){const b=await fs.readFile(file);s.images.add({blob:b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),contentType:'image/png',fit:'contain',position:pos});}
for(let i=0;i<20;i++){
 const s=p.slides.add();s.background.fill='#FFFFFF';
 await img(s,path.join(ROOT,'素材/整張生成-20261014',`slide-${String(i+1).padStart(2,'0')}.png`),frame);
 if(i===0){
 const sh=s.shapes.add({geometry:'textbox',name:'main-title',position:{left:frame.left,top:28,width:frame.width,height:110},fill:'none',line:{style:'solid',fill:'none',width:0}});
 sh.text='AI 下一個最大贏家？為什麼我看好博通！';
 sh.text.style={typeface:'Noto Sans TC',fontSize:60,bold:true,color:'#0C1B2F',autoFit:'none',wrap:'square',insets:0,verticalAlignment:'middle'};
 }
 await img(s,path.join(ROOT,'素材/品牌貓頭鷹.png'),owl);
 s.speakerNotes.text=notes[i];
}
await(await PresentationFile.exportPptx(p)).save(path.join(BUILD,'integrated-before-template.pptx'));
console.log('20 fully generated content images embedded with accepted notes');

