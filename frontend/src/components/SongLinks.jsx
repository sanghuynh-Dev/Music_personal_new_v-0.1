import { NavLink } from 'react-router-dom';

function artistIdOf(song) {
    const u = song?.uploadedBy;
    if (!u) return song?.artistId || null;
    return typeof u === 'string' ? u : u._id || null;
}

function handleClick(e, onNavigate) {
    // Links often sit inside play buttons / cards — never trigger the parent.
    e.stopPropagation();
    onNavigate?.();
}

/** Song title → song detail page. Falls back to plain text when no id. */
export function SongTitleLink({ song, className, onNavigate, children }) {
    if (!song?._id) return <span className={className}>{children ?? song?.title}</span>;
    return (
        <NavLink to={`/songs/${song._id}`} className={className} onClick={(e) => handleClick(e, onNavigate)}>
            {children ?? song.title}
        </NavLink>
    );
}

/** Artist name → artist profile page. Falls back to plain text when no id. */
export function ArtistLink({ song, userId, name, className, onNavigate }) {
    const id = userId || artistIdOf(song);
    const label = name ?? song?.artist;
    if (!id) return <span className={className}>{label}</span>;
    return (
        <NavLink to={`/profile/${id}`} className={className} onClick={(e) => handleClick(e, onNavigate)}>
            {label}
        </NavLink>
    );
}
