# Create Booking Test Cases

**Module:** Create Booking | **Sub-module:** CreateBooking | **Spec:** `tests/create-booking.spec.ts`
**Report:** `reports/<module-slug>/<Module Name> test <DD-MM-YYYY>_<HH-mm-ss>.html` (all runs: `reports/index.html`)  |  **Master CSV:** `docs/test-cases/create-booking.csv`

## Overview
POST /booking creates a booking from JSON or XML and answers with the new bookingid. Every test deletes the booking it created.
API documentation: https://restful-booker.herokuapp.com/apidoc/index.html (CreateBooking (POST /booking)).

## Scope and notes
- Runs against the public demo API https://restful-booker.herokuapp.com. No browser is used.
- Every test creates its own booking and deletes it at the end, so tests are independent.
- Admin credentials are the public demo values from the API documentation.
- Deviations from the documentation are logged in [DEFECTS.md](../../DEFECTS.md).

## A. Positive

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_CREATE_01 | Creates a booking and echoes it with a new bookingid | High | None | 1. Send POST /booking with a valid JSON booking. | Status 200. The body has a numeric bookingid and the same booking data. |
| TC_CREATE_02 | The created booking can be read back with the same data | High | None | 1. Create a booking. 2. Send GET /booking/:id. | The read data equals the created data. |
| TC_CREATE_03 | The created id appears in the booking list | Medium | None | 1. Create a booking. 2. Send GET /booking?lastname=<last>. | The list contains the new id. |
| TC_CREATE_04 | Two bookings get two different ids | Medium | None | 1. Create a booking. 2. Create a second booking. | The two ids are different. |
| TC_CREATE_05 | additionalneeds is optional | Low | None | 1. Send POST /booking without additionalneeds. | Status 200. |
| TC_CREATE_06 | XML payload with Accept: application/xml creates a booking | Low | None | 1. Send POST /booking with an XML body, Content-Type text/xml and Accept application/xml. | Status 200. The answer contains <created-booking> and a numeric <bookingid>. |

## B. Negative

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_CREATE_07 | A payload with missing required fields is rejected with 500 | Medium | None | 1. Send POST /booking with only a firstname. | Status 500 (the API does not answer 400). |
| TC_CREATE_08 | An empty payload is rejected with 500 | Medium | None | 1. Send POST /booking with an empty JSON body. | Status 500. |

## Traceability

Every case is automated. The requirement is the item of the official API documentation.

| ID | Type | Test data | Automation | Spec file | Requirement |
| --- | --- | --- | --- | --- | --- |
| TC_CREATE_01 | API / Functional | Booking: Jim, unique last name, totalprice 111, depositpaid true, 2018-01-01 to 2019-01-01, Breakfast | Automated | `tests/create-booking.spec.ts` | API doc: CreateBooking (POST /booking) |
| TC_CREATE_02 | API / Functional / Data integrity | Booking: firstname Readback, totalprice 250, depositpaid false | Automated | `tests/create-booking.spec.ts` | API doc: CreateBooking (POST /booking) |
| TC_CREATE_03 | API / Functional / Data integrity | unique lastname | Automated | `tests/create-booking.spec.ts` | API doc: CreateBooking (POST /booking) |
| TC_CREATE_04 | API / Functional | Two valid bookings | Automated | `tests/create-booking.spec.ts` | API doc: CreateBooking (POST /booking) |
| TC_CREATE_05 | API / Functional / Boundary | Booking without additionalneeds | Automated | `tests/create-booking.spec.ts` | API doc: CreateBooking (POST /booking) |
| TC_CREATE_06 | API / Functional | XML booking for firstname Xml, lastname User | Automated | `tests/create-booking.spec.ts` | API doc: CreateBooking (POST /booking) |
| TC_CREATE_07 | API / Negative / Validation | Body {firstname: OnlyName} | Automated | `tests/create-booking.spec.ts` | API doc: CreateBooking (POST /booking) |
| TC_CREATE_08 | API / Negative / Boundary | Body {} | Automated | `tests/create-booking.spec.ts` | API doc: CreateBooking (POST /booking) |

## Summary

| Cases | High priority | Automated |
| --- | --- | --- |
| 8 | 2 | 8 |
