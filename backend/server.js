// ...existing code...
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { sequelize, User, Attendance, Course, CatchupClass, Notification, CourseRegistration } = require('./models');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 3000;

const allowedOrigins = ['http://localhost:8080']; // Revert to only allow localhost frontend

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // if you’re using cookies or auth headers
}));


console.log('=== NFC Attendance Backend STARTED ===');

// Enable CORS for all routes
 app.use(cors()); // Removed duplicate CORS middleware to prevent override
// Use body-parser for urlencoded data (optional, for form submissions)
app.use(bodyParser.urlencoded({ extended: true }));
// Middleware to parse JSON
app.use(express.json());

// Log every incoming request (method and path)
app.use((req, res, next) => {
    console.log(`[INCOMING] ${req.method} ${req.originalUrl}`);
    next();
});

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
        // Generate a JWT token with id, username, and role
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, role: user.role, id: user.id }); // Return id as well
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
    // Validate input: require code, title, lecturer, credits, hours, location, classroom
    const requiredFields = ['code', 'title', 'lecturer', 'credits', 'hours', 'location', 'classroom'];
    for (const field of requiredFields) {
        if (!req.body[field] || (typeof req.body[field] === 'string' && req.body[field].trim() === '')) {
            return res.status(400).json({ error: `Course ${field} is required.` });
        }
    }
    try {
        // Convert startTime and endTime to UTC if provided (assume input is local time)
        if (req.body.startTime) {
            const [h, m] = req.body.startTime.split(':').map(Number);
            const d = new Date();
            d.setHours(h, m, 0, 0);
            req.body.startTime = d.toISOString().slice(11, 16); // UTC HH:MM
        }
        if (req.body.endTime) {
            const [h, m] = req.body.endTime.split(':').map(Number);
            const d = new Date();
            d.setHours(h, m, 0, 0);
            req.body.endTime = d.toISOString().slice(11, 16); // UTC HH:MM
        }
        // Convert days to UTC day names if provided
        if (req.body.days && Array.isArray(req.body.days)) {
            req.body.days = req.body.days.map(day => {
                // Convert local day to UTC day name
                const d = new Date();
                const currentDay = d.getDay();
                const targetDay = [
                    'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'
                ].indexOf(day);
                if (targetDay === -1) return day;
                // Adjust for UTC offset
                d.setDate(d.getDate() + (targetDay - currentDay));
                return d.toLocaleString('en-US', { weekday: 'long', timeZone: 'UTC' });
            });
        }
        const newCourse = await Course.create(req.body);
        res.status(201).json(newCourse);
    } catch (err) {
        console.error('Failed to create course:', err);
        res.status(500).json({ error: 'Failed to create course' });
    }
});

// UPDATE a course by ID in the database (Lecturer/Admin only)
app.put('/courses/:id', authenticateToken, authorizeRole(['lecturer', 'administrator']), async (req, res) => {
    const courseId = parseInt(req.params.id);
    try {
        // Update course fields (all updatable fields)
        const [updated] = await Course.update(req.body, { where: { id: courseId } });
        if (!updated) {
            return res.status(404).json({ error: 'Course not found' });
        }
        const updatedCourse = await Course.findByPk(courseId);
        res.json(updatedCourse);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update course' });
    }
});

// DELETE a course by ID from the database (Lecturer/Admin only)
app.delete('/courses/:id', authenticateToken, authorizeRole(['lecturer', 'administrator']), async (req, res) => {
    const courseId = parseInt(req.params.id);
    try {
        const deleted = await Course.destroy({ where: { id: courseId } });
        if (!deleted) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete course' });
    }
});
// Endpoint: Get all students registered for a course
app.get('/register-course/registered-students', authenticateToken, authorizeRole(['lecturer', 'administrator']), async (req, res) => {
    const courseId = req.query.courseId;
    if (!courseId) return res.status(400).json({ error: 'courseId is required' });
    try {
        const registrations = await CourseRegistration.findAll({
            where: { courseId },
            include: [{
                model: User,
                as: 'Student',
                attributes: ['username', 'id', 'role']
            }]
        });
        // Map to just student info
        const students = registrations.map(r => r.Student || { userId: r.userId });
        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch students for course.' });
    }
});

// CREATE a catchup class for a course (Lecturer/Admin only)
app.post('/courses/:id/catchup', authenticateToken, authorizeRole(['lecturer', 'administrator']), async (req, res) => {
    const courseId = parseInt(req.params.id);
    const { date, startTime, endTime, reason } = req.body;
    if (!date || !startTime || !endTime) {
        return res.status(400).json({ error: 'Date, startTime, and endTime are required for a catchup class.' });
    }
    try {
        const catchup = await CatchupClass.create({
            courseId,
            date,
            startTime,
            endTime,
            reason: reason || null
        });
        res.status(201).json(catchup);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create catchup class' });
    }
});

// UPDATE a catchup class by ID (Lecturer/Admin only)
app.put('/catchup/:id', authenticateToken, authorizeRole(['lecturer', 'administrator']), async (req, res) => {
    const catchupId = parseInt(req.params.id);
    try {
        // Update catchup class fields (all updatable fields)
        const [updated] = await CatchupClass.update(req.body, { where: { id: catchupId } });
        if (!updated) {
            return res.status(404).json({ error: 'Catchup class not found' });
        }
        const updatedCatchup = await CatchupClass.findByPk(catchupId);
        res.json(updatedCatchup);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update catchup class' });
    }
});

// DELETE a catchup class by ID (Lecturer/Admin only)
app.delete('/catchup/:id', authenticateToken, authorizeRole(['lecturer', 'administrator']), async (req, res) => {
    const catchupId = parseInt(req.params.id);
    try {
        const deleted = await CatchupClass.destroy({ where: { id: catchupId } });
        if (!deleted) {
            return res.status(404).json({ error: 'Catchup class not found' });
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete catchup class' });
    }
});

// Mark time-in for attendance (Student only)
app.post('/attendance/in', authenticateToken, async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user.id;
    try {
        // Always use UTC for timeIn
        const record = await Attendance.create({
            courseId,
            userId,
            timeIn: new Date().toISOString(), // UTC
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
    const { courseId } = req.body;
    const userId = req.user.id;
    try {
        // Find the active attendance record for the user and course
        const record = await Attendance.findOne({
            where: { userId, courseId, timeOut: null }
        });
        if (!record) {
            return res.status(404).json({ error: 'No active attendance found' });
        }
        // Set timeOut and calculate duration in minutes (all in UTC)
        record.timeOut = new Date().toISOString(); // UTC
        record.duration = Math.round((new Date(record.timeOut) - new Date(record.timeIn)) / 60000);
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
    if (req.user.role === 'student' && req.user.id !== parseInt(userId)) {
        return res.status(403).json({ error: 'Forbidden: Students can only view their own attendance records.' });
    }
    try {
        // Fetch attendance records for the user and course
        const records = await Attendance.findAll({
            where: { userId: parseInt(userId), courseId: parseInt(courseId) }
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
            const studentRecords = await Attendance.findAll({ where: { userId: req.user.id } });
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
    const userId = req.user.id;
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
    const userId = req.user.id;
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

// Get all course registrations for the current student
app.get('/register-course/registered', authenticateToken, authorizeRole(['student']), async (req, res) => {
    // Support both ?userId=... and authenticated user
    const userId = req.query.userId ? parseInt(req.query.userId) : req.user.id;
    try {
        const registrations = await CourseRegistration.findAll({
            where: { userId },
            include: [{
                model: Course,
                as: 'Course',
                attributes: [
                  'id', 'title', 'code', 'hours', 'totalHours', 'days',
                  'classroom', 'startTime', 'endTime', 'lecturer'
                ]
            }]
        });
        res.json(registrations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch registered courses.' });
    }
});

// POST endpoint to resolve which class is happening in a hall right now
app.post('/resolve-class', authenticateToken, authorizeRole(['student']), async (req, res) => {
    console.log('[DEBUG] /resolve-class called');
    console.log('[DEBUG] Auth user:', req.user);
    console.log('[DEBUG] Request body:', req.body);
    const { hallName } = req.body;
    if (!hallName) {
        console.log('[DEBUG] No hallName provided');
        return res.status(400).json({ error: 'Hall name is required.' });
    }
    try {
        // Always use UTC for time comparison
        const now = new Date(); // UTC
        const dayOfWeek = now.toLocaleString('en-US', { weekday: 'long', timeZone: 'UTC' });
        const currentTime = now.toISOString().slice(11, 16); // 'HH:MM' in UTC
        console.log(`[DEBUG] UTC dayOfWeek: ${dayOfWeek}, currentTime: ${currentTime}`);
        // Find a course with matching classroom, day, and time
        const courses = await Course.findAll({ where: { classroom: hallName } });
        console.log(`[DEBUG] Found ${courses.length} courses for classroom ${hallName}`);
        for (const course of courses) {
            console.log(`[DEBUG] Checking course ${course.id}: days=${course.days}, startTime=${course.startTime}, endTime=${course.endTime}`);
            if (course.days && course.days.includes(dayOfWeek)) {
                // Parse startTime and endTime as UTC
                const startTime = course.startTime ? course.startTime.slice(0,5) : null;
                const endTime = course.endTime ? course.endTime.slice(0,5) : null;
                if (startTime && endTime && currentTime >= startTime && currentTime <= endTime) {
                    console.log(`[DEBUG] Matched course ${course.id}`);
                    return res.json({ courseId: course.id });
                }
            }
        }
        console.log('[DEBUG] No class found for this hall at this time.');
        return res.status(404).json({ error: 'No class found for this hall at this time.' });
    } catch (err) {
        console.error('[ERROR] Failed to resolve class for hall:', err);
        res.status(500).json({ error: 'Failed to resolve class for hall.' });
    }
});

//nfc-route
app.post('/nfc/attendance', authenticateToken, authorizeRole(['student']), async (req, res) => {
    const { hallName } = req.body;
    const userId = req.user.id;

    if (!hallName) return res.status(400).json({ error: 'Hall name is required.' });

    try {
        const now = new Date();
        const dayOfWeek = now.toLocaleString('en-US', { weekday: 'long' });
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM

        // Normalize hallName for case-insensitive comparison
        const normalizedHallName = hallName.trim().toLowerCase();
        // Fetch all courses and match classroom in a robust way
        const courses = await Course.findAll();
        let activeCourse = null;

        for (const course of courses) {
            if (
                course.classroom &&
                course.classroom.trim().toLowerCase() === normalizedHallName &&
                course.days &&
                course.days.includes(dayOfWeek)
            ) {
                if (
                    course.startTime &&
                    course.endTime &&
                    currentTime >= course.startTime.slice(0, 5) &&
                    currentTime <= course.endTime.slice(0, 5)
                ) {
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
            // Calculate how many minutes late
            const className = activeCourse.name || activeCourse.title || 'this course';
            const classEndTime = new Date();
            classEndTime.setHours(endHour, endMinute, 0, 0);
            const minutesLate = Math.abs(minutesToEnd);
            return res.status(403).json({ 
                error: `${minutesLate} minutes late to take attendance for ${className}.` 
            });
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

// Health check endpoint for debugging
app.get('/test-alive', (req, res) => {
    res.json({ status: 'alive', time: new Date().toISOString() });
});

// Catch-all 404 handler for unknown routes
app.use((req, res, next) => {
    console.log(`[404] Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});