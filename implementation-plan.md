# CodeCraftHub Implementation Plan

## Scope

Build and verify a beginner-friendly Node.js and Express API that manages courses in a local `courses.json` file. The release includes CRUD operations, validation, persistence, and clear errors. It does not include a frontend, authentication, users, database, or external integrations.

## Implementation Decisions

- Use Node.js 20 or newer, CommonJS, and a single `app.js` entry point.
- Use Express and Node.js `fs/promises`.
- Publish the package as `codecrafthub` version `1.0.0` with description `Personal learning goal tracker API`.
- Keep the `start` script as `node app.js` and declare Express as a runtime dependency.
- Store records in root-level `courses.json`.
- Use numeric IDs starting at 1 and generate `created_at` as an ISO timestamp.
- Treat `PUT` as a full replacement of editable fields while preserving `id` and `created_at`.
- Return `204 No Content` after a successful delete.
- Listen on port `5000`.
- Use `/api/courses` without a version prefix.

## Required Contract

Create and update requests must include non-empty `name`, `description`, `target_date`, and `status`. `target_date` must be a real `YYYY-MM-DD` date. `status` must be exactly `Not Started`, `In Progress`, or `Completed`. Stored courses also contain generated numeric `id` and ISO `created_at` fields.

## Implementation Steps

1. **Project setup:** configure Express, `npm start`, `npm run dev`, and `npm test` in `package.json`.
2. **JSON storage:** create missing `courses.json` with `[]`; read, parse, validate the array, and write formatted JSON.
3. **Validation:** reject missing or whitespace-only fields, invalid dates, and invalid statuses.
4. **Course operations:** generate IDs, create records, find by ID, update while preserving generated fields, and delete.
5. **Routes:** implement `POST /api/courses`, `GET /api/courses`, `GET /api/courses/stats`, `GET /api/courses/:id`, `PUT /api/courses/:id`, and `DELETE /api/courses/:id`.
6. **Error handling:** return `400` for invalid input, `404` for missing IDs, and `500` for storage or unexpected failures.
7. **Verification:** run syntax checks, tests, and a live CRUD smoke sequence on port 5000.
8. **Documentation:** keep `README.md` current with the project overview, features, installation, startup, endpoint examples, and troubleshooting guidance; record releases in `CHANGELOG.md`.

## Completion Criteria

The implementation is complete when all required routes and fields, including course statistics, work as documented, `courses.json` is created automatically, errors return the documented status codes, the server runs on port 5000, `README.md` and `CHANGELOG.md` provide current project documentation, and the checks pass without modifying unrelated data.