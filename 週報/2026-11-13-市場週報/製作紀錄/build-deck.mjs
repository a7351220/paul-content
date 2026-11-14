import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
process.env.RUNTIME_NODE_MODULES ??= '/Users/xieminghua/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const root=path.resolve(import.meta.dirname,'..');
const workspace=path.resolve(root,'../..');
const template=path.join(workspace,'.agents/skills/market-video-story/assets/template.pptx');
const skill='/Users/xieminghua/.codex/plugins/cache/openai-primary-runtime/presentations/26.1104.22356/skills/presentations';
const slides=JSON.parse(await fs.readFile(path.join(root,'製作紀錄/slides.json'),'utf8'));
if(slides.length!==29||slides.some((s,i)=>s.index!==i+1))throw Error('Page mapping must be 1–29');
const p=await PresentationFile.importPptx(await FileBlob.load(template));
const inspect=async()=> (await p.inspect({kind:'slide,shape,textbox,image',maxChars:200000})).ndjson.split('\n').filter(Boolean).map(JSON.parse);
let objects=await inspect();
p.delete([objects.find(o=>o.kind==='slide'&&o.slideIndex===1).id]);
objects=await inspect();
p.delete(objects.filter(o=>o.name==='AutoShape 4').map(o=>o.id));
const base=p.slides.items[0];
for(let i=1;i<slides.length;i++)base.duplicate().moveTo(i);
objects=await inspect();
for(let i=0;i<slides.length;i++){
 const slide=p.slides.items[i],s=slides[i];
 const owl=p.resolve(objects.find(o=>o.slideIndex===i&&o.name==='Freeform 5').id);
 const ratio=owl.position.height/owl.position.width;
 owl.position={left:1640,top:35,width:220,height:220*ratio};
 const title=p.resolve(objects.find(o=>o.slideIndex===i&&o.name==='TextBox 6').id);
 title.position={left:60,top:45,width:1490,height:90};
 title.text=s.title;
 title.text.style={typeface:'可画榜书',fontSize:56,color:'#0C1B2F',alignment:'left',verticalAlignment:'middle'};
 title.text.insets=0;
 const body=objects.find(o=>o.slideIndex===i&&o.name==='TextBox 7');
 if(i===0){
  const agenda=p.resolve(body.id);
  agenda.position={left:100,top:260,width:1320,height:500};
  agenda.text='黃仁勳辭職，AI訂單與利潤怎麼分？\n比特幣跌破七萬，原本的買盤去哪了？\n美國通膨，升息壓力影響哪些投資？';
  agenda.text.style={typeface:'可画榜书',fontSize:52,color:'#0C1B2F',alignment:'left'};
 }else{
  p.delete([body.id]);
  const bytes=await fs.readFile(path.join(root,s.asset));
  slide.images.add({blob:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),contentType:'image/png',alt:`第${s.index}頁：${s.section_title}`,fit:'contain',position:{left:60,top:180,width:1380,height:777}});
 }
 slide.speakerNotes.text=s.notes;
 slide.speakerNotes.setVisible(true);
}
await fs.mkdir(path.join(root,'製圖預覽'),{recursive:true});
const candidate=path.join(root,'.build/candidate.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
console.log('candidate exported');
for(let i=0;i<slides.length;i++){
 const blob=await p.export({slide:p.slides.items[i],format:'png',scale:0.65});
 await fs.writeFile(path.join(root,'製圖預覽',`slide_${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await blob.arrayBuffer()));
 console.log(`rendered ${i+1}`);
}
await fs.writeFile(path.join(root,'製作紀錄/版面物件.json'),(await p.inspect({kind:'slide,textbox,shape,image,notes',maxChars:300000})).ndjson);
const {finalizePresentation}=await import(path.join(skill,'container_tools/artifact_tool_utils.mjs'));
const result=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:path.join(root,'輸出/2026-11-13市場週報-29頁.pptx'),explicitTotalSlideCount:29,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],pythonExecutable:'/Users/xieminghua/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','18288000,10287000'],fontPolicy:{basis:'reference',families:['可画榜书'],referencePath:template,referenceSha256:createHash('sha256').update(await fs.readFile(template)).digest('hex')},verifyArtifactToolImport:true,receiptPath:path.join(root,'製作紀錄/validation.json')});
console.log(JSON.stringify(result));
