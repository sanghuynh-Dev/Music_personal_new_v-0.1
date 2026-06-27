import { create } from "zustand";
import playlistApi from "../services/playlistApi";

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
        const data = await playlistApi.addSongToPlaylist(playlistId, songId);
        if (data.success) {
            alert('Added to playlist!');
        } else {
            alert(data.error || 'Failed to add song');
        }
        set({
            isMenuOpen: false
        })
    },

    removeSongToPlaylist: async (playlistId, songId) => {
        const data = await playlistApi.removeSongToPlaylist(playlistId, songId);
        if (data.success) {
            alert('song removed!');
            set({
                reloadPlaylist: !get().reloadPlaylist
            })
        } else {
            alert(data.error || 'Failed to remove song');
        }
    },

    createPlaylist: async (name) => {
        const data = await playlistApi.createPlaylist(name);
        if (data.success) {
            alert('Playlist created!');
            set({
                isModalOpen: false,
                reloadPlaylist: !get().reloadPlaylist
            })
        } else {
            alert(data.error || 'Failed to create playlist');
        }
    },

    deletePlaylist: async (playlistId) => {
        if (!confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) {
            return;
        }
        const data = await playlistApi.deletePlaylist(playlistId);
        if (data.success) {
            alert('Playlist deleted!');
            set({
                reloadPlaylist: !get().reloadPlaylist
            })
        } else {
            alert(data.error || 'Failed to delete playlist');
        }
    }
}));

export default usePLaylistStore