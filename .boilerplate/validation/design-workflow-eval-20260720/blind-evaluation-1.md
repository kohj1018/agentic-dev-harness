# Blind Visual Evaluation 1

## Method

Scores use only the supplied briefs and blind small montage screenshots. Each dimension is an integer from 1 (fails visibly) to 5 (excellent): primary-task clarity (`Task`, weight 2), information hierarchy (`Hier`, 1.5), visual coherence (`Coh`, 1.5), distinctive domain-fit identity (`Ident`, 1.5), production realism/state communication (`State`, 1), mobile reflow/text fit (`Mobile`, 1.5), and visible accessibility/interaction affordance (`A11y`, 1). Ranking values are weighted sums out of 50. Exact-score ties are resolved by direct comparison against the brief's evaluation task.

## OpsRelay

| ID | Task | Hier | Coh | Ident | State | Mobile | A11y | Short rationale |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| O01 | 5 | 4 | 4 | 4 | 5 | 4 | 4 | 43.0 | The unconfirmed-owner handoff and three next actions are explicit, with stale data and evidence visible. The oversized red severity rail competes with the incident content, and the mobile sequence is long. |
| O02 | 5 | 4 | 5 | 3 | 5 | 4 | 4 | Queue, response stages, evidence, ownership, transition, and update form a realistic command flow. Dense low-contrast dark styling and a fairly generic operations-dashboard identity slow scanning. |
| O03 | 5 | 5 | 4 | 4 | 5 | 5 | 5 | The selected incident, owner gap, state line, stale warning, and numbered responsibility-to-update sequence are exceptionally easy to follow on both widths. The dark-console treatment is polished but not especially ownable. |
| O04 | 5 | 4 | 4 | 5 | 5 | 4 | 4 | Numbered commander, mitigation, verification, and update steps make the next action unambiguous, while the editorial command-console styling is distinctive. The horizontal incident strip is less scannable than the required list convention and mobile is comparatively dense. |
| O05 | 5 | 5 | 5 | 4 | 5 | 4 | 4 | A calm three-pane layout makes the selected P1, missing owner, handoff actions, stale state, and evidence immediately legible. Mobile preserves the action order well, though secondary text and pale borders are small and subdued. |
| O06 | 5 | 4 | 4 | 3 | 5 | 4 | 4 | Ownership and mitigation are paired as clear sequential actions and the warning, impact, evidence, and update are plausible. The crowded top status band and washed-out, generic visual treatment weaken hierarchy and identity. |
| O07 | 5 | 5 | 5 | 4 | 5 | 5 | 5 | This is the strongest queue-to-detail-to-action composition: missing ownership, stale data, impact, evidence, and the mitigation step all read in the expected order. Mobile reorders the same workflow cleanly without losing labels or controls. |
| O08 | 5 | 4 | 4 | 4 | 5 | 5 | 4 | The highlighted P1 and explicit handoff box make assignment and mitigation obvious, and mobile prioritizes the selected incident and actions before the full queue. The strong red action treatment is effective but visually louder than the otherwise quiet system. |
| O09 | 5 | 4 | 4 | 5 | 4 | 4 | 4 | Severity/time rails give this command view a memorable identity and the owner-to-mitigation path remains direct on mobile. The rails consume useful width, partly lean on color mapping, and feel less production-conventional than the simpler queues. |
| O10 | 5 | 5 | 4 | 3 | 5 | 5 | 5 | The attention table exposes the P1/no-owner case at once, then the detail view names the next responsible action and disables mitigation until assignment. Mobile sequencing is excellent, but the pale spreadsheet aesthetic is visually generic. |
| O11 | 5 | 4 | 4 | 3 | 5 | 5 | 5 | The active-incident table, explicit no-owner action, disabled transition, update, evidence, and stale notice communicate a credible state machine. The desktop composition is compressed into a small upper region and has little product-specific identity. |
| O12 | 4 | 4 | 5 | 4 | 5 | 4 | 4 | The quiet palette, explicit ownership blocker, transition, update, evidence, and stale banner form a coherent operational screen. On mobile, the evidence stream precedes the urgent ownership action, weakening the brief's at-a-glance test. |

### OpsRelay Overall Ranking

1. **O07** - 48.5
2. **O03** - 47.0
3. **O05** - 46.0
4. **O10** - 45.5
5. **O08** - 44.5
6. **O04** - 44.5
7. **O11** - 44.0
8. **O09** - 43.5
9. **O01** - 43.0
10. **O02** - 43.0
11. **O12** - 42.5
12. **O06** - 41.5

## Stillroom Coffee

| ID | Task | Hier | Coh | Ident | State | Mobile | A11y | Short rationale |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| C01 | 4 | 4 | 3 | 4 | 4 | 4 | 4 | 38.5 | The taste, amount, cadence, price, date, and subscribe action are all available, including a useful mobile price bar. The large promotional lead-in and unrelated purple, lime, and blue accents make the configurator feel less focused and coherent. |
| C02 | 5 | 5 | 5 | 5 | 4 | 5 | 4 | The two-pane editorial layout turns terminology into three plain taste choices and makes the selected two-bag/two-week price easy to verify. Mobile reflow and text fit are excellent, but the summary is an end-of-flow block rather than visibly persistent. |
| C03 | 4 | 4 | 4 | 5 | 4 | 4 | 4 | The tasting-line metaphor is memorable and the controls remain familiar, with a visible price and shipment review. On mobile the sticky subscribe bar arrives between stages, while the many accent colors and route ornament add friction to a short task. |
| C04 | 5 | 4 | 5 | 5 | 5 | 4 | 4 | Dark teal, orange, and coffee imagery create a strong non-beige identity, while selected controls and the recurring summary are concrete. The mobile sticky bar divides the form from the detailed review and the dense dark summary takes extra effort to scan. |
| C05 | 4 | 4 | 4 | 4 | 5 | 3 | 4 | Desktop cleanly separates product, choices, and a persistent order summary with realistic selected states. On mobile the fixed price/action bar interrupts the form before cadence and summary content, making the sequence feel obstructed. |
| C06 | 5 | 5 | 5 | 4 | 5 | 5 | 4 | Plain-language choices, compact amount/cadence controls, exact price, and shipment details make the task direct at both sizes. The progress rail adds some unnecessary process framing and the photo-plus-editorial treatment is less distinctive than the leaders. |
| C07 | 5 | 5 | 5 | 5 | 4 | 5 | 5 | The blue identity panel avoids brown monotony, and the shortest, clearest form makes taste, two bags, two weeks, price, and cancellation reassurance easy to verify. Its review is inline rather than visibly persistent, which is the main realism gap. |
| C08 | 5 | 5 | 5 | 4 | 5 | 5 | 5 | Photo, form, and persistent summary create a highly usable desktop system; mobile retains a compact price/action bar and a complete review. Familiar controls and redundant selected-state cues are strong, though the identity is intentionally safer than the leaders. |
| C09 | 5 | 5 | 5 | 4 | 5 | 5 | 5 | The selected taste, two-bag amount, cadence, first shipment, price, and CTA form a complete, legible path with an effective mobile summary bar. The roaster-rotation callout adds useful product context but makes the identity slightly less focused than C08. |
| C10 | 5 | 4 | 4 | 4 | 5 | 4 | 4 | Controls and selected values are straightforward and mobile keeps price and CTA visible. The oversized, mostly empty desktop summary column separates the total from its details, weakening density, hierarchy, and perceived finish. |
| C11 | 4 | 4 | 4 | 4 | 5 | 3 | 4 | The taste-first framing, amounts, cadence, real prices, and shipment details are credible and the blue accent prevents a brown-only palette. A large selected-taste explanation makes mobile unnecessarily long, with the fixed action bar visually interrupting later choices. |
| C12 | 5 | 5 | 5 | 5 | 5 | 5 | 4 | The tasting-route identity is distinctive without replacing familiar radio, segmented, and select controls; the yellow review rail keeps selections and price prominent. Mobile stacks the route and full review cleanly, with only some small secondary labels limiting visible accessibility. |

### Stillroom Coffee Overall Ranking

1. **C12** - 49.0
2. **C07** - 49.0
3. **C08** - 48.5
4. **C09** - 48.5
5. **C02** - 48.0
6. **C06** - 47.5
7. **C04** - 46.0
8. **C10** - 43.0
9. **C03** - 41.5
10. **C05** - 39.5
11. **C11** - 39.5
12. **C01** - 38.5
