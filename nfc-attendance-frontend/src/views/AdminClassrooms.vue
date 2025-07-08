<template>
  <v-container>
    <h2>Classroom Management</h2>
    <v-form @submit.prevent="createClassroom" class="mb-4">
      <v-text-field v-model="newClassroom.name" label="Classroom Name" required />
      <v-text-field v-model="newClassroom.location" label="Location" />
      <v-text-field v-model="newClassroom.capacity" label="Capacity" type="number" />
      <v-btn type="submit" color="primary">Add Classroom</v-btn>
    </v-form>
    <v-divider class="my-4"></v-divider>
    <v-list>
      <v-list-item v-for="room in classrooms" :key="room.id">
        <v-list-item-content>
          <v-list-item-title>{{ room.name }} ({{ room.location }})</v-list-item-title>
          <v-list-item-subtitle>Capacity: {{ room.capacity }}</v-list-item-subtitle>
        </v-list-item-content>
        <v-btn @click="generateQr(room.id)" color="secondary">Generate QR</v-btn>
        <qrcode-vue v-if="qrTokens[room.id]" :value="qrTokens[room.id]" :size="100" />
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script>
import QrcodeVue from 'qrcode.vue';
export default {
  components: { QrcodeVue },
  data() {
    return {
      classrooms: [],
      newClassroom: { name: '', location: '', capacity: null },
      qrTokens: {}
    };
  },
  methods: {
    async fetchClassrooms() {
      const res = await fetch('/classrooms', { headers: { Authorization: `Bearer ${localStorage.token}` } });
      this.classrooms = await res.json();
    },
    async createClassroom() {
      await fetch('/classrooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.token}` },
        body: JSON.stringify(this.newClassroom)
      });
      this.newClassroom = { name: '', location: '', capacity: null };
      this.fetchClassrooms();
    },
    async generateQr(classroomId) {
      const res = await fetch(`/classrooms/${classroomId}/qr`, { headers: { Authorization: `Bearer ${localStorage.token}` } });
      const data = await res.json();
      this.qrTokens = { ...this.qrTokens, [classroomId]: data.token };
    }
  },
  mounted() {
    this.fetchClassrooms();
  }
};
</script>

<style scoped>
.mb-4 { margin-bottom: 24px; }
</style>
