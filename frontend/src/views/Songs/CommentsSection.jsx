import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import useCommentStore from "../../stores/commentStore";
import songApi from "../../services/songApi";
import Loading from "../../components/loading/Loading";
import styles from './Songs.module.scss'

function CommentsSection({ songId }) {
    const { user } = useAuth();
    const [content, setContent] = useState("");

    const { comments, loadComments, reloadComments, addComment } = useCommentStore();

    const timeString = (date) => {
        return new Date(date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    useEffect(() => {
        loadComments(songId);
    }, [songId, reloadComments]);

    async function handleSubmit(e) {
        e.preventDefault();

        const result = await addComment(songId, content);
        if (result.success) {
            setContent("");
        } else {
            alert(data.error || "Failed to submit comment");
        }
    }


    return (
        <div className={styles.songCommentsPanel}>
            <h3 className={styles.panelTitle}>Comments (<span id="comment-count-label">{comments.length}</span>)</h3>
            
            { user ? (
                <form onSubmit={handleSubmit} className={styles.commentInputForm}>
                    <div className={styles.commentInputWrapper}>
                        <img 
                            src={user?.avatar?.url || 'https://res.cloudinary.com/dqynaodv1/image/upload/v1781293476/955c965a3e831375a9fc2ed4e7599882_zlbj68.jpg'} 
                            alt="My avatar" 
                            className={styles.commentUserAvatar}/>
                        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Add a comment..." required></textarea>
                    </div>
                    <div className={styles.commentFormActions}>
                        <button type="submit" className={styles.btnSubmitComment}>Comment</button>
                    </div>
                </form>
            ) : (
                <div className={styles.loginToCommentMsg}>
                    <p><NavLink to="/login">Log in</NavLink> to join the conversation.</p>
                </div>
            )}
            <ul className={styles.commentsList} id="comments-list-items">
                {/* <!-- Dynamically populated via AJAX --> */}
                <>
                    { !comments ? (
                        <div className="comments-loading"><Loading /></div>
                    ):(
                        comments.length > 0 ?(
                            comments?.map(comment => (
                                <li key={comment._id} className={styles.commentItem}>
                                    <img 
                                        src={comment.user?.avatar?.url || 'https://res.cloudinary.com/dqynaodv1/image/upload/v1781293476/955c965a3e831375a9fc2ed4e7599882_zlbj68.jpg'} 
                                        alt={comment.user?.username} 
                                        className={styles.commentItemAvatar}/>
                                    <div className={styles.commentItemContent}>
                                        <div className={styles.commentItemHeader}>
                                            <NavLink to={`/profile/${comment.user?._id}`} className={styles.commentUsername}>{comment.user?.username || 'Deleted User'}</NavLink>
                                            <span className={styles.commentTime}>{timeString(comment.createdAt)}</span>
                                        </div>
                                        <p className={styles.commentText}>{comment.content}</p>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="comments-loading">There are no comments for this song.</li>
                        )
                    )}
                </>
            </ul>
        </div>
    );
}

export default CommentsSection;