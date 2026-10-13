import { apiGet, apiFetch, BASE } from './http';

export const getUser = () => apiGet('/user');

export const getUserPlayList = () => apiGet('/user/playlists');

export const updateAvatarUser = async (avatar) => {
    const res = await fetch(`${BASE}/profile/avatar`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        credentials: 'include',
        body: avatar
    });
    return await res.json();
};

export const updateBannerUser = async (banner) => {
    const res = await fetch(`${BASE}/profile/header`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        credentials: 'include',
        body: banner
    });
    return await res.json();
};

export const toggleFollowApi = async (artistId, isFollowing) => {
    const res = await fetch(`${BASE}/artists/${artistId}/${isFollowing ? "unfollow" : "follow"}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        credentials: 'include',
    });
    return await res.json();
};

export const getFollowings = () => apiGet('/followings');

export const changePassword = (currentPassword, newPassword) =>
    apiFetch('/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) });

export const requestPasswordReset = (email) =>
    apiFetch('/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });

export const resetPassword = (token, newPassword) =>
    apiFetch('/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) });

export const requestVerification = () =>
    apiFetch('/verify-email/request', { method: 'POST', body: JSON.stringify({}) });

export const verifyEmail = (token) =>
    apiFetch('/verify-email', { method: 'POST', body: JSON.stringify({ token }) });

export const deleteMe = (password) =>
    apiFetch('/user/me', { method: 'DELETE', body: JSON.stringify({ password }) });

export const getNotifications = () => apiGet('/notifications');
export const markAllNotificationsRead = () =>
    apiFetch('/notifications/read', { method: 'PATCH', body: JSON.stringify({}) });
export const markNotificationRead = (id) =>
    apiFetch(`/notifications/${id}/read`, { method: 'PATCH', body: JSON.stringify({}) });

export default {
    getUser,
    getUserPlayList,
    updateAvatarUser,
    updateBannerUser,
    toggleFollowApi,
    getFollowings,
    changePassword,
    requestPasswordReset,
    resetPassword,
    requestVerification,
    verifyEmail,
    deleteMe,
    getNotifications,
    markAllNotificationsRead,
    markNotificationRead,
};
