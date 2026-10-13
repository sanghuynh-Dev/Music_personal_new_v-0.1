import { create } from "zustand";
import { toggleFollowApi } from "../services/userApi";

const useFollowStore = create((set, get) => ({
    artists: [],
    reloadFollow: false,

    setArtists: (artists) => set({ artists }),

    toggleFollow: async (artistId) => {
        if (get()._followBusy?.[artistId]) return;
        const artist = get().artists.find((a) => a._id === artistId);
        if (!artist) return;

        const isFollowing = artist.isFollowing;
        set((state) => ({
            _followBusy: { ...(state._followBusy || {}), [artistId]: true },
        }));

        // optimistic update (button flips instantly, no refetch)
        set((state) => ({
            artists: state.artists.map((artist) =>
                artist._id === artistId
                ? {
                    ...artist,
                    isFollowing: !isFollowing,
                    }
                : artist
            ),
        }));

        try {
           const data = await toggleFollowApi(artistId, isFollowing);
           if (!data.success) {
               // revert on server rejection
               set((state) => ({
                   artists: state.artists.map((artist) =>
                       artist._id === artistId
                       ? { ...artist, isFollowing }
                       : artist
                   ),
               }));
           }
        } catch (err) {
            console.error(err);
            // revert on network failure
            set((state) => ({
                artists: state.artists.map((artist) =>
                    artist._id === artistId
                    ? { ...artist, isFollowing }
                    : artist
                ),
            }));
        } finally {
            set((state) => {
                const busy = { ...(state._followBusy || {}) };
                delete busy[artistId];
                return { _followBusy: busy };
            });
        }
    },

    toggleFollowSingle: async (artistId, isFollowing) => {
        try {
            const data = await toggleFollowApi(artistId, isFollowing);
            return data;
        } catch (err) {
            console.error(err);
            return null;
        }
    },
}));

export default useFollowStore;