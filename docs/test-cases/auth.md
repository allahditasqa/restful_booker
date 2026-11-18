# Auth Test Cases

**Module:** Auth | **Sub-module:** CreateToken | **Spec:** `tests/auth.spec.ts`
**Report:** `reports/<module-slug>/<Module Name> test <DD-MM-YYYY>_<HH-mm-ss>.html` (all runs: `reports/index.html`)  |  **Master CSV:** `docs/test-cases/auth.csv`

## Overview
POST /auth returns a token for the admin user. The token is used for update and delete calls. A failed login answers 200 with a reason in the body.
API documentation: https://restful-booker.herokuapp.com/apidoc/index.html (CreateToken (POST /auth)).

## Scope and notes
- Runs against the public demo API https://restful-booker.herokuapp.com. No browser is used.
- Every test creates its own booking and deletes it at the end, so tests are independent.
- Admin credentials are the public demo values from the API documentation.
- Deviations from the documentation are logged in [DEFECTS.md](../../DEFECTS.md).

## A. Positive

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_AUTH_01 | Valid admin credentials return a token | High | None | 1. Send POST /auth with the admin credentials. | Status 200. The body has a token that is a string with more than 5 characters. |
| TC_AUTH_05 | A fresh token is accepted by a protected endpoint | High | A booking created by the test (unique last name) | 1. Create a token. 2. Send DELETE /booking/:id with the token cookie. | Status 201, so the token is accepted. |

## B. Negative

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_AUTH_02 | Wrong password returns "Bad credentials" and no token | High | None | 1. Send POST /auth with username admin and password wrong. | Status 200 (this API reports the failure in the body). The body reason is "Bad credentials" and there is no token. |
| TC_AUTH_03 | Unknown username returns "Bad credentials" | Medium | None | 1. Send POST /auth with username nobody. | The body reason is "Bad credentials". |
| TC_AUTH_04 | Empty body returns "Bad credentials" | Medium | None | 1. Send POST /auth with an empty JSON body. | The body reason is "Bad credentials". |

## Traceability

Every case is automated. The requirement is the item of the official API documentation.

| ID | Type | Test data | Automation | Spec file | Requirement |
| --- | --- | --- | --- | --- | --- |
| TC_AUTH_01 | API / Functional | username admin, password password123 (public demo credentials) | Automated | `tests/auth.spec.ts` | API doc: CreateToken (POST /auth) |
| TC_AUTH_05 | API / Functional | a token created with admin / password123 | Automated | `tests/auth.spec.ts` | API doc: CreateToken (POST /auth) |
| TC_AUTH_02 | API / Negative | username admin, password wrong | Automated | `tests/auth.spec.ts` | API doc: CreateToken (POST /auth) |
| TC_AUTH_03 | API / Negative | username nobody, password password123 | Automated | `tests/auth.spec.ts` | API doc: CreateToken (POST /auth) |
| TC_AUTH_04 | API / Negative / Boundary | Body {} | Automated | `tests/auth.spec.ts` | API doc: CreateToken (POST /auth) |

## Summary

| Cases | High priority | Automated |
| --- | --- | --- |
| 5 | 3 | 5 |
