import { defineStore } from 'pinia';

const TOKEN_KEY = 'service_catalog_token';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) ?? '',
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    login(token: string) {
      this.token = token;
      localStorage.setItem(TOKEN_KEY, token);
    },
    logout() {
      this.token = '';
      localStorage.removeItem(TOKEN_KEY);
    },
  },
});
