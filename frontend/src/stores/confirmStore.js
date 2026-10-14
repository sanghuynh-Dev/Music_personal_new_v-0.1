import { create } from "zustand";

const useConfirmStore = create((set) => ({
    isConfirmOpen: false,
    actionText: '',
    message: '',
    resolver: null,
    confirmLabel: 'Confirm',
    danger: true,

    openModal: (text, message, options = {}) =>
        new Promise((resolve) => {
            set({
                isConfirmOpen: true,
                actionText: text,
                message: message,
                resolver: resolve,
                confirmLabel: options.confirmLabel || 'Confirm',
                danger: options.danger !== undefined ? options.danger : true
            });
        }),

    handleConfirm: () => {
        const resolver = useConfirmStore.getState().resolver;

        resolver?.(true);

        set({
            isConfirmOpen: false,
            actionText: '',
            resolver: null,
            confirmLabel: 'Confirm',
            danger: true
        });
    },

    handleCancel: () => {
        const resolver = useConfirmStore.getState().resolver;

        resolver?.(false);

        set({
            isConfirmOpen: false,
            actionText: '',
            resolver: null,
            confirmLabel: 'Confirm',
            danger: true
        });
    }
}));

export default useConfirmStore;
