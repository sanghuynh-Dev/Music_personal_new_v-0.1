
import { create } from "zustand";
import songApi from "../services/songApi";
import usePlayerStore from "./playerStore";
import useConfirmStore from "./confirmStore";
import useAlertStore from "./alertStore";

let timeoutId = null;

export const useSongStore = create((set, get) => ({
    topSongs: [],
    songs: [],
    reload: false,
    songDetail: null,

    progress: 0,
    uploading: false,
    uploadStatus: "",


    setTopSongs: (songs) => set({ topSongs: songs }),
    setSongDetail: (song) => set({ songDetail: song }),
    setSongs: (songs) => set({ songs }),

    setCurrentSong: (song) => set({ currentSong: song }),


    toggleLikeLocal: async (songId) => {
        let data;
        try {
            data = await songApi.toggleLikeApi(songId);
        } catch {
            data = null;
        }
        // Backend returns {error} on 401/invalid id — never corrupt local state.
        if (!data || typeof data.liked === 'undefined') {
            useAlertStore.getState().openModal('Error', data?.error || 'Failed to update like. Please sign in again.');
            return data;
        }

        // Keep footer / expanded player / queue in sync with lists.
        try {
            usePlayerStore.getState().setTrackLiked(songId, data.liked);
        } catch { /* player store optional */ }

        set((state) => ({
            songs: state.songs.map(song =>
                song._id === songId
                    ? { ...song, liked: data.liked }
                    : song
            ),

            topSongs: state.topSongs.map(song =>
                song._id === songId
                    ? { ...song, liked: data.liked }
                    : song
            ),

            songDetail: state.songDetail?._id === songId
                ? { ...state.songDetail, liked: data.liked }
                : state.songDetail,

            reload: !get().reload
        }));
        return data;
    },

    deleteSong: async (songId) => {
        if (timeoutId) clearTimeout(timeoutId);

        const confirmed  = await useConfirmStore.getState().openModal('Delete this song?', 'This action cannot be undone.');
        if (!confirmed ) {
            return;
        }
        const data = await songApi.deleteSong(songId);

        if (data.success) {
            set({
                reload: !get().reload
            })
            useAlertStore.getState().openModal('Success','Song deleted successfully.');

            timeoutId =setTimeout(() => {
                useAlertStore.getState().closeModal();
            }, 3000)
            
        } else {
            useAlertStore.getState().openModal('Error', data.error || 'Failed to delete song');
        }
    },

    uploadSong: async (formData) => {
        try {
            if (timeoutId) clearTimeout(timeoutId);
            set({
                uploading: true,
                progress: 0,
                uploadStatus: "Uploading track..."
            });

            const data = await songApi.uploadSong(
                formData,
                (percent) => {
                    if (percent < 95) {
                        set({ progress: percent });
                    } else {
                        set({
                            progress: 95,
                            uploadStatus: "Processing upload..."
                        });
                    }
                }
            );

            if (data.success) {
                set({
                    progress: 100,
                    uploadStatus: "Completed!"
                });

                useAlertStore.getState().openModal("Success","Song uploaded successfully.");

                set({
                    reload: !get().reload,
                });
                
                timeoutId = setTimeout(() => {
                    set({
                        uploading: false,
                        progress: 0
                    });

                    useAlertStore.getState().closeModal();
                }, 1500)

                return data;
            }
        } catch (err) {
            set({
                uploading: false,
                progress: 0
            });

            useAlertStore.getState().openModal('Error', err.message || 'Upload failed. Please try again.');
        }
    }
}));

export default useSongStore;