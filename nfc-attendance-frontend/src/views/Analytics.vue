<template>
  <v-container fluid>
    <v-app-bar app color="white" flat>
      <v-btn icon @click="$router.back()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>Attendance Analytics</v-toolbar-title>
    </v-app-bar>
    <v-row>
      <v-col cols="12">
J        <h1>Attendance Analytics</h1>
        <v-data-table
          :headers="headers"
          :items="attendanceReports"
          class="elevation-1"
        >
          <template #item="{ item }">
            <tr>
              <td>{{ item.course }}</td>
              <td>
                <v-progress-linear :value="calculateProgress(item.hoursCovered, item.totalHours)" height="20" color="blue">
                  <div class="d-flex justify-center align-center">
                    <span>{{ item.hoursCovered }} / {{ item.totalHours }} hours</span>
                  </div>
                </v-progress-linear>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'AnalyticsView',
  data() {
    return {
      attendanceReports: [
        { course: 'Computer Science 101', hoursCovered: 35, totalHours: 40 },
        { course: 'Mathematics 101', hoursCovered: 20, totalHours: 30 },
        { course: 'Physics 101', hoursCovered: 25, totalHours: 25 },
        // Add more courses as needed
      ],
      headers: [
        { text: 'Course', value: 'course' },
        { text: 'Hours Covered', value: 'hoursCovered' },
      ],
    };
  },
  methods: {
    calculateProgress(hoursCovered, totalHours) {
      return (hoursCovered / totalHours) * 100;
    },
  },
};
</script>

<style scoped>
.h1 {
  margin-bottom: 20px;
}
</style>