# CodeCraftHub Project Requirements

CodeCraftHub is a simple personalized learning platform for developers. It helps a developer track courses they want to learn and their progress toward a target date.

## Goals

- Build a beginner-friendly REST API with Node.js and Express.
- Store all course data in a local JSON file named `courses.json`.
- Avoid a database, authentication, and user management.
- Practice create, read, update, and delete operations.

## Node.js Package

The project package must use these metadata values:

| Property | Value |
|---|---|
| `name` | `codecrafthub` |
| `version` | `1.0.0` |
| `description` | `Personal learning goal tracker API` |
| `start` script | `node app.js` |
| Runtime dependency | `express` |

## Application Structure

```text
codecrafthub/
├── app.js             # Express application and route handlers
├── courses.json       # Local course records; created automatically if missing
├── package.json
├── CHANGELOG.md       # Release history
└── README.md
```

## Course Data Model

Each course must contain these fields:

| Field | Type | Required | Description |
|---|---|---:|---|
| `id` | number | Generated | Numeric unique identifier starting at 1 |
| `name` | string | Yes | Course name |
| `description` | string | Yes | Explanation of what the course covers |
| `target_date` | string | Yes | Real date in `YYYY-MM-DD` format |
| `status` | string | Yes | `Not Started`, `In Progress`, or `Completed` |
| `created_at` | string | Generated | ISO timestamp created by the server |

## REST API Endpoints

The server listens on port `5000` and exposes these routes:

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/courses` | Add a new course |
| `GET` | `/api/courses` | Return all courses |
| `GET` | `/api/courses/stats` | Return total and status statistics |
| `GET` | `/api/courses/:id` | Return one course by ID |
| `PUT` | `/api/courses/:id` | Update a course by ID |
| `DELETE` | `/api/courses/:id` | Delete a course by ID |

`POST` and `PUT` require `name`, `description`, `target_date`, and `status`. The server rejects missing fields, invalid dates, and values outside the three allowed statuses.

The statistics endpoint returns `total_courses` and a `by_status` object containing counts for `Not Started`, `In Progress`, and `Completed`.

## API Behavior

- Return JSON for successful reads, creates, updates, and errors.
- Return `201 Created` after a successful create.
- Return `200 OK` after successful reads and updates.
- Return `204 No Content` after a successful delete.
- Return `400 Bad Request` for missing fields, invalid status/date values, and malformed JSON.
- Return `404 Not Found` when a course ID does not exist.
- Return `500 Internal Server Error` for file read, JSON parse, file write, or unexpected application errors.

## JSON Storage

`courses.json` contains a top-level array. The application creates it with `[]` when missing, reads it with `fs/promises` and `JSON.parse()`, changes the array in memory, and writes formatted JSON with `JSON.stringify(courses, null, 2)`. Invalid JSON and non-array contents are reported as server errors.