<template>
  <section class="panel">
    <header class="section-header">
      <h2>Dashboard</h2>
    </header>

    <p v-if="loading" class="muted">Loading dashboard...</p>
    <p v-else-if="error" class="error-text">{{ error }}</p>

    <template v-else-if="dashboard">
      <div class="kpi-grid">
        <article class="kpi-card">
          <h4>Total Services</h4>
          <strong>{{ dashboard.totalServices }}</strong>
        </article>
        <article class="kpi-card">
          <h4>Total Endpoints</h4>
          <strong>{{ dashboard.totalEndpoints }}</strong>
        </article>
      </div>

      <div class="kpi-grid">
        <article class="panel nested-panel">
          <h3>Services by Status</h3>
          <ul>
            <li v-for="item in statusItems" :key="item.key">
              <span>{{ item.key }}</span>
              <strong>{{ item.value }}</strong>
            </li>
          </ul>
        </article>

        <article class="panel nested-panel">
          <h3>Endpoints by Auth Type</h3>
          <ul>
            <li v-for="item in authItems" :key="item.key">
              <span>{{ item.key }}</span>
              <strong>{{ item.value }}</strong>
            </li>
          </ul>
        </article>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ApiError, api } from '../services/api';
import type { DashboardResponse } from '../types';

const dashboard = ref<DashboardResponse | null>(null);
const loading = ref(false);
const error = ref('');

const statusItems = computed(() => Object.entries(dashboard.value?.servicesByStatus ?? {}).map(([key, value]) => ({ key, value })));
const authItems = computed(() => Object.entries(dashboard.value?.endpointsByAuthType ?? {}).map(([key, value]) => ({ key, value })));

async function fetchDashboard() {
  loading.value = true;
  error.value = '';

  try {
    dashboard.value = await api.get<DashboardResponse>('/dashboard');
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Unable to load dashboard.';
  } finally {
    loading.value = false;
  }
}

onMounted(fetchDashboard);
</script>
