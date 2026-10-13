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
// First visit on a small screen: keep the overlay drawer closed so it
// never covers the content; wide screens keep the classic open panel.
const wideScreen = typeof window !== 'undefined' && window.innerWidth > 1280;

export const useUiStore = create((set) => ({
    sidebarCollapsed: initial.sidebarCollapsed ?? false,
    sidebarOpen: false,
    rightPanelOpen: initial.rightPanelOpen ?? wideScreen,

    toggleSidebar: () =>
        set((s) => {
            const sidebarCollapsed = !s.sidebarCollapsed;
            save({ sidebarCollapsed });
            return { sidebarCollapsed };
        }),
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    // Explicit user choice (persisted). Auto-open on new track uses
    // setRightPanelOpen below so it never persists a mobile drawer open.
    setRightPanelOpen: (rightPanelOpen) => set({ rightPanelOpen }),
    toggleRightPanel: () =>
        set((s) => {
            const rightPanelOpen = !s.rightPanelOpen;
            save({ rightPanelOpen });
            return { rightPanelOpen };
        }),
}));

export default useUiStore;
