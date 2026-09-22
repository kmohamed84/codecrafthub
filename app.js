const express = require('express');
const fs = require('node:fs/promises');
const path = require('node:path');

const app = express();
const PORT = 5000;
const COURSES_FILE = path.join(__dirname, 'courses.json');
const ALLOWED_STATUSES = ['Not Started', 'In Progress', 'Completed'];

// Parse JSON request bodies before the course routes handle them.
app.use(express.json());

// Create the JSON file the first time the application needs it.
async function ensureCoursesFile() {
  try {
    await fs.access(COURSES_FILE);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }

    await fs.writeFile(COURSES_FILE, '[]', 'utf8');
  }
}

// Read all courses from disk and make sure the file contains an array.
async function readCourses() {
  await ensureCoursesFile();
  const fileContents = await fs.readFile(COURSES_FILE, 'utf8');
  const courses = JSON.parse(fileContents);

  if (!Array.isArray(courses)) {
    throw new Error('courses.json must contain an array');
  }

  return courses;
}

// Save the complete course list with readable formatting for beginners.
async function writeCourses(courses) {
  await fs.writeFile(
    COURSES_FILE,
    JSON.stringify(courses, null, 2),
    'utf8'
  );
}

// Check that a date is both YYYY-MM-DD and a real calendar date.
function isValidTargetDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

// Return a list of validation messages for a course request body.
function validateCourse(course) {
  const errors = [];
  const requiredFields = ['name', 'description', 'target_date', 'status'];

  for (const field of requiredFields) {
    if (
      typeof course[field] !== 'string' ||
      course[field].trim().length === 0
    ) {
      errors.push(`${field} is required`);
    }
  }

  if (
    course.target_date !== undefined &&
    !isValidTargetDate(course.target_date)
  ) {
    errors.push('target_date must use the YYYY-MM-DD format');
  }

  if (
    course.status !== undefined &&
    !ALLOWED_STATUSES.includes(course.status)
  ) {
    errors.push(
      `status must be one of: ${ALLOWED_STATUSES.join(', ')}`
    );
  }

  return errors;
}

// Generate the next numeric ID, starting at 1 even when the file is empty.
function getNextId(courses) {
  const highestId = courses.reduce(
    (highest, course) =>
      Number.isInteger(course.id) && course.id > highest
        ? course.id
        : highest,
    0
  );

  return highestId + 1;
}

// Add a course to the collection.
app.post('/api/courses', async (req, res, next) => {
  const errors = validateCourse(req.body || {});

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  try {
    const courses = await readCourses();
    const course = {
      id: getNextId(courses),
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      target_date: req.body.target_date,
      status: req.body.status,
      created_at: new Date().toISOString()
    };

    courses.push(course);
    await writeCourses(courses);
    return res.status(201).json(course);
  } catch (error) {
    return next(error);
  }
});

// Return every course in the JSON file.
app.get('/api/courses', async (req, res, next) => {
  try {
    const courses = await readCourses();
    return res.json(courses);
  } catch (error) {
    return next(error);
  }
});

// Return the total number of courses and a count for each allowed status.
app.get('/api/courses/stats', async (req, res, next) => {
  try {
    const courses = await readCourses();
    const byStatus = Object.fromEntries(
      ALLOWED_STATUSES.map((status) => [status, 0])
    );

    for (const course of courses) {
      if (Object.prototype.hasOwnProperty.call(byStatus, course.status)) {
        byStatus[course.status] += 1;
      }
    }

    return res.json({
      total_courses: courses.length,
      by_status: byStatus
    });
  } catch (error) {
    return next(error);
  }
});

// Return one course by its numeric ID.
app.get('/api/courses/:id', async (req, res, next) => {
  try {
    const courses = await readCourses();
    const course = courses.find((item) => String(item.id) === req.params.id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    return res.json(course);
  } catch (error) {
    return next(error);
  }
});

// Update all editable fields while preserving the course ID and timestamp.
app.put('/api/courses/:id', async (req, res, next) => {
  const errors = validateCourse(req.body || {});

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  try {
    const courses = await readCourses();
    const courseIndex = courses.findIndex(
      (item) => String(item.id) === req.params.id
    );

    if (courseIndex === -1) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const updatedCourse = {
      ...courses[courseIndex],
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      target_date: req.body.target_date,
      status: req.body.status
    };

    courses[courseIndex] = updatedCourse;
    await writeCourses(courses);
    return res.json(updatedCourse);
  } catch (error) {
    return next(error);
  }
});

// Delete one course by its numeric ID.
app.delete('/api/courses/:id', async (req, res, next) => {
  try {
    const courses = await readCourses();
    const courseIndex = courses.findIndex(
      (item) => String(item.id) === req.params.id
    );

    if (courseIndex === -1) {
      return res.status(404).json({ error: 'Course not found' });
    }

    courses.splice(courseIndex, 1);
    await writeCourses(courses);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

// Convert malformed JSON request bodies into a useful client error.
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'Request body must contain valid JSON' });
  }

  return next(error);
});

// Handle file errors and unexpected failures without crashing the server.
app.use((error, req, res, next) => {
  console.error(error);
  return res.status(500).json({ error: 'Unable to access course data' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Course API is running on port ${PORT}`);
  });
}

module.exports = app;