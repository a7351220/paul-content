import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const ROOT='/Users/xieminghua/Documents/保羅內容/主題影片/2026-10-13-博通AI下一個最大贏家';
const SKILL='/Users/xieminghua/.codex/plugins/cache/openai-primary-runtime/presentations/26.1011.11113/skills/presentations';
const {finalizePresentation}=await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')).href);
const script=await fs.readFile(path.join(ROOT,'逐字稿.txt'),'utf8');
const notes=script.split(/^## Slide \d+\s*$/m).slice(1).map(x=>x.trim());
const p=Presentation.create({slideSize:{width:1920,height:1080}});
for(let i=0;i<20;i++){
 const slide=p.slides.add();
 const bytes=await fs.readFile(path.join(ROOT,`.build/previews/slide-${String(i+1).padStart(2,'0')}.png`));
 slide.images.add({blob:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),contentType:'image/png',alt:`第 ${i+1} 頁，完整保留已核對版面`,fit:'contain',position:{left:0,top:0,width:1920,height:1080}});
 slide.speakerNotes.text=notes[i];
}
const candidate=path.join(ROOT,'.build/flat-candidate.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
const finalPath=path.join(ROOT,'輸出/博通AI下一個最大贏家-Canva匯入版.pptx');
await finalizePresentation({workspaceDir:ROOT,candidatePath:candidate,finalPath,
 pythonExecutable:'/Users/xieminghua/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',
 integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','18288000,10287000'],
 explicitTotalSlideCount:20,requiredNativeChartOwnerSlides:[],requiredNativeTableOwnerSlides:[],
 verifyArtifactToolImport:true,receiptPath:path.join(ROOT,'.build/canva-import.validation.json')});
console.log(finalPath);
