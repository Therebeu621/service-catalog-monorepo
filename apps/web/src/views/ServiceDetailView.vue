<template>
  <section class="panel">
    <header class="section-header">
      <h2>Service Detail</h2>
      <button class="secondary-btn" type="button" @click="goBack">Back</button>
    </header>

    <p v-if="loading" class="muted">Loading service...</p>
    <p v-else-if="error" class="error-text">{{ error }}</p>

    <template v-else-if="service">
      <article class="service-summary">
        <h3>{{ service.name }}</h3>
        <p>{{ service.description || 'No description' }}</p>
        <p><strong>Status:</strong> {{ service.status }}</p>
        <p><strong>Owner:</strong> {{ service.owner || '-' }}</p>
        <p><strong>Tags:</strong> {{ service.tags.join(', ') || '-' }}</p>
      </article>

      <section class="panel nested-panel">
        <header class="section-header">
          <h3>Endpoints</h3>
          <div class="toolbar inline">
            <select v-model="endpointSortBy" @change="fetchEndpoints">
              <option value="createdAt">Sort by createdAt</option>
              <option value="path">Sort by path</option>
              <option value="method">Sort by method</option>
            </select>
            <select v-model="endpointSortOrder" @change="fetchEndpoints">
              <option value="desc">desc</option>
              <option value="asc">asc</option>
            </select>
            <button type="button" @click="openCreateEndpoint">Add Endpoint</button>
          </div>
        </header>

        <p v-if="endpointLoading" class="muted">Loading endpoints...</p>
        <p v-else-if="endpoints.length === 0" class="muted">No endpoints for this service.</p>

        <table v-else class="table">
          <thead>
            <tr>
              <th>Method</th>
              <th>Path</th>
              <th>Version</th>
              <th>SLA (ms)</th>
              <th>Auth</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="endpoint in endpoints" :key="endpoint.id">
              <td>{{ endpoint.method }}</td>
              <td>{{ endpoint.path }}</td>
              <td>{{ endpoint.version }}</td>
              <td>{{ endpoint.slaMs }}</td>
              <td>{{ endpoint.authType }}</td>
              <td class="actions-row">
                <button class="secondary-btn" type="button" @click="openEditEndpoint(endpoint)">
                  Edit
                </button>
                <button class="danger-btn" type="button" @click="deleteEndpoint(endpoint.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </section>

  <EndpointFormModal
    :open="showEndpointModal"
    :mode="endpointModalMode"
    :initial="selectedEndpoint"
    @close="closeEndpointModal"
    @submit="submitEndpoint"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EndpointFormModal from '../components/EndpointFormModal.vue';
import { ApiError, api } from '../services/api';
import { useToastStore } from '../stores/toast';
import type { Endpoint, ServiceDetail } from '../types';

const route = useRoute();
const router = useRouter();
const toastStore = useToastStore();

const service = ref<ServiceDetail | null>(null);
const endpoints = ref<Endpoint[]>([]);

const loading = ref(false);
const endpointLoading = ref(false);
const error = ref('');

const endpointSortBy = ref<'path' | 'createdAt' | 'method'>('createdAt');
const endpointSortOrder = ref<'asc' | 'desc'>('desc');

const showEndpointModal = ref(false);
const endpointModalMode = ref<'create' | 'edit'>('create');
const selectedEndpoint = ref<Endpoint | null>(null);

const serviceId = computed(() => String(route.params.id ?? ''));

async function fetchService() {
  loading.value = true;
  error.value = '';

  try {
    service.value = await api.get<ServiceDetail>(`/services/${serviceId.value}`);
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Unable to load service.';
  } finally {
    loading.value = false;
  }
}

async function fetchEndpoints() {
  endpointLoading.value = true;

  const params = new URLSearchParams({
    sortBy: endpointSortBy.value,
    sortOrder: endpointSortOrder.value,
  });

  try {
    endpoints.value = await api.get<Endpoint[]>(
      `/services/${serviceId.value}/endpoints?${params.toString()}`,
    );
  } catch (err) {
    toastStore.push(err instanceof ApiError ? err.message : 'Unable to load endpoints.', 'error');
  } finally {
    endpointLoading.value = false;
  }
}

function goBack() {
  router.push('/app/services');
}

function openCreateEndpoint() {
  endpointModalMode.value = 'create';
  selectedEndpoint.value = null;
  showEndpointModal.value = true;
}

function openEditEndpoint(endpoint: Endpoint) {
  endpointModalMode.value = 'edit';
  selectedEndpoint.value = endpoint;
  showEndpointModal.value = true;
}

function closeEndpointModal() {
  showEndpointModal.value = false;
}

async function submitEndpoint(payload: {
  method: Endpoint['method'];
  path: string;
  version: string;
  slaMs: number;
  authType: Endpoint['authType'];
}) {
  if (!payload.path.startsWith('/')) {
    toastStore.push('Path must start with /', 'error');
    return;
  }

  try {
    if (endpointModalMode.value === 'create') {
      await api.post(`/services/${serviceId.value}/endpoints`, payload);
      toastStore.push('Endpoint created.', 'success');
    } else if (selectedEndpoint.value) {
      await api.put(`/endpoints/${selectedEndpoint.value.id}`, payload);
      toastStore.push('Endpoint updated.', 'success');
    }

    closeEndpointModal();
    await fetchService();
    await fetchEndpoints();
  } catch (err) {
    toastStore.push(err instanceof ApiError ? err.message : 'Failed to save endpoint.', 'error');
  }
}

async function deleteEndpoint(endpointId: string) {
  const confirmed = window.confirm('Delete this endpoint?');
  if (!confirmed) {
    return;
  }

  try {
    await api.delete(`/endpoints/${endpointId}`);
    toastStore.push('Endpoint deleted.', 'success');
    await fetchService();
    await fetchEndpoints();
  } catch (err) {
    toastStore.push(err instanceof ApiError ? err.message : 'Failed to delete endpoint.', 'error');
  }
}

onMounted(async () => {
  await fetchService();
  await fetchEndpoints();
});
</script>
