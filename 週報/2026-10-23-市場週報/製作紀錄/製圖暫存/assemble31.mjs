import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root='/Users/xieminghua/Documents/保羅內容/週報/2026-10-23-市場週報';
const skill='/Users/xieminghua/.codex/plugins/cache/openai-primary-runtime/presentations/26.1017.22136/skills/presentations';
const template='/Users/xieminghua/Documents/保羅內容/週報/2026-10-16-市場週報/輸出/2026-10-16-市場週報-原範本修正版.pptx';
const p=await PresentationFile.importPptx(await FileBlob.load(root+'/.製圖暫存/template-31.pptx'));
const notes=JSON.parse(await fs.readFile(root+'/製作紀錄/notes-31.json','utf8'));
const originals={
 5:{file:'woc42_etf_flows_volume_c.png',text:'ETF近30日平均成交量，不到一年前的四分之一',date:'Glassnode 2026/10/21 報告',url:'https://research.glassnode.com/the-week-onchain-week-42-2026/'},
 6:{file:'techflow-01.png',text:'40個新錢包，從 Wintermute 提走9,458 BTC',date:'2026/10/1起累計，約7.7億美元',url:'https://www.techflowpost.com/article/34831'},
 7:{file:'techflow-03.png',text:'巨鯨持倉303萬 BTC，月增速度創2月以來最快',date:'2026年10月觀察，排除交易所與礦池',url:'https://www.techflowpost.com/article/34831'},
 8:{file:'swy_a1_pnl_90d_b.png',text:'最近一週實現獲利，只剩9月高點那一週的約50％',date:'Glassnode 2026/10/21 報告',url:'https://research.glassnode.com/the-week-onchain-week-42-2026/'},
 9:{file:'woc42_obk_bids_b.png',text:'8萬美元買單重掛，上方8.65–8.75萬美元賣單集中',date:'Glassnode 2026/10/21 報告，幣安現貨掛單',url:'https://research.glassnode.com/the-week-onchain-week-42-2026/'}
};
function txt(s,name,value,x,y,w,h,size,color='#0C1B2F'){
 let q=s.shapes.add({name,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});q.text=value;q.text.style={typeface:'可画榜书',fontSize:size,bold:true,color};return q;
}
await fs.mkdir(root+'/輸出/逐頁預覽',{recursive:true});const map=[];
for(let i=0;i<p.slides.items.length;i++){
 const n=i+1,s=p.slides.items[i];s.speakerNotes.text=notes[i].notes;
 if(n>1){
  const original=originals[n];
  const imagePath=original?root+'/素材/真實數據圖/'+original.file:root+'/素材/主圖/slide-'+String(n).padStart(2,'0')+'.png';
  const b=await fs.readFile(imagePath);
  let pos=original?{left:440,top:250,width:1400,height:760}:{left:400,top:145,width:1480,height:832};
  if(n===6)pos={left:600,top:245,width:1080,height:765};
  s.images.add({name:'Slide '+n+' content',blob:b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),contentType:'image/png',alt:original?'原始來源數據圖，保留座標圖例日期':'紙感墨線內容主圖',fit:'contain',position:pos});
  if(original){txt(s,'資料重點',original.text,440,145,1400,55,n===9?35:38,'#B75A38');txt(s,'觀察期間',original.date,440,203,1400,35,24,'#444444');}
  map.push({slide:n,title:notes[i].title,type:original?'source-original':'generated',asset:imagePath,source:original?.url||null,sha256:crypto.createHash('sha256').update(b).digest('hex')});
 }
 const png=await p.export({slide:s,format:'png',scale:0.65});
 await fs.writeFile(root+'/輸出/逐頁預覽/slide-'+String(n).padStart(2,'0')+'.png',new Uint8Array(await png.arrayBuffer()));
 console.log('rendered',n);
}
await fs.writeFile(root+'/製作紀錄/頁面素材對照.json',JSON.stringify(map,null,2));
const candidate=root+'/.製圖暫存/candidate-31.pptx';await (await PresentationFile.exportPptx(p)).save(candidate);
const {finalizePresentation}=await import(skill+'/container_tools/artifact_tool_utils.mjs');
const result=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:root+'/輸出/2026-10-23-市場週報-31頁.pptx',pythonExecutable:'/Users/xieminghua/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','18288000,10287000','--validate-heading-fit'],explicitTotalSlideCount:31,requiredNativeTableOwnerSlides:[],fontPolicy:{basis:'reference',families:['可画榜书'],referencePath:template,referenceSha256:crypto.createHash('sha256').update(await fs.readFile(template)).digest('hex')},verifyArtifactToolImport:true,receiptPath:root+'/製作紀錄/31頁核對.json'});
console.log(JSON.stringify(result));
