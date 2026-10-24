---
name: market-script-writing
description: Turn an approved, source-audited weekly or single-topic outline into a Traditional Chinese spoken investment-video script or slide-design brief. Use after the research mode has stabilized the story, terminology order, voice sample, slide jobs, evidence IDs, and audit conditions for crypto, stocks, semiconductors, or AI content.
---

# Market Script Writing

Write only from an approved research pack and outline. Read [voice-zh-TW.md](references/voice-zh-TW.md) completely before drafting.

## Input Gate

Require:

- `mode: weekly | topic`;
- `house_voice_profile: market-house-voice-zh-tw-v1`;
- approved research pack and audit result;
- approved page outline and slide map owned by the selected research mode;
- audience and target duration;
- audience prior knowledge and learning outcome;
- `voice_status: approved`, unless the user explicitly requests only a calibration sample;
- term and entity registries;
- editor notes, required wording, banned patterns, and conditional audit requirements.

Return to research when a page depends on an unsupported claim. Do not browse for surprise evidence during writing.

Mode changes pacing and story architecture only. Weekly narration can use shorter setup and cleaner topic breaks; topic narration can spend longer on prerequisite concepts. Both must sound like the same person and follow the same shared voice reference, user corrections, approved phrases, and banned patterns.

## Preserve the Outline

Do not redesign the story while drafting. Preserve every approved page title and its `這頁大概要講什麼` contract. Internally, each slide must also retain its `slide_job`, `viewer_question_in`, `answer`, `prior_knowledge_required`, `new_terms`, `key_numbers`, `claim_ids`, `source_ids`, `visual_evidence_needed`, `visual_evidence_status`, and `why_next`.

If the outline has a JSON sidecar, resolve the plugin root from this skill and run `python3 scripts/validate_script_map.py <script-map.json> --research-pack <research-pack.json>` before full drafting. Writing may tighten language, but it may not repair a failed evidence or teaching-order contract by silently changing the story.

Return to the selected research mode when a page is redundant, missing prerequisites, titled abstractly, or unable to bridge to the next page. Do not repair a broken outline by adding narration.

For voice calibration, write only three representative samples: the opening, one evidence-heavy page, and the ending. Stop for approval before full narration.

## Output Separation

Produce two artifacts by default. Combine them only when the user explicitly asks for one production document.

`逐字稿.md` is narration-only:

```markdown
## Slide X｜[短標題]

**逐字稿**：
[自然口語段落]
```

`畫面建議.md` is visual/source-note-only:

```markdown
## Slide X｜[同一個短標題]

**畫面建議**：[一個主視覺、圖表、文件或 1–3 組核心數字]

**製作備註／來源**：[來源 ID、頁碼或連結；不念出口]
```

The outline, narration, and visual document must use the same current display order and title. Do not solve a mismatch with a prose note. If a page is inserted, deleted, reordered, or renamed, return to the selected research mode, increment `slide_map_revision`, then use `$market-project-package` to reconcile every artifact.

## Script

Match the user's approved reference density before applying generic timing. When the reference uses many short pages, keep one reasoning step per slide and expand the slide count instead of writing long weekly pages. Without a reference, weekly pages usually need 25–50 seconds and topic pages may use 60–90 seconds. Treat these as pacing guides, not quotas.

Use the shortest necessary first-use form for terms and institutions. Explain products through application, buyer, demand, supply pressure, and investor relevance before technical internals. Keep full source provenance in production notes; name a source in narration only when identity changes how the claim should be interpreted.

Do not invent a fixed period, threshold, confirmation formula, lead/lag relationship, top, bottom, or trading rule. Carry conditional audit language exactly far enough to prevent an overclaim.

### Expansion and repeated claims

When the user requests a page-level increase, save the current per-page narration as the baseline before editing. For “double every page,” each page must reach at least 2x its own baseline, including openings unless the user exempts them. Preserve a locked page count, order and requested conclusions. Count spoken non-whitespace characters consistently, excluding titles and page labels; save a before/after table outside narration. Do not substitute total growth for page-level growth or carry the multiplier into later tasks automatically.

Expand with sourced facts, clearly hypothetical everyday situations, concrete actions, causal steps or distinct consequences. Audit repetition by meaning: explain a central claim once; every later return must add evidence, a different situation or an unresolved choice. A synonym for “upgrades take time” is not new information. Keep each requested page conclusion tied to that page's new evidence. If evidence is insufficient, fill the specific source gap rather than pad the page with definitions, caveats or repeated summaries.

## Visual Direction

When requested, read [visual-direction.md](references/visual-direction.md) completely and produce slide-by-slide visual recommendations:

- one primary chart, document, person, product, or market screen;
- 1–3 core figures;
- specific logos and source assets;
- enough negative space;
- what must stay off the slide.

Route real source screenshots, crops, and annotations to `$market-evidence-capture`. When the user asks for an actual generated bitmap, freeze the approved slide, stable slide ID, style, exact text, text-density limit, target path, and avoid list; then route rendering to `$imagegen`. Save generated or editorial assets under `視覺素材/` and inspect text accuracy, product assignment, tone, and legibility before marking them active.

## Final Pass

Run `$script-editor-zh-tw` after drafting. Require its first-use audit, whole-script pattern sweep, beginner cold read, and ending gate. The editor may tighten language but must not change evidence, numbers, page roles, or the user's approved phrasing. Finish through `$market-project-package` so artifact separation, headings, links, assets, and the final folder are validated together.
