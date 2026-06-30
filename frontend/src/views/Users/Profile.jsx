
import { NavLink,useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import clsx from "clsx";

import { useAuth } from "../../contexts/AuthContext";
import useSongStore from "../../stores/songStore";
import useFollowStore from "../../stores/followStore";
import usePlayerStore from "../../stores/playerStore";
import usePlaylistStore from "../../stores/playlistStore";
import { updateAvatarUser, updateBannerUser } from "../../services/userApi";
import appRoute from "../../routes/appRoute"
import styles from './User.module.scss'

function Profile() {
    const { user,setUser } = useAuth();
    const { id } = useParams();
    const [profileData, setProfileData] = useState({});

    const currentSong = usePlayerStore(s => s.currentSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const playSong = usePlayerStore(s => s.playSong);
    const pauseSong = usePlayerStore(s => s.pauseSong);
    const resumeSong = usePlayerStore(s => s.resumeSong);
    const setCurrentSong = usePlayerStore(s => s.setCurrentSong);

    const {toggleFollowSingle,reloadFollow} = useFollowStore();

    const { 
        deleteSong, 
        songs, 
        setSongs, 
        toggleLikeLocal,
        reload 
    } = useSongStore();

    const { openMenu } = usePlaylistStore();

    const isCurrentSong = (song) => song._id === currentSong?._id;

    function handleClick(song) {
        if (isCurrentSong(song)) {
            if (isPlaying) pauseSong();
            else resumeSong();
        } else {
            playSong(song._id);
        }
    }   
    function handleFollow(artistId,isFollowing) {
        toggleFollowSingle(artistId,isFollowing);
    }

    function handleShowPlaylist (song,e) {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        openMenu(song._id, {
            x: rect.left - 200,
            y: rect.bottom 
        });
    };
    async function handleLike(song) {
        toggleLikeLocal(song._id);
    } 

    async function handleChangeAvatar(e) {
        e.preventDefault();
        const avatar = e.target.files[0];
        const compressed = await imageCompression(avatar, {
            maxSizeMB: 10,
            maxWidthOrHeight: 2000,
            useWebWorker: true
        });
        if (!avatar) return;
        const preview = URL.createObjectURL(compressed);
        setUser(prev => ({
            ...prev,
            avatar: {
                ...prev.avatar,
                url: preview
            }
        }));

        const formData = new FormData();
        formData.append('image', compressed);
        updateAvatarUser(formData).then((data) => {
            setUser(data.user);
            URL.revokeObjectURL(preview);
        })
    }

    function handleDeleteSong(song) {
        if (isCurrentSong(song)){
            pauseSong();
            setCurrentSong(null);
        } 
        deleteSong(song._id);
    }

    async function handleChangeBanner(e) {
        e.preventDefault();
        const banner = e.target.files[0];
        const compressed = await imageCompression(banner, {
            maxSizeMB: 10,
            maxWidthOrHeight: 3500,
            useWebWorker: true
        });
        if (!banner) return;
        const preview = URL.createObjectURL(compressed);
        setUser(prev => ({
            ...prev,
            background: {
                ...prev.background,
                url: preview
            }
        }));

        const formData = new FormData();
        formData.append('image', compressed);
        updateBannerUser(formData).then((data) => {
            setUser(data.user);
            URL.revokeObjectURL(preview);
        })
    }
    
    useEffect(() => {
        setSongs(profileData.tracks);
    }, [profileData]);

    useEffect(() => {
        appRoute.getProfileUser(id).then(data => {
            setProfileData(data);
        });
    }, [id, reload, reloadFollow]);
    return (
        <div className="profile-container event-chang-icon-js">
            {/* <!-- Header Background Cover --> */}
            <div className={styles.profileHeaderBanner} 
                style={{ 
                    backgroundImage: !profileData.isOwnProfile
                        ? `url(${user?.background?.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop'})`
                        : `url(${profileData.profileUser?.background?.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop'})` 
                        }}>
                { !profileData.isOwnProfile && (
                    <form encType="multipart/form-data" className={styles.headerUploadForm} id="header-form">
                        <label htmlFor="header-file-input" className={styles.btnChangeHeader} title="Change Banner">
                            <i className="ti-camera"></i> Update Banner
                        </label>
                        <input type="file" id="header-file-input" name="image" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleChangeBanner(e)}/>
                    </form>
                )}
                
                <div className={styles.profileHeaderInfo}>
                    <div className={styles.profileAvatarWrapper}>
                        <img src={ !profileData.isOwnProfile
                            ?  user?.avatar?.url || 'https://res.cloudinary.com/dqynaodv1/image/upload/v1781293476/955c965a3e831375a9fc2ed4e7599882_zlbj68.jpg'
                            :  profileData.profileUser?.avatar?.url || 'https://res.cloudinary.com/dqynaodv1/image/upload/v1781293476/955c965a3e831375a9fc2ed4e7599882_zlbj68.jpg'} alt=">" className={styles.profileAvatar}/>
                        { !profileData.isOwnProfile && (
                            <form action="/profile/avatar" method="POST" encType="multipart/form-data" className="avatar-upload-form" id="avatar-form">
                                <label htmlFor="avatar-file-input" className={styles.avatarUploadOverlay} title="Change Avatar">
                                    <i className="ti-camera"></i>
                                </label>
                                <input type="file" id="avatar-file-input" name="image" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleChangeAvatar(e)}/>
                            </form>
                        )}
                    </div>
                    
                    <div className={styles.profileMeta}>
                        <span className={styles.profileRole}>{profileData.profileUser?.role.toUpperCase()}</span>
                        <h1 className={styles.profileUsername}>{profileData.profileUser?.username}</h1>
                        
                        <div className={styles.profileStats}>
                            <span id="stat-tracks"><strong>{profileData.profileUser?.tracksCount || 0}</strong> Tracks</span>
                            { profileData.profileUser?.role === 'artist' || profileData.profileUser?.role === 'admin' && (
                                <span id="stat-plays"><strong>{profileData.profileUser?.totalPlays || 0}</strong> Plays</span>
                            )}
                            <span id="stat-followers"><strong>{profileData.profileUser?.followerCount || 0}</strong> Followers</span>
                            <span id="stat-following"><strong>{profileData.profileUser?.followingCount || 0}</strong> Following</span>
                        </div>
                    </div>
                    
                    { profileData.isOwnProfile && user && (
                        <div className="profile-actions">
                            <button 
                                className={clsx(styles.btnProfileFollow, profileData.profileUser?.isFollowing ? "following" : "follow")} 
                                onClick={() => handleFollow(profileData.profileUser?._id, profileData.profileUser?.isFollowing)}>
                                {profileData.profileUser?.isFollowing ? 'Following' : 'Follow'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* <!-- Uploaded Songs List --> */}
            <div className={styles.profileContent}>
                <h2 className={styles.contentTitle}>Uploaded Songs</h2>
                
                <div className="songs-list-container">
                    { profileData.tracks && profileData.tracks.length > 0 ? (
                        <div className="songs-table">
                            <div className="songs-table-header">
                                <div className="col-index">#</div>
                                <div className="col-title">Title</div>
                                <div className="col-genre">Genre</div>
                                <div className="col-plays"><i className="ti-headphone"></i></div>
                                <div className="col-actions"></div>
                            </div>
                            
                            { songs?.map((song, index) => (
                                <div key={song._id} className="song-row" id={`song-row-${song._id}`} data-id={song._id}>
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
                                    <div className="col-title">
                                        <img src={song.imageUrl?.url || ''} alt={song.title} className="song-row-img"/>
                                        <div className="song-row-info">
                                            <NavLink to={`/songs/${song._id}`} className="song-row-title">{song.title}</NavLink>
                                            <span className="song-row-artist">{song.artist}</span>
                                        </div>
                                    </div>
                                    <div className="col-genre">{song.genre || 'Unknown'}</div>
                                    <div className="col-plays">{song.playCount || 0}</div>
                                    <div className="col-actions">
                                        { user && (
                                            <>
                                                <button 
                                                    className={clsx("action-icon-btn like-btn", song.liked && "liked")} 
                                                    onClick={() => handleLike(song)} 
                                                    title="Like">
                                                    <i className="ti-heart"></i>
                                                </button>
                                                <button 
                                                    className="action-icon-btn opt-btn" 
                                                    onClick={(e) => handleShowPlaylist(song,e)}
                                                    title="Add to Playlist">
                                                    <i className="ti-more-alt"></i>
                                                </button>
                                                { !profileData.isOwnProfile  || (user && user.role === 'admin') && (
                                                    <button 
                                                        className="action-icon-btn delete-btn" 
                                                        onClick={() => handleDeleteSong(song)} 
                                                        title="Delete Song">
                                                        <i className="ti-trash"></i>
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ): (
                        <div className="empty-profile-tracks">
                            <i className="ti-music-alt"></i>
                            <p>No tracks uploaded yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile