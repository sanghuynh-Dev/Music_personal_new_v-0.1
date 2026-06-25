import { create } from "zustand";

export const useArtistStore = create((set) => ({
    users: [],
    user: null,

    setUsers: (users) => set({ users }),
    setUser: (user) => set({ user }),

    toggleFollowLocal: (userId, count) =>
        set((state) => ({
            users: state.users.map((user) =>
                user._id === userId
                    ? {
                          ...user,
                          isFollowing: !artist.isFollowing,
                          followersCount: count,
                      }
                    : user
            ),
        })),
}));