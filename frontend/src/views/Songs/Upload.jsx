import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import imageCompression from "browser-image-compression";

import useSongStore from '../../stores/songStore';
import { useAuth } from '../../contexts/AuthContext'
import styles from './Songs.module.scss'
function Upload() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState("")
    const [genre, setGenre] = useState("")
    const [description, setDescription] = useState("")

    const [file, setFile] = useState(null)
    const [image, setImage] = useState(null)
    const uploadSong = useSongStore(s => s.uploadSong);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!file || !image) {
            alert('Please select both an audio file and a cover image.');
            return;
        }
        // Frontend pre-checks mirror backend limits (multer 20MB audio, controller 5MB image).
        if (file.size > 20 * 1024 * 1024) {
            alert('Audio file too large (max 20MB).');
            return;
        }
        if (image.size > 5 * 1024 * 1024) {
            alert('Cover image too large (max 5MB).');
            return;
        }
        let coverFile;
        try {
            // Keep compressed output well under the backend 5MB image cap.
            const compressed = await imageCompression(image, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true
            });
            // Preserve a filename: some servers/storages rely on originalname.
            coverFile = new File([compressed], image.name || 'cover.jpg', {
                type: compressed.type || image.type || 'image/jpeg',
            });
        } catch {
            // Compression is best-effort (e.g. already-small PNG); fall back to original.
            coverFile = image;
        }
        const formData = new FormData();
        formData.append("title", title);
        formData.append("genre", genre);
        formData.append("artist", user?.username);
        formData.append("description", description);
        formData.append("image", coverFile, coverFile.name || 'cover.jpg');
        formData.append("file", file, file.name || 'track.mp3');

        try {
            const data = await uploadSong(formData);
            if (data?.success) navigate('/');
            // On failure the store already shows an error modal; stay on the form.
        } catch {
            // Store already surfaced the error modal; avoid unhandled rejection.
        }
    }

    return (
        <div className={styles.uploadContainer}>
            <div className={styles.formWrapper}>
                <h2 className={styles.formTitle}>Upload a New Track</h2>
                <p className={styles.formSubtitle}>Share your music with the world. Audio and cover image files are required.</p>
                
                <form onSubmit={handleSubmit} encType="multipart/form-data" className="upload-form">
                    <div className={styles.formGrid}>
                        <div className={styles.formLeftCol}>
                            <div className={styles.formFieldGroup}>
                                <label htmlFor="title">Song Title</label>
                                <input 
                                    type="text" 
                                    id="title" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    name="title" 
                                    placeholder="Enter song name" 
                                    required/>
                            </div>

                            <div className={styles.formFieldGroup}>
                                <label htmlFor="artist">Artist Name</label>
                                <input 
                                    type="text" 
                                    id="artist" 
                                    name="artist" 
                                    value={user?.username || ""} 
                                    placeholder="Enter artist name" 
                                    style={{opacity: 0.7}} readOnly/>
                            </div>

                            <div className={styles.formFieldGroup}>
                                <label htmlFor="genre">Genre</label>
                                <input 
                                    type="text" 
                                    id="genre" 
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                    name="genre" 
                                    placeholder="e.g. Pop, Rock, Jazz, Hip Hop"/>
                            </div>

                            <div className={styles.formFieldGroup}>
                                <label htmlFor="description">Description</label>
                                <textarea 
                                    id="description" 
                                    name="description" 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="4" 
                                    placeholder="Tell us about your track...">
                                </textarea>
                            </div>
                        </div>

                        <div className={styles.formRightCol}>
                            <div className={styles.fileUploadBox} id="audio-file-box">
                                <label>Audio File (MP3/WAV)</label>
                                <div className={styles.fileDropZone}>
                                    <i className="ti-music-alt"></i>
                                    <span className={styles.fileZoneText}>Click to browse audio file</span>
                                    <input 
                                        type="file" 
                                        id="audio-file" 
                                        onChange={(e) => setFile(e.target.files[0])}
                                        name="file" 
                                        accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/wave,audio/webm,audio/mp4,audio/x-m4a,audio/aac,audio/ogg,audio/flac" 
                                        required/>
                                </div>
                                <div className={styles.selectedFilename} id="audio-filename">{file?.name || "No file selected"}</div>
                            </div>

                            <div className={styles.fileUploadBox} id="image-file-box">
                                <label>Cover Art (Image)</label>
                                <div className={styles.fileDropZone}>
                                    <i className="ti-image"></i>
                                    <span className={styles.fileZoneText}>Click to browse cover image</span>
                                    <input 
                                        type="file" 
                                        id="image-file" 
                                        onChange={(e) => setImage(e.target.files[0])}
                                        name="image" 
                                        accept="image/jpeg,image/png,image/webp" 
                                        required/>
                                </div>
                                <div className={styles.selectedFilename} id="image-filename">{image?.name || "No image selected"}</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSubmitWrapper}>
                        <button type="submit" className={styles.btnSubmitTrack}>Upload Song</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Upload