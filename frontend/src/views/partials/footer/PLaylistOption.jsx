
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";

import apiUser from "../../../services/userApi";
import usePlaylistStore from "../../../stores/playlistStore";
import styles from "./Footer.module.scss";

function PlaylisOption() {
    const [userPlayLists, setUserPlayLists] = useState([]);  
    const dropdownRef = useRef(null);   
    const {
        isMenuOpen,
        activeSongId,
        playlistPosition,
        addSongToPlaylist,
        closeMenu,
        reloadPlaylist,
        pageRef,
        toggleModal
    } = usePlaylistStore();
    
    useEffect(() => {
        apiUser.getUserPlayList().then((userPlayLists) => {
            setUserPlayLists(userPlayLists);
        });
    }, [reloadPlaylist]);
    // close dropdown when click outside
    useEffect(() => {
        if (!isMenuOpen) return;
        const handleClickOutside = (e) => {
            if ( dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                closeMenu();
            }
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [isMenuOpen]);
    // close dropdown when scroll
    useEffect(() => {
        if (!isMenuOpen) return;

        pageRef.addEventListener("scroll", closeMenu);

        return () => {
            pageRef.removeEventListener("scroll", closeMenu);
        };
    }, [isMenuOpen]);
    

    return (
        <div ref={dropdownRef} 
            className={clsx(styles.playlistSelectDropdown, isMenuOpen && styles.active)} 
            style={{
                left: playlistPosition.x,
                top: playlistPosition.y,
                position: "fixed"
            }}>
            <div className={styles.dropdownHeader}>Add to Playlist</div>
            <ul id="playlist-select-options">
                {userPlayLists.length === 0 ? (
                    <li 
                        onClick={() => toggleModal()}
                        className={styles.emptyPlaylistsMsg}>
                        Create a playlist first!
                    </li>
                ) : (
                    userPlayLists.map((playlist) => (
                        <li
                            key={playlist._id}
                            onClick={() =>
                                addSongToPlaylist(
                                    playlist._id,
                                    activeSongId
                                )
                            }
                        >
                            {playlist.name}
                        </li>
                    ))
                )}
            </ul>
        </div>
)
}

export default PlaylisOption