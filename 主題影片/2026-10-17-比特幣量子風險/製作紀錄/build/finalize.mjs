import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {finalizePresentation} from '/Users/xieminghua/.codex/plugins/cache/openai-primary-runtime/presentations/26.1017.11052/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root=path.resolve(import.meta.dirname,'../..');
const skill='/Users/xieminghua/.codex/plugins/cache/openai-primary-runtime/presentations/26.1017.11052/skills/presentations';
const template='/Users/xieminghua/.codex/skills/market-video-story/assets/template.pptx';
const result=await finalizePresentation({
 workspaceDir:root,
 candidatePath:path.join(import.meta.dirname,'candidate.pptx'),
 finalPath:path.join(root,'輸出/比特幣會被量子計算攻破嗎.pptx'),
 pythonExecutable:'/Users/xieminghua/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',
 integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','18288000,10287000','--validate-heading-fit'],
 explicitTotalSlideCount:20,
 requiredNativeTableOwnerSlides:[],
 fontPolicy:{basis:'reference',families:['可画榜书'],referencePath:template,referenceSha256:crypto.createHash('sha256').update(await fs.readFile(template)).digest('hex')},
 verifyArtifactToolImport:true,
 receiptPath:path.join(root,'製作紀錄/validation.json'),
});
console.log(JSON.stringify(result));
