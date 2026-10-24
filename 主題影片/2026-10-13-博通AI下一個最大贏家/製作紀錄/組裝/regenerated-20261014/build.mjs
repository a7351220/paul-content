import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const ROOT='/Users/xieminghua/Documents/保羅內容/主題影片/2026-10-13-博通AI下一個最大贏家';
const BUILD=path.join(ROOT,'.build/regenerated-20261014');
const SKILL='/Users/xieminghua/.codex/plugins/cache/openai-primary-runtime/presentations/26.1013.11914/skills/presentations';
const {finalizePresentation,applyPresentationChartFont}=await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')).href);
const script=await fs.readFile(path.join(ROOT,'逐字稿-深度修訂稿.txt'),'utf8');
const notes=script.split(/^## Slide \d+\s*$/m).slice(1).map(x=>x.trim());
if(notes.length!==20)throw Error('Expected twenty notes');
await fs.writeFile(path.join(BUILD,'notes.json'),JSON.stringify(notes,null,2));
const p=Presentation.create({slideSize:{width:1920,height:1080}});
const frame={left:3804729/9525,top:1208274/9525,width:14101225/9525,height:7870451/9525};
const owl={left:1091566/9525,top:6463917/9525,width:2994728/9525,height:2794383/9525};
const C={navy:'#0C1B2F',orange:'#B75A38',cream:'#F4F3EB',gray:'#76818C'};
const F='Noto Sans TC';
const nativePages=[2,10,11,15,16,17,18];
const data=[];
const previewDir=path.join(BUILD,'previews');await fs.mkdir(previewDir,{recursive:true});
async function img(s,file,pos,alt){const b=await fs.readFile(file);s.images.add({blob:b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),contentType:'image/png',fit:'contain',position:pos,alt});}
function text(s,t,x,y,w,h,size=40,color=C.navy,bold=true){
 const sh=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{style:'solid',fill:'none',width:0},name:t.slice(0,30)});
 sh.text=t;sh.text.style={typeface:F,fontSize:size,bold,color,alignment:'left',verticalAlignment:'middle',autoFit:'none',wrap:'square',insets:0};return sh;
}
function tx(s,t,x,y,w,h,size=40,color=C.navy,bold=true){return text(s,t,frame.left+x,frame.top+y,w,h,size,color,bold);}
function fill(color){return {type:'solid',color:'#F4F3EB',pattern:{type:'upwardDiagonal',color}};}
function bars(s,page,categories,values,max,unit,format='0',labels=null){
 data.push({page,categories,values,max,unit});
 const chart=s.charts.add('bar',{
 position:{left:frame.left+55,top:frame.top+205,width:1000,height:465},
 categories,series:[{name:unit,values,fill:fill(C.navy),line:{style:'solid',fill:C.navy,width:3},points:values.map((_,idx)=>({idx,fill:fill(idx?C.orange:C.navy),line:{style:'solid',fill:idx?C.orange:C.navy,width:3}})),
 ...(labels?{dataLabelOverrides:labels.map((t,idx)=>({idx,text:t,showValue:false,textStyle:{fontSize:66,fill:C.navy,bold:true}}))}:{})}],
 hasLegend:false,barOptions:{direction:[15,17].includes(page)?'bar':'column',grouping:'clustered',gapWidth:160},
 chartFill:'none',plotAreaFill:'none',chartLine:{style:'solid',fill:'none',width:0},plotAreaLine:{style:'solid',fill:'none',width:0},
 xAxis:{textStyle:{fontSize:31,fill:C.navy,bold:true},line:{style:'solid',fill:C.navy,width:2},majorGridlines:null},
 yAxis:{min:0,max,visible:false,majorGridlines:null,line:{style:'solid',fill:'none',width:0}},
 dataLabels:{showValue:![15,17].includes(page),numberFormatCode:format,position:'outEnd',textStyle:{fontSize:66,fill:C.navy,bold:true}}
 });applyPresentationChartFont(chart,{fontFamily:F});return chart;
}
for(let n=1;n<=20;n++){
 const s=p.slides.add();s.background.fill='#FFFFFF';
 if(n===1)text(s,'AI 下一個最大贏家？為什麼我看好博通！',frame.left,28,frame.width,110,60);
 await img(s,path.join(ROOT,'素材/全套重製-20261014',`slide-${String(n).padStart(2,'0')}.png`),frame,`第${n}頁全新紙感墨線主圖`);
 if(n===2){
  tx(s,'半導體 ＋ 企業軟體',70,65,950,90,58);
  const ch=s.charts.add('bar',{
   position:{left:frame.left+65,top:frame.top+355,width:900,height:180},
   categories:['全公司收入'],
   series:[
    {name:'半導體',values:[20.839],fill:fill(C.orange),line:{style:'solid',fill:C.orange,width:3}},
    {name:'企業軟體',values:[8.752],fill:fill(C.navy),line:{style:'solid',fill:C.navy,width:3}}
   ],hasLegend:false,barOptions:{direction:'bar',grouping:'stacked',gapWidth:40,overlap:100},
   chartFill:'none',chartLine:{style:'solid',fill:'none',width:0},plotAreaFill:'none',
   xAxis:{visible:false,majorGridlines:null},yAxis:{min:0,max:29.591,visible:false,majorGridlines:null},
   dataLabels:{showValue:false}
  });applyPresentationChartFont(ch,{fontFamily:F});
  tx(s,'半導體 約 70%',70,245,900,90,64,C.orange);
  tx(s,'企業軟體 約 30%',70,565,900,90,56);
  tx(s,'2026 財年第三季營收占比',70,730,950,48,28,C.navy,false);
  data.push({page:2,values:[20.839,8.752],categories:['半導體','企業軟體']});
 }
 if(n===8){
  tx(s,'AI 相關營收',70,55,920,80,55);
  tx(s,'167',65,150,700,230,200,C.orange);
  tx(s,'億美元',80,375,550,80,56);
  tx(s,'年增 221%',80,500,850,95,70);
  tx(s,'占全公司收入約 56%',80,605,900,80,46);
  tx(s,'2026 財年第三季，截至 8 月 2 日',80,735,1000,40,27,C.navy,false);
 }
 if(n===9){
  tx(s,'全公司的自由現金流',70,55,980,80,52);
  tx(s,'137',65,170,700,235,200,C.orange);
  tx(s,'億美元',80,400,550,80,56);
  tx(s,'相當於營收 46%',80,560,930,95,65);
  tx(s,'2026 財年第三季',80,735,900,40,27,C.navy,false);
 }
 if(n===10){
  tx(s,'下一季 AI 營收，再多 50 億',70,55,1150,80,52);
  bars(s,n,['第三季實際','第四季公司預估'],[167,217],270,'億美元');
  tx(s,'2026 財年，單位：億美元',70,735,1000,45,29,C.navy,false);
 }
 if(n===11){
  tx(s,'AI 年營收，預估再翻倍',70,55,1150,80,52);
  bars(s,n,['2027 財年','2028 財年'],[1150,2300],2850,'億美元','#,##0');
  tx(s,'兩年皆為公司預估，單位：億美元',70,735,1080,45,29,C.navy,false);
 }
 if(n===15){
  tx(s,'市場期待，每股獲利成長六成多',70,55,1180,80,48);
  bars(s,n,['2026 財年預估','2027 財年預估'],[11.66,19.39],24,'美元','0.00');
  tx(s,'19.39',650,270,240,105,56).fill=C.cream;tx(s,'11.66',430,490,240,105,56).fill=C.cream;
  tx(s,'分析師預估，每股獲利，單位：美元',70,735,1120,45,28,C.navy,false);
 }
 if(n===16){
  tx(s,'估值風險：獲利低於預期',70,55,1160,80,52);
  bars(s,n,['依原獲利預估','獲利少兩成（假設）'],[18.3934244456,22.991780557],29,'倍','0" 倍"');
  tx(s,'同樣股價，約 18 倍變 23 倍',70,665,1150,65,40,C.orange);
  tx(s,'9/16–10/13 二十日均價，2027 財年獲利估計',70,755,1180,36,26,C.navy,false);
 }
 if(n===17){
  tx(s,'博通的估值，沒有比輝達便宜',70,55,1190,80,49);
  bars(s,n,['博通','輝達'],[18.3934244456,14.3506913891],23,'倍','0" 倍"');
  tx(s,'14 倍',455,270,220,105,56).fill=C.cream;tx(s,'18 倍',600,490,220,105,56).fill=C.cream;
  tx(s,'博通 2027 財年、輝達 2028 財年預估，二十日均價',70,735,1150,45,27,C.navy,false);
 }
 if(n===18){
  tx(s,'風險：收入集中在少數大客戶',70,55,1170,80,49);
  bars(s,n,['去年同期','本季'],[40,55],70,'百分比','0"%"');
  tx(s,'前五大客戶占全公司營收比例',70,685,1140,55,37);
  tx(s,'2026 財年第三季，與去年同期比較',70,752,1140,40,27,C.navy,false);
 }
 if(n===19){
  tx(s,'風險：替客戶租金當保人',70,55,1010,80,49);
  tx(s,'290',65,175,700,230,195,C.orange);
  tx(s,'億美元',80,405,600,80,56);
  tx(s,'擔保責任上限',80,510,960,75,51);
  tx(s,'五年設備租賃，客戶違約時得補錢',80,625,960,60,32);
  tx(s,'設備全部投入使用後的上限',80,740,980,40,28,C.navy,false);
 }
 await img(s,path.join(ROOT,'素材/品牌貓頭鷹.png'),owl,'原始品牌貓頭鷹');
 s.speakerNotes.text=notes[n-1];
 console.log(`Built ${n}/20`);
}
for(let i=0;i<20;i++){
 const png=await p.export({slide:p.slides.items[i],format:'png',scale:1});
 await fs.writeFile(path.join(previewDir,`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));
 console.log(`Rendered ${i+1}/20`);
}
await fs.writeFile(path.join(BUILD,'chart-data.json'),JSON.stringify(data,null,2));
const candidate=path.join(BUILD,'candidate.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
const finalPath=path.join(ROOT,'輸出/博通AI下一個最大贏家-20頁紙感墨線定稿-20261014.pptx');
const result=await finalizePresentation({
 workspaceDir:ROOT,candidatePath:candidate,finalPath,
 pythonExecutable:'/Users/xieminghua/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',
 integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','18288000,10287000','--validate-heading-fit'],
 explicitTotalSlideCount:20,requiredNativeChartOwnerSlides:nativePages,requiredNativeTableOwnerSlides:[],
 materializeLiteralChartWorkbooks:true,fontPolicy:{basis:'design',families:[F]},verifyArtifactToolImport:true,
 receiptPath:path.join(BUILD,'native-approved.validation.json')
});console.log(JSON.stringify({finalPath,result}));

