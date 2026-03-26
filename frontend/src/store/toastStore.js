
import { create } from "zustand";

export const useToastStore = create((set) => {
  let toastId = 0;

  return {
    toasts: [],

    addToast: (message, type = "info", duration = 3000) => {
      const id = toastId++;
      set((state) => ({
        toasts: [...state.toasts, { id, message, type, duration }],
      }));

      if (duration > 0) {
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }));
        }, duration);
      }

      return id;
    },

    removeToast: (id) => set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

    success: (message, duration = 3000) => {
      const id = toastId++;
      set((state) => ({
        toasts: [...state.toasts, { id, message, type: "success" }],
      }));

      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    },

    error: (message, duration = 4000) => {
      const id = toastId++;
      set((state) => ({
        toasts: [...state.toasts, { id, message, type: "error" }],
      }));

      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    },

    warning: (message, duration = 3500) => {
      const id = toastId++;
      set((state) => ({
        toasts: [...state.toasts, { id, message, type: "warning" }],
      }));

      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    },
  };
});

