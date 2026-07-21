# Design Workflow Evaluation (2026-07-20)

> Mode: boilerplate-only validation artifact. This is not a product design SSOT.

## Question

Which `/bootstrap-design` R0-R2 workflow produces the best usable design direction without adding disproportionate research and review cost?

## Conditions

| ID | Workflow | Main difference |
|---|---|---|
| B0 | Current baseline | Current R0 source hierarchy, 1-3 references, token-first decomposition, anti-reference, divergence cards |
| B1 | BACKLOG2 corrected intent | Autonomous A/B/C research, 6-8 candidate pool, 3-5 final references, role lanes, positive identity, baseline-safe vs signature-forward concepts |
| B2 | Task-first corrected | Primary-task tensions first, role-specific evidence, visual/live verification gate, one coherent token system, 3-5 final references, signature constrained by familiar UX |

Each condition receives the same two briefs, four search queries per brief, and produces two concepts per brief. Search was run on 2026-07-20.

## Hypotheses

- H0: The current workflow is already sufficient; extra research adds cost without a reliable quality gain.
- H1: Broad role lanes and a positive identity contract improve distinctness, but forced breadth can reduce coherence or task fit.
- H2: Task-first evidence plus one coherent implementation system provides the best combined task clarity, identity, and implementation realism.
- H3: HTML reading catches code-level rule violations but misses mobile overflow, clipping, hierarchy, and visual density failures that screenshots expose.
- H4: A signature-forward concept improves identity only when a familiar task convention is explicitly preserved.
- H5: Google DESIGN.md examples are useful format fixtures but do not improve concept aesthetics when included in the creative context.

## Controls

- Same product brief and required surface for all conditions.
- Same model family and two concepts per product.
- Standalone HTML/CSS, real copy, no build dependency.
- Desktop 1280x900 and mobile 375x812 screenshots.
- Automated checks: page render, horizontal overflow, clipped text, axe violations.
- Blind visual review: screenshot IDs do not reveal workflow condition.

## Scoring

Each concept is scored 1-5 on:

1. Primary-task clarity (weight 2)
2. Information hierarchy (weight 1.5)
3. Visual coherence (weight 1.5)
4. Distinctive, domain-fit identity without trend slop (weight 1.5)
5. Production realism and state communication (weight 1)
6. Mobile reflow and text fit (weight 1.5)
7. Visible accessibility and interaction affordance (weight 1)

Reference packs are separately scored on task relevance, source authority, visual inspectability, behavior/flow evidence, token/code evidence, freshness, and cost. These dimensions are not collapsed into a source-tier ranking.

## Falsification

- B1/B2 do not win merely by having more references; they must improve rendered output.
- Any workflow with a serious/critical accessibility violation or horizontal overflow cannot be the overall winner.
- If B0 is within 5% of the best weighted score at materially lower cost, H0 is retained.
- If B1 is more distinctive but less task-clear or coherent, fixed diversity quotas are rejected.
- If B2 wins only one product archetype, the result is domain-conditional rather than a universal default.

## Artifact Layout

- `briefs/`: fixed product inputs
- `reference-packs/`: search inputs, candidates, shortlist, evidence caveats
- `concepts/`: generated candidate HTML
- `screenshots/`: rendered desktop/mobile evidence
- `metrics.json`: deterministic render/a11y/overflow results
- `blind-evaluation*.md`: independent screenshot reviews
- `REPORT.md`: synthesis and recommendation
