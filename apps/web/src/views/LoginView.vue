<template>
  <section class="panel centered login-page">
    <h1>Login</h1>
    <p class="muted">Mock auth for demo purposes.</p>

    <form class="form-grid" @submit.prevent="onSubmit">
      <label>
        Email
        <input v-model="email" type="email" required />
      </label>

      <label>
        Password
        <input v-model="password" type="password" required minlength="4" />
      </label>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Signing in...' : 'Sign in' }}
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';

const router = useRouter();
const authStore = useAuthStore();
const toastStore = useToastStore();

const email = ref('admin@example.com');
const password = ref('admin1234');
const loading = ref(false);

async function onSubmit() {
  if (!email.value.includes('@') || password.value.length < 4) {
    toastStore.push('Invalid credentials format.', 'error');
    return;
  }

  loading.value = true;

  await new Promise((resolve) => setTimeout(resolve, 350));
  authStore.login(`mock-token-${Date.now()}`);
  toastStore.push('Logged in successfully.', 'success');
  await router.push('/app/services');

  loading.value = false;
}
</script>
