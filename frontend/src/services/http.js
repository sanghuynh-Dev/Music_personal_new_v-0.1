const BASE = import.meta.env.VITE_API_URL;
const DEFAULT_TIMEOUT = 15000;

/**
 * Shared fetch wrapper: credentials, JSON, timeout via AbortController.
 * Throws Error(message) on HTTP error or network failure.
 */
export async function apiFetch(path, { timeout = DEFAULT_TIMEOUT, ...options } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
        const res = await fetch(`${BASE}${path}`, {
            credentials: 'include',
            headers: { Accept: 'application/json', ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(options.headers || {}) },
            signal: controller.signal,
            ...options,
        });
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        if (!res.ok) {
            const err = new Error(data.error || `Request failed (${res.status})`);
            err.status = res.status;
            err.code = data.code;
            err.data = data;
            if (data.code === 'SESSION_REVOKED') {
                window.dispatchEvent(new CustomEvent('session-revoked'));
            }
            throw err;
        }
        return data;
    } catch (e) {
        if (e.name === 'AbortError') throw new Error('Request timed out. Please try again.', { cause: e });
        if (e instanceof SyntaxError) throw new Error('Invalid server response.', { cause: e });
        throw e;
    } finally {
        clearTimeout(timer);
    }
}

export const apiGet = (path, opts) => apiFetch(path, { method: 'GET', ...opts });

export { BASE };

export default { apiFetch, apiGet, BASE };
