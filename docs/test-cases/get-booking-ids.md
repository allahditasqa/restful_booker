# Get Booking IDs Test Cases

**Module:** Get Booking IDs | **Sub-module:** GetBookingIds | **Spec:** `tests/get-booking-ids.spec.ts`
**Report:** `reports/<module-slug>/<Module Name> test <DD-MM-YYYY>_<HH-mm-ss>.html` (all runs: `reports/index.html`)  |  **Master CSV:** `docs/test-cases/get-booking-ids.csv`

## Overview
GET /booking returns the ids of all bookings and can filter them by name and by date. Cases marked as known defect are written as the documentation says; the live API differs (see DEFECTS.md) and the tests use test.fail().
API documentation: https://restful-booker.herokuapp.com/apidoc/index.html (GetBookingIds (GET /booking)).

## Scope and notes
- Runs against the public demo API https://restful-booker.herokuapp.com. No browser is used.
- Every test creates its own booking and deletes it at the end, so tests are independent.
- Admin credentials are the public demo values from the API documentation.
- Deviations from the documentation are logged in [DEFECTS.md](../../DEFECTS.md).

## A. List and name filters

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_IDS_01 | Returns a non-empty array of numeric booking ids | High | None | 1. Send GET /booking. | Status 200. The body is a non-empty array and every item has a numeric bookingid. |
| TC_IDS_02 | Filter by firstname and lastname finds the new booking | High | A booking created by the test (unique last name) | 1. Send GET /booking?firstname=<first>&lastname=<last>. | Status 200 and the list contains the new booking id. |
| TC_IDS_03 | Filter by lastname only finds exactly the new booking | Medium | A booking created by the test (unique last name) | 1. Send GET /booking?lastname=<last>. | The list is exactly the new booking id. |
| TC_IDS_10 | A name that matches nothing returns an empty array | Medium | None | 1. Send GET /booking?firstname=NoSuchPerson&lastname=NoSuchFamily. | Status 200 and an empty array. |

## B. Date filters

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_IDS_04 | Filter by a checkin date before the booking checkin returns the booking | Medium | A booking with checkin 2031-05-10 and checkout 2031-05-20 | 1. Send GET /booking?lastname=<last>&checkin=2031-05-09. | The list contains the booking. |
| TC_IDS_05 | Filter by a checkin date after the booking checkin does not return the booking | Medium | A booking with checkin 2031-05-10 and checkout 2031-05-20 | 1. Send GET /booking?lastname=<last>&checkin=2031-05-11. | The list does not contain the booking. |
| TC_IDS_06 | Filter by the same checkin date returns the booking (>= rule) | Medium | A booking with checkin 2031-05-10 and checkout 2031-05-20 | 1. Send GET /booking?lastname=<last>&checkin=2031-05-10. | The list contains the booking (greater than or equal). Known defect D-01: the live API returns an empty list. |
| TC_IDS_07 | Filter by the same checkout date returns the booking | Medium | A booking with checkin 2031-05-10 and checkout 2031-05-20 | 1. Send GET /booking?lastname=<last>&checkout=2031-05-20. | The list contains the booking. |
| TC_IDS_08 | Filter by a checkout date before the booking checkout returns the booking (>= rule) | Medium | A booking with checkin 2031-05-10 and checkout 2031-05-20 | 1. Send GET /booking?lastname=<last>&checkout=2031-05-19. | The list contains the booking (greater than or equal). Known defect D-02: the live API filters with "<=" and returns an empty list. |
| TC_IDS_09 | Filter by a checkout date after the booking checkout does not return the booking (>= rule) | Medium | A booking with checkin 2031-05-10 and checkout 2031-05-20 | 1. Send GET /booking?lastname=<last>&checkout=2031-05-21. | The list does not contain the booking. Known defect D-02: the live API returns it. |
| TC_IDS_11 | An invalid date format is rejected with 500 | Low | None | 1. Send GET /booking?checkin=not-a-date. | Status 500 (the API does not answer 400). |

## Traceability

Every case is automated. The requirement is the item of the official API documentation.

| ID | Type | Test data | Automation | Spec file | Requirement |
| --- | --- | --- | --- | --- | --- |
| TC_IDS_01 | API / Functional | No filter | Automated | `tests/get-booking-ids.spec.ts` | API doc: GetBookingIds (GET /booking) |
| TC_IDS_02 | API / Functional | firstname Filtera, unique lastname | Automated | `tests/get-booking-ids.spec.ts` | API doc: GetBookingIds (GET /booking) |
| TC_IDS_03 | API / Functional | unique lastname | Automated | `tests/get-booking-ids.spec.ts` | API doc: GetBookingIds (GET /booking) |
| TC_IDS_10 | API / Negative | firstname NoSuchPerson, lastname NoSuchFamily | Automated | `tests/get-booking-ids.spec.ts` | API doc: GetBookingIds (GET /booking) |
| TC_IDS_04 | API / Boundary | checkin 2031-05-09 | Automated | `tests/get-booking-ids.spec.ts` | API doc: GetBookingIds (GET /booking) |
| TC_IDS_05 | API / Boundary | checkin 2031-05-11 | Automated | `tests/get-booking-ids.spec.ts` | API doc: GetBookingIds (GET /booking) |
| TC_IDS_06 | API / Boundary | checkin 2031-05-10 (equal date) | Automated | `tests/get-booking-ids.spec.ts` | API doc: GetBookingIds (GET /booking) |
| TC_IDS_07 | API / Boundary | checkout 2031-05-20 (equal date) | Automated | `tests/get-booking-ids.spec.ts` | API doc: GetBookingIds (GET /booking) |
| TC_IDS_08 | API / Boundary | checkout 2031-05-19 | Automated | `tests/get-booking-ids.spec.ts` | API doc: GetBookingIds (GET /booking) |
| TC_IDS_09 | API / Boundary | checkout 2031-05-21 | Automated | `tests/get-booking-ids.spec.ts` | API doc: GetBookingIds (GET /booking) |
| TC_IDS_11 | API / Negative / Validation | checkin not-a-date | Automated | `tests/get-booking-ids.spec.ts` | API doc: GetBookingIds (GET /booking) |

## Summary

| Cases | High priority | Automated |
| --- | --- | --- |
| 11 | 2 | 11 |
