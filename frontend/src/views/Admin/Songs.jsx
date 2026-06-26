
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import usePlayerStore from '../../stores/playerStore';
import useSongStore from '../../stores/songStore';
import stylesAdmin from './Admin.module.scss'
import stylesSong from './Song.module.scss'

function Songs({ songs }) {
    const {
        currentSong,
        setCurrentSong,
        isPlaying,
        playSong,
        pauseSong,
        resumeSong,
    } = usePlayerStore();

    const { deleteSong } = useSongStore();
    const isCurrentSong = (song) => song._id === currentSong?._id;

    function handleClick(song) {
        if (isCurrentSong(song)) {
            if (isPlaying) pauseSong();
            else resumeSong();
        } else {
            playSong(song._id);
        }
    }

    function handleDeleteSong(song) {
        if (isCurrentSong(song)){
            pauseSong();
            setCurrentSong(null);
        } 
        deleteSong(song._id);
    }
    return (
       <div className="profile-content">
            <div className="songs-list-container">
                { songs && songs.length > 0 ? (
                    <div className="songs-table">
                        {/* <!-- Column Headers --> */}
                        <div className={clsx("songs-table-header", stylesSong.gridSongTable)}>
                            <div className="col-index">#</div>
                            <div>Track Title</div>
                            <div>Uploader</div>
                            <div>Genre</div>
                            <div>Plays</div>
                            <div className={stylesAdmin.colActions}></div>
                        </div>
                        
                        {songs.map((song, index) => (
                            <div key={song._id} className={clsx("song-row", stylesSong.gridSongRow)}>
                                <div className="col-index">
                                    <span className="row-num">{index + 1}</span>
                                    <button 
                                        className="row-play-btn play-btn-js" 
                                        onClick={() => handleClick(song)}
                                        title="Play">
                                        { isCurrentSong(song) && isPlaying ? (
                                            <svg className="icon-pause" id="pause-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M0 5h4v14H0zm8 0h4v14H8z"></path>
                                            </svg>
                                        ): (
                                            <svg className="icon-play" id="play-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M0 5v14l11-7z"></path>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                
                                {/* <!-- Track Title / Album art click details link --> */}
                                <div className={stylesSong.songInfo}>
                                    <img 
                                        src={song.imageUrl?.url || 'https://res.cloudinary.com/dqynaodv1/image/upload/v1717904033/resources/images/default-thumbnail.png'} 
                                        alt={song.title} 
                                        className={clsx("song-row-img", stylesSong.songRowImg)}></img>
                                    <NavLink to={`/songs/${song._id}`} className={stylesSong.songLink}>{song.title}</NavLink>
                                </div>
                                
                                {/* <!-- Uploader profile link --> */}
                                <div className={stylesSong.songUploaderProfile}>
                                    <NavLink to={`/profile/${song.uploadedBy?._id || song.uploadedBy}`} className={stylesSong.uploaderLink}>{song.uploadedBy?.username || 'System Seeded'}</NavLink>
                                </div>
                                
                                {/* <!-- Genre --> */}
                                <div className={stylesSong.songGenre}>{song.genre || 'Unknown'}</div>
                                
                                {/* <!-- Plays --> */}
                                <div className={stylesSong.songCountPlays}>{song.playCount || 0}</div>
                                
                                {/* <!-- Delete action --> */}
                                <div className={stylesSong.songActions}>
                                    <button 
                                        className="action-icon-btn delete-btn" 
                                        onClick={() => handleDeleteSong(song)}
                                        title="Delete track">
                                        <i className="ti-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-feed">
                        <i className="ti-music-alt"></i>
                        <p>No songs found in the system database.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Songs