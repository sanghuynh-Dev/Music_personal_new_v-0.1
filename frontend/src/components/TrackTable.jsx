import { NavLink } from "react-router-dom";
import clsx from "clsx";
import PlayPauseIcon from "./PlayPauseIcon";

/**
 * Shared editorial track table. Keeps one interaction pattern
 * (play / like / add-to-playlist) across Favorites, History and Profile.
 */
function TrackTable({
    songs,
    currentSong,
    isPlaying,
    onPlay,
    onLike,
    onAdd,
    user,
    playsHeader = "Plays",
    renderPlays = (song) => song.playCount || 0,
    renderMetaExtra = null,
}) {
    const isCurrentSong = (song) => song._id === currentSong?._id;

    return (
        <div className="songs-table" role="table" aria-label="Track list">
            <div className="songs-table-header" role="row">
                <div className="col-index">#</div>
                <div className="col-title">Title</div>
                <div className="col-genre">Genre</div>
                <div className="col-plays">{playsHeader}</div>
                <div className="col-actions"></div>
            </div>

            {songs?.map((song, index) => (
                <div
                    key={song._id}
                    className={clsx("song-row", isCurrentSong(song) && "song-row-current")}
                    id={`song-row-${song._id}`}
                    data-id={song._id}
                    role="row"
                >
                    <div className="col-index">
                        <span className="row-num numeric">{index + 1}</span>
                        <button
                            className="row-play-btn play-btn-js"
                            onClick={() => onPlay(song)}
                            title="Play"
                            aria-label={isCurrentSong(song) && isPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
                        >
                            <PlayPauseIcon playing={isCurrentSong(song) && isPlaying} size={24} />
                        </button>
                    </div>
                    <div className="col-title">
                        <img src={song.imageUrl?.url} alt="" loading="lazy" className="song-row-img" />
                        <div className="song-row-info">
                            <NavLink to={`/songs/${song._id}`} className="song-row-title">{song.title}</NavLink>
                            <NavLink to={`/profile/${song.uploadedBy?._id}`} className="song-row-artist">{song.artist}</NavLink>
                            {renderMetaExtra && (
                                <span className="song-row-extra">{renderMetaExtra(song)}</span>
                            )}
                        </div>
                    </div>
                    <div className="col-genre">{song.genre || 'Unknown'}</div>
                    <div className="col-plays numeric">{renderPlays(song)}</div>
                    <div className="col-actions">
                        {user && (
                            <>
                                <button
                                    className={clsx("action-icon-btn like-btn", song.liked && "liked")}
                                    onClick={() => onLike(song)}
                                    title={song.liked ? "Unlike" : "Like"}
                                    aria-label={`${song.liked ? 'Unlike' : 'Like'} ${song.title}`}
                                    aria-pressed={!!song.liked}
                                >
                                    <i className="ti-heart"></i>
                                </button>
                                <button
                                    className="action-icon-btn opt-btn"
                                    onClick={(e) => onAdd(song, e)}
                                    title="Add to Playlist"
                                    aria-label={`Add ${song.title} to playlist`}
                                >
                                    <i className="ti-more-alt"></i>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default TrackTable;
