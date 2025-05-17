const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');

// Dashboard Routes
router.get('/dashboard/student', dashboardController.studentDashboard);
router.get('/dashboard/instructor', dashboardController.instructorDashboard);

module.exports = router;
