
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";

import apiUser from "../../../services/userApi";
import usePlaylistStore from "../../../stores/playlistStore";
import styles from "./Footer.module.scss";

function PlaylisOption() {
    const [userPlayLists, setUserPlayLists] = useState([]);
    const [name, setName] = useState('');
    const navigate = useNavigate();
    const dropdownRef = useRef(null);   
    const {
        isModalOpen,
        toggleModal,
        createPlaylist
    } = usePlaylistStore();
    
    function handleSubmit (e) {
        e.preventDefault();
        createPlaylist(name);
        navigate('/');
    }

    return (
        <div className={clsx(styles.modalOverlay, isModalOpen && styles.active)}>
            <div className={styles.playlistModal}>
                <div className={styles.playlistModalHeader}>
                    <h3>Create Playlist</h3>
                    <button className="modal-close-btn">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.modalFormGroup}>
                        <label htmlFor="new-playlist-name">Name</label>
                        <input 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            type="text" 
                            id="new-playlist-name" 
                            name="name" 
                            placeholder="My Awesome Playlist" required/>
                    </div>
                    <div className={styles.modalActions}>
                        <button     
                            onClick={toggleModal}
                            type="button" 
                            className={styles.btnCancel}>
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className={styles.btnConfirm}>
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default PlaylisOption