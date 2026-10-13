import { create } from "zustand";
import { persist } from "zustand/middleware";
import useSongStore from "./songStore";
import playlistApi from "./../services/playlistApi";
import songApi from "../services/songApi";
import useAlertStore from "./alertStore";

const CHANNEL_NAME = "soundora-player";
const TAB_ID = Math.random().toString(36).slice(2);

const fail = (message) => useAlertStore.getState().openModal("Error", message);

const toIds = (list) =>
    (list || [])
        .map((item) => (typeof item === "string" ? item : item?._id))
        .filter(Boolean)
        .map(String);

const indexTracks = (tracks) => {
    const map = {};
    for (const t of tracks || []) {
        if (t?._id) map[String(t._id)] = t;
    }
    return map;
};

// Placeholder for ids whose full info hasn't loaded yet — keeps queue
// order/count stable instead of dropping unplayed tracks from the UI.
const placeholderTrack = (id) => ({ _id: String(id), title: 'Loading…', artist: '' });

// Fire-and-forget: fetch full info for queue ids missing from the map.
const backfillQueueTracks = (ids, set, get) => {
    const missing = (ids || []).map(String).filter((id) => id && !get().queueTracks[id]);
    if (!missing.length) return;
    const unique = [...new Set(missing)];
    Promise.all(unique.map((id) => songApi.getSongInfo(id).catch(() => null))).then((results) => {
        const found = indexTracks(results.filter((r) => r && !r.error && r._id));
        if (Object.keys(found).length) {
            set((s) => ({ queueTracks: { ...s.queueTracks, ...found } }));
        }
    });
};

const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

let channel = null;
try {
    channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL_NAME) : null;
} catch {
    channel = null;
}

const announcePlay = () => {
    try { channel?.postMessage({ type: "playing", tabId: TAB_ID }); } catch { /* noop */ }
};

export const usePlayerStore = create()(persist((set, get) => {
    // Pause this tab when another tab starts playback (single-playback).
    try {
        channel?.addEventListener("message", (e) => {
            if (e.data?.type === "playing" && e.data.tabId !== TAB_ID) {
                get().pauseSong();
            }
        });
    } catch { /* noop */ }

    const audio = () => get().audioRef || null;

    return {
        currentSong: null,
        isPlaying: false,
        isShuffle: false,
        activePlaylistId: null,
        queue: [],
        queueIndex: 0,
        queueTracks: {},
        audioRef: null,

        repeatMode: "off",
        originalQueue: [],
        history: [],
        volume: 0.5,
        muted: false,

        setAudioRef: (ref) => {
            set({ audioRef: ref });
        },

        setCurrentSong: (song = null) => set({ currentSong: song }),

        setVolume: (v) => {
            const volume = Math.min(1, Math.max(0, Number(v) || 0));
            const muted = volume === 0;
            const el = audio();
            if (el) {
                el.volume = volume;
                el.muted = muted;
            }
            set({ volume, muted });
        },

        toggleMute: () => {
            const el = audio();
            const muted = !get().muted;
            if (el) el.muted = muted;
            set({ muted });
        },

        playSong: async (songId, customQueue = null) => {
            const state = get();
            songId = String(songId || "");
            if (!songId) return;

            // Same song => toggle
            if (state.currentSong && String(state.currentSong._id) === songId) {
                const el = audio();
                if (!el) return;
                if (el.paused) {
                    try {
                        await el.play();
                        set({ isPlaying: true });
                        announcePlay();
                    } catch { set({ isPlaying: false }); }
                } else {
                    el.pause();
                    set({ isPlaying: false });
                }
                return;
            }

            try {
                const song = await songApi.getSongInfo(songId);
                if (!song || song.error) {
                    fail(song?.error || "Song is unavailable (it may have been deleted).");
                    return;
                }
                if (!song.audioUrl?.url) {
                    fail("Song has no playable audio.");
                    return;
                }

                useSongStore.getState().setSongDetail(song);
                set({ currentSong: song, isPlaying: true });
                announcePlay();
                // History must never break playback
                try { await songApi.saveHistory(songId); } catch { /* noop */ }

                if (customQueue) {
                    const ids = toIds(customQueue);
                    const tracks = indexTracks(customQueue);
                    const idx = ids.indexOf(songId);
                    set((s) => ({
                        queue: ids.length ? ids : [songId],
                        queueTracks: { ...s.queueTracks, ...tracks, [songId]: song },
                        originalQueue: ids.length ? ids : [songId],
                        queueIndex: idx > -1 ? idx : 0,
                        activePlaylistId: null,
                        isShuffle: false,
                    }));
                    // customQueue may be id-only (next/prev/playlist rows):
                    // fetch missing track info so queue UI never collapses.
                    backfillQueueTracks(ids, set, get);
                } else {
                    const queueRes = await songApi.renderQueue(songId).catch(() => []);
                    const list = Array.isArray(queueRes) ? queueRes : [];
                    const ids = toIds(list);
                    set((s) => ({
                        queue: ids.length ? ids : [songId],
                        queueTracks: { ...s.queueTracks, ...indexTracks(list), [songId]: song },
                        originalQueue: ids.length ? ids : [songId],
                        queueIndex: 0,
                        activePlaylistId: null,
                        isShuffle: false,
                    }));
                }
            } catch {
                fail("Could not play this song. Please try again.");
            }
        },

        playPlaylist: async (playlistId) => {
            try {
                const res = await playlistApi.getPlaylistById(playlistId);
                const songs = res?.playlist?.songs || res?.songs || [];
                const ids = toIds(songs);
                if (!ids.length) {
                    fail("This playlist is empty.");
                    return;
                }
                set((s) => ({
                    activePlaylistId: playlistId,
                    queue: ids,
                    queueTracks: { ...s.queueTracks, ...indexTracks(songs) },
                    originalQueue: ids,
                    queueIndex: 0,
                    isShuffle: false,
                }));
                await get().playSong(ids[0], songs);
            } catch {
                fail("Could not play this playlist.");
            }
        },

        pauseSong: () => {
            const el = audio();
            if (!el) return;
            el.pause();
            set({ isPlaying: false });
        },

        resumeSong: async () => {
            const el = audio();
            if (!el) return;
            try {
                await el.play();
                set({ isPlaying: true });
                announcePlay();
            } catch {
                set({ isPlaying: false });
            }
        },

        nextSong: async () => {
            const { queue, queueIndex, history, repeatMode } = get();
            if (!queue.length) return;
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
            set({ history: [...history, queueIndex], queueIndex: nextIndex });
            await get().playSong(nextId, queue);
        },

        prevSong: async () => {
            const { queue, history } = get();
            const el = audio();
            // No history: restart current track (standard streaming behaviour)
            if (!history.length) {
                if (el) {
                    el.currentTime = 0;
                    try {
                        await el.play();
                        set({ isPlaying: true });
                    } catch { /* noop */ }
                }
                return;
            }
            const prevHistory = [...history];
            const prevIndex = prevHistory.pop();
            const prevId = queue[prevIndex];
            set({ history: prevHistory, queueIndex: prevIndex });
            if (prevId) await get().playSong(prevId, queue);
        },

        playFromQueue: async (songId) => {
            const { queue } = get();
            const idx = queue.map(String).indexOf(String(songId));
            if (idx > -1) set({ queueIndex: idx });
            await get().playSong(songId, queue.length ? queue : null);
        },

        removeFromQueue: (songId) => {
            const { queue, queueIndex, currentSong } = get();
            const id = String(songId);
            if (id === String(currentSong?._id)) return; // never remove what's playing
            const idx = queue.map(String).indexOf(id);
            if (idx === -1) return;
            const next = queue.filter((x) => String(x) !== id);
            set((s) => {
                const tracks = { ...s.queueTracks };
                delete tracks[id];
                return {
                    queue: next,
                    queueTracks: tracks,
                    originalQueue: s.originalQueue.filter((x) => String(x) !== id),
                    queueIndex: idx < queueIndex ? queueIndex - 1 : queueIndex,
                };
            });
        },

        clearQueue: () => {
            const { currentSong } = get();
            const id = currentSong?._id ? String(currentSong._id) : null;
            set((s) => ({
                queue: id ? [id] : [],
                originalQueue: id ? [id] : [],
                queueTracks: id && s.queueTracks[id] ? { [id]: s.queueTracks[id] } : {},
                queueIndex: 0,
                history: [],
                isShuffle: false,
            }));
        },

        shuffleQueue: () => {
            const { queue, currentSong } = get();
            if (queue.length < 3 || !currentSong) return;
            const cur = String(currentSong._id);
            const rest = queue.filter((id) => String(id) !== cur);
            set({ queue: [cur, ...shuffleArray(rest)], queueIndex: 0 });
        },

        toggleShuffle: () => {
            const { isShuffle, originalQueue, currentSong, queue } = get();
            if (!currentSong || !queue.length) return;
            const cur = String(currentSong._id);
            if (!isShuffle) {
                const rest = (originalQueue.length ? originalQueue : queue).filter((id) => String(id) !== cur);
                set({ isShuffle: true, queue: [cur, ...shuffleArray(rest)], queueIndex: 0 });
            } else {
                const originalIndex = originalQueue.map(String).indexOf(cur);
                set({ isShuffle: false, queue: [...originalQueue], queueIndex: originalIndex > -1 ? originalIndex : 0 });
            }
        },

        toggleRepeat: () => {
            const { repeatMode } = get();
            if (repeatMode === "off") set({ repeatMode: "all" });
            else if (repeatMode === "all") set({ repeatMode: "one" });
            else set({ repeatMode: "off" });
        },

        // Called by songStore after a successful like toggle so footer,
        // expanded player and queue always agree with lists.
        setTrackLiked: (songId, liked) => {
            const id = String(songId || "");
            if (!id) return;
            set((s) => ({
                currentSong: s.currentSong && String(s.currentSong._id) === id
                    ? { ...s.currentSong, liked }
                    : s.currentSong,
                queueTracks: s.queueTracks[id]
                    ? { ...s.queueTracks, [id]: { ...s.queueTracks[id], liked } }
                    : s.queueTracks,
            }));
        },
    };
}, {
    name: "soundora-player",
    partialize: (s) => ({
        currentSong: s.currentSong,
        queue: s.queue,
        queueTracks: s.queueTracks,
        queueIndex: s.queueIndex,
        originalQueue: s.originalQueue,
        repeatMode: s.repeatMode,
        isShuffle: s.isShuffle,
        volume: s.volume,
        muted: s.muted,
        activePlaylistId: s.activePlaylistId,
    }),
    // Never resume autoplay after refresh (browser policy + user expectation).
    merge: (persisted, current) => ({ ...current, ...(persisted || {}), isPlaying: false, audioRef: null, history: [] }),
}));

export const selectQueueList = (s) =>
    s.queue.map((id) => s.queueTracks[String(id)] || placeholderTrack(id));

export default usePlayerStore;
