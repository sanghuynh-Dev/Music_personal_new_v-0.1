
import { NavLink, useParams,useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import appRoute from '../../routes/appRoute'
import songApi from '../../services/songApi'
import styles from './Songs.module.scss'

function Edit() {
    const navigate = useNavigate();
    const { id } = useParams()
    const [song, setSong] = useState({})
    const [title, setTitle] = useState("")
    const [genre, setGenre] = useState("")
    const [description, setDescription] = useState("")
    
    useEffect(() => {
        if (!song) return;

        setTitle(song.title || "");
        setGenre(song.genre || "");
        setDescription(song.description || "");
        console.log("edit");
    }, [song]);

    useEffect(() => {
        appRoute.getSongInfo(id).then(data => setSong(data))
    }, [id]);

    async function handleSubmit(e) {
        e.preventDefault();

        const data = {
            title,
            genre,
            description
        }
        const res = await songApi.editSong(id, data);
        console.log(res);
        if(res.success) navigate(`/songs/${id}`);
    }
    return (
       <div className={styles.uploadContainer}>
            <div className={styles.formWrapper}>
                <h2 className={styles.formTitle}>Edit Song Details</h2>
                <p className={styles.formSubtitle}>Update information for your track.</p>
                
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.formLeftCol}>
                            <div className={styles.formFieldGroup}>
                                <label htmlFor="song-title">Song Title</label>
                                <input 
                                    type="text" 
                                    id="song-title" 
                                    name="title" 
                                    value={title} 
                                    onChange={e => setTitle(e.target.value)}
                                    required 
                                    placeholder="Enter track title"/>
                            </div>
                            
                            <div className={styles.formFieldGroup}>
                                <label htmlFor="song-artist">Artist Name</label>
                                <input 
                                    type="text" 
                                    id="song-artist" 
                                    name="artist" 
                                    value={song?.artist || ""}
                                    placeholder="Enter artist name" 
                                    style={{opacity: 0.7}} 
                                    readOnly/>
                            </div>
                            
                            <div className={styles.formFieldGroup}>
                                <label htmlFor="song-genre">Genre</label>
                                <input 
                                    type="text" 
                                    id="song-genre" 
                                    name="genre" 
                                    value={genre} 
                                    onChange={e => setGenre(e.target.value)}
                                    placeholder="e.g. Pop, Rock, Electronic"/>
                            </div>
                        </div>
                        
                        <div className={styles.formRightCol}>
                            <div className={styles.formFieldGroup}>
                                <label htmlFor="song-desc">Description</label>
                                <textarea 
                                    id="song-desc" 
                                    name="description" 
                                    rows="8" 
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Tell us about your track...">
                                    {song.description}
                                </textarea>
                            </div>
                        </div>
                    </div>
                    
                    <div className={styles.formSubmitWrapper}>
                        <NavLink to={`/songs/${song._id}`} className={styles.btnCancel}>Cancel</NavLink>
                        <button type="submit" className={styles.btnSubmitTrack}>Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Edit