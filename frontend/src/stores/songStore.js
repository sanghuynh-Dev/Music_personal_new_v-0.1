
import { create } from "zustand";
import {toggleLikeApi} from "../services/songApi";
import usePlayerStore from "./playerStore";

export const useSongStore = create((set, get) => ({
    topSongs: [],
    songs: [],
    songDetail: null,

    setTopSongs: (songs) => set({ topSongs: songs }),
    setSongDetail: (song) => set({ songDetail: song }),
    setSongs: (songs) => set({ songs }),

    setCurrentSong: (song) => set({ currentSong: song }),


    toggleLikeLocal: async (songId) => {
        const data = await toggleLikeApi(songId);

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
}));

export default useSongStore;