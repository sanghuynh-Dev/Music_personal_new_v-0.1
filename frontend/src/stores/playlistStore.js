import { create } from "zustand";
import playlistApi from "../services/playlistApi";
import useAlertStore from "./alertStore";
import useConfirmStore from "./confirmStore";

let timeoutId = null;
export const usePLaylistStore = create((set, get) => ({
    isMenuOpen: false,
    activeSongId: null,
    isModalOpen: false,
    reloadPlaylist: false,
    pageRef: null,
    playlistPosition: { x: 0, y: 0 },

    setPageRef: (ref) => set({ pageRef: ref }),
    openMenu: (songId, anchor) => {
        const {isMenuOpen} = get();
        if(isMenuOpen) {
            set({isMenuOpen: false});
            return;
        }
        // Anchor the fixed-position dropdown right next to the "..." button:
        // right-aligned with the button, 6px below it. Callers pass the
        // button's bounding rect; a raw {x, y} point is still accepted as
        // fallback. First paint uses this best guess; PLaylistOption then
        // measures the real menu height and calls fitMenuToViewport for an
        // exact correction (flip above when short of room).
        // Sizes mirror .playlistSelectDropdown (200px wide).
        const MENU_W = 200;
        const GAP = 6;
        const MARGIN = 8;
        const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
        let menuAnchor = null;
        let x;
        let y;
        if (anchor && typeof anchor.right === 'number') {
            menuAnchor = { top: anchor.top, right: anchor.right, bottom: anchor.bottom, left: anchor.left };
            x = Math.max(MARGIN, Math.min(anchor.right - MENU_W, vw - MENU_W - MARGIN));
            y = anchor.bottom + GAP;
        } else {
            // Fallback: legacy {x, y} point.
            x = Math.max(MARGIN, Math.min(anchor?.x ?? 0, vw - MENU_W - MARGIN));
            y = anchor?.y ?? 0;
        }
        set({
            isMenuOpen: true,
            activeSongId: songId,
            menuAnchor,
            playlistPosition: { x, y }
        })
    },
    // Exact post-layout correction with the measured menu height.
    fitMenuToViewport: (menuH) => {
        const { isMenuOpen, menuAnchor, playlistPosition } = get();
        if (!isMenuOpen) return;
        const MENU_W = 200;
        const GAP = 6;
        const MARGIN = 8;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const h = Math.min(menuH, vh - MARGIN * 2);
        let x = Math.max(MARGIN, Math.min(playlistPosition.x, vw - MENU_W - MARGIN));
        let y;
        if (!menuAnchor) {
            y = Math.max(MARGIN, Math.min(playlistPosition.y, vh - MARGIN - h));
        } else if (menuAnchor.bottom + GAP + h <= vh - MARGIN) {
            y = menuAnchor.bottom + GAP;
        } else {
            // Flip above the button, still adjacent; pin to the viewport
            // when the menu is taller than the room above it.
            y = Math.max(MARGIN, Math.min(menuAnchor.top - GAP - h, vh - MARGIN - h));
        }
        if (x !== playlistPosition.x || y !== playlistPosition.y) {
            set({ playlistPosition: { x, y } });
        }
    },
    closeMenu: () =>
        set({
            isMenuOpen: false
        }),
    
    toggleModal: () => {
        set({
            isModalOpen: !get().isModalOpen
        })
        if(get().isModalOpen) {
            get().closeMenu();
        }
    },

    addSongToPlaylist: async (playlistId, songId) => {
        if (timeoutId) clearTimeout(timeoutId);
        const data = await playlistApi.addSongToPlaylist(playlistId, songId);
        if (data.success) {
            useAlertStore.getState().openModal('Success','Added to playlist!');
        } else {
            useAlertStore.getState().openModal('Error', data.error || 'Failed to add song');
        }
        set({
            isMenuOpen: false
        })
    },

    removeSongToPlaylist: async (playlistId, songId) => {
        if (timeoutId) clearTimeout(timeoutId);
        const data = await playlistApi.removeSongToPlaylist(playlistId, songId);
        if (data.success) {
            useAlertStore.getState().openModal('Success','Song removed from playlist.');
            set({
                reloadPlaylist: !get().reloadPlaylist
            })
            timeoutId =setTimeout(() => {
                useAlertStore.getState().closeModal();
            }, 3000)
        } else {
            useAlertStore.getState().openModal('Error', data.error || 'Failed to remove song');
        }
    },

    createPlaylist: async (name, isPrivate = false) => {
        if (timeoutId) clearTimeout(timeoutId);
        const data = await playlistApi.createPlaylist(name, isPrivate);
        if (data.success) {
            useAlertStore.getState().openModal('Success','Playlist created successfully.');
            set({
                isModalOpen: false,
                reloadPlaylist: !get().reloadPlaylist
            })
            timeoutId =setTimeout(() => {
                useAlertStore.getState().closeModal();
            }, 3000)
        } else {
            useAlertStore.getState().openModal('Error', data.error || 'Failed to create playlist');
        }
    },

    deletePlaylist: async (playlistId) => {
        if (timeoutId) clearTimeout(timeoutId);
        const confirmed  = await useConfirmStore.getState().openModal('Delete this playlist?', 'This action cannot be undone.', { confirmLabel: 'Delete', danger: true });
        if (!confirmed) {
            return;
        }
        const data = await playlistApi.deletePlaylist(playlistId);
        if (data.success) {
            useAlertStore.getState().openModal('Success','Playlist deleted successfully.');
            set({
                reloadPlaylist: !get().reloadPlaylist
            })
            timeoutId =setTimeout(() => {
                useAlertStore.getState().closeModal();
            }, 3000)
            return data;
        } else {
            useAlertStore.getState().openModal('Error', data.error || 'Failed to delete playlist');
        }
    }
}));

export default usePLaylistStore