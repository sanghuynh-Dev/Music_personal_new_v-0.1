import { create } from "zustand";

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
        const { currentSong, audioRef, isShuffle,queueIndex,originalQueue,queue } = get();
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
            const res = await fetch(`${import.meta.env.VITE_API_URL}/songs/info/${songId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
            });
            const song = await res.json();
            
            if (song.error) {
                alert(song.error);
                return;
            }
            
            set({
                currentSong: song,
                isPlaying: true
            });
            // save history
            await fetch(`${import.meta.env.VITE_API_URL}/songs/${songId}/play`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'include',
            }); 

            if (customQueue) {
                set({
                    queueIndex: isShuffle ? queue.indexOf(songId) : originalQueue.indexOf(songId)
                });
            } else {
                const queueRes = await fetch(`${import.meta.env.VITE_API_URL}/songs/queue?currentSongId=${songId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    credentials: 'include',
                });
                const fullQueue = await queueRes.json();

                set({
                    queue: fullQueue.map(item => item._id),
                    originalQueue: fullQueue.map(item => item._id),
                    originalInfoQueue: fullQueue,
                    queueIndex: 0
                });
            }

        } catch (err) {
            // console.error(err);
        }
    },

    playPlaylist: async (playlistId) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/playlists/${playlistId}`);
        const playlist = await res.json();

        set({
            activePlaylistId: playlistId,
            queue: playlist.songs.map(item => item._id),
            originalInfoQueue: playlist.songs,
            originalQueue: playlist.songs.map(item => item._id),
            queueIndex: 0
        });

        await get().playSong(queue[0], queue);
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