# Update Booking Test Cases

**Module:** Update Booking | **Sub-module:** UpdateBooking | **Spec:** `tests/update-booking.spec.ts`
**Report:** `reports/<module-slug>/<Module Name> test <DD-MM-YYYY>_<HH-mm-ss>.html` (all runs: `reports/index.html`)  |  **Master CSV:** `docs/test-cases/update-booking.csv`

## Overview
PUT /booking/:id replaces a booking. It needs a token cookie or Basic auth; without them the API answers 403.
API documentation: https://restful-booker.herokuapp.com/apidoc/index.html (UpdateBooking (PUT /booking/:id)).

## Scope and notes
- Runs against the public demo API https://restful-booker.herokuapp.com. No browser is used.
- Every test creates its own booking and deletes it at the end, so tests are independent.
- Admin credentials are the public demo values from the API documentation.
- Deviations from the documentation are logged in [DEFECTS.md](../../DEFECTS.md).

## A. Positive

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_UPDATE_01 | Full update with a token cookie returns the new data | High | A booking created by the test (unique last name) | 1. Create a token. 2. Send PUT /booking/:id with the token cookie and new data. | Status 200 and the body equals the new data. |
| TC_UPDATE_02 | The update is stored (GET returns the new data) | High | A booking created by the test (unique last name) | 1. Update the booking with a token. 2. Send GET /booking/:id. | GET returns the new data. |
| TC_UPDATE_03 | Full update with Basic auth works as an alternative to the token | Medium | A booking created by the test (unique last name) | 1. Send PUT /booking/:id with the header Authorization: Basic (admin). | Status 200 and the body equals the new data. |

## B. Negative and authorization

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_UPDATE_04 | Update without any authorization returns 403 | High | A booking created by the test (unique last name) | 1. Send PUT /booking/:id without a token and without Basic auth. | Status 403. |
| TC_UPDATE_05 | Update with an invalid token returns 403 | High | A booking created by the test (unique last name) | 1. Send PUT /booking/:id with a wrong token cookie. | Status 403. |
| TC_UPDATE_06 | A rejected update leaves the booking unchanged | Medium | A booking created by the test (unique last name) | 1. Send a PUT without authorization. 2. Send GET /booking/:id. | The booking still has its original data. |
| TC_UPDATE_07 | Update of a booking id that does not exist returns 405 | Low | A valid token | 1. Send PUT /booking/99999999 with the token. | Status 405 (the API does not answer 404). |

## Traceability

Every case is automated. The requirement is the item of the official API documentation.

| ID | Type | Test data | Automation | Spec file | Requirement |
| --- | --- | --- | --- | --- | --- |
| TC_UPDATE_01 | API / Functional | Token cookie; firstname James, totalprice 999, depositpaid false, Dinner | Automated | `tests/update-booking.spec.ts` | API doc: UpdateBooking (PUT /booking/:id) |
| TC_UPDATE_02 | API / Functional / Data integrity | firstname Stored, totalprice 321 | Automated | `tests/update-booking.spec.ts` | API doc: UpdateBooking (PUT /booking/:id) |
| TC_UPDATE_03 | API / Functional / Security | Basic auth admin:password123, firstname BasicAuth | Automated | `tests/update-booking.spec.ts` | API doc: UpdateBooking (PUT /booking/:id) |
| TC_UPDATE_04 | API / Security / Negative | No authorization | Automated | `tests/update-booking.spec.ts` | API doc: UpdateBooking (PUT /booking/:id) |
| TC_UPDATE_05 | API / Security / Negative | Invalid token | Automated | `tests/update-booking.spec.ts` | API doc: UpdateBooking (PUT /booking/:id) |
| TC_UPDATE_06 | API / Negative / Data integrity | firstname ShouldNotApply (must not be stored) | Automated | `tests/update-booking.spec.ts` | API doc: UpdateBooking (PUT /booking/:id) |
| TC_UPDATE_07 | API / Negative | id 99999999 | Automated | `tests/update-booking.spec.ts` | API doc: UpdateBooking (PUT /booking/:id) |

## Summary

| Cases | High priority | Automated |
| --- | --- | --- |
| 7 | 4 | 7 |
