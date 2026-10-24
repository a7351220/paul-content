process.on('uncaughtException',e=>{console.error('BUILD ERROR:',e.message);process.exit(1)});
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {FileBlob, PresentationFile} from '@oai/artifact-tool';
const root='/Users/xieminghua/Documents/保羅內容/週報/2026-10-16-市場週報';
const SKILL='/Users/xieminghua/.codex/plugins/cache/openai-primary-runtime/presentations/26.1013.11914/skills/presentations';
const slides=JSON.parse(await fs.readFile(path.join(root,'.build/slides.json'),'utf8'));
const p=await PresentationFile.importPptx(await FileBlob.load('/Users/xieminghua/.codex/skills/market-video-story/assets/template.pptx'));
const original=p.slides.items[1];
for(let i=2;i<20;i++) original.duplicate().moveTo(i);
if(p.slides.items.length!==20) throw new Error('Slide count mismatch');
const anchors=(await p.inspect({kind:'shape,textbox',maxChars:200000})).ndjson.split('\n').filter(Boolean).map(line=>JSON.parse(line));
for(let i=0;i<20;i++) {
 const slide=p.slides.items[i];
 const content=slides[i];
 const names=i===0?['TextBox 7','AutoShape 4']:['Freeform 4','Freeform 5'];
 const old=anchors.filter(s=>s.slideIndex===i&&names.includes(s.name));
 p.delete(old.map(s=>s.id));
 if(i>0) {
  const title=slide.shapes.add({geometry:'textbox',name:'分類標題',position:{left:399.45,top:28,width:1480,height:98},fill:'none',line:{fill:'none',width:0}});
  title.text=content.title;
  title.text.style={typeface:'可画榜书',fontSize:54,bold:true,color:'#0C1B2F',verticalAlignment:'middle'};
  title.text.insets=0;
 }
 const bytes=await fs.readFile(path.join(root,content.target));
 slide.images.add({blob:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),contentType:'image/png',alt:`Slide ${i+1} 紙感墨線主圖`,fit:'contain',position:{left:399.45,top:126.85,width:1480.44,height:826.29}});
 slide.speakerNotes.text=content.notes;
 slide.speakerNotes.setVisible(true);
 console.log(`assembled ${i+1}`);
}
const candidate=path.join(root,'.build/candidate.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
await fs.mkdir(path.join(root,'.build/rendered'),{recursive:true});
for(let i=0;i<20;i++) {
 const blob=await p.export({slide:p.slides.items[i],format:'png',scale:1});
 await fs.writeFile(path.join(root,'.build/rendered',`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await blob.arrayBuffer()));
 console.log(`rendered ${i+1}`);
}
const {finalizePresentation}=await import(path.join(SKILL,'container_tools/artifact_tool_utils.mjs'));
const template='/Users/xieminghua/.codex/skills/market-video-story/assets/template.pptx';
const result=await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:path.join(root,'輸出/2026-10-16-市場週報-紙感墨線.pptx'),explicitTotalSlideCount:20,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],pythonExecutable:'/Users/xieminghua/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','18288000,10287000'],fontPolicy:{basis:'reference',families:['可画榜书'],referencePath:template,referenceSha256:createHash('sha256').update(await fs.readFile(template)).digest('hex')},verifyArtifactToolImport:true,receiptPath:path.join(root,'.build/validation.json')});
console.log(JSON.stringify(result));
