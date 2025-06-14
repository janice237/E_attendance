const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { sequelize, User, Attendance, Course, CatchupClass, Notification, CourseRegistration } = require('./models');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 3000;



// Enable CORS for all routes
app.use(cors());
// Use body-parser for urlencoded data (optional, for form submissions)
app.use(bodyParser.urlencoded({ extended: true }));
// Middleware to parse JSON
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('NFC Attendance System Server(API) is running!');
});

let users = [];

// User registration route (now uses the database)
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ error: 'Username, password, and role are required.' });
    }
    if (!['student', 'lecturer', 'administrator'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(409).json({ error: 'Username already exists' });
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create user in the database
        await User.create({ username, password: hashedPassword, role });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Registration error:', err); // Log the actual error for debugging
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// User login route (now uses the database)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }
    try {
        // Find user in the database
        const user = await User.findOne({ where: { username } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Generate a JWT token with username and role
        const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, role: user.role }); // <-- Return the role in the response
    } catch (err) {
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]; // Get token from Authorization header
    if (!token) return res.sendStatus(401); // Respond with 401 if no token

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Respond with 403 if token is invalid
        req.user = user; // Attach user info to request
        next(); // Proceed to the next middleware or route handler
    });
};

// Middleware to authorize roles
const authorizeRole = (roles) => {
    return (req, res, next) => {
        const userRole = req.user.role; // Get user's role from token
        if (!roles.includes(userRole)) {
            return res.status(403).json({ error: 'Forbidden' }); // User does not have permission
        }
        next(); // User has permission, proceed to next middleware
    };
};

// Protected route example
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user }); // Respond with user info
});

// GET all courses from the database (public, no auth required)
app.get('/public-courses', async (req, res) => {
    try {
        const courses = await Course.findAll();
        res.json(courses);
    } catch (err) {
        console.error('Error fetching courses:', err);
        res.status(500).json({ error: 'Failed to fetch courses from the database.' });
    }
});

// GET all courses from the database
app.get('/courses', authenticateToken, async (req, res) => {
    try {
        // Fetch all courses using Sequelize (all fields)
        const courses = await Course.findAll();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

// POST a new course to the database (Lecturer/Admin only)
app.post('/courses', authenticateToken, authorizeRole(['lecturer', 'administrator']), async (req, res) => {
    // Validate input
    if (!req.body.classroom || typeof req.body.classroom !== 'string') {
        return res.status(400).json({ error: 'Course classroom is required and must be a string.' });
    }
    try {
        // Insert new course and return the created row
        const [result] = await sequelize.query(
            'INSERT INTO "Courses" (classroom, createdAt, updatedAt) VALUES (:classroom, NOW(), NOW()) RETURNING *',
            { replacements: { classroom: req.body.classroom }, type: sequelize.QueryTypes.INSERT }
        );
        res.status(201).json(result[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create course' });
    }
});

// UPDATE a course by ID in the database (Lecturer/Admin only)
app.put('/courses/:id', authenticateToken, authorizeRole(['lecturer', 'administrator']), async (req, res) => {
    const courseId = parseInt(req.params.id);
    // Validate input
    if (!req.body.classroom || typeof req.body.classroom !== 'string') {
        return res.status(400).json({ error: 'Course classroom is required and must be a string.' });
    }
    try {
        // Update course and return the updated row
        const [result] = await sequelize.query(
            'UPDATE "Courses" SET classroom = :classroom, updatedAt = NOW() WHERE id = :id RETURNING *',
            { replacements: { id: courseId, classroom: req.body.classroom }, type: sequelize.QueryTypes.UPDATE }
        );
        if (!result[0]) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json(result[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update course' });
    }
});

// DELETE a course by ID from the database (Lecturer/Admin only)
app.delete('/courses/:id', authenticateToken, authorizeRole(['lecturer', 'administrator']), async (req, res) => {
    const courseId = parseInt(req.params.id);
    try {
        // Delete course and return the deleted row
        const [result] = await sequelize.query(
            'DELETE FROM "Courses" WHERE id = :id RETURNING *',
            { replacements: { id: courseId }, type: sequelize.QueryTypes.DELETE }
        );
        if (!result[0]) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete course' });
    }
});

// Mark time-in for attendance (Student only)
app.post('/attendance/in', authenticateToken, async (req, res) => {
    const { courseId, userId } = req.body;
    try {
        // Create a new attendance record
        const record = await Attendance.create({
            courseId,
            userId,
            timeIn: new Date(),
            timeOut: null,
            duration: null
        });
        res.status(201).json({ message: 'Time in marked', record });
    } catch (err) {
        res.status(500).json({ error: 'Failed to mark time in' });
    }
});

// Mark time-out for attendance (Student only)
app.post('/attendance/out', authenticateToken, async (req, res) => {
    const { courseId, userId } = req.body;
    try {
        // Find the active attendance record for the user and course
        const record = await Attendance.findOne({
            where: { userId, courseId, timeOut: null }
        });
        if (!record) {
            return res.status(404).json({ error: 'No active attendance found' });
        }
        // Set timeOut and calculate duration in minutes
        record.timeOut = new Date();
        record.duration = Math.round((record.timeOut - record.timeIn) / 60000);
        await record.save();
        res.json({ message: 'Time out marked', record });
    } catch (err) {
        res.status(500).json({ error: 'Failed to mark time out' });
    }
});

// Get attendance records for a specific user and course
app.get('/attendance/:userId/:courseId', authenticateToken, async (req, res) => {
    const { userId, courseId } = req.params;
    // Students can only view their own attendance records
    if (req.user.role === 'student' && req.user.username !== userId) {
        return res.status(403).json({ error: 'Forbidden: Students can only view their own attendance records.' });
    }
    try {
        // Fetch attendance records for the user and course
        const records = await Attendance.findAll({
            where: { userId, courseId: parseInt(courseId) }
        });
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch attendance records' });
    }
});

// Get all attendance records (Lecturer/Admin can see all, Student only their own)
app.get('/attendance', authenticateToken, async (req, res) => {
    try {
        if (req.user.role === 'lecturer' || req.user.role === 'administrator') {
            // Lecturers and administrators see all records
            const records = await Attendance.findAll();
            return res.json(records);
        } else if (req.user.role === 'student') {
            // Students see only their own records
            const studentRecords = await Attendance.findAll({ where: { userId: req.user.username } });
            return res.json(studentRecords);
        } else {
            return res.status(403).json({ error: 'Forbidden' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch attendance records' });
    }
});

// Get all users (Admin only)
app.get('/users', authenticateToken, authorizeRole(['administrator']), async (req, res) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password'] } });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Unregister a student from a course
app.delete('/register-course', authenticateToken, authorizeRole(['student']), async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user.username;
    try {
        const registration = await CourseRegistration.findOne({ where: { userId, courseId } });
        if (!registration) return res.status(404).json({ error: 'Not registered for this course.' });
        await registration.destroy();
        res.json({ message: 'Unregistered from course.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to unregister from course.' });
    }
});

// Register a student for a course
app.post('/register-course', authenticateToken, authorizeRole(['student']), async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user.username;
    if (!courseId) {
        return res.status(400).json({ error: 'Course ID is required.' });
    }
    try {
        // Check if course exists
        const course = await Course.findByPk(courseId);
        if (!course) return res.status(404).json({ error: 'Course not found.' });
        // Check if already registered
        const exists = await CourseRegistration.findOne({ where: { userId, courseId } });
        if (exists) return res.status(409).json({ error: 'Already registered for this course.' });
        // Register
        await CourseRegistration.create({ userId, courseId });
        res.status(201).json({ message: 'Registered for course.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to register for course.' });
    }
});

// POST endpoint to resolve which class is happening in a hall right now
app.post('/resolve-class', authenticateToken, authorizeRole(['student']), async (req, res) => {
    const { hallName } = req.body;
    if (!hallName) return res.status(400).json({ error: 'Hall name is required.' });
    try {
        // Find the course scheduled for this hall at the current time
        const now = new Date();
        const dayOfWeek = now.toLocaleString('en-US', { weekday: 'long' });
        const currentTime = now.toTimeString().slice(0, 5); // 'HH:MM'
        // Find a course with matching location, day, and time
        const courses = await Course.findAll({ where: { location: hallName } });
        for (const course of courses) {
            if (course.days && course.days.includes(dayOfWeek)) {
                // Check if current time is within course start and end time
                if (course.startTime && course.endTime &&
                    currentTime >= course.startTime.slice(0,5) && currentTime <= course.endTime.slice(0,5)) {
                    return res.json({ courseId: course.id });
                }
            }
        }
        return res.status(404).json({ error: 'No class found for this hall at this time.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to resolve class for hall.' });
    }
});

//nfc-route
app.post('/nfc/attendance', authenticateToken, authorizeRole(['student']), async (req, res) => {
    const { hallName } = req.body;
    const userId = req.user.username;

    if (!hallName) return res.status(400).json({ error: 'Hall name is required.' });

    try {
        const now = new Date();
        const dayOfWeek = now.toLocaleString('en-US', { weekday: 'long' });
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM

        // Find the course in the hall at the current time
        const courses = await Course.findAll({ where: { location: hallName } });
        let activeCourse = null;

        for (const course of courses) {
            if (course.days && course.days.includes(dayOfWeek)) {
                if (course.startTime && course.endTime &&
                    currentTime >= course.startTime.slice(0, 5) &&
                    currentTime <= course.endTime.slice(0, 5)) {
                    activeCourse = course;
                    break;
                }
            }
        }

        if (!activeCourse) {
            return res.status(404).json({ error: 'No active class in this hall right now.' });
        }

        // Minimum duration enforcement
        const classEnd = new Date();
        const [endHour, endMinute] = activeCourse.endTime.split(':').map(Number);
        classEnd.setHours(endHour, endMinute, 0, 0);

        const minutesToEnd = Math.floor((classEnd - now) / 60000);

        if (minutesToEnd < 20) {
            return res.status(403).json({ error: 'Too late to take attendance.' });
        }

        // Check for an existing open attendance record
        const existing = await Attendance.findOne({
            where: { userId, courseId: activeCourse.id, timeOut: null }
        });

        if (!existing) {
            // Mark time-in
            const newRecord = await Attendance.create({
                userId,
                courseId: activeCourse.id,
                timeIn: now,
                timeOut: null,
                duration: null
            });
            return res.status(201).json({ message: 'Time-in recorded', status: 'IN', record: newRecord });
        } else {
            // Mark time-out and calculate duration
            existing.timeOut = now;
            existing.duration = Math.round((now - existing.timeIn) / 60000);
            await existing.save();
            return res.json({ message: 'Time-out recorded', status: 'OUT', record: existing });
        }
    } catch (err) {
        console.error('NFC attendance error:', err);
        res.status(500).json({ error: 'An error occurred while recording attendance.' });
    }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});