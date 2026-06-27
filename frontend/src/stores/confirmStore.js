import { create } from "zustand";

const useConfirmStore = create((set) => ({
    isConfirmOpen: false,
    actionText: '',
    message: '',
    resolver: null,

    openModal: (text, message) =>
        new Promise((resolve) => {
            set({
                isConfirmOpen: true,
                actionText: text,
                message: message,
                resolver: resolve
            });
        }),

    handleConfirm: () => {
        const resolver = useConfirmStore.getState().resolver;

        resolver?.(true);

        set({
            isConfirmOpen: false,
            actionText: '',
            resolver: null
        });
    },

    handleCancel: () => {
        const resolver = useConfirmStore.getState().resolver;

        resolver?.(false);

        set({
            isConfirmOpen: false,
            actionText: '',
            resolver: null
        });
    }
}));

export default useConfirmStore;