import { apiFetch, apiGet } from './http';

const qs = (params = {}) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
    }
    const s = sp.toString();
    return s ? `?${s}` : '';
};

export const getDashboard = () => apiGet('/admin/dashboard');
export const getUsers = (params = {}) => apiGet(`/admin/users${qs(params)}`);
export const getArtists = (params = {}) => apiGet(`/admin/artists${qs(params)}`);
export const getSongs = (params = {}) => apiGet(`/admin/songs${qs(params)}`);
export const getPlaylists = (q = '', params = {}) =>
    apiGet(`/admin/playlists${qs(typeof q === 'object' ? q : { q, ...params })}`);
export const getComments = (q = '', params = {}) =>
    apiGet(`/admin/comments${qs(typeof q === 'object' ? q : { q, ...params })}`);
export const getReports = (status = '', params = {}) =>
    apiGet(`/admin/reports${qs(typeof status === 'object' ? status : { status, ...params })}`);
export const getAnalytics = (days = 7) => apiGet(`/admin/analytics?days=${days}`);
export const getUserDetail = (userId) => apiGet(`/admin/user/${userId}`);

export const toggleBanUser = (userId) =>
    apiFetch(`/admin/user/${userId}/ban`, { method: 'PATCH', body: JSON.stringify({}) });

export const promoteToArtist = (userId) =>
    apiFetch(`/admin/user/${userId}/promote`, { method: 'PATCH', body: JSON.stringify({}) });

export const demoteArtist = (userId) =>
    apiFetch(`/admin/user/${userId}/demote`, { method: 'PATCH', body: JSON.stringify({}) });

export const toggleVerifyArtist = (userId) =>
    apiFetch(`/admin/user/${userId}/verify`, { method: 'PATCH', body: JSON.stringify({}) });

export const deleteUser = (userId) =>
    apiFetch(`/admin/user/${userId}`, { method: 'DELETE' });

export const deleteSong = (songId) =>
    apiFetch(`/admin/song/${songId}`, { method: 'DELETE' });

export const deletePlaylist = (playlistId) =>
    apiFetch(`/admin/playlist/${playlistId}`, { method: 'DELETE' });

export const deleteComment = (commentId) =>
    apiFetch(`/admin/comment/${commentId}`, { method: 'DELETE' });

export const reviewReport = (reportId, action) =>
    apiFetch(`/admin/report/${reportId}/review`, { method: 'PATCH', body: JSON.stringify({ action }) });

export default {
    getDashboard,
    getUsers,
    getArtists,
    getSongs,
    getPlaylists,
    getComments,
    getReports,
    getAnalytics,
    getUserDetail,
    toggleBanUser,
    promoteToArtist,
    demoteArtist,
    deleteUser,
    deleteSong,
    deletePlaylist,
    deleteComment,
    reviewReport,
    toggleVerifyArtist,
};
