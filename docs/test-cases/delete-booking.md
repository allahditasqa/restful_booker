# Delete Booking Test Cases

**Module:** Delete Booking | **Sub-module:** DeleteBooking | **Spec:** `tests/delete-booking.spec.ts`
**Report:** `reports/<module-slug>/<Module Name> test <DD-MM-YYYY>_<HH-mm-ss>.html` (all runs: `reports/index.html`)  |  **Master CSV:** `docs/test-cases/delete-booking.csv`

## Overview
DELETE /booking/:id removes a booking. It needs a token cookie or Basic auth. A successful delete answers 201 Created.
API documentation: https://restful-booker.herokuapp.com/apidoc/index.html (DeleteBooking (DELETE /booking/:id)).

## Scope and notes
- Runs against the public demo API https://restful-booker.herokuapp.com. No browser is used.
- Every test creates its own booking and deletes it at the end, so tests are independent.
- Admin credentials are the public demo values from the API documentation.
- Deviations from the documentation are logged in [DEFECTS.md](../../DEFECTS.md).

## A. Positive

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_DELETE_01 | Delete with a token cookie returns 201 Created | High | A booking created by the test (unique last name) | 1. Create a token. 2. Send DELETE /booking/:id with the token cookie. | Status 201 and the body "Created". |
| TC_DELETE_02 | A deleted booking can no longer be read (404) | High | A booking created by the test (unique last name) | 1. Delete the booking. 2. Send GET /booking/:id. | Status 404. |
| TC_DELETE_03 | A deleted booking disappears from the list | Medium | A booking created by the test (unique last name) | 1. Delete the booking. 2. Send GET /booking?lastname=<last>. | The list is empty. |
| TC_DELETE_04 | Delete with Basic auth works as an alternative to the token | Medium | A booking created by the test (unique last name) | 1. Send DELETE /booking/:id with Basic auth. 2. Send GET /booking/:id. | Status 201, then GET answers 404. |

## B. Negative and authorization

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_DELETE_05 | Delete without authorization returns 403 and keeps the booking | High | A booking created by the test (unique last name) | 1. Send DELETE /booking/:id without authorization. 2. Send GET /booking/:id. | Status 403 and the booking still exists (GET answers 200). |
| TC_DELETE_06 | Delete with an invalid token returns 403 | High | A booking created by the test (unique last name) | 1. Send DELETE /booking/:id with a wrong token cookie. | Status 403. |
| TC_DELETE_07 | Deleting a booking id that does not exist returns 405 | Low | A valid token | 1. Send DELETE /booking/99999999 with the token. | Status 405 (the API does not answer 404). |
| TC_DELETE_08 | Deleting the same booking twice: the second call returns 405 | Medium | A booking created by the test (unique last name) | 1. Delete the booking. 2. Delete it again. | The first call answers 201, the second 405. |

## Traceability

Every case is automated. The requirement is the item of the official API documentation.

| ID | Type | Test data | Automation | Spec file | Requirement |
| --- | --- | --- | --- | --- | --- |
| TC_DELETE_01 | API / Functional | a token created with admin / password123 | Automated | `tests/delete-booking.spec.ts` | API doc: DeleteBooking (DELETE /booking/:id) |
| TC_DELETE_02 | API / Functional / Data integrity | a token created with admin / password123 | Automated | `tests/delete-booking.spec.ts` | API doc: DeleteBooking (DELETE /booking/:id) |
| TC_DELETE_03 | API / Functional / Data integrity | unique lastname | Automated | `tests/delete-booking.spec.ts` | API doc: DeleteBooking (DELETE /booking/:id) |
| TC_DELETE_04 | API / Functional / Security | Basic auth admin:password123 | Automated | `tests/delete-booking.spec.ts` | API doc: DeleteBooking (DELETE /booking/:id) |
| TC_DELETE_05 | API / Security / Negative | No authorization | Automated | `tests/delete-booking.spec.ts` | API doc: DeleteBooking (DELETE /booking/:id) |
| TC_DELETE_06 | API / Security / Negative | Invalid token | Automated | `tests/delete-booking.spec.ts` | API doc: DeleteBooking (DELETE /booking/:id) |
| TC_DELETE_07 | API / Negative | id 99999999 | Automated | `tests/delete-booking.spec.ts` | API doc: DeleteBooking (DELETE /booking/:id) |
| TC_DELETE_08 | API / Negative | a token created with admin / password123 | Automated | `tests/delete-booking.spec.ts` | API doc: DeleteBooking (DELETE /booking/:id) |

## Summary

| Cases | High priority | Automated |
| --- | --- | --- |
| 8 | 4 | 8 |
