<template>
  <v-container fluid>
    <v-app-bar app color="white" flat>
      <v-btn icon @click="$router.back()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title> My Course Attendance Records</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="error" class="ml-2" @click="logout">
        <v-icon left>mdi-logout</v-icon>Logout
      </v-btn>
    </v-app-bar>
    <v-row class="mb-4" v-if="courses.length">
      <v-col v-for="course in courses" :key="course.id" cols="auto">
        <v-btn color="primary" @click="selectCourse(course)">
          {{ course.title || course.code }}
        </v-btn>
      </v-col>
    </v-row>
    <v-alert type="info" v-else>
      <span v-if="fetchError">{{ fetchError }}</span>
      <span v-else>No courses found. Create a course to get started.</span>
    </v-alert>
    <v-row v-if="selectedCourse">
      <v-col cols="12">
        <h3>Registered Students for {{ selectedCourse.title || selectedCourse.code }}</h3>
        <v-alert v-if="students.length === 0" type="info">No students registered for this course.</v-alert>
        <v-list v-else>
          <!-- PATCH: Show attendance percentage next to student name -->
          <v-list-item v-for="student in students" :key="student.id || student.userId">
            <v-list-item-content>
              <v-list-item-title>
                {{ student.username || student.id || student.userId || 'Unknown' }}
                <span v-if="typeof student.attendance === 'number'"> — Attendance: {{ student.attendance }}%</span>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbar" :timeout="2000">{{ snackbarText }}</v-snackbar>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: 'LecturerAttendance',
  data() {
    return {
      courses: [],
      selectedCourse: null,
      students: [],
      snackbar: false,
      snackbarText: '',
      fetchError: '',
    };
  },
  methods: {
    async fetchCourses() {
      console.log('[LecturerAttendance] Component mounted, fetching courses...');
      try {
        const token = this.$store.state.user.token;
        if (!token) {
          this.fetchError = 'No authentication token found.';
          console.error('[LecturerAttendance] No token in store.');
          return;
        }
        const apiUrl=import.meta.env.VITE_API_URL;
        const response = await axios.get(`${apiUrl}/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('[LecturerAttendance] /courses API response:', response.data);
        this.courses = response.data;
        if (!this.courses.length) {
          this.fetchError = 'No courses found for this lecturer.';
        }
      } catch (error) {
        this.fetchError = 'Failed to fetch courses: ' + (error.response?.data?.error || error.message);
        this.snackbarText = this.fetchError;
        this.snackbar = true;
        console.error('[LecturerAttendance] Error fetching courses:', error);
      }
    },
    async selectCourse(course) {
      this.selectedCourse = course;
      this.students = [];
      const token = this.$store.state.user.token;
      if (!token || !course.id) return;
      try {
        const apiUrl=import.meta.env.VITE_API_URL;
        const res = await axios.get(`${apiUrl}/register-course/registered-students?courseId=${encodeURIComponent(course.id)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(res.data)) {
          this.students = res.data;
        } else {
          this.students = [];
        }
      } catch (e) {
        this.students = [];
        this.snackbarText = 'Failed to fetch students for this course.';
        this.snackbar = true;
      }
    },
    logout() {
      this.$store.dispatch('logout');
      this.$router.push('/login');
    },
  },
  mounted() {
    console.log('[LecturerAttendance] mounted() called');
    this.fetchCourses();
  },
};
</script>

<style scoped>
.v-btn {
  min-width: 120px;
}
.v-card-title {
  font-weight: bold;
}
</style>
