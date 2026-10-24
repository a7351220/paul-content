import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const ROOT='/Users/xieminghua/Documents/保羅內容/主題影片/2026-10-13-博通AI下一個最大贏家';
const BUILD=path.join(ROOT,'.build/regenerated-20261014');
const SKILL='/Users/xieminghua/.codex/plugins/cache/openai-primary-runtime/presentations/26.1013.11914/skills/presentations';
const {finalizePresentation}=await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')).href);
const notes=JSON.parse(await fs.readFile(path.join(BUILD,'notes.json'),'utf8'));
const p=Presentation.create({slideSize:{width:1920,height:1080}});
for(let i=0;i<20;i++){
 const s=p.slides.add(),b=await fs.readFile(path.join(BUILD,'rendered-final',`slide-${String(i+1).padStart(2,'0')}.png`));
 s.images.add({blob:b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),contentType:'image/png',fit:'contain',position:{left:0,top:0,width:1920,height:1080},alt:`第${i+1}頁完整紙感墨線版面`});
 s.speakerNotes.text=notes[i];
}
const candidate=path.join(BUILD,'canva-candidate.pptx');
await(await PresentationFile.exportPptx(p)).save(candidate);
const finalPath=path.join(ROOT,'輸出/博通AI下一個最大贏家-全套重製20261014-Canva匯入版.pptx');
const result=await finalizePresentation({workspaceDir:ROOT,candidatePath:candidate,finalPath,
 pythonExecutable:'/Users/xieminghua/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',
 integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','18288000,10287000'],
 explicitTotalSlideCount:20,requiredNativeChartOwnerSlides:[],requiredNativeTableOwnerSlides:[],
 verifyArtifactToolImport:true,receiptPath:path.join(BUILD,'canva-import.validation.json')});
console.log(JSON.stringify({finalPath,result}));

