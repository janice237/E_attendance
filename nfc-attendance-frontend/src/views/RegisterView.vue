<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Sign Up</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="onSubmit">
              <v-text-field
                v-model="form.name"
                label="Name"
                required
                prepend-inner-icon="mdi-account"
              />
              <v-text-field
                v-model="form.email"
                label="Email"
                type="email"
                required
                prepend-inner-icon="mdi-email"
              />
              <v-text-field
                v-model="form.password"
                label="Password"
                type="password"
                required
                prepend-inner-icon="mdi-lock"
              />
              <v-radio-group
                v-model="form.role"
                row
                class="my-4"
                :mandatory="true"
                label="Role"
              >
                <template #default>
                  <div
                    style="display: flex; flex-direction: row; justify-content: center; width: 100%;"
                  >
                    <v-radio label="Student" value="student" class="mx-2" />
                    <v-radio label="Lecturer" value="lecturer" class="mx-2" />
                    <v-radio label="Admin" value="admin" class="mx-2" />
                  </div>
                </template>
              </v-radio-group>
              <v-btn type="submit" color="primary" block class="mt-4">
                Sign Up
              </v-btn>
              <div class="text-center mt-2">
                <router-link to="/login"
                  >Already have an account? Login</router-link
                >
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'RegisterView',
  data() {
    return {
      form: {
        name: '',
        email: '',
        password: '',
        role: '',
      },
    };
  },
  methods: {
    async onSubmit() {
      if (!this.form.role) {
        alert('Please select a role.');
        return;
      }
      // const apiUrl = import.meta.env.VITE_API_URL;
      const apiUrl = process.env.VUE_APP_API_URL;
      try {
        const response = await fetch(`${apiUrl}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: this.form.name,
            password: this.form.password,
            role: this.form.role,
            email: this.form.email,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          // Save user info to Vuex (except password)
          this.$store.dispatch('login', {
            username: this.form.name,
            role: data.role || this.form.role,
            token: data.token || '',
          });

          // Redirect to the correct dashboard based on role
          const userRole = (data.role || this.form.role || '').toLowerCase();
          if (userRole === 'student') {
            this.$router.push('/student-dashboard');
          } else if (userRole === 'admin' || userRole === 'administrator') {
            this.$router.push('/admin-dashboard');
          } else if (userRole === 'lecturer') {
            this.$router.push('/dashboard');
          } else {
            this.$router.push('/'); // fallback
          }
        } else {
          alert(data.error || data.message || 'Registration failed.');
        }
      } catch (error) {
        alert('Error connecting to server.');
      }
    },
  },
};
</script>

<style scoped>
.v-card-title {
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
}
</style>
