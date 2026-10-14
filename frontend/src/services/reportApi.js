import { apiFetch, apiGet } from './http';

export const submitReport = ({ targetType, targetId, type, reason }) =>
    apiFetch('/reports', {
        method: 'POST',
        body: JSON.stringify({ targetType, targetId, type, reason }),
    });

export const myReports = () => apiGet('/reports/mine');

export default { submitReport, myReports };
