import { create } from "zustand";
import { toggleFollowApi } from "../services/userApi";

const useFollowStore = create((set, get) => ({
    artists: [],
    reloadFollow: false,

    setArtists: (artists) => set({ artists }),

    toggleFollow: async (artistId) => {
        const artist = get().artists.find((a) => a._id === artistId);
        if (!artist) return;

        const isFollowing = artist.isFollowing;

        // optimistic update
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
           if (data.success) {
               set({ reloadFollow: !get().reloadFollow });
           }
        } catch (err) {
            console.error(err);
        }
    },

    toggleFollowSingle: async (artistId, isFollowing) => {
        const data = await toggleFollowApi(artistId, isFollowing);
        if (data.success) {
            set({ reloadFollow: !get().reloadFollow });
        } 
    },
}));

export default useFollowStore;