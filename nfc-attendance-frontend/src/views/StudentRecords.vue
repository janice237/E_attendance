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
           <h1 class="mb-0 heading-title">Attendance Records</h1>
      </v-col>
      <v-col cols="auto"> </v-col> <!-- Optional: keeps the heading centered if you add other controls on the right -->
    </v-row>
  <!-- Scrollable wrapper for course buttons on mobile -->
  <div style="overflow-x: auto; white-space: nowrap;">
    <v-row class="mb-4 flex-nowrap" style="min-width: 300px;" v-if="courses.length">
      <v-col v-for="course in courses" :key="course.courseId" cols="auto" style="display: inline-block; min-width: 120px;">
        <v-btn :color="selectedCourse && selectedCourse.courseId === course.courseId ? 'primary' : 'grey'"
               @click="selectCourse(course)"
               :disabled="loading">
          {{ course.title || course.code }}
        </v-btn>
      </v-col>
    </v-row>
  </div>
        <v-alert type="info" v-if="!selectedCourse">
          Select a course to view attendance records.
        </v-alert>
        <v-alert type="info" v-else-if="records.length === 0">
          No attendance records found for this course.
        </v-alert>
        <v-data-table
          v-else
          :headers="headers"
          :items="records"
          class="elevation-1 mb-4"
        />
        <div v-if="selectedCourse && records.length">
          <div class="d-flex align-center mb-2">
            <span class="mr-2 font-weight-bold">Total Hours Covered:</span>
            <span>{{ totalHoursCovered.toFixed(2) }} / {{ selectedCourse.hours || selectedCourse.totalHours || '-' }} hours</span>
            <!-- PATCH: Show overall attendance percentage for this course -->
            <span class="ml-4 font-weight-bold">Attendance: {{ progressPercent.toFixed(1) }}%</span>
          </div>
          <v-progress-linear
            :value="progressPercent"
            height="20"
            color="primary"
            striped
            >
            <template v-slot:default>
              {{ progressPercent.toFixed(1) }}%
            </template>
          </v-progress-linear>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'StudentRecords',
  data() {
    return {
      courses: [],
      selectedCourse: null,
      records: [],
      rawRecords: [], // Store raw attendance records for accurate calculations
      headers: [
        { text: 'Day', value: 'day' },
        { text: 'Check-In Time', value: 'checkIn' },
        { text: 'Check-Out Time', value: 'checkOut' },
        { text: 'Duration (hours spent)', value: 'duration' },
        { text: 'Allocated (hours expected)', value: 'allocated' },
      ],
      totalHoursCovered: 0,
      progressPercent: 0,
      loading: false, // For preventing double-clicks and showing loading state
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
      // Use /register-course/registered?userId=... to get only courses the student is registered in
      let courses = [];
      try {
        const apiUrl= process.env.VUE_APP_API_URL;
        const res = await fetch(`${apiUrl}/register-course/registered?userId=${encodeURIComponent(userId)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const registered = await res.json();
          if (Array.isArray(registered) && registered.length && registered[0].Course) {
            courses = registered.map(r => ({
              title: r.Course?.title || r.Course?.code || r.Course?.name || 'Untitled',
              courseId: r.Course?.id
            }));
          }
        }
      } catch (e) {
        // ignore, leave courses empty
      }
      this.courses = courses;
      this.loading = false;
    },
    async selectCourse(course) {
      if (this.loading) return; // Prevent double-clicks
      this.loading = true;
      this.selectedCourse = course;
      this.records = [];
      this.rawRecords = [];
      this.totalHoursCovered = 0;
      this.progressPercent = 0;
      const token = this.$store.state.user.token;
      const userId = this.$store.state.user.id;
      if (!token || !userId) {
        this.loading = false;
        return;
      }
      // Fetch attendance for this course (Attendance table data)
      try {
        const apiUrl= process.env.VUE_APP_API_URL;
        const res = await fetch(`${apiUrl}/attendance/${userId}/${course.courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const recs = await res.json();
          this.rawRecords = recs.sort((a, b) => new Date(b.timeIn) - new Date(a.timeIn));
          // Map and format for table display
          this.records = this.rawRecords.map(rec => {
            const inDate = rec.timeIn ? new Date(rec.timeIn) : null;
            const outDate = rec.timeOut ? new Date(rec.timeOut) : null;
            const duration = (inDate && outDate) ? ((outDate - inDate) / (1000 * 60 * 60)) : 0;
            // Allocated hours for the class that day (from course.days, course.hours, etc.)
            let allocated = course.hours || course.totalHours || 0;
            // If course.days is an array of objects with day/hours, try to match
            if (course.days && Array.isArray(course.days) && inDate) {
              const weekday = inDate.toLocaleDateString(undefined, { weekday: 'long' });
              const dayObj = course.days.find(d => d.day === weekday);
              if (dayObj && dayObj.hours) allocated = dayObj.hours;
            }
            return {
              day: inDate ? inDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }) : '-',
              checkIn: inDate ? inDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
              checkOut: outDate ? outDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
              duration: duration > 0 ? duration.toFixed(2) : '-',
              allocated: allocated ? allocated : '-',
              rawDuration: duration > 0 ? duration : 0, // Save raw duration for calculations
            };
          });
          this.computeTotals();
        }
      } catch (e) {
        // ignore
      }
      this.loading = false;
    },
    // Compute total hours covered using raw durations
    computeTotals() {
      let total = 0;
      for (const rec of this.records) {
        total += rec.rawDuration || 0;
      }
      this.totalHoursCovered = total;
      const alloc = this.selectedCourse.hours || this.selectedCourse.totalHours || 0;
      this.progressPercent = alloc ? Math.min(100, (total / alloc) * 100) : 0;
    },
    formatDate(dt) {
      if (!dt) return '-';
      const d = new Date(dt);
      return d.toLocaleDateString();
    },
    formatTime(dt) {
      if (!dt) return '-';
      const d = new Date(dt);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
  },
  async mounted() {
    await this.fetchCourses();
  },
};
</script>

<style scoped>
.v-btn {
  min-width: 120px;
}
h1.mb-0 {
  margin-bottom: 0;
}
.back-btn {
  display: inline-flex;
  margin-bottom: 24px;
  margin-right: 0;
  margin-left: 0;
  padding-left: 0;
}


</style>
