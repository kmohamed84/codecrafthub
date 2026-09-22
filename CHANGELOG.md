# Changelog

All notable changes to CodeCraftHub are documented here.

## [1.0.0] - 2026-09-22

### Added

- Express REST API for managing learning courses.
- `POST /api/courses` to create a course.
- `GET /api/courses` to list all courses.
- `GET /api/courses/:id` to retrieve one course.
- `GET /api/courses/stats` to return total and per-status course counts.
- `PUT /api/courses/:id` to update a course.
- `DELETE /api/courses/:id` to delete a course.
- Numeric course IDs generated starting at 1.
- Automatic `created_at` ISO timestamps.
- Validation for required fields, `YYYY-MM-DD` target dates, and supported statuses.
- Automatic creation of `courses.json` when it does not exist.
- JSON file persistence with error handling for read, parse, and write failures.
- Beginner-friendly README documentation with API examples and troubleshooting guidance.

### Statistics Request Example

Request:

```bash
curl http://localhost:5000/api/courses/stats
```

Response:

```json
{
	"total_courses": 2,
	"by_status": {
		"Not Started": 2,
		"In Progress": 0,
		"Completed": 0
	}
}
```

### Configuration

- Package name: `codecrafthub`.
- Package version: `1.0.0`.
- Server port: `5000`.
- Runtime dependency: Express.
