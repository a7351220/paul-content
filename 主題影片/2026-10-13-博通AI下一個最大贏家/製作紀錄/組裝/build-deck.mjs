import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const ROOT='/Users/xieminghua/Documents/保羅內容/主題影片/2026-10-13-博通AI下一個最大贏家';
const SKILL='/Users/xieminghua/.codex/plugins/cache/openai-primary-runtime/presentations/26.1011.11113/skills/presentations';
const PYTHON='/Users/xieminghua/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
const {finalizePresentation,applyPresentationChartFont}=await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')).href);
const specs=JSON.parse(await fs.readFile(path.join(ROOT,'.build/slide-specs.json'),'utf8'));
const script=await fs.readFile(path.join(ROOT,'逐字稿.txt'),'utf8');
const notes=script.split(/^## Slide \d+\s*$/m).slice(1).map(x=>x.trim());
if(notes.length!==20)throw new Error('Expected 20 narration pages');
const presentation=Presentation.create({slideSize:{width:1920,height:1080}});
const C={navy:'#0C1B2F',orange:'#B75A38',cream:'#F4F3EB',gray:'#929BA4',light:'#CFD0CC'};
const F='Noto Sans TC';
const frame={left:3804729/9525,top:1208274/9525,width:14101225/9525,height:7870451/9525};
const owl={left:1091566/9525,top:6463917/9525,width:2994728/9525,height:2794383/9525};
const pngDir=path.join(ROOT,'.build/previews');
await fs.mkdir(pngDir,{recursive:true});
await fs.mkdir(path.join(ROOT,'輸出'),{recursive:true});
async function addImage(slide,file,position,alt){
 const bytes=await fs.readFile(file);
 return slide.images.add({blob:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),contentType:'image/png',alt,fit:'contain',position});
}
function text(slide,value,x,y,w,h,size=40,color=C.navy,bold=true,align='left',name=''){
 const sp=slide.shapes.add({geometry:'textbox',name:name||value.slice(0,30),position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 sp.text=value;
 sp.text.style={typeface:F,fontSize:size,bold,color,alignment:align,verticalAlignment:'middle',autoFit:'none',wrap:'square',insets:0};
 return sp;
}
function tx(slide,value,x,y,w,h,size=40,color=C.navy,bold=true,align='left'){return text(slide,value,frame.left+x,frame.top+y,w,h,size,color,bold,align);}
function paper(slide){slide.shapes.add({geometry:'rect',name:'content-background',position:frame,fill:C.cream,line:{fill:'none',width:0}});}
function chart(slide,categories,values,max,unit='億美元',colors=[C.navy,C.orange],format='0'){
 const ch=slide.charts.add('bar',{
  position:{left:frame.left+90,top:frame.top+160,width:frame.width-180,height:510},
  categories,series:[{name:unit,values,fill:C.navy,points:colors.map((fill,idx)=>({idx,fill}))}],
  hasLegend:false,barOptions:{direction:'column',grouping:'clustered',gapWidth:180},
  chartFill:C.cream,plotAreaFill:C.cream,chartLine:{fill:'none',width:0},plotAreaLine:{fill:'none',width:0},
  xAxis:{textStyle:{fontSize:36,fill:C.navy,bold:true},line:{fill:C.light,width:1},majorGridlines:null},
  yAxis:{min:0,max,visible:false,majorGridlines:null,line:{fill:'none',width:0}},
  dataLabels:{showValue:true,numberFormatCode:format,position:'outEnd',textStyle:{fontSize:66,fill:C.navy,bold:true}}
 });applyPresentationChartFont(ch,{fontFamily:F});return ch;
}
for(const spec of specs){
 const slide=presentation.slides.add();slide.background.fill='#FFFFFF';
 await addImage(slide,path.join(ROOT,'素材/品牌貓頭鷹.png'),owl,'保羅原始品牌貓頭鷹');
 if(spec.page===1)text(slide,'AI 下一個最大贏家？為什麼我看好博通！',frame.left,28,frame.width,110,60,C.navy,true,'left','main-title');
 if(['image','figureImage'].includes(spec.type))await addImage(slide,path.join(ROOT,`素材/slide-${String(spec.page).padStart(2,'0')}.png`),frame,spec.job);
 else paper(slide);
 if(spec.page===8){
  tx(slide,'AI 晶片相關營收',70,70,720,75,48);
  tx(slide,'167',70,175,680,245,210,C.orange);
  tx(slide,'億美元',80,410,600,80,58);
  tx(slide,'年增 221%',80,520,680,95,72);
  tx(slide,'2026 年度第三季｜截至 8 月 2 日',80,725,1050,45,28,C.navy,false);
 }
 if(spec.page===9){
  tx(slide,'自由現金流',70,80,720,75,52);
  tx(slide,'137',70,210,680,245,210,C.orange);
  tx(slide,'億美元',80,440,600,80,58);
  tx(slide,'營運現金－設備等投資支出',80,580,760,60,35,C.navy,false);
  tx(slide,'2026 年度第三季｜全公司',80,725,900,45,28,C.navy,false);
 }
 if(spec.page===10){
  tx(slide,'AI 晶片相關營收',80,55,1000,70,52);
  tx(slide,'億美元',1160,60,240,55,32,C.navy,false,'right');
  chart(slide,['第三季（已公布）','第四季（公司預估）'],[167,217],260);
  tx(slide,'2026 年度｜第四季為公司指引',90,735,1250,48,30,C.navy,false);
 }
 if(spec.page===11){
  tx(slide,'AI 年度營收展望',80,55,1000,70,52);
  tx(slide,'億美元',1160,60,240,55,32,C.navy,false,'right');
  chart(slide,['2027 年度','2028 年度'],[1150,2300],2800,'億美元',[C.orange,C.navy],'#,##0');
  tx(slide,'兩年皆為公司預估｜依博通年度結算期間',90,735,1270,48,30,C.navy,false);
 }
 if(spec.page===15){
  tx(slide,'股價',95,180,320,85,48,C.navy,true,'center');
  tx(slide,'每股獲利',550,180,360,85,48,C.navy,true,'center');
  tx(slide,'本益比',1050,180,340,85,48,C.navy,true,'center');
  tx(slide,'200',95,300,320,210,150,C.navy,true,'center');
  tx(slide,'÷',415,310,120,190,105,C.gray,true,'center');
  tx(slide,'10',550,300,360,210,150,C.navy,true,'center');
  tx(slide,'=',920,310,120,190,105,C.gray,true,'center');
  tx(slide,'20 倍',1045,300,360,210,135,C.orange,true,'center');
  tx(slide,'假設例子：股價 200 元，一年每股賺 10 元',120,650,1240,60,36,C.navy,false,'center');
 }
 if(spec.page===16){
  tx(slide,'預估本益比',70,80,720,75,52);
  tx(slide,'約 18 倍',70,240,760,230,155,C.orange);
  tx(slide,'以未來獲利估計計算',80,520,760,65,42);
  tx(slide,'10/12 收盤價｜博通 2027 年度',80,690,1080,42,28,C.navy,false);
  tx(slide,'獲利估計排除部分費用等項目',80,740,1080,42,28,C.navy,false);
 }
 if(spec.page===17){
  tx(slide,'預估本益比',80,55,1000,70,52);
  chart(slide,['博通','輝達'],[18.2945,14.225],23,'倍',[C.orange,C.navy],'0');
  tx(slide,'10/12 股價｜博通 2027 年度、輝達 2028 年度預估獲利',80,705,1320,43,27,C.navy,false);
  tx(slide,'年度起訖與排除項目不同，僅作初步比較',80,755,1320,43,28,C.navy,false);
 }
 if(spec.page===18){
  tx(slide,'前五大終端客戶',80,55,1200,80,52);
  const ch=slide.charts.add('doughnut',{
   position:{left:frame.left+70,top:frame.top+180,width:720,height:500},
   categories:['前五大終端客戶','其他客戶'],series:[{name:'營收占比',values:[55,45],points:[{idx:0,fill:C.orange},{idx:1,fill:C.light}]}],
   hasLegend:false,doughnutOptions:{holeSize:76,firstSliceAngle:270},
   chartFill:C.cream,plotAreaFill:C.cream,chartLine:{fill:'none',width:0},
   dataLabels:{showValue:false,showPercent:false}
  });applyPresentationChartFont(ch,{fontFamily:F});
  tx(slide,'55%',180,345,500,150,120,C.orange,true,'center');
  tx(slide,'全公司當季營收',840,270,560,85,44);
  tx(slide,'來自前五大客戶',840,365,560,85,44);
  tx(slide,'客戶延後建置 → 業績受影響',840,495,570,110,33,C.navy,false);
  tx(slide,'2026 年度第三季｜終端客戶為最後使用產品的公司',80,735,1350,48,28,C.navy,false);
 }
 if(spec.page===19){
  tx(slide,'設備租賃保證',70,65,740,75,48);
  tx(slide,'290',70,190,700,210,180,C.orange);
  tx(slide,'億美元',80,390,650,75,54);
  tx(slide,'最大潛在責任',80,490,750,70,45);
  tx(slide,'設備全數投入使用後的上限',80,620,780,44,28,C.navy,false);
  tx(slide,'實際依違約條件與設備售價',80,672,780,44,28,C.navy,false);
  tx(slide,'財報揭露時尚未支付款項',80,724,780,44,28,C.navy,false);
 }
 slide.speakerNotes.text=notes[spec.page-1];
 const blob=await presentation.export({slide,format:'png',scale:1});
 await fs.writeFile(path.join(pngDir,`slide-${String(spec.page).padStart(2,'0')}.png`),new Uint8Array(await blob.arrayBuffer()));
 console.log(`Rendered ${spec.page}/20`);
}
if(process.env.RENDER_ONLY==='1')process.exit(0);
const candidate=path.join(ROOT,'.build/candidate.pptx');
await(await PresentationFile.exportPptx(presentation)).save(candidate);
await fs.writeFile(path.join(ROOT,'.build/inspect.ndjson'),(await presentation.inspect({kind:'slide,textbox,chart,notes',maxChars:100000})).ndjson);
const finalPath=path.join(ROOT,'輸出/博通AI下一個最大贏家-20頁完整簡報.pptx');
const result=await finalizePresentation({
 workspaceDir:ROOT,candidatePath:candidate,finalPath,pythonExecutable:PYTHON,
 integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','18288000,10287000','--validate-heading-fit'],
 explicitTotalSlideCount:20,requiredNativeChartOwnerSlides:[10,11,17,18],requiredNativeTableOwnerSlides:[],materializeLiteralChartWorkbooks:true,
 fontPolicy:{basis:'design',families:[F]},verifyArtifactToolImport:true,
 receiptPath:path.join(ROOT,'.build/final.validation.json')
});
console.log(JSON.stringify({finalPath,result}));
