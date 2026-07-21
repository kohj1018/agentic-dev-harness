# DS-7 State Matrix Simulation

> Scope: representative component inventories derived from the two fixed experiment briefs. Counts are planning entries, not implementation LOC.

## Compared Contracts

- Current: every inventory item receives all eight entries (`default/hover/active/focus/disabled/loading/error/empty`).
- BACKLOG2 wording: applicable states plus an `N/A + reason` for everything else. This removes fake behavior but still invites eight-cell paperwork.
- Category contract tested here:
  - interactive primitive: `default/hover/active/focus-visible/disabled`, plus `loading` only when async;
  - data-bearing composite or screen: `default/loading/empty/error/success`;
  - static primitive: no state matrix;
  - a category-expected state may be omitted only with a reason.

## OpsRelay Inventory

| Item | Category | Current entries | Category entries |
|---|---|---:|---:|
| Navigation link | interactive | 8 | 5 |
| Incident-row selector | interactive | 8 | 5 |
| Search/filter input | interactive | 8 | 5 |
| Severity/status badge | static | 8 | 0 |
| Assignee combobox | async interactive | 8 | 6 |
| Begin-mitigation action | async interactive | 8 | 6 |
| Update composer/publish action | async interactive | 8 | 6 |
| Event timeline | data-bearing | 8 | 5 |
| Selected-incident detail | data-bearing | 8 | 5 |
| **Total** | | **72** | **43** |

## Stillroom Inventory

| Item | Category | Current entries | Category entries |
|---|---|---:|---:|
| Product image | static | 8 | 0 |
| Taste radio group | interactive | 8 | 5 |
| Amount radio group | interactive | 8 | 5 |
| Cadence radio group | interactive | 8 | 5 |
| Ship-date picker | interactive | 8 | 5 |
| Order summary | data-bearing | 8 | 5 |
| Subscribe action | async interactive | 8 | 6 |
| Recurring-price copy | static | 8 | 0 |
| **Total** | | **64** | **31** |

## Observation

Across these two representative inventories, the category contract reduces 136 mandatory planning entries to 74 (46%) while adding the missing `success` state where data changes. The result is directional because inventory granularity is a planning decision, but it falsifies the need to preserve an eight-column matrix filled with `N/A` explanations.
