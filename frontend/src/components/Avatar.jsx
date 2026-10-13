import { FALLBACK_AVATAR, FALLBACK_COVER, handleImgError } from './avatarFallback.js';

export default function Avatar({ src, alt = '', className, kind = 'avatar', ...rest }) {
    return (
        <img
            src={src || (kind === 'cover' ? FALLBACK_COVER : FALLBACK_AVATAR)}
            onError={handleImgError(kind)}
            alt={alt}
            loading="lazy"
            className={className}
            {...rest}
        />
    );
}
