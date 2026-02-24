<template>
  <div v-if="open" class="modal-backdrop">
    <div class="modal">
      <h3>{{ mode === 'create' ? 'Add Endpoint' : 'Edit Endpoint' }}</h3>

      <form class="form-grid" @submit.prevent="submitForm">
        <label>
          Method
          <select v-model="form.method">
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </label>

        <label>
          Path *
          <input v-model="form.path" type="text" required placeholder="/api/v1/orders" />
        </label>

        <label>
          Version *
          <input v-model="form.version" type="text" required placeholder="v1" />
        </label>

        <label>
          SLA (ms)
          <input v-model.number="form.slaMs" type="number" min="50" max="10000" required />
        </label>

        <label>
          Auth
          <select v-model="form.authType">
            <option value="public">public</option>
            <option value="apiKey">apiKey</option>
            <option value="jwt">jwt</option>
          </select>
        </label>

        <div class="modal-actions">
          <button type="button" class="secondary-btn" @click="$emit('close')">Cancel</button>
          <button type="submit">{{ mode === 'create' ? 'Create' : 'Save' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { AuthType, Endpoint, HttpMethod } from '../types';

type EndpointPayload = {
  method: HttpMethod;
  path: string;
  version: string;
  slaMs: number;
  authType: AuthType;
};

const props = defineProps<{
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Endpoint | null;
}>();

const emit = defineEmits<{
  close: [];
  submit: [payload: EndpointPayload];
}>();

const form = reactive<EndpointPayload>({
  method: 'GET',
  path: '/api/v1/example',
  version: 'v1',
  slaMs: 100,
  authType: 'jwt',
});

watch(
  () => props.initial,
  (initial) => {
    form.method = initial?.method ?? 'GET';
    form.path = initial?.path ?? '/api/v1/example';
    form.version = initial?.version ?? 'v1';
    form.slaMs = initial?.slaMs ?? 100;
    form.authType = initial?.authType ?? 'jwt';
  },
  { immediate: true },
);

function submitForm() {
  emit('submit', {
    method: form.method,
    path: form.path.trim(),
    version: form.version.trim(),
    slaMs: form.slaMs,
    authType: form.authType,
  });
}
</script>
