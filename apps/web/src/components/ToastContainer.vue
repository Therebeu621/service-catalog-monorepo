<template>
  <div class="toast-container">
    <div v-for="toast in toasts" :key="toast.id" :class="['toast', toast.type]">
      <span>{{ toast.message }}</span>
      <button type="button" @click="remove(toast.id)">x</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useToastStore } from '../stores/toast';

const toastStore = useToastStore();
const { toasts } = storeToRefs(toastStore);

function remove(id: number) {
  toastStore.remove(id);
}
</script>
