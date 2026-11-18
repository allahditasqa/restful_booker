# Test strategy: Restful-Booker API

**Version:** 1.0  |  **Prepared by:** QA (SDET)

## 1. Objective
Check that the public Restful-Booker API (https://restful-booker.herokuapp.com) behaves as its official documentation says
(https://restful-booker.herokuapp.com/apidoc/index.html), and record every difference as a defect.

## 2. Scope

| Module (report) | Endpoint | Spec file | Cases |
| --- | --- | --- | --- |
| Health Check | GET /ping | `tests/ping.spec.ts` | 1 |
| Auth | POST /auth | `tests/auth.spec.ts` | 5 |
| Get Booking IDs | GET /booking | `tests/get-booking-ids.spec.ts` | 11 |
| Get Booking | GET /booking/:id | `tests/get-booking.spec.ts` | 6 |
| Create Booking | POST /booking | `tests/create-booking.spec.ts` | 8 |
| Update Booking | PUT /booking/:id | `tests/update-booking.spec.ts` | 7 |
| Partial Update Booking | PATCH /booking/:id | `tests/partial-update-booking.spec.ts` | 8 |
| Delete Booking | DELETE /booking/:id | `tests/delete-booking.spec.ts` | 8 |
| **Total** | 8 endpoints | | **54** |

**Out of scope:** load and performance testing, rate limits, security testing beyond authorization (token, Basic auth, none, invalid).

## 3. Approach

| Type | How |
| --- | --- |
| Functional | Status code, body and headers for every endpoint and format (JSON, XML) |
| Negative / validation | Missing fields, invalid dates, unknown and non-numeric ids, wrong credentials |
| Authorization | Token cookie, Basic auth, no auth, invalid token on update, patch and delete |
| Data integrity | Create then read back, update then read back, delete then 404, rejected update leaves data unchanged |
| Boundary | Date filters on equal, before and after dates; optional field; empty body |

Each test creates its own data (unique last name) and removes it at the end, so tests are independent and can run in parallel.

## 4. Environment
Public shared demo API, Node 20+, Playwright request client (no browser). The server is reset regularly and shared with other users, so local runs retry once and CI twice. The final report runs use no retries.

## 5. Traceability
Every case names the item of the API documentation it checks (Traceability table in each document). Differences between documentation and live API: [DEFECTS.md](../DEFECTS.md) (D-01 to D-03, four cases).

## 6. Entry and exit criteria
All High cases pass, pass rate 95% or more (known defects are expected failures and are listed separately), no unexplained failure.

## 7. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Shared public server, parallel users | Occasional failures | Unique data per test, retries on CI |
| API is fixed one day | A known-defect case starts to pass | Reported as failed so the `test.fail()` mark is removed |

## 8. Reports
Module-wise reports are committed: `reports/index.html`, `reports/history.json` and per module `reports/<module-slug>/<Module Name> test <DD-MM-YYYY>_<HH-mm-ss>.html` plus the `... test cases ...csv` with the real result of each case.
