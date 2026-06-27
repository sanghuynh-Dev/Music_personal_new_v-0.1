import { create } from "zustand";
import songApi from "../services/songApi";

export const useCommentStore = create((set,get) => ({
    comments: [],
    reloadComments: false,

    loadComments: async (songId) => {
         try {
            const res = await songApi.loadComments(songId);
            const data = await res;
            set({ 
                comments: data,
                reloadComments: !get().reloadComments
            });
        } catch (err) {
            console.error("Error loading comments:", err);
        }
        
    },

    addComment: async (songId, content) => {
        try {
            const trimmed = content.trim();
            if (!trimmed) return;
            const res = await songApi.addComment(songId,trimmed);
            const data = await res;
            if (data.success) {
                set({ 
                    reloadComments: !get().reloadComments
                });
                return data;
            } else {
                return data;
            }
            
        } catch (err) {
            console.error("Error adding comment:", err);
        }
    }
}));

export default useCommentStore;