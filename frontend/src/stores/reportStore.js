import { create } from 'zustand';
import { submitReport } from '../services/reportApi';
import useAlertStore from './alertStore';

const useReportStore = create((set, get) => ({
    isOpen: false,
    target: null, // { type: 'song'|'user'|'playlist'|'comment', id, label }
    submitting: false,

    openReport: (target) => {
        if (!target?.id || !target?.type) return;
        set({ isOpen: true, target });
    },

    closeReport: () => {
        if (get().submitting) return;
        set({ isOpen: false, target: null });
    },

    submit: async ({ type, reason }) => {
        const { target } = get();
        if (!target) return { success: false };
        set({ submitting: true });
        try {
            const data = await submitReport({
                targetType: target.type,
                targetId: target.id,
                type,
                reason,
            });
            set({ isOpen: false, target: null, submitting: false });
            useAlertStore.getState().openModal(
                'Success',
                data.duplicate
                    ? 'You already reported this. Our moderators are reviewing it.'
                    : 'Thanks — your report was submitted for review.'
            );
            return { success: true };
        } catch (e) {
            set({ submitting: false });
            useAlertStore.getState().openModal('Error', e.message || 'Failed to submit report.');
            return { success: false };
        }
    },
}));

export default useReportStore;
