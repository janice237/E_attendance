<template>
  <v-container fluid>
    <v-app-bar app color="white" flat>
      <v-btn icon @click="$router.back()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>Course Management</v-toolbar-title>
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
        >
          <template v-slot:top="">
            <v-btn color="primary" v-if="isLecturerOrAdmin" @click="showDialog = true">Add New Course</v-btn>
          </template>

          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template v-slot:item.actions="props">
            <v-btn icon small color="primary" v-if="isLecturerOrAdmin" @click="openEditDialog(props.item)"><v-icon>mdi-pencil</v-icon></v-btn>
            <v-btn icon small color="red" v-if="isLecturerOrAdmin" @click="openDeleteDialog(props.item)"><v-icon>mdi-delete</v-icon></v-btn>
            <v-btn icon small color="green" v-if="isLecturerOrAdmin" @click="openCatchupDialog(props.item)"><v-icon>mdi-calendar-plus</v-icon></v-btn>
          </template>
        </v-data-table>
        <!-- Edit Course Dialog -->
        <v-dialog v-model="showEditDialog" max-width="600px">
          <v-card>
            <v-card-title>Edit Course</v-card-title>
            <v-card-text>
              <v-form ref="editForm" v-model="editValid">
                <v-text-field v-model="editCourse.code" label="Course Code" required />
                <v-text-field v-model="editCourse.title" label="Course Title" required />
                <v-text-field v-model="editCourse.lecturer" label="Lecturer's Name" required />
                <v-textarea v-model="editCourse.description" label="Description" required />
                <v-text-field v-model="editCourse.credits" label="Course Credits" type="number" required />
                <v-text-field v-model="editCourse.hours" label="Course Hours" type="number" required />
                <v-text-field v-model="editCourse.location" label="Location" required />
                <v-select
                  v-model="editCourse.classroomId"
                  :items="classroomOptions"
                  item-text="name"
                  item-value="id"
                  label="Classroom"
                  required
                />
                <v-combobox v-model="editCourse.days" :items="['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']" label="Days (optional)" multiple chips clearable />
                <v-text-field v-model="editCourse.startTime" label="Start Time (optional)" type="time" />
                <v-text-field v-model="editCourse.endTime" label="End Time (optional)" type="time" />
                <v-text-field v-model="editCourse.totalHours" label="Total Hours (optional)" type="number" />
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="showEditDialog = false">Cancel</v-btn>
              <v-btn color="primary" @click="saveEditCourse">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Delete Course Dialog -->
        <v-dialog v-model="showDeleteDialog" max-width="400px">
          <v-card>
            <v-card-title>Delete Course</v-card-title>
            <v-card-text>Are you sure you want to delete course <b>{{ deleteCourse?.title }}</b>?</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="showDeleteDialog = false">Cancel</v-btn>
              <v-btn color="red" @click="confirmDeleteCourse">Delete</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Create Catchup Class Dialog -->
        <v-dialog v-model="showCatchupDialog" max-width="500px">
          <v-card>
            <v-card-title>Create Catchup Class for {{ catchupCourse?.title }}</v-card-title>
            <v-card-text>
              <v-form ref="catchupForm" v-model="catchupValid">
                <v-text-field v-model="catchupData.date" label="Date" type="date" required />
                <v-text-field v-model="catchupData.startTime" label="Start Time" type="time" required />
                <v-text-field v-model="catchupData.endTime" label="End Time" type="time" required />
                <v-textarea v-model="catchupData.reason" label="Reason (optional)" />
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="showCatchupDialog = false">Cancel</v-btn>
              <v-btn color="green" @click="createCatchupClass">Create</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="showDialog" max-width="600px">
          <v-card>
            <v-card-title>Add New Course</v-card-title>
            <v-card-text>
              <v-form ref="form" v-model="valid">
                <v-text-field v-model="newCourse.code" label="Course Code" required />
                <v-text-field v-model="newCourse.title" label="Course Title" required />
                <v-text-field v-model="newCourse.lecturer" label="Lecturer's Name" required />
                <v-textarea v-model="newCourse.description" label="Description" required />
                <v-text-field v-model="newCourse.credits" label="Course Credits" type="number" required />
                <v-text-field v-model="newCourse.hours" label="Course Hours" type="number" required />
                <v-text-field v-model="newCourse.location" label="Location" required />
                <v-select
                  v-model="newCourse.classroomId"
                  :items="classroomOptions"
                  item-text="name"
                  item-value="id"
                  label="Classroom"
                  required
                />
                <v-combobox v-model="newCourse.days" :items="['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']" label="Days (optional)" multiple chips clearable />
                <v-text-field v-model="newCourse.startTime" label="Start Time (optional)" type="time" />
                <v-text-field v-model="newCourse.endTime" label="End Time (optional)" type="time" />
                <v-text-field v-model="newCourse.totalHours" label="Total Hours (optional)" type="number" />
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="showDialog = false">Cancel</v-btn>
              <v-btn color="primary" @click="addCourse">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: 'CourseManagement',
  data() {
    return {
      search: '',
      courses: [],
      filteredCourses: [],
      showDialog: false,
      valid: false,
      showEditDialog: false,
      showDeleteDialog: false,
      showCatchupDialog: false,
      editValid: false,
      catchupValid: false,
      editCourse: {},
      deleteCourse: null,
      catchupCourse: null,
      catchupData: { date: '', startTime: '', endTime: '', reason: '' },
      newCourse: {
        code: '',
        title: '',
        lecturer: '',
        description: '',
        credits: '',
        hours: '',
        location: '',
        classroomId: null, // now using classroomId
        days: [],
        startTime: '',
        endTime: '',
        totalHours: '',
      },
      headers: [
        { text: 'Course Code', value: 'code' },
        { text: 'Course Title', value: 'title' },
        { text: 'Lecturer', value: 'lecturer' },
        { text: 'Description', value: 'description' },
        { text: 'Credits', value: 'credits' },
        { text: 'Hours', value: 'hours' },
        { text: 'Location', value: 'location' },
        { text: 'Classroom', value: 'classroomName' },
        { text: 'Days', value: 'days' },
        { text: 'Start Time', value: 'startTime' },
        { text: 'End Time', value: 'endTime' },
        { text: 'Total Hours', value: 'totalHours' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      snackbar: false,
      snackbarText: '',
    };
  },
  computed: {
    isLecturerOrAdmin() {
      const role = this.$store.state.user.role?.toLowerCase();
      return role === 'lecturer' || role === 'admin' || role === 'administrator';
    },
  },
  methods: {
    async filterCourses() {
      this.filteredCourses = this.courses.filter(course =>
        course.title && course.title.toLowerCase().includes(this.search.toLowerCase())
      );
    },
    openEditDialog(course) {
      this.editCourse = { ...course };
      this.showEditDialog = true;
    },
    async saveEditCourse() {
      const token = this.$store.state.user.token;
      if (!token) {
        alert('You must be logged in as a lecturer or admin to edit a course.');
        return;
      }
      try {
        const payload = { ...this.editCourse };
        // Remove id and undefined/null fields
        delete payload.id;
        Object.keys(payload).forEach(key => {
          if (payload[key] === null || payload[key] === '') {
            delete payload[key];
          }
        });
        const response = await axios.put(`http://localhost:3000/courses/${this.editCourse.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Update local list
        const idx = this.courses.findIndex(c => c.id === this.editCourse.id);
        if (idx !== -1) this.courses.splice(idx, 1, response.data);
        this.filterCourses();
        this.showEditDialog = false;
      } catch (error) {
        alert(error.response?.data?.error || error.message || 'Failed to update course');
      }
    },
    openDeleteDialog(course) {
      this.deleteCourse = course;
      this.showDeleteDialog = true;
    },
    async confirmDeleteCourse() {
      const token = this.$store.state.user.token;
      if (!token) {
        alert('You must be logged in as a lecturer or admin to delete a course.');
        return;
      }
      try {
        await axios.delete(`http://localhost:3000/courses/${this.deleteCourse.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.courses = this.courses.filter(c => c.id !== this.deleteCourse.id);
        this.filterCourses();
        this.showDeleteDialog = false;
      } catch (error) {
        alert(error.response?.data?.error || error.message || 'Failed to delete course');
      }
    },
    openCatchupDialog(course) {
      this.catchupCourse = course;
      this.catchupData = { date: '', startTime: '', endTime: '', reason: '' };
      this.showCatchupDialog = true;
    },
    async createCatchupClass() {
      const token = this.$store.state.user.token;
      if (!token) {
        alert('You must be logged in as a lecturer or admin to create a catchup class.');
        return;
      }
      try {
        const payload = { ...this.catchupData };
        if (!payload.date || !payload.startTime || !payload.endTime) {
          alert('Date, start time, and end time are required.');
          return;
        }
        await axios.post(`http://localhost:3000/courses/${this.catchupCourse.id}/catchup`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.showCatchupDialog = false;
        this.snackbarText = 'Catchup class created!';
        this.snackbar = true;
      } catch (error) {
        alert(error.response?.data?.error || error.message || 'Failed to create catchup class');
      }
    },
    async addCourse() {
      console.log('addCourse called');
      try {
        const token = this.$store.state.user.token;
        if (!token) {
          alert('You must be logged in as a lecturer or admin to add a course.');
          return;
        }
        // Prepare payload with correct types and required fields
        const payload = {
          code: this.newCourse.code,
          title: this.newCourse.title,
          lecturer: this.newCourse.lecturer,
          description: this.newCourse.description || null,
          credits: this.newCourse.credits ? Number(this.newCourse.credits) : null,
          hours: this.newCourse.hours ? Number(this.newCourse.hours) : null,
          location: this.newCourse.location,
          classroomId: this.newCourse.classroomId,
          days: this.newCourse.days && this.newCourse.days.length ? this.newCourse.days : null,
          startTime: this.newCourse.startTime || null,
          endTime: this.newCourse.endTime || null,
          totalHours: this.newCourse.totalHours ? Number(this.newCourse.totalHours) : null,
        };
        // Remove undefined/null fields for backend compatibility
        Object.keys(payload).forEach(key => {
          if (payload[key] === null || payload[key] === '') {
            delete payload[key];
          }
        });
        const response = await axios.post('http://localhost:3000/courses', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.courses.push(response.data);
        this.showDialog = false;
        this.newCourse = {
          code: '', title: '', lecturer: '', description: '', credits: '', hours: '', location: '', classroomId: null, days: [], startTime: '', endTime: '', totalHours: ''
        };
        this.filterCourses();
      } catch (error) {
        alert(error.response?.data?.error || error.message || 'Failed to add course');
      }
    },
    async fetchCourses() {
      console.log('fetchCourses called');
      try {
        // Always use the public endpoint so all users (including students and unauthenticated) can see courses
        const response = await axios.get('http://localhost:3000/public-courses');
        if (!Array.isArray(response.data)) {
          throw new Error('Invalid response from server.');
        }
        // Map classroom name for display
        this.courses = response.data.map(course => ({
          ...course,
          classroomName: course.Classroom ? course.Classroom.name : ''
        }));
        this.filteredCourses = this.courses;
      } catch (error) {
        alert(error.response?.data?.error || error.message || 'Failed to fetch courses');
      }
    },
    async fetchClassroomsList() {
      // Fetch all classrooms for dropdowns
      try {
        const res = await fetch('http://localhost:3000/classrooms', { headers: { Authorization: `Bearer ${localStorage.token}` } });
        if (!res.ok) throw new Error('Failed to fetch classrooms');
        this.classroomOptions = await res.json();
      } catch (e) {
        this.classroomOptions = [];
      }
    },
    // Write hall name to NFC tag using Web NFC API
    async writeHallToNfcTag(hallName) {
      // Check if Web NFC is available
      if (!('NDEFWriter' in window)) {
        this.snackbarText = 'Web NFC writing is not supported on this device/browser.';
        this.snackbar = true;
        return;
      }
      try {
        const ndef = new window.NDEFWriter();
        // Attempt to write the hall name as a text record
        await ndef.write({ records: [{ recordType: 'text', data: hallName }] });
        this.snackbarText = `Hall name "${hallName}" written to NFC tag!`;
        this.snackbar = true;
      } catch (err) {
        this.snackbarText = 'Failed to write to NFC tag: ' + err;
        this.snackbar = true;
      }
    },
  },
  mounted() {
    this.fetchCourses();
    this.fetchClassroomsList();
  },
};
</script>

<style scoped>
.v-card-title {
  font-weight: bold;
}
</style>