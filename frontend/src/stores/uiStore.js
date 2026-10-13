import { create } from "zustand";

const KEY = "soundora-ui";

function load() {
    try {
        return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch {
        return {};
    }
}

function save(partial) {
    try {
        const prev = load();
        localStorage.setItem(KEY, JSON.stringify({ ...prev, ...partial }));
    } catch {
        /* private mode */
    }
}

const initial = load();

export const useUiStore = create((set) => ({
    sidebarCollapsed: initial.sidebarCollapsed ?? false,
    sidebarOpen: false,
    rightPanelOpen: initial.rightPanelOpen ?? true,

    toggleSidebar: () =>
        set((s) => {
            const sidebarCollapsed = !s.sidebarCollapsed;
            save({ sidebarCollapsed });
            return { sidebarCollapsed };
        }),
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    toggleRightPanel: () =>
        set((s) => {
            const rightPanelOpen = !s.rightPanelOpen;
            save({ rightPanelOpen });
            return { rightPanelOpen };
        }),
}));

export default useUiStore;
