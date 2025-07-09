<template>
  <v-container fluid>
    <v-app-bar app color="white" flat>
      <v-btn icon @click="$router.push('/student-dashboard')">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>Available Courses</v-toolbar-title>
    </v-app-bar>
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="search"
          label="Search for courses"
          append-icon="mdi-magnify"
          @input="filterCourses"
        />
        <v-data-table
          :headers="headers"
          :items="filteredCourses"
          :search="search"
          class="elevation-1"
          item-key="id"
        >
          <template #item="{ item }">
            <tr>
              <td>{{ item.code }}</td>
              <td>{{ item.title }}</td>
              <td>{{ item.lecturer }}</td>
              <td>{{ item.description }}</td>
              <td>{{ item.credits }}</td>
              <td>{{ item.hours }}</td>
              <td>{{ item.location }}</td>
              <!-- PATCH: Show attendance percentage if registered -->
              <td>
                <span v-if="item.registered">{{ item.attendance }}</span>
                <span v-else>-</span>
              </td>
              <td>
                <v-btn v-if="!item.registered" color="primary" @click="registerCourse(item)">
                  Register
                </v-btn>
                <v-btn v-else color="error" @click="unregisterCourse(item)">
                  Unregister
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbar" :timeout="2000">{{ snackbarText }}</v-snackbar>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: 'StudentCourses',
  data() {
    return {
      search: '',
      courses: [],
      filteredCourses: [],
      snackbar: false,
      snackbarText: '',
      headers: [
        { text: 'Course Code', value: 'code' },
        { text: 'Course Title', value: 'title' },
        { text: 'Lecturer', value: 'lecturer' },
        { text: 'Description', value: 'description' },
        { text: 'Credits', value: 'credits' },
        { text: 'Hours', value: 'hours' },
        { text: 'Location', value: 'location' },
        { text: 'Attendance', value: 'attendance', sortable: false }, // PATCH
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  methods: {
    filterCourses() {
      this.filteredCourses = this.courses.filter(course =>
        course.title && course.title.toLowerCase().includes(this.search.toLowerCase())
      );
    },
    async fetchCourses() {
      console.log('fetchCourses called');
      try {
        // Get all available courses from the backend
        const apiUrl= process.env.VUE_APP_API_URL;
        const response = await axios.get(`${apiUrl}/public-courses`);
        if (!Array.isArray(response.data)) {
          throw new Error('Invalid response from server.');
        }
        // Fetch registered courses for the student from CourseRegistration table
        let registeredCourseIds = [];
        const token = this.$store.state.user.token;
        const userId = this.$store.state.user.id;
        if (token && userId) {
          try {
            // Get all course registrations for this student
            const regRes = await axios.get(`${apiUrl}/register-course/registered?userId=${encodeURIComponent(userId)}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            // Defensive: handle both array of {courseId, Course} and array of courseId
            registeredCourseIds = (regRes.data || []).map(r => r.courseId || (r.Course && r.Course.id)).filter(Boolean);
          } catch (e) {
            registeredCourseIds = [];
          }
        }
        this.courses = response.data.map(course => ({
          ...course,
          registered: registeredCourseIds.includes(course.id)
        }));
        this.filteredCourses = this.courses;
      } catch (error) {
        this.snackbarText = error.response?.data?.error || error.message || 'Failed to fetch courses';
        this.snackbar = true;
      }
    },
    async registerCourse(course) {
      console.log('registerCourse called', course);
      const token = this.$store.state.user.token;
      if (!token) {
        this.$router.push('/login');
        return;
      }
      try {
        // Register the student for the course
        const apiUrl= process.env.VUE_APP_API_URL;
        await axios.post(`${apiUrl}/register-course`, { courseId: course.id }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        course.registered = true;
        this.snackbarText = 'Successfully registered for course!';
        this.snackbar = true;
        await this.fetchCourses();
      } catch (error) {
        this.snackbarText = error.response?.data?.error || 'Failed to register for course';
        this.snackbar = true;
      }
    },
    async unregisterCourse(course) {
      console.log('unregisterCourse called', course);
      const token = this.$store.state.user.token;
      if (!token) {
        this.$router.push('/login');
        return;
      }
      try {
        // Unregister the student from the course
        const apiUrl= process.env.VUE_APP_API_URL;
        await axios.delete(`${apiUrl}/register-course`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { courseId: course.id }
        });
        course.registered = false;
        this.snackbarText = 'Successfully unregistered from course!';
        this.snackbar = true;
        await this.fetchCourses();
      } catch (error) {
        this.snackbarText = error.response?.data?.error || 'Failed to unregister from course';
        this.snackbar = true;
      }
    },
  },
  mounted() {
    this.fetchCourses();
  },
};
</script>

<style scoped>
.v-card-title {
  font-weight: bold;
}
</style>
