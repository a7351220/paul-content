# scoring_v2 Reference

Use this when you need to explain or reason about the fixed-source ranking model.

## Sub-scores

- `sourceQualityScore`
  - Source trust and structural strength
- `evidenceScore`
  - Density of usable numbers, quotes, and supporting paragraphs
- `substantiationScore`
  - Whether the article's main claim is actually supported
- `corroborationScore`
  - Multi-source and multi-source-type confirmation
- `marketReactionScore`
  - Observable market reaction
- `storyValueScore`
  - Usefulness for cluster/bundle formation
- `penaltyScore`
  - Admin/generic/tutorial/dead-link penalties

## Current Scoring Authority

Use the current API output or implementation for weights and total-score calculation. Do not keep a second hardcoded formula in this skill; when the current weights are unavailable, explain the returned sub-scores without inventing a total or ranking.

## Interpretation

- High `sourceQualityScore` with low `evidenceScore`
  - Usually means trustworthy source, but weak article payload
- High `marketReactionScore` with low `substantiationScore`
  - Usually means market heat without enough support
- High `storyValueScore` with low `corroborationScore`
  - Often a promising singleton that still needs confirmation
- High `penaltyScore`
  - Means the item is structurally less useful even if it looks important

## Practical Rule

Prefer stories that are strong across:
- source quality
- evidence
- corroboration
- story value

Treat `marketReactionScore` as important but not sufficient by itself.
