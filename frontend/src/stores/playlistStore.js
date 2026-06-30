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
    openMenu: (songId, position) => {
        const {isMenuOpen} = get();
        if(isMenuOpen) {
            set({isMenuOpen: false});
            return;
        }
        set({
            isMenuOpen: true,
            activeSongId: songId,
            playlistPosition: position
        })
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
            alert(data.error || 'Failed to add song');
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
            alert(data.error || 'Failed to remove song');
        }
    },

    createPlaylist: async (name) => {
        if (timeoutId) clearTimeout(timeoutId);
        const data = await playlistApi.createPlaylist(name);
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
            alert(data.error || 'Failed to create playlist');
        }
    },

    deletePlaylist: async (playlistId) => {
        if (timeoutId) clearTimeout(timeoutId);
        const confirmed  = await useConfirmStore.getState().openModal('Delete this playlist?', 'This action cannot be undone.');
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
            alert(data.error || 'Failed to delete playlist');
        }
    }
}));

export default usePLaylistStore