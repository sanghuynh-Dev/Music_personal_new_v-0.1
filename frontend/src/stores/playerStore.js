import { create } from "zustand";
import useSongStore from "./songStore";
import playlistApi from "./../services/playlistApi";
import songApi from "../services/songApi";

const usePlayerStore = create((set, get) => ({
    currentSong: null,
    isPlaying: false,
    isShuffle: false,
    activePlaylistId: null,
    queue: [],
    queueIndex: 0,
    audioRef: null,
    
    repeatMode: "off",
    originalQueue: [],
    originalInfoQueue: [],
    history: [],

    setAudioRef: (ref) => {
        set({ audioRef: ref });
    },

    setCurrentSong: (song = null) => set({ currentSong: song }),

    playSong: async (songId, customQueue = null) => {
        const { currentSong, audioRef, isShuffle,queueIndex,originalQueue,queue,activePlaylistId } = get();
        if(activePlaylistId && currentSong?._id === songId) {
            const audio = audioRef;
            if (!audio) return;
            audio.currentTime = 0;
        }
        // same song => toggle  
        if (currentSong && currentSong._id === songId) {
            const audio = audioRef.current;
            if (!audio) return;
            if (audio.paused) {
                await audio.play();
                set({ isPlaying: true });
            } else {
                audio.pause();
                set({ isPlaying: false });
            }

            return;
        }
        
        try {
            const res = await songApi.getSongInfo(songId);
            const song = await res;
            
            if (song.error) {
                alert(song.error);
                return;
            }
            
            useSongStore.getState().setSongDetail(song);
            set({
                currentSong: song,
                isPlaying: true
            });
            // save history
            await songApi.saveHistory(songId);

            if (customQueue) {
                set({
                    queueIndex: isShuffle ? queue.indexOf(songId) : originalQueue.indexOf(songId)
                });
            } else {
                const queueRes = await songApi.renderQueue(songId);

                set({
                    queue: queueRes.map(item => item._id),
                    originalQueue: queueRes.map(item => item._id),
                    originalInfoQueue: queueRes,
                    activePlaylistId: null,
                    queueIndex: 0
                });
            }

        } catch (err) {
            // console.error(err);
        }
    },

    playPlaylist: async (playlistId) => {
        const res = await playlistApi.getPlaylistById(playlistId);
        const playlist = await res;

        const newQueue = playlist.songs.map(item => item._id);

        set({
            activePlaylistId: playlistId,
            queue: newQueue,
            originalInfoQueue: playlist.songs,
            originalQueue: newQueue,
            queueIndex: 0
        });
        await get().playSong(newQueue[0], newQueue);
    },

    pauseSong: () => {
        const { audioRef } = get();
        if (!audioRef) return;

        audioRef.pause();
        set({ isPlaying: false });
    },

    resumeSong: async () => {
        const { audioRef } = get();
        if (!audioRef) return;

        await audioRef.play();
        set({ isPlaying: true });
    },

    nextSong: async () => {
        const { queue, queueIndex, isShuffle, history, repeatMode } = get();
        if (!queue.length) return;
        history.push(queueIndex);
        let nextIndex = queueIndex + 1;
        if (nextIndex >= queue.length) {
            if (repeatMode === "all") {
                nextIndex = 0;
            } else {
                set({ isPlaying: false });
                return;
            }
        }

        const nextId = queue[nextIndex];

        set({ 
            history,
            queueIndex: nextIndex 
        });

        await get().playSong(nextId, queue);
    },

    prevSong: async () => {
        const { queue, queueIndex,history } = get();

        if (!history.length) return;

        const prevIndex = history.pop();

        set({
            history,
            queueIndex: prevIndex
        });

        const prevId = queue[prevIndex];

        await get().playSong(prevId, queue);
    },

    toggleShuffle: () => {
        const {
            isShuffle,
            originalQueue,
            currentSong
        } = get();

        if (!isShuffle) {
            const shuffled = shuffleArray(
                originalQueue.filter(id => id !== currentSong._id)
            );

            const newQueue = [currentSong._id, ...shuffled];

            set({
                isShuffle: true,
                queue: newQueue,
                queueIndex: 0
            });
        } else {
            const originalIndex = originalQueue.indexOf(currentSong._id);

            set({
                isShuffle: false,
                queue: originalQueue,
                queueIndex: originalIndex
            });
        }
    },

    toggleRepeat: () => {
        const { repeatMode } = get();

        if (repeatMode === "off")
            set({ repeatMode: "all" });
        else if (repeatMode === "all")
            set({ repeatMode: "one" });
        else
            set({ repeatMode: "off" });
    }
}));

const shuffleArray = (arr) => {
    const a = [...arr];

    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
}

export default usePlayerStore;