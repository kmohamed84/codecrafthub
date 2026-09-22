# CodeCraftHub Test Strategy

## Purpose

Verify the Express CRUD API, input validation, JSON persistence, and error handling without corrupting the developer's course data.

## Test Levels

| Level | Role |
|---|---|
| Static checks | Catch syntax and implementation errors. |
| Unit checks | Verify date/status validation, ID generation, and storage rules. |
| Integration/API checks | Verify routes, status codes, response bodies, and persistence. |
| Smoke test | Start the real server on port 5000 and exercise one CRUD journey. |

## Test Isolation

- Use a temporary JSON file or directory for automated mutation tests.
- Do not modify the normal `courses.json` during automated tests.
- Remove temporary files after every suite.
- Do not run parallel mutation tests against the same JSON file.

## Validation Checks

- Accept complete payloads with `Not Started`, `In Progress`, and `Completed`.
- Reject missing or empty `name`, `description`, `target_date`, and `status`.
- Reject statuses outside the allowed list.
- Accept real dates in `YYYY-MM-DD` format.
- Reject impossible dates such as `2026-02-30` and other formats.

## API Contract Checks

| Scenario | Expected result |
|---|---|
| `GET /api/courses` with an empty file | `200` and `[]` |
| `GET /api/courses` with records | `200` and all records |
| `GET /api/courses/stats` | `200`, total course count, and counts for all three statuses |
| `GET /api/courses/:id` for an existing course | `200` and matching record |
| `GET /api/courses/:id` for an unknown ID | `404` |
| Valid `POST /api/courses` | `201`, generated ID, timestamp, and persisted record |
| Invalid `POST /api/courses` | `400`; file unchanged |
| Valid `PUT /api/courses/:id` | `200`, updated fields, original ID and timestamp |
| Unknown `PUT /api/courses/:id` | `404` |
| Invalid `PUT /api/courses/:id` | `400`; existing record unchanged |
| Valid `DELETE /api/courses/:id` | `204`; record removed |
| Unknown `DELETE /api/courses/:id` | `404` |
| Malformed JSON request | `400` |
| Storage read, parse, or write failure | `500` with an error response |

Express accepts the collection route with a trailing slash. Item routes require an ID, for example `/api/courses/1`.

## Smoke Test

Run `npm start`, then verify:

```text
POST /api/courses -> GET /api/courses -> GET /api/courses/1
-> PUT /api/courses/1 -> DELETE /api/courses/1
-> GET /api/courses/1 returns 404
```

The test must remove its created record and leave the development data file clean.

## Available Checks

```bash
node --check app.js
npm test
```

Additional API tests should use an HTTP client library or Node.js's built-in HTTP client and temporary storage.

## Definition of Done

- Every documented endpoint has success and failure coverage.
- Invalid input never causes a partial write.
- Mutations remain visible after a fresh file read.
- File and JSON errors return `500` without crashing the server.
- Tests pass repeatedly and leave no temporary artifacts.