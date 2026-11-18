# Partial Update Booking Test Cases

**Module:** Partial Update Booking | **Sub-module:** PartialUpdateBooking | **Spec:** `tests/partial-update-booking.spec.ts`
**Report:** `reports/<module-slug>/<Module Name> test <DD-MM-YYYY>_<HH-mm-ss>.html` (all runs: `reports/index.html`)  |  **Master CSV:** `docs/test-cases/partial-update-booking.csv`

## Overview
PATCH /booking/:id changes only the sent fields. It needs a token cookie or Basic auth.
API documentation: https://restful-booker.herokuapp.com/apidoc/index.html (PartialUpdateBooking (PATCH /booking/:id)).

## Scope and notes
- Runs against the public demo API https://restful-booker.herokuapp.com. No browser is used.
- Every test creates its own booking and deletes it at the end, so tests are independent.
- Admin credentials are the public demo values from the API documentation.
- Deviations from the documentation are logged in [DEFECTS.md](../../DEFECTS.md).

## A. Positive

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_PATCH_01 | Changes only the sent fields and keeps the others | High | A booking created by the test (unique last name) | 1. Send PATCH /booking/:id with a new firstname and the same lastname. | Status 200. firstname is changed, all other fields are the same as before. |
| TC_PATCH_02 | A single field (totalprice) can be changed | Medium | A booking created by the test (unique last name) | 1. Send PATCH /booking/:id with only totalprice. | Status 200 and totalprice is 5000. |
| TC_PATCH_03 | The change is stored (GET returns it) | Medium | A booking created by the test (unique last name) | 1. Send PATCH with additionalneeds. 2. Send GET /booking/:id. | GET returns the original data with the new additionalneeds. |
| TC_PATCH_04 | The booking dates can be changed | Medium | A booking created by the test (unique last name) | 1. Send PATCH with new bookingdates. | Status 200 and the dates are the new dates. |
| TC_PATCH_05 | Partial update with Basic auth works | Medium | A booking created by the test (unique last name) | 1. Send PATCH /booking/:id with Basic auth. | Status 200 and firstname is changed. |

## B. Negative and authorization

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_PATCH_06 | Partial update without authorization returns 403 | High | A booking created by the test (unique last name) | 1. Send PATCH /booking/:id without authorization. | Status 403. |
| TC_PATCH_07 | Partial update with an invalid token returns 403 | High | A booking created by the test (unique last name) | 1. Send PATCH /booking/:id with a wrong token cookie. | Status 403. |
| TC_PATCH_08 | Partial update of a booking id that does not exist returns 405 | Low | A valid token | 1. Send PATCH /booking/99999999 with the token. | Status 405 (the API does not answer 404). |

## Traceability

Every case is automated. The requirement is the item of the official API documentation.

| ID | Type | Test data | Automation | Spec file | Requirement |
| --- | --- | --- | --- | --- | --- |
| TC_PATCH_01 | API / Functional | firstname Patched | Automated | `tests/partial-update-booking.spec.ts` | API doc: PartialUpdateBooking (PATCH /booking/:id) |
| TC_PATCH_02 | API / Functional / Boundary | totalprice 5000 | Automated | `tests/partial-update-booking.spec.ts` | API doc: PartialUpdateBooking (PATCH /booking/:id) |
| TC_PATCH_03 | API / Functional / Data integrity | additionalneeds Late checkout | Automated | `tests/partial-update-booking.spec.ts` | API doc: PartialUpdateBooking (PATCH /booking/:id) |
| TC_PATCH_04 | API / Functional | checkin 2030-03-01, checkout 2030-03-09 | Automated | `tests/partial-update-booking.spec.ts` | API doc: PartialUpdateBooking (PATCH /booking/:id) |
| TC_PATCH_05 | API / Functional / Security | Basic auth admin:password123, firstname BasicPatch | Automated | `tests/partial-update-booking.spec.ts` | API doc: PartialUpdateBooking (PATCH /booking/:id) |
| TC_PATCH_06 | API / Security / Negative | No authorization | Automated | `tests/partial-update-booking.spec.ts` | API doc: PartialUpdateBooking (PATCH /booking/:id) |
| TC_PATCH_07 | API / Security / Negative | Invalid token | Automated | `tests/partial-update-booking.spec.ts` | API doc: PartialUpdateBooking (PATCH /booking/:id) |
| TC_PATCH_08 | API / Negative | id 99999999 | Automated | `tests/partial-update-booking.spec.ts` | API doc: PartialUpdateBooking (PATCH /booking/:id) |

## Summary

| Cases | High priority | Automated |
| --- | --- | --- |
| 8 | 3 | 8 |
