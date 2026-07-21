# B2 Reference Pack: OpsRelay

## Search Budget

1. `site:docs.incident.io incidents lifecycle triage active post incident official`
2. `site:grafana.com/developers/saga templates list objects table official`
3. `site:grafana.com/docs/grafana/latest/visualizations/dashboards/build-dashboards best practices cognitive load`
4. `site:atlassian.design patterns notifications flags status indicators accessibility`

## Task Tensions

- Scan speed vs sufficient incident context
- Calm surface vs unmistakable severity
- Dense desktop coordination vs focused mobile triage

## Designer Shortlist

### incident.io lifecycle
- URL: https://docs.incident.io/incidents/lifecycle
- Role: shipped behavior/flow evidence
- Exact use: Declared -> Investigating -> Fixing/Mitigating -> Monitoring -> Closed
- Borrow: explicit lifecycle labels and triage/active/post-incident separation
- Avoid: inventing a new state model from visual inspiration

### Grafana dashboard best practices
- URL: https://grafana.com/docs/grafana/latest/visualizations/dashboards/build-dashboards/best-practices/
- Role: task and information-hierarchy evidence
- Exact use: answer a question, reduce cognitive load, direct drill-down, meaningful color
- Borrow: show trouble first and use directed browsing
- Avoid: decorative KPI grids and undirected browsing

### Saga Lists of Objects
- URL: https://grafana.com/developers/saga/templates/lists-of-objects/
- Role: screen-pattern evidence
- Exact use: list for understood data; table for open exploration; controls next to data; failure in the data region
- Borrow: queue anatomy and in-place remediation
- Avoid: cards when comparison is the task

### Grafana Saga
- URL: https://grafana.com/developers/saga
- Role: one coherent primary implementation system
- Borrow: accessible, quiet product primitives and component coherence
- Avoid: mixing a second token system without a named gap

## Positive Identity Input

- Thesis: Make the next responsible action more legible than the surrounding telemetry.
- Signature: A restrained tempo rail ties incident age, lifecycle, and handoff together.
- Familiar convention preserved: incident queue -> selected detail -> explicit state/update action.
- Density: high on desktop, task-reduced on mobile.

## Verification State

All four references are canonical official pages and were text-inspected on 2026-07-20. Pixel-level visual claims are not made where screenshots were not inspected.
