# Brief: OpsRelay

## Product

An internal incident command workspace for a 40-person SRE organization.

## Persona and Situation

Mina is the on-call lead at 02:17. Multiple alerts are firing and she must act without scanning decorative analytics.

## Primary Task

Find the most urgent active incident, confirm or assign an owner, move it from Investigating to Mitigating, and publish a concise stakeholder update.

## Required Surface

One active incident command screen containing:

- Active incident queue with severity, age, service, state, and owner
- Selected incident summary and current impact
- Timeline or evidence stream
- Clear state transition and update action
- A visible degraded-data or stale-data state

## Constraints

- Dense, quiet, utilitarian UI; no marketing hero
- Desktop 1280 must support sustained use
- Mobile 375 must support quick triage and update, not reproduce the whole desktop grid
- Real operational copy and plausible data
- Color cannot be the only severity signal
- No gradient, glassmorphism, nested-card grid, decorative chart, or raw status color without a label
- Preserve the familiar incident list -> selected detail -> action convention

## Evaluation Task

At a glance, identify the P1 incident that has no confirmed owner and determine the next action.
