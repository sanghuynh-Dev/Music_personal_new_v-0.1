import { apiGet } from './http';

export const getDashboard = () => apiGet('/artist/dashboard');
export const getStatistics = () => apiGet('/artist/statistics');
export const getMySongs = ({ q = '', page = 1, limit = 10, sort = 'newest' } = {}) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), sort });
    if (q.trim()) params.set('q', q.trim());
    return apiGet(`/artist/songs?${params.toString()}`);
};
export const getFollowers = ({ page = 1, limit = 20 } = {}) =>
    apiGet(`/artist/followers?page=${page}&limit=${limit}`);

export default { getDashboard, getStatistics, getMySongs, getFollowers };
