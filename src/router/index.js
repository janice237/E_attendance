import { createRouter, createWebHistory } from 'vue-router'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Attendance from '../views/Attendance.vue'
import Analytics from '../views/Analytics.vue'
import StudentCourses from '../views/StudentCourses.vue';
import Courses from '../views/Courses.vue';
import StudentDashboard from '../views/StudentDashboard.vue';
import LecturerAttendance from '../views/LecturerAttendance.vue';
import StudentRecords from '../views/StudentRecords.vue';

const routes = [
  {
    path: '/',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/register',
    name: 'register-alias',
    component: RegisterView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/student-dashboard',
    name: 'StudentDashboard',
    component: StudentDashboard,
  },
  {
  path: '/dashboard',
  name: 'Dashboard',
  component: Dashboard,
},
{
  path: '/student-courses',
  name: 'StudentCourses',
  component: StudentCourses,
},
{
  path: '/course-management',
  name: 'Courses',
  component: Courses,
},
{
  path: '/attendance',
  name: 'Attendance',
  component: Attendance,
},
{
  path:'/record',
  name: 'Record',
  component: StudentRecords,
},
{
  path: '/analytics',
  name: 'Analytics',
  component: Analytics,
},
{
  path: '/lecturer-attendance',
  name: 'LecturerAttendance',
  component: LecturerAttendance,
},
{
  path: '/timetable',
  name: 'Timetable',
  component: () => import('../views/Timetable.vue'),
},
{
  path: '/admin-dashboard',
  name: 'AdminDashboard',
  component: () => import('../views/AdminDashboard.vue'),
},
{
  path: '/admin/classrooms',
  name: 'AdminClassrooms',
  component: () => import('../views/AdminClassrooms.vue'),
}
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
