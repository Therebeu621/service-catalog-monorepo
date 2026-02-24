<template>
  <section class="panel">
    <header class="section-header">
      <h2>Services</h2>
      <button type="button" @click="openCreateModal">New Service</button>
    </header>

    <div class="toolbar">
      <input v-model="search" type="text" placeholder="Search name or description" @keyup.enter="applyFilters" />

      <select v-model="status" @change="applyFilters">
        <option value="">All statuses</option>
        <option value="active">active</option>
        <option value="paused">paused</option>
        <option value="deprecated">deprecated</option>
      </select>

      <input v-model="tag" type="text" placeholder="Filter by tag" @keyup.enter="applyFilters" />

      <select v-model="sortBy" @change="applyFilters">
        <option value="createdAt">Sort: createdAt</option>
        <option value="name">Sort: name</option>
      </select>

      <select v-model="sortOrder" @change="applyFilters">
        <option value="desc">desc</option>
        <option value="asc">asc</option>
      </select>

      <button type="button" class="secondary-btn" @click="resetFilters">Reset</button>
    </div>

    <p v-if="loading" class="muted">Loading services...</p>
    <p v-else-if="error" class="error-text">{{ error }}</p>
    <p v-else-if="services.length === 0" class="muted">No services found.</p>

    <table v-else class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          <th>Owner</th>
          <th>Tags</th>
          <th>Endpoints</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="service in services" :key="service.id">
          <td>
            <button class="link-btn" type="button" @click="goToDetail(service.id)">{{ service.name }}</button>
          </td>
          <td><span :class="['badge', service.status]">{{ service.status }}</span></td>
          <td>{{ service.owner || '-' }}</td>
          <td>{{ service.tags.join(', ') || '-' }}</td>
          <td>{{ service.endpointsCount }}</td>
          <td class="actions-row">
            <button class="secondary-btn" type="button" @click="openEditModal(service.id)">Edit</button>
            <button class="danger-btn" type="button" @click="deleteService(service.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <footer class="pagination">
      <button type="button" class="secondary-btn" :disabled="meta.page <= 1 || loading" @click="prevPage">
        Previous
      </button>
      <span>Page {{ meta.page }} / {{ meta.totalPages }} ({{ meta.total }} results)</span>
      <button
        type="button"
        class="secondary-btn"
        :disabled="meta.page >= meta.totalPages || loading"
        @click="nextPage"
      >
        Next
      </button>
    </footer>
  </section>

  <ServiceFormModal
    :open="showModal"
    :mode="modalMode"
    :initial="selectedService"
    @close="closeModal"
    @submit="submitService"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import ServiceFormModal from '../components/ServiceFormModal.vue';
import { ApiError, api } from '../services/api';
import { useToastStore } from '../stores/toast';
import type { PaginatedResponse, ServiceDetail, ServiceListItem, ServiceStatus } from '../types';

const router = useRouter();
const toastStore = useToastStore();

const services = ref<ServiceListItem[]>([]);
const loading = ref(false);
const error = ref('');

const page = ref(1);
const limit = ref(10);
const search = ref('');
const status = ref<ServiceStatus | ''>('');
const tag = ref('');
const sortBy = ref<'name' | 'createdAt'>('createdAt');
const sortOrder = ref<'asc' | 'desc'>('desc');

const meta = ref({ page: 1, limit: 10, total: 0, totalPages: 1 });

const showModal = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const selectedService = ref<ServiceDetail | null>(null);

const selectedServiceId = computed(() => selectedService.value?.id ?? null);

async function fetchServices() {
  loading.value = true;
  error.value = '';

  const params = new URLSearchParams({
    page: String(page.value),
    limit: String(limit.value),
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
  });

  if (search.value.trim()) {
    params.append('search', search.value.trim());
  }

  if (status.value) {
    params.append('status', status.value);
  }

  if (tag.value.trim()) {
    params.append('tag', tag.value.trim());
  }

  try {
    const response = await api.get<PaginatedResponse<ServiceListItem>>(`/services?${params.toString()}`);
    services.value = response.data;
    meta.value = response.meta;
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Unable to load services.';
  } finally {
    loading.value = false;
  }
}

function applyFilters() {
  page.value = 1;
  fetchServices();
}

function resetFilters() {
  search.value = '';
  status.value = '';
  tag.value = '';
  sortBy.value = 'createdAt';
  sortOrder.value = 'desc';
  applyFilters();
}

function prevPage() {
  if (page.value > 1) {
    page.value -= 1;
    fetchServices();
  }
}

function nextPage() {
  if (page.value < meta.value.totalPages) {
    page.value += 1;
    fetchServices();
  }
}

function goToDetail(id: string) {
  router.push(`/app/services/${id}`);
}

function openCreateModal() {
  modalMode.value = 'create';
  selectedService.value = null;
  showModal.value = true;
}

async function openEditModal(id: string) {
  try {
    selectedService.value = await api.get<ServiceDetail>(`/services/${id}`);
    modalMode.value = 'edit';
    showModal.value = true;
  } catch (err) {
    toastStore.push(err instanceof ApiError ? err.message : 'Unable to load service.', 'error');
  }
}

function closeModal() {
  showModal.value = false;
}

async function submitService(payload: {
  name: string;
  description?: string;
  owner?: string;
  status: ServiceStatus;
  tags: string[];
}) {
  try {
    if (modalMode.value === 'create') {
      await api.post('/services', payload);
      toastStore.push('Service created.', 'success');
    } else if (selectedServiceId.value) {
      await api.put(`/services/${selectedServiceId.value}`, payload);
      toastStore.push('Service updated.', 'success');
    }

    closeModal();
    fetchServices();
  } catch (err) {
    toastStore.push(err instanceof ApiError ? err.message : 'Failed to save service.', 'error');
  }
}

async function deleteService(id: string) {
  const confirmed = window.confirm('Delete this service and all related endpoints?');
  if (!confirmed) {
    return;
  }

  try {
    await api.delete(`/services/${id}`);
    toastStore.push('Service deleted.', 'success');
    fetchServices();
  } catch (err) {
    toastStore.push(err instanceof ApiError ? err.message : 'Failed to delete service.', 'error');
  }
}

onMounted(fetchServices);
</script>
