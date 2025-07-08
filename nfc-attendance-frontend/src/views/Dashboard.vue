<template>
  <v-app>
    <v-navigation-drawer app class="sidebar" permanent>
      <v-toolbar class="sidebar-header">
        <v-toolbar-title>TapTrack</v-toolbar-title>
      </v-toolbar>
    <v-list>
        <v-list-item v-for="item in menuItems" :key="item.title" @click="navigateTo(item.route)">
             <v-list-item-avatar>
                <v-img :src="item.image" width="40" height="40" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
     </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="white" flat>
      <!-- Removed back button -->
      <v-toolbar-title>Dashboard</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-text-field
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
      <v-btn color="error" class="ml-2" @click="logout">
        <v-icon left>mdi-logout</v-icon>Logout
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-row>
            <v-col v-for="(box, index) in boxes" :key="index" cols="12" md="6">
            <v-card>
            <v-card-title>{{ box.title }}</v-card-title>
            <v-card-text>
        <!-- Placeholder for image representation -->
        <v-img :src="box.image" height="200px"></v-img>
      </v-card-text>
    </v-card>
  </v-col>
</v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'DashboardView', // Changed from 'Dashboard' to 'DashboardView' for multi-word name
  data() {
    return {
      menuItems: [
        { title: 'Course Management', route: '/course-management' },
        { title: 'Attendance', route: '/lecturer-attendance'},
        { title: 'Analytics', route: '/analytics' },
        { title: 'Notifications', route: '/notifications' },
      ],
      boxes: [
        { title: 'Course Management', image: '/images/Essential stationery for studying.png' },
        { title: 'Attendance', image: '/images/mobile phone with check mark.png' },
        { title: 'Analytics', image: '/images/rectangle with graph.png' },
        { title: 'Timetable', image: '/images/Calendar, checklist and clock for time management.png' },
      ],
      profileImagePath: '/images/Account.png', // Set your profile image path here
    };
  },
  methods: {
    navigateTo(route) {
      // If route is a getter property, call it to get the actual path
      const path = typeof route === 'function' ? route() : (typeof route === 'string' ? route : route);
      this.$router.push(path);
    },
    logout() {
      this.$store.dispatch('logout');
      this.$router.push('/login');
    },
  },
};
</script>

<style scoped>
.sidebar {
  width: 250px;
}

.sidebar-header {
  background-color: aquamarine;
  color: white;
}
</style>