import path from 'node:path';
import {pathToFileURL} from 'node:url';
const ROOT='/Users/xieminghua/Documents/保羅內容/主題影片/2026-10-13-博通AI下一個最大贏家';
const BUILD=path.join(ROOT,'.build/regenerated-20261014');
const SKILL='/Users/xieminghua/.codex/plugins/cache/openai-primary-runtime/presentations/26.1013.11914/skills/presentations';
const {finalizePresentation}=await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')).href);
const result=await finalizePresentation({workspaceDir:ROOT,candidatePath:path.join(BUILD,'integrated-candidate.pptx'),finalPath:path.join(ROOT,'輸出/博通AI下一個最大贏家-整張生成20頁.pptx'),
 pythonExecutable:'/Users/xieminghua/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',
 integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','18288000,10287000','--validate-heading-fit'],
 explicitTotalSlideCount:20,requiredNativeChartOwnerSlides:[],requiredNativeTableOwnerSlides:[],
 fontPolicy:{basis:'design',families:['Noto Sans TC']},verifyArtifactToolImport:true,
 receiptPath:path.join(BUILD,'integrated.validation.json')
});console.log(JSON.stringify({finalPath:result.finalPath,sha256:result.finalSha256}));

