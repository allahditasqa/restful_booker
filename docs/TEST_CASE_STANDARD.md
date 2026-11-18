# Test case standard

Every module uses the same format and structure, in simple English, so that anyone can read, run and trace a case.

## 1. Where things live

| Item | Location | Example |
| --- | --- | --- |
| Test case document (one per module / sub-module) | `docs/test-cases/<endpoint>.md` | `docs/test-cases/create-booking.md` |
| **Master CSV** (regression list, same columns for every module) | `docs/test-cases/<endpoint>.csv` | `docs/test-cases/create-booking.csv` |
| Automation | `tests/<endpoint>.spec.ts` | `tests/create-booking.spec.ts` |
| Run CSV (after each run: the cases of the module + the real result) | `reports/<module-slug>/<Module Name> test cases <DD-MM-YYYY>_<HH-mm-ss>.csv` | `reports/create-booking/Create Booking test cases 18-11-2026_12-37-58.csv` |
| Report (after each run, committed to the repository) | `reports/<module-slug>/<Module Name> test <DD-MM-YYYY>_<HH-mm-ss>.html` | `reports/create-booking/Create Booking test 18-11-2026_12-37-58.html` |
| History of all runs (newest on top) | `reports/index.html` and `reports/history.json` | |

One document = one spec file. One module = one report folder. Old reports are never overwritten (the time is part of the name).

## 2. Test case ID
`TC_<MODULE>_<NN>`, for example `TC_CREATE_01`. An ID is never reused. Data-driven cases may use `.1`, `.2` ...
The test title in code is `TC_CREATE_01 - <title>`, and the document row has the same ID and title.

## 3. Title rule
A title is one complete English sentence that says **what is done** and **which data is used**, for example:
`Creates a booking and echoes it with a new bookingid`.
It appears unchanged in the document, in the code, in the CSV and in the report.

## 4. What every document contains

The first lines name the module: ``**Module:** Create Booking | **Sub-module:** CreateBooking | **Spec:** `tests/create-booking.spec.ts```.
Then, in this order: Overview, Scope and notes, test case tables grouped by kind, a **Traceability** table and a Summary.

**Test case tables** (the columns never change):

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |

- **Priority:** `High` (core flow, the product is unusable if it fails), `Medium`, `Low` (cosmetic).
- **Steps:** short, numbered, action words: `1. Send the request. 2. Read the status.`
- **Expected result:** clear and checkable.

**Traceability table** (one row for every case):

| ID | Type | Test data | Automation | Spec file | Requirement |
| --- | --- | --- | --- | --- | --- |

- **Type:** Functional, Negative, Validation, Boundary, Security, Access control, API, E2E ... (a mix is allowed, for example `Negative / Validation`).
- **Test data:** the exact values used, or `None`. Public demo values only, never a real secret.
- **Automation:** `Automated`. Only cases that exist in code are documented.
- **Spec file:** the file whose test title starts with the ID.
- **Requirement:** the item of the official API documentation (https://restful-booker.herokuapp.com/apidoc/index.html), for example `API doc: CreateBooking (POST /booking)`.

## 5. Writing rules
1. Simple English, active voice.
2. One test case checks one thing.
3. Quote exact interface text or status codes.
4. Do not hard-code values that change; write the relationship ("the total equals the item total plus the tax").
5. A test case is never silently changed: update the document, run `npm run cases:csv`, review the diff.
6. Keep the cases independent: each one creates and cleans up its own data.

## 6. Master CSV and the traceability check
- The master CSV is generated from the documents: `npm run cases:csv`. Edit the document, never the CSV.
- Columns: Test Case ID, Module, Sub-module, Group, Title, Priority, Test Type, Preconditions, Test Steps, Test Data, Expected Result, Automation Status, Spec File, Requirement, Regression, Last Updated.
- Rows that did not change keep their `Last Updated` date, so the CSV shows what changed and when.
- `npm run cases:check` fails when documents, master CSV and code do not agree: a documented ID with no test, a test with no document, a duplicate ID, a different title, a wrong spec file, or a case without a traceability row. It runs in CI.

## 7. Known defects
A case that is written as the documentation says but fails because the live API differs is marked `test.fail()` in code, described in its
expected result ("Known defect D-01 ...") and logged in [DEFECTS.md](../DEFECTS.md). Reports show it as **known defect**. When the API is fixed the case
turns red ("defect no longer reproduces") and the mark is removed.
