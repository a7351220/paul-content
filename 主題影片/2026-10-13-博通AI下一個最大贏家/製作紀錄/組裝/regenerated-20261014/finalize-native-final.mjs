import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const ROOT='/Users/xieminghua/Documents/保羅內容/主題影片/2026-10-13-博通AI下一個最大贏家';
const BUILD=path.join(ROOT,'.build/regenerated-20261014');
const SKILL='/Users/xieminghua/.codex/plugins/cache/openai-primary-runtime/presentations/26.1013.11914/skills/presentations';
const {finalizePresentation,applyPresentationChartFont}=await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')).href);
const nativePages=[2,10,11,15,16,17,18];
const F="Noto Sans TC";
const candidate=path.join(BUILD,"candidate.pptx");
const finalPath=path.join(ROOT,'輸出/博通AI下一個最大贏家-全套重製20261014-完成版.pptx');
const result=await finalizePresentation({
 workspaceDir:ROOT,candidatePath:candidate,finalPath,
 pythonExecutable:'/Users/xieminghua/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',
 integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','18288000,10287000','--validate-heading-fit'],
 explicitTotalSlideCount:20,requiredNativeChartOwnerSlides:nativePages,requiredNativeTableOwnerSlides:[],
 materializeLiteralChartWorkbooks:true,fontPolicy:{basis:'design',families:[F]},verifyArtifactToolImport:true,
 receiptPath:path.join(BUILD,'native-final.validation.json')
});console.log(JSON.stringify({finalPath,result}));

