<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-row class="align-center mb-4">
          <v-col cols="auto">
            <v-btn variant="text" @click="$router.back()" density="compact" style="min-width: 0; padding: 0;">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
          </v-col>
          <v-col class="text-center">
            <h1 class="mb-0 heading-title">My Timetable</h1>
          </v-col>
          <v-col cols="auto"> </v-col>
        </v-row>
        <v-alert v-if="loading" type="info">Loading timetable...</v-alert>
        <v-alert v-else-if="!courses.length" type="info">No registered courses found.</v-alert>
        <v-row v-else>
          <v-col
            v-for="(course, idx) in courses"
            :key="idx"
            cols="12" sm="6" md="4"
          >
            <v-card class="mb-4" outlined elevation="2">
              <v-card-title class="d-flex align-center justify-space-between">
                <span class="font-weight-bold course-title">{{ course.title }}</span>
                <v-chip color="primary" text-color="white" small>{{ course.classroom }}</v-chip>
              </v-card-title>
              <v-card-text class="flex-grow-1 card-content">
                <div class="mb-2">
                  <v-icon size="18" class="mr-1" color="primary">mdi-calendar</v-icon>
                  <span><strong>Days:</strong> {{ course.days }}</span>
                </div>
                <div class="mb-2">
                  <v-icon size="18" class="mr-1" color="primary">mdi-clock-outline</v-icon>
                  <span><strong>Time:</strong>
                    <span v-if="course.startTime && course.endTime">
                      {{ course.startTime }} - {{ course.endTime }}
                    </span>
                    <span v-else-if="course.startTime">
                      {{ course.startTime }}-?
                    </span>
                    <span v-else-if="course.endTime">
                      ?-{{ course.endTime }}
                    </span>
                    <span v-else>
                        Not set
                    </span>
                  </span>
                </div>
                <div class="mb-2">
                  <v-icon size="18" class="mr-1" color="primary">mdi-account-tie</v-icon>
                  <span><strong>Lecturer:</strong> {{ course.lecturer }}</span>
                </div>
                <div>
                  <v-icon size="18" class="mr-1" color="primary">mdi-pound</v-icon>
                  <span><strong>Course ID:</strong> {{ course.code }}</span>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'StudentTimetable',
  data() {
    return {
      courses: [],
      loading: false,
    };
  },
  methods: {
    async fetchCourses() {
      this.loading = true;
      const token = this.$store.state.user.token;
      const userId = this.$store.state.user.id;
      if (!token || !userId) {
        this.loading = false;
        return;
      }
      try {
        const res = await fetch(`http://localhost:3000/register-course/registered?userId=${encodeURIComponent(userId)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const registered = await res.json();
          console.log('Registered Courses:', registered);
          if (Array.isArray(registered) && registered.length && registered[0].Course) {
            // Map each registration to a flat object for the table
            this.courses = registered.map(r => {
              const c = r.Course || {};
              return {
                title: c.title || c.code || '-',
                code: c.code || '-',
                days: Array.isArray(c.days) ? c.days.join(', ') : (c.days || '-'),
                startTime: c.startTime ?? c.start_time ?? null,
                endTime: c.endTime ?? c.end_time ?? null,
                classroom: c.classroom ?? '-',
                lecturer: c.lecturer ?? '-',
              };
            });
          }
        }
      } catch (e) {
        // ignore
      }
      this.loading = false;
    },
    // No need for formatDays/formatTime, handled in mapping
  },
  async mounted() {
    await this.fetchCourses();
  }
};
</script>

<style scoped>
.v-btn {
  min-width: 120px;
}
h1.mb-0 {
  margin-bottom: 0;
}
.heading-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}
.back-btn {
  display: inline-flex;
  margin-bottom: 24px;
  margin-right: 0;
  margin-left: 0;
  padding-left: 0;
}
.course-title {
  white-space: normal;
  text-overflow: unset;
  overflow: visible;
}
.card-content {
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
