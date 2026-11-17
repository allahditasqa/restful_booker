# Restful-Booker API Test Automation (Playwright + TypeScript)

An API test suite for the public [Restful-Booker](https://restful-booker.herokuapp.com/apidoc/index.html) playground API. Every endpoint in the official API documentation is covered with positive, negative, authorization and data-integrity cases. The suite found three places where the live API does not match its own documentation (see [DEFECTS.md](DEFECTS.md)).

**54 test cases · 8 endpoints · runs in about 30 seconds · no browser needed**

## Coverage

| Endpoint | Method | Spec file | Cases |
|---|---|---|---|
| `/ping` (HealthCheck) | GET | `tests/ping.spec.ts` | 1 |
| `/auth` (CreateToken) | POST | `tests/auth.spec.ts` | 5 |
| `/booking` (GetBookingIds + filters) | GET | `tests/get-booking-ids.spec.ts` | 11 |
| `/booking/:id` (GetBooking) | GET | `tests/get-booking.spec.ts` | 6 |
| `/booking` (CreateBooking, JSON and XML) | POST | `tests/create-booking.spec.ts` | 8 |
| `/booking/:id` (UpdateBooking) | PUT | `tests/update-booking.spec.ts` | 7 |
| `/booking/:id` (PartialUpdateBooking) | PATCH | `tests/partial-update-booking.spec.ts` | 8 |
| `/booking/:id` (DeleteBooking) | DELETE | `tests/delete-booking.spec.ts` | 8 |

What is checked:

- **Status codes and bodies** against the documentation, including field types and the echoed data.
- **Authorization:** token cookie, Basic auth, no auth, invalid token (the API answers 403).
- **Data integrity:** create → read back, update → read back, delete → 404, rejected update leaves the data unchanged.
- **Filters:** firstname, lastname, checkin, checkout, no match, invalid date.
- **Formats:** JSON and XML (`Accept` and `Content-Type`).
- **Negative cases:** missing fields (500), unknown id (404 on read, 405 on write), wrong credentials (`Bad credentials`).

## Known defects

Four cases are written as the documentation says but the live API behaves differently. They are marked with `test.fail()`: they pass while the defect exists and turn red the day the API is fixed. Details are in [DEFECTS.md](DEFECTS.md).

| ID | Case | Problem |
|---|---|---|
| D-01 | TC_IDS_06 | `checkin` filter does not include a booking with the same date |
| D-02 | TC_IDS_08, TC_IDS_09 | `checkout` filter works as "<=" instead of ">=" |
| D-03 | TC_GET_06 | XML response is sent with `Content-Type: text/html` |

## Design

```
tests/*.spec.ts        WHAT is checked (steps and assertions only)
tests/fixtures.ts      gives every test a ready `api` client
src/api/booking-api.ts HOW to call the API (URLs, headers, auth modes)
src/data/booking-data.ts  test data builders, admin credentials
```

- Tests never build URLs or headers themselves. One client class owns them.
- Each test creates its own booking with a unique last name, so tests are independent and can run in parallel.
- Every test deletes what it created, to keep the shared demo server clean.
- The public server is shared, so CI uses retries. Local runs retry once.

## Run it

Prerequisite: Node.js 20 or newer.

```bash
git clone https://github.com/allahditasqa/restful_booker.git
cd restful_booker
npm install
npm test
```

| Goal | Command |
|---|---|
| Run everything | `npm test` |
| One endpoint | `npm run test:auth` · `test:get` · `test:create` · `test:update` · `test:delete` · `test:ping` |
| Open the HTML report | `npm run report` |
| Type check | `npm run typecheck` |
| Another host | `BASE_URL=https://your-host npm test` |

## CI

`.github/workflows/ci.yml` runs the type check and the whole suite on every push and pull request, and uploads the HTML report as an artifact.

## Note

The API is a public playground that is reset regularly, so tests create their own data instead of relying on existing bookings.
