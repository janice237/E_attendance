<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1>Admin Dashboard</h1>
      <v-btn color="error" @click="logOut">Log Out</v-btn>
    </div>
    <v-row>
      <!-- Replicate Lecturer Dashboard features -->
      <v-col cols="12" md="6">
        <v-card class="mb-4">
          <v-card-title>Manage Courses</v-card-title>
          <v-card-actions>
            <v-btn color="primary" @click="$router.push('/course-management')">View All Courses</v-btn>
          </v-card-actions>
        </v-card>
        <v-card class="mb-4">
          <v-card-title>Catchup Classes</v-card-title>
          <v-card-actions>
            <v-btn color="primary" @click="$router.push('/catchup-classes')">Manage Catchup Classes</v-btn>
          </v-card-actions>
        </v-card>
        <v-card class="mb-4">
          <v-card-title>Attendance Reports</v-card-title>
          <v-card-actions>
            <v-btn color="primary" @click="$router.push('/attendance-reports')">View Attendance Reports</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <!-- Admin-only: Manage Classrooms -->
      <v-col cols="12" md="6">
        <v-card class="mb-4">
          <v-card-title>Manage Classrooms</v-card-title>
          <v-card-text>
            <v-btn color="secondary" @click="$router.push('/admin/classrooms')">Go to Classroom Management</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'AdminDashboard',
  methods: {
    logOut() {
      // Clear Vuex store and localStorage
      this.$store.dispatch('logout');
      localStorage.removeItem('user');
      this.$router.push('/login');
    },
  },
};
</script>

<style scoped>
.mb-4 { margin-bottom: 24px; }
.d-flex { display: flex; }
.justify-space-between { justify-content: space-between; }
.align-center { align-items: center; }
</style>
