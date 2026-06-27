
import { create } from "zustand";
import songApi from "../services/songApi";
import usePlayerStore from "./playerStore";
import useConfirmStore from "./confirmStore";
import useAlertStore from "./alertStore";

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
        const data = await songApi.toggleLikeApi(songId);

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
                : state.songDetail
        }));

        // usePlayerStore.setState((state) => ({
        //     currentSong:
        //         state.currentSong?._id === songId
        //             ? { ...state.currentSong, liked: data.liked }
        //             : state.currentSong
        // }));
    },

    deleteSong: async (songId) => {
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
            setTimeout(() => {
                useAlertStore.getState().closeModal();
            }, 3000);
        } else {
            alert(data.error || 'Failed to delete song');
        }
    },

    uploadSong: async (formData) => {
        try {
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
                    reload: !get().reload
                });

                setTimeout(() => {
                    set({
                        uploading: false,
                        progress: 0
                    });

                    useAlertStore.getState().closeModal();
                }, 1500);

                return data;
            }
        } catch (err) {
            set({
                uploading: false,
                progress: 0
            });

            alert("Upload failed");
            console.log(err);
        }
    }
}));

export default useSongStore;