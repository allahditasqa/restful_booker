# Get Booking Test Cases

**Module:** Get Booking | **Sub-module:** GetBooking | **Spec:** `tests/get-booking.spec.ts`
**Report:** `reports/<module-slug>/<Module Name> test <DD-MM-YYYY>_<HH-mm-ss>.html` (all runs: `reports/index.html`)  |  **Master CSV:** `docs/test-cases/get-booking.csv`

## Overview
GET /booking/:id returns one booking as JSON or XML.
API documentation: https://restful-booker.herokuapp.com/apidoc/index.html (GetBooking (GET /booking/:id)).

## Scope and notes
- Runs against the public demo API https://restful-booker.herokuapp.com. No browser is used.
- Every test creates its own booking and deletes it at the end, so tests are independent.
- Admin credentials are the public demo values from the API documentation.
- Deviations from the documentation are logged in [DEFECTS.md](../../DEFECTS.md).

## A. Positive

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_GET_01 | Returns all documented fields for an existing booking | High | A booking created by the test (unique last name) | 1. Send GET /booking/:id. | Status 200, content type JSON, and the body equals the created booking. |
| TC_GET_02 | Field types match the documentation | Medium | At least one booking exists | 1. Read the first id of GET /booking. 2. Send GET /booking/:id. | firstname and lastname are strings, totalprice is a number, depositpaid is a boolean, both dates look like YYYY-MM-DD. |
| TC_GET_03 | Accept: application/xml returns an XML body | Low | At least one booking exists | 1. Send GET /booking/:id with the header Accept: application/xml. | Status 200. The body starts with the XML declaration and contains <booking> and <firstname>. |
| TC_GET_06 | The XML response is labelled with an XML content type | Low | At least one booking exists | 1. Send GET /booking/:id with Accept: application/xml. 2. Read the Content-Type header. | The Content-Type contains "xml". Known defect D-03: the live API sends text/html. |

## B. Negative

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_GET_04 | A booking id that does not exist returns 404 | Medium | None | 1. Send GET /booking/99999999. | Status 404. |
| TC_GET_05 | A non-numeric id returns 404 | Low | None | 1. Send GET /booking/abc. | Status 404. |

## Traceability

Every case is automated. The requirement is the item of the official API documentation.

| ID | Type | Test data | Automation | Spec file | Requirement |
| --- | --- | --- | --- | --- | --- |
| TC_GET_01 | API / Functional | Booking with firstname Jim, totalprice 111, dates 2018-01-01 to 2019-01-01 | Automated | `tests/get-booking.spec.ts` | API doc: GetBooking (GET /booking/:id) |
| TC_GET_02 | API / Functional / Schema | First id of the list | Automated | `tests/get-booking.spec.ts` | API doc: GetBooking (GET /booking/:id) |
| TC_GET_03 | API / Functional | Header Accept: application/xml | Automated | `tests/get-booking.spec.ts` | API doc: GetBooking (GET /booking/:id) |
| TC_GET_06 | API / Negative | Header Accept: application/xml | Automated | `tests/get-booking.spec.ts` | API doc: GetBooking (GET /booking/:id) |
| TC_GET_04 | API / Negative | id 99999999 | Automated | `tests/get-booking.spec.ts` | API doc: GetBooking (GET /booking/:id) |
| TC_GET_05 | API / Negative / Boundary | id abc | Automated | `tests/get-booking.spec.ts` | API doc: GetBooking (GET /booking/:id) |

## Summary

| Cases | High priority | Automated |
| --- | --- | --- |
| 6 | 1 | 6 |
