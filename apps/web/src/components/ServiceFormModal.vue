<template>
  <div v-if="open" class="modal-backdrop">
    <div class="modal">
      <h3>{{ mode === 'create' ? 'New Service' : 'Edit Service' }}</h3>

      <form class="form-grid" @submit.prevent="submitForm">
        <label>
          Name *
          <input v-model="form.name" type="text" required minlength="2" />
        </label>

        <label>
          Description
          <textarea v-model="form.description" rows="3"></textarea>
        </label>

        <label>
          Owner
          <input v-model="form.owner" type="text" />
        </label>

        <label>
          Status
          <select v-model="form.status">
            <option value="active">active</option>
            <option value="paused">paused</option>
            <option value="deprecated">deprecated</option>
          </select>
        </label>

        <label>
          Tags (comma separated)
          <input v-model="tagsInput" type="text" placeholder="orders, core" />
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
import { computed, reactive, watch } from 'vue';
import type { ServiceDetail, ServiceStatus } from '../types';

type ServiceFormPayload = {
  name: string;
  description?: string;
  owner?: string;
  status: ServiceStatus;
  tags: string[];
};

const props = defineProps<{
  open: boolean;
  mode: 'create' | 'edit';
  initial?: ServiceDetail | null;
}>();

const emit = defineEmits<{
  close: [];
  submit: [payload: ServiceFormPayload];
}>();

const form = reactive<ServiceFormPayload>({
  name: '',
  description: '',
  owner: '',
  status: 'active',
  tags: [],
});

const tagsInput = computed({
  get: () => form.tags.join(', '),
  set: (value: string) => {
    form.tags = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 10);
  },
});

watch(
  () => props.initial,
  (initial) => {
    form.name = initial?.name ?? '';
    form.description = initial?.description ?? '';
    form.owner = initial?.owner ?? '';
    form.status = initial?.status ?? 'active';
    form.tags = initial?.tags ? [...initial.tags] : [];
  },
  { immediate: true },
);

function submitForm() {
  emit('submit', {
    name: form.name.trim(),
    description: form.description?.trim() || undefined,
    owner: form.owner?.trim() || undefined,
    status: form.status,
    tags: form.tags,
  });
}
</script>
