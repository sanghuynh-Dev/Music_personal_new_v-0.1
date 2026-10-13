import { create } from "zustand";
import adminApi from "../services/adminApi";
import useConfirmStore from "./confirmStore";
import useAlertStore from "./alertStore";

export const useAdminStore = create((set, get) => ({
    reloadAdmin: false,
    loading: false,

    bump: () => set({ reloadAdmin: !get().reloadAdmin }),

    toggleBan: async (userId, actionText) => {
        const ok = await useConfirmStore.getState().openModal(
            `${actionText === 'unban' ? 'Unban' : 'Ban'} user`,
            `Are you sure you want to ${actionText} this user?`
        );
        if (!ok) return;
        try {
            set({ loading: true });
            await adminApi.toggleBanUser(userId);
            useAlertStore.getState().openModal('Success', `User ${actionText} successfully.`);
            get().bump();
        } catch (e) {
            useAlertStore.getState().openModal('Failed', e.message || 'Failed to update user.');
        } finally {
            set({ loading: false });
        }
    },

    promoteToArtist: async (userId) => {
        const ok = await useConfirmStore.getState().openModal(
            'Promote to Artist',
            'Are you sure you want to promote this user to Artist?'
        );
        if (!ok) return;
        try {
            set({ loading: true });
            await adminApi.promoteToArtist(userId);
            useAlertStore.getState().openModal('Success', 'User promoted to Artist.');
            get().bump();
        } catch (e) {
            useAlertStore.getState().openModal('Failed', e.message || 'Failed to promote user.');
        } finally {
            set({ loading: false });
        }
    },

    demoteArtist: async (userId) => {
        const ok = await useConfirmStore.getState().openModal(
            'Demote to User',
            'Demote this artist back to a regular user? Their songs stay published.'
        );
        if (!ok) return;
        try {
            set({ loading: true });
            await adminApi.demoteArtist(userId);
            useAlertStore.getState().openModal('Success', 'Artist demoted to user.');
            get().bump();
        } catch (e) {
            useAlertStore.getState().openModal('Failed', e.message || 'Failed to demote artist.');
        } finally {
            set({ loading: false });
        }
    },

    toggleVerify: async (userId, verified) => {
        const ok = await useConfirmStore.getState().openModal(
            verified ? 'Remove verification' : 'Verify artist',
            verified ? 'Remove the verified badge from this artist?' : 'Mark this artist as verified?'
        );
        if (!ok) return;
        try {
            set({ loading: true });
            await adminApi.toggleVerifyArtist(userId);
            useAlertStore.getState().openModal('Success', verified ? 'Verification removed.' : 'Artist verified.');
            get().bump();
        } catch (e) {
            useAlertStore.getState().openModal('Failed', e.message || 'Failed to update verification.');
        } finally {
            set({ loading: false });
        }
    },

    deleteUser: async (userId) => {
        const ok = await useConfirmStore.getState().openModal(
            'Delete user',
            'Delete this user and ALL their songs, playlists and comments? This cannot be undone.'
        );
        if (!ok) return;
        try {
            set({ loading: true });
            await adminApi.deleteUser(userId);
            useAlertStore.getState().openModal('Success', 'User deleted.');
            get().bump();
        } catch (e) {
            useAlertStore.getState().openModal('Failed', e.message || 'Failed to delete user.');
        } finally {
            set({ loading: false });
        }
    },

    deleteSong: async (songId) => {
        const ok = await useConfirmStore.getState().openModal(
            'Delete song',
            'Delete this song from the system and Cloudinary? This cannot be undone.'
        );
        if (!ok) return;
        try {
            set({ loading: true });
            await adminApi.deleteSong(songId);
            useAlertStore.getState().openModal('Success', 'Song deleted.');
            get().bump();
        } catch (e) {
            useAlertStore.getState().openModal('Failed', e.message || 'Failed to delete song.');
        } finally {
            set({ loading: false });
        }
    },

    deletePlaylist: async (playlistId) => {
        const ok = await useConfirmStore.getState().openModal(
            'Delete playlist',
            'Delete this playlist? Songs themselves are kept.'
        );
        if (!ok) return;
        try {
            set({ loading: true });
            await adminApi.deletePlaylist(playlistId);
            useAlertStore.getState().openModal('Success', 'Playlist deleted.');
            get().bump();
        } catch (e) {
            useAlertStore.getState().openModal('Failed', e.message || 'Failed to delete playlist.');
        } finally {
            set({ loading: false });
        }
    },

    deleteComment: async (commentId) => {
        const ok = await useConfirmStore.getState().openModal(
            'Delete comment',
            'Delete this comment? This cannot be undone.'
        );
        if (!ok) return;
        try {
            set({ loading: true });
            await adminApi.deleteComment(commentId);
            useAlertStore.getState().openModal('Success', 'Comment deleted.');
            get().bump();
        } catch (e) {
            useAlertStore.getState().openModal('Failed', e.message || 'Failed to delete comment.');
        } finally {
            set({ loading: false });
        }
    },

    reviewReport: async (reportId, action) => {
        const ok = await useConfirmStore.getState().openModal(
            action === 'resolve' ? 'Resolve report' : 'Dismiss report',
            `Mark report as ${action === 'resolve' ? 'resolved' : 'dismissed'}?`
        );
        if (!ok) return;
        try {
            set({ loading: true });
            await adminApi.reviewReport(reportId, action);
            useAlertStore.getState().openModal('Success', `Report ${action}d.`);
            get().bump();
        } catch (e) {
            useAlertStore.getState().openModal('Failed', e.message || 'Failed to review report.');
        } finally {
            set({ loading: false });
        }
    },
}));

export default useAdminStore;
