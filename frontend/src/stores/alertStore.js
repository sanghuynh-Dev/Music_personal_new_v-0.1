import { create } from "zustand";

const useAlertStore = create((set, get) => ({
    isAlertOpen: false,
    message: '',
    title: '',

    openModal: (title, message) =>
        set({
            isAlertOpen: true,
            title,
            message
        }),

    closeModal: () =>
        set({
            isAlertOpen: false
        })
}));

export default useAlertStore;