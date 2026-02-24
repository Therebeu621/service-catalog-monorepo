import { defineStore } from 'pinia';

export type ToastType = 'success' | 'error' | 'info';

export type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

let toastId = 1;

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [] as Toast[],
  }),
  actions: {
    push(message: string, type: ToastType = 'info') {
      const id = toastId++;
      this.toasts.push({ id, message, type });
      setTimeout(() => this.remove(id), 3000);
    },
    remove(id: number) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id);
    },
  },
});
