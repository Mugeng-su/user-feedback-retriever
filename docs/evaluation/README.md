# Evaluation Workflow

This folder is for structured product-quality review of real analysis results.

The goal is to avoid tuning the product only by intuition. Each tested video should produce one evaluation note using `sample-review-template.md`, then the summary should be added to `sample-tracker.md`.

## Recommended Test Set

- Test 5 to 10 real videos before making major prompt or UI changes.
- Prefer videos from different product categories, creator styles, and comment quality levels.
- For each video, keep the exact analysis URL so the output can be rechecked later.

## Scoring Scale

Use a 1 to 5 score.

- 1: Not useful
- 2: Mostly weak or generic
- 3: Usable but needs manual filtering
- 4: Useful and mostly actionable
- 5: Strong enough to use directly in a content or copy workflow

## Evaluation Dimensions

- Video analysis accuracy
- Replicable content mechanics
- Comment material usefulness
- Reusable language asset quality
- Brief usefulness
- Overall confidence

## Decision Rules

- If a module is skipped in most tests, consider hiding, merging, or rewriting it.
- If a module is read but not used, clarify its purpose or make it more actionable.
- If language assets are not directly reusable, tune prompt/schema before adding more UI.
- If the brief is useful, prioritize export and collaboration features.
- If analysis quality is inconsistent across categories, add category/context controls before scaling acquisition.
