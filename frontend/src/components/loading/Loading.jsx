import { LoadingState } from '../ui';

/**
 * Legacy centered loader (Favorites / History / Comments).
 * Unified on the shared equalizer LoadingState — same look everywhere.
 */
export default function Loading({ text = 'Loading your music...' }) {
  return <LoadingState text={text} />;
}
