import { createStore } from 'vuex';

// Load user from localStorage if available
const userFromStorage = JSON.parse(localStorage.getItem('user')) || {
  id: null,
  username: '',
  role: '',
  token: '',
};

const store = createStore({
  state: {
    user: userFromStorage,
    courses: [],
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
      // Also update localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
    },
    setUserRole(state, role) {
      state.user.role = role;
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    setToken(state, token) {
      state.user.token = token;
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    setCourses(state, courses) {
      state.courses = courses;
    },
  },
  actions: {
    login({ commit }, user) {
      commit('setUser', user);
    },
    logout({ commit }) {
      commit('setUser', { username: '', role: '', token: '' });
      localStorage.removeItem('user');
    },
    updateCourses({ commit }, courses) {
      commit('setCourses', courses);
    },
  },
  getters: {
    isAuthenticated: state => !!state.user.token,
    userRole: state => state.user.role,
    courses: state => state.courses,
  },
});

export default store;
