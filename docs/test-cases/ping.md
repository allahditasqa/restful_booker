# Health Check Test Cases

**Module:** Health Check | **Sub-module:** Ping | **Spec:** `tests/ping.spec.ts`
**Report:** `reports/<module-slug>/<Module Name> test <DD-MM-YYYY>_<HH-mm-ss>.html` (all runs: `reports/index.html`)  |  **Master CSV:** `docs/test-cases/ping.csv`

## Overview
The health check endpoint tells whether the API is up.
API documentation: https://restful-booker.herokuapp.com/apidoc/index.html (HealthCheck (GET /ping)).

## Scope and notes
- Runs against the public demo API https://restful-booker.herokuapp.com. No browser is used.
- Every test creates its own booking and deletes it at the end, so tests are independent.
- Admin credentials are the public demo values from the API documentation.
- Deviations from the documentation are logged in [DEFECTS.md](../../DEFECTS.md).

## A. Health check

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_PING_01 | GET /ping answers 201 Created | High | None | 1. Send GET /ping. | Status 201 and the body "Created". |

## Traceability

Every case is automated. The requirement is the item of the official API documentation.

| ID | Type | Test data | Automation | Spec file | Requirement |
| --- | --- | --- | --- | --- | --- |
| TC_PING_01 | API / Functional | GET /ping | Automated | `tests/ping.spec.ts` | API doc: HealthCheck (GET /ping) |

## Summary

| Cases | High priority | Automated |
| --- | --- | --- |
| 1 | 1 | 1 |
