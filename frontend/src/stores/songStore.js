
import { create } from "zustand";
import songApi from "../services/songApi";
import usePlayerStore from "./playerStore";

export const useSongStore = create((set, get) => ({
    topSongs: [],
    songs: [],
    reload: false,
    songDetail: null,

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
        if (!confirm('Are you sure you want to delete this track? This action cannot be undone.')) {
            return;
        }
        const data = await songApi.deleteSong(songId);

        if (data.success) {
            alert('Song deleted successfully!');
            set({
                reload: !get().reload
            })
        } else {
            alert(data.error || 'Failed to delete song');
        }
    },

    uploadSong: async (formData) => {
        const data = await songApi.uploadSong(formData);
        if (data.success) {
            alert('Song uploaded successfully!');
            set({
                reload: !get().reload
            })
            return data;
        } else {
            alert(data.error || 'Failed to upload song');
            return null;
        }
    }
}));

export default useSongStore;