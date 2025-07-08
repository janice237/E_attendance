<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Log In</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="onLogin">
              <v-text-field
                v-model="form.username"
                label="Username"
                required
                prepend-inner-icon="mdi-account"
              />
              <v-text-field
                v-model="form.password"
                label="Password"
                type="password"
                required
                prepend-inner-icon="mdi-lock"
              />
              <v-btn type="submit" color="primary" block class="mt-4">Sign In</v-btn>
              <div class="text-center mt-2">
                <router-link to="/forgot-password">Forgot password?</router-link>
              </div>
              <div class="text-center mt-2">
                <router-link to="/register">Don't have an account? Sign Up</router-link>
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
  name: 'LoginView',
  data() {
    return {
      form: {
        username: '',
        password: '',
      },
    };
  },
  methods: {
    async onLogin() {
      console.log('onLogin called');
      const apiUrl=import.meta.env.VITE_API_URL;
      try {
        const response=await fetch(`${apiUrl}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: this.form.username,
            password: this.form.password,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          // Save user info to Vuex (except password)
          const userObj = {
            id: data.id,
            username: this.form.username,
            role: data.role || '',
            token: data.token || '',
          };
          this.$store.dispatch('login', userObj);
          // Also save to localStorage for persistence
          localStorage.setItem('user', JSON.stringify(userObj));
          // Redirect to the correct dashboard based on backend role
          const userRole = (data.role || '').toLowerCase();
          if (userRole === 'student') {
            this.$router.push('/student-dashboard');
          } else if (userRole === 'administrator') {
            this.$router.push('/admin-dashboard');
          } else {
            this.$router.push('/dashboard');
          }
        } else {
          alert(data.error || data.message || 'Login failed.');
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
