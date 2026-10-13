// Local SVG placeholders — no dependency on personal Cloudinary URLs.
export const FALLBACK_AVATAR =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="#26263A"/><circle cx="48" cy="36" r="16" fill="#8A88A0"/><path d="M20 78c4-16 14-24 28-24s24 8 28 24" fill="#8A88A0"/></svg>`
    );

export const FALLBACK_COVER =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="12" fill="#26263A"/><path d="M80 130V74l44-10v48" stroke="#F5A623" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="72" cy="130" r="14" fill="#F5A623"/><circle cx="116" cy="112" r="14" fill="#F5A623"/></svg>`
    );

export function handleImgError(kind = 'avatar') {
    return (e) => {
        const el = e.currentTarget;
        if (el.dataset.fbk) return;
        el.dataset.fbk = '1';
        el.src = kind === 'cover' ? FALLBACK_COVER : FALLBACK_AVATAR;
    };
}
