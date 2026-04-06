import { create } from "zustand";

export type ConfirmVariant = "danger" | "warning" | "info";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions;
  resolve: ((value: boolean) => void) | null;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export const useConfirmStore = create<ConfirmState>()((set, get) => ({
  isOpen: false,
  options: {
    title: "",
    description: "",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    variant: "info",
  },
  resolve: null,

  confirm: (options: ConfirmOptions) =>
    new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        options: {
          confirmLabel: "Confirm",
          cancelLabel: "Cancel",
          variant: "info",
          ...options,
        },
        resolve,
      });
    }),

  handleConfirm: () => {
    const { resolve } = get();
    resolve?.(true);
    set({ isOpen: false, resolve: null });
  },

  handleCancel: () => {
    const { resolve } = get();
    resolve?.(false);
    set({ isOpen: false, resolve: null });
  },
}));
