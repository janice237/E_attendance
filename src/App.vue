<template>
  <v-app>
    <router-view/>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    // Fix routing issues: always scroll to top and reload route if navigating to the same path
    this.$router.afterEach((to, from) => {
      window.scrollTo(0, 0);
      if (to.path === from.path) {
        this.$router.replace({ path: '/_force_reload' }).then(() => {
          this.$router.replace(to.fullPath);
        });
      }
    });
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

@media (max-width: 600px) {
  .v-card-title {
    font-size: 1.1rem;
    padding: 8px 12px;
  }
  .v-data-table {
    font-size: 0.9rem;
  }
  .attendance-heading {
    font-size: 1.2rem;
  }
  .attendance-img {
    height: 80px !important;
    width: 80px !important;
  }
  .sidebar {
    width: 100vw !important;
    min-width: 0 !important;
  }
  .v-navigation-drawer {
    width: 100vw !important;
    min-width: 0 !important;
  }
  .v-main {
    padding: 0 !important;
  }
  .v-container, .v-row, .v-col {
    padding: 0 !important;
    margin: 0 !important;
  }
  .v-btn {
    font-size: 0.95rem;
    min-width: 90px;
  }
}
</style>
