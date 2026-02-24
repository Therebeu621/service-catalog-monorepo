<template>
  <div class="app-shell">
    <aside class="sidebar">
      <h1>Service Catalog</h1>
      <RouterLink to="/app/services" class="nav-link">Services</RouterLink>
      <RouterLink to="/app/dashboard" class="nav-link">Dashboard</RouterLink>
      <button class="logout-btn" type="button" @click="logout">Logout</button>
    </aside>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();

function logout() {
  auth.logout();
  router.push('/login');
}
</script>
