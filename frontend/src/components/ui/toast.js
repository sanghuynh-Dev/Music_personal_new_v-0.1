import useAlertStore from '../../stores/alertStore';

/* Toast = AlertDialog store (single source). Programmatic helper. */
export const toast = {
    success: (message) => useAlertStore.getState().openModal('Success', message),
    error: (message) => useAlertStore.getState().openModal('Error', message),
    warning: (message) => useAlertStore.getState().openModal('Warning', message),
};

export default toast;
