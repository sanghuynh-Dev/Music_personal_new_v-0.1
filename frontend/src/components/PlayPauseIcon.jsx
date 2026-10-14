import { Pause, Play } from 'lucide-react';

/**
 * Shared Lucide play/pause icon — solid fill, one interaction pattern
 * across footer player, track rows, cards and detail pages.
 */
function PlayPauseIcon({ playing, size = 24, className }) {
    const Icon = playing ? Pause : Play;
    return <Icon size={size} fill="currentColor" className={className} aria-hidden="true" />;
}

export default PlayPauseIcon;
