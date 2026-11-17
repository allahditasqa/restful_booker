# Defect Log

Differences between the Restful-Booker documentation and the live API (https://restful-booker.herokuapp.com), found while running this suite. Checked on 2026-11-17.

Each defect has a test marked `test.fail()`. The test passes while the defect exists and fails when the API is fixed, which tells you to remove the mark.

## D-01: checkin filter does not include equal dates

- **Endpoint:** `GET /booking?checkin=<date>`
- **Documentation:** "Return bookings that have a checkin date greater than or equal to the set checkin date."
- **Steps:** create a booking with checkin `2031-05-10`, then call `GET /booking?lastname=<name>&checkin=2031-05-10`.
- **Expected:** the booking is in the list (equal date).
- **Actual:** empty list. `checkin=2031-05-09` does return it, so the filter behaves like "greater than".
- **Test:** `TC_IDS_06`
- **Severity:** Low

## D-02: checkout filter works in the opposite direction

- **Endpoint:** `GET /booking?checkout=<date>`
- **Documentation:** "Return bookings that have a checkout date greater than or equal to the set checkout date."
- **Steps:** create a booking with checkout `2031-05-20`, then filter by `checkout=2031-05-19` and `checkout=2031-05-21`.
- **Expected:** found with `2031-05-19`, not found with `2031-05-21`.
- **Actual:** not found with `2031-05-19`, found with `2031-05-21`. The filter behaves like "less than or equal".
- **Tests:** `TC_IDS_08`, `TC_IDS_09`
- **Severity:** Medium (the filter returns the wrong bookings)

## D-03: XML response has the wrong Content-Type

- **Endpoint:** `GET /booking/:id` with `Accept: application/xml`
- **Documentation:** the response format can be `application/xml`.
- **Expected:** `Content-Type` contains `xml`.
- **Actual:** the body is valid XML, but the header is `text/html; charset=utf-8`.
- **Test:** `TC_GET_06`
- **Severity:** Low

## Observations (not defects, covered by passing tests)

- Wrong credentials on `POST /auth` answer **200** with `{"reason":"Bad credentials"}`, not 401.
- `PUT`, `PATCH` and `DELETE` on an id that does not exist answer **405**, not 404.
- Missing required fields or an invalid date format answer **500**, not 400.
- `GET /ping`, a successful `DELETE` answer **201 Created**.
