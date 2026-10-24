import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root='/Users/xieminghua/Documents/保羅內容/週報/2026-10-16-市場週報';
const skill='/Users/xieminghua/.codex/plugins/cache/openai-primary-runtime/presentations/26.1013.11914/skills/presentations';
const template='/Users/xieminghua/Documents/保羅內容/週報/2026-10-09-市場週報/輸出/市場週報-固定格式重製版-固定開場.pptx';
const {finalizePresentation}=await import(path.join(skill,'container_tools/artifact_tool_utils.mjs'));
try {
 const r=await finalizePresentation({workspaceDir:root,candidatePath:path.join(root,'.build/template-restored.pptx'),finalPath:path.join(root,'輸出/2026-10-16-市場週報-原範本修正版.pptx'),explicitTotalSlideCount:20,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],pythonExecutable:'/Users/xieminghua/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','18288000,10287000'],fontPolicy:{basis:'reference',families:['可画榜书'],referencePath:template,referenceSha256:createHash('sha256').update(await fs.readFile(template)).digest('hex')},verifyArtifactToolImport:true,receiptPath:path.join(root,'.build/template-restored-validation.json')});
 console.log(JSON.stringify(r));
} catch(e) {console.error(e.message);process.exit(1)}
