import { create } from "zustand";
import adminApi from "../services/adminApi";
export const useAdminStore = create((set, get) => ({
    reloadAdmin: false,

    toggleBan: async (userId, actionText) => {
        if (!confirm(`Are you sure you want to ${actionText} this user?`)) {
            return;
        }

        const data = await adminApi.toggleBanUser(userId);
        if (data.success) {
            alert('User banned successfully!');
            set({
                reloadAdmin: !get().reloadAdmin
            })
        } else {
            alert(data.error || 'Failed to ban user');
        }
    },

    promoteToArtist: async (userId) => {
        if (!confirm('Are you sure you want to promote this user to an Artist?')) {
            return;
        }
        const data = await adminApi.promoteToArtist(userId);
        if (data.success) {
            alert('User promoted to Artist successfully!');
            set({
                reloadAdmin: !get().reloadAdmin
            })
        } else {
            alert(data.error || 'Failed to promote user');
        }
    }
}));

export default useAdminStore