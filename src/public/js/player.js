// Player State
let audio = document.getElementById('player-audio');
let currentSong = null;
let playbackQueue = [];
let queueIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

// UI Elements
const playerBar = document.getElementById('player-bar');
const appContainer = document.querySelector('.app-container');
const playBtn = document.getElementById('player-btn-play');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const prevBtn = document.getElementById('player-btn-prev');
const nextBtn = document.getElementById('player-btn-next');
const shuffleBtn = document.getElementById('player-btn-shuffle');
const loopBtn = document.getElementById('player-btn-loop');
const timeCurrent = document.getElementById('player-time-current');
const timeDuration = document.getElementById('player-time-duration');
const progressBar = document.getElementById('player-progress-bar');
const timelineSlider = document.getElementById('player-timeline-slider');
const volumeSlider = document.getElementById('player-volume-slider');

// Song Meta Elements
// const playerBar = document.getElementById('player-bar');
const songImg = document.getElementById('player-song-thumbnail');
const songTitle = document.getElementById('player-song-title');
const songArtist = document.getElementById('player-song-artist');
const likeBtn = document.getElementById('player-btn-like');
const queueBtn = document.getElementById('player-btn-queue');
const queueDropdown = document.getElementById('queue-dropdown-panel');
const queueListItems = document.getElementById('queue-list-items');
const closeQueueBtn = document.getElementById('close-queue-btn');

// Initialize Player Event Listeners
if (audio) {
    audio.addEventListener('timeupdate', updateProgressBar);
    audio.addEventListener('loadedmetadata', setDuration);
    audio.addEventListener('ended', onSongEnded);
}

if (playBtn) {
    playBtn.addEventListener('click', togglePlayback);
}

if (prevBtn) prevBtn.addEventListener('click', playPrevious);
if (nextBtn) nextBtn.addEventListener('click', playNext);

if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
        isShuffle = !isShuffle;
        shuffleBtn.classList.toggle('active', isShuffle);
    });
}

if (loopBtn) {
    loopBtn.addEventListener('click', () => {
        isRepeat = !isRepeat;
        loopBtn.classList.toggle('active', isRepeat);
    });
}

if (timelineSlider) {
    timelineSlider.addEventListener('click', seekAudio);
}

if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
    });
}

if (queueBtn) {
    queueBtn.addEventListener('click', () => {
        queueDropdown.classList.toggle('active');
        if (queueDropdown.classList.contains('active')) {
            // renderQueueUI();
        }
    });
}

if (closeQueueBtn) {
    closeQueueBtn.addEventListener('click', () => {
        queueDropdown.classList.remove('active');
    });
}

// Global play function accessible from view scripts
window.playSong = async function(songId, customQueue = null, isQueue = false, isPLayList = false) {
    if (currentSong && songId === currentSong?._id) {
        togglePlayback();
        return;
    }
    try {
        // change icon old song
        if (currentSong && songId !== currentSong?._id) togglePlayback();
        // Fetch song info
        const res = await fetch(`/songs/info/${songId}`);
        const song = await res.json();
        
        if (song.error) {
            alert('Failed to load song: ' + song.error);
            return;
        }

        currentSong = song;
        
        // Show player details section
        if (playerBar){
            playerBar.style.display = 'block';
            appContainer.style.height = 'calc(100vh - 90px)';
        } 

        // Set song metadata
        if (songImg) songImg.src = song.imageUrl?.url || 'https://res.cloudinary.com/dqynaodv1/image/upload/v1717904033/resources/images/default-thumbnail.png';
        if (songTitle) songTitle.innerText = song.title;
        if (songArtist) {
            songArtist.innerText = song.artist;
            songArtist.href = `/profile/${song.uploadedBy._id || song.uploadedBy}`;
        }
        
        // Heart Button state
        if (likeBtn) {
            likeBtn.setAttribute('data-id', song._id);
            if (song.liked) {
                likeBtn.classList.add('liked');
            } else {
                likeBtn.classList.remove('liked');
            }
        }

        // Set audio source
        audio.src = song.audioUrl.url;
        audio.load();
        
        // Play audio
        audio.play().then(() => {
            isPlaying = true;
            updatePlayButtonUI(song._id);
            if(!isQueue && !isPLayList) updatePlayListButtonUI(false);
            registerPlayEvent(song._id);
        }).catch(err => {
            console.error('Audio play error:', err);
        });

        // Initialize queue
        if (customQueue && customQueue.length > 0) {
            playbackQueue = customQueue;
            queueIndex = playbackQueue.indexOf(songId);
            if(!isQueue) renderQueueUI(); 
        } else {
            // Get recommendations based on this song
            const queueRes = await fetch(`/songs/queue?currentSongId=${songId}`);
            const fullQueue = await queueRes.json();
            playbackQueue = fullQueue.map(item => item._id);
            queueIndex = 0;
            if(!isQueue) renderQueueUI();  
        }

    } catch (err) {
        console.error('Error playing song:', err);
    }
};

// Play playlist helper
window.playSongIds = function(songIds) {
    if (!songIds || songIds.length === 0) return;
    window.playSong(songIds[0], songIds);
};

async function registerPlayEvent(songId) {
    try {
        await fetch(`/songs/${songId}/play`, { method: 'POST' });
    } catch (err) {
        console.error('Error logging play count:', err);
    }
}

function togglePlayback() {
    if (!currentSong) return;

    if (isPlaying) {
        audio.pause();
        isPlaying = false;
    } else {
        audio.play();
        isPlaying = true;
    }
    updatePlayButtonUI(currentSong._id);
}

function updatePlayButtonUI(songID) {
    const eventChangeIcon = document.querySelector('.event-chang-icon-js');
    if(!eventChangeIcon) return;

    const playBtns = eventChangeIcon?.querySelectorAll(`.play-btn-js[data-id="${songID}"]`);
    if (isPlaying) {
        playBtns.forEach(item => {
            const playIcon = item.querySelector('.icon-play');
            const pauseIcon = item.querySelector('.icon-pause');
            console.log(playIcon);

            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        })
    } else {
        playBtns.forEach(item => {
            const playIcon = item.querySelector('.icon-play');
            const pauseIcon = item.querySelector('.icon-pause');
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        })
    }
}

function updateLikeButtonUI(songID,liked) {
    const eventChangeIcon = document.querySelector('.event-chang-icon-js');
    if(!eventChangeIcon) return;
    const likeBtns = eventChangeIcon?.querySelectorAll(`.like-btn[data-id="${songID}"]`);
    likeBtns.forEach(item => {
        if (item) {
           item.classList.toggle('liked', liked);
        }
    })
}
function playPrevious() {
    if (playbackQueue.length === 0) return;
    
    queueIndex--;
    if (queueIndex < 0) {
        queueIndex = playbackQueue.length - 1;
    }
    window.playSong(playbackQueue[queueIndex], playbackQueue, true, true);
}

function playNext() {
    if (playbackQueue.length === 0) return;

    if (isShuffle) {
        queueIndex = Math.floor(Math.random() * playbackQueue.length);
    } else {
        queueIndex++;
        if (queueIndex >= playbackQueue.length) {
            queueIndex = 0;
        }
    }
    window.playSong(playbackQueue[queueIndex], playbackQueue, true, true);
}

function onSongEnded() {
    if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
    } else {
        // isPlaying = false;
        playNext();
    }
}

function updateProgressBar() {
    if (audio.duration) {
        const percentage = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${percentage}%`;
        timeCurrent.innerText = formatTime(audio.currentTime);
    }
}

function setDuration() {
    timeDuration.innerText = formatTime(audio.duration);
}

function seekAudio(e) {
    const width = timelineSlider.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    if (duration) {
        audio.currentTime = (clickX / width) * duration;
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

async function renderQueueUI() {
    if (!queueListItems) return;
    queueListItems.innerHTML = '';

    const remainingSongIds = playbackQueue.slice(queueIndex + 1);
    if (playbackQueue.length === 0) {
        queueListItems.innerHTML = '<li class="empty-playlists-msg">Queue is empty</li>';
        return;
    }

    for (const songId of playbackQueue) {
        try {
            const res = await fetch(`/songs/info/${songId}`);
            const song = await res.json();
            
            const li = document.createElement('li');
            li.className = 'queue-item';
            li.onclick = () => window.playSong(song._id, playbackQueue,isQueue = true);
            li.innerHTML = `
                <img src="${song.imageUrl?.url || 'https://res.cloudinary.com/dqynaodv1/image/upload/v1717904033/resources/images/default-thumbnail.png'}">
                <div class="queue-item-meta">
                    <strong>${song.title}</strong>
                    <span>${song.artist}</span>
                </div>
            `;
            queueListItems.appendChild(li);
        } catch (err) {
            console.error('Error adding queue item:', err);
        }
    }
}

// Global Heart Button click handler
if (likeBtn) {
    likeBtn.addEventListener('click', async () => {
        const songId = likeBtn.getAttribute('data-id');
        if (!songId) return;

        const liked = await toggleLike(songId);
        if (liked !== null) {
            likeBtn.classList.toggle('liked', liked);
            
            // Sync with page rows if exist
            const pageLikeBtn = document.querySelector(`.song-row[data-id="${songId}"] .like-btn`);
            if (pageLikeBtn) {
                pageLikeBtn.classList.toggle('liked', liked);
            }
        }
    });
}

// Likes operations via AJAX
window.toggleLike = async function(songId, buttonElement = null) {
    try {
        const response = await fetch(`/songs/${songId}/like`, {
            method: 'POST'
        });
        const data = await response.json();
        
        if (data.error) {
            if (response.status === 401) {
                window.location.href = '/login';
            } else {
                alert(data.error);
            }
            return null;
        }

        if (buttonElement) {
            updateLikeButtonUI(songId, data.liked);
        }
        
        // Sync with player heart if playing the same song
        if (currentSong && currentSong._id === songId && likeBtn) {
            likeBtn.classList.toggle('liked', data.liked);
        }

        return data.liked;
    } catch (err) {
        console.error('Error toggling like:', err);
        return null;
    }
};

// Follow/Unfollow via AJAX
window.toggleFollow = async function(artistId, buttonElement) {
    const isFollowing = buttonElement.classList.contains('following');
    const endpoint = isFollowing ? 'unfollow' : 'follow';
    
    try {
        const response = await fetch(`/artists/${artistId}/${endpoint}`, {
            method: 'POST'
        });
        const data = await response.json();
        
        if (data.error) {
            if (response.status === 401) {
                window.location.href = '/login';
            } else {
                alert(data.error);
            }
            return;
        }

        if (endpoint === 'follow') {
            buttonElement.classList.remove('follow');
            buttonElement.classList.add('following');
            buttonElement.innerText = 'Following';
        } else {
            buttonElement.classList.remove('following');
            buttonElement.classList.add('follow');
            buttonElement.innerText = 'Follow';
        }

        // Update counts on profile details if present
        const followersCountLabel = document.querySelector('#stat-followers strong');
        if (followersCountLabel) {
            followersCountLabel.innerText = data.count;
        }
    } catch (err) {
        console.error('Error toggling follow:', err);
    }
};

// Add to Playlist popups and interactions
let activeSongIdForPlaylist = null;
const playlistDropdown = document.getElementById('playlist-select-dropdown');
const playlistOptions = document.getElementById('playlist-select-options');

window.showAddToPlaylistMenu = async function(event, songId) {
    event.stopPropagation();
    activeSongIdForPlaylist = songId;

    // Fetch user playlists to list
    try {
        const res = await fetch('/playlists/create', { // fetching creates fallback list or we can get user playlists via local api
            headers: { 'Accept': 'application/json' }
        });
        // We will make a quick JSON endpoint or retrieve sidebar playlists!
        const playlistLinks = document.querySelectorAll('#playlists-sidebar-list a');
        
        playlistOptions.innerHTML = '';
        if (playlistLinks.length === 0 || playlistLinks[0].parentNode.classList.contains('empty-playlists-msg')) {
            playlistOptions.innerHTML = '<li class="empty-playlists-msg">Create a playlist first!</li>';
        } else {
            playlistLinks.forEach(link => {
                const id = link.getAttribute('href').split('/').pop();
                const name = link.querySelector('span').innerText;
                
                const li = document.createElement('li');
                li.innerText = name;
                li.onclick = () => addSongToPlaylist(id, songId);
                playlistOptions.appendChild(li);
            });
        }

        // Position dropdown
        playlistDropdown.style.left = `${event.clientX - 200}px`;
        playlistDropdown.style.top = `${event.clientY}px`;
        playlistDropdown.classList.add('active');

        // Close dropdown on click outside
        document.addEventListener('click', closeDropdownOutside);

    } catch (err) {
        console.error('Error showing playlist dropdown:', err);
    }
};

function closeDropdownOutside(e) {
    if (!playlistDropdown.contains(e.target)) {
        playlistDropdown.classList.remove('active');
        document.removeEventListener('click', closeDropdownOutside);
    }
}

async function addSongToPlaylist(playlistId, songId) {
    try {
        const response = await fetch(`/playlists/${playlistId}/add-song`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ songId })
        });
        const data = await response.json();
        if (data.success) {
            alert('Added to playlist!');
        } else {
            alert(data.error || 'Failed to add song');
        }
        playlistDropdown.classList.remove('active');
    } catch (err) {
        console.error('Error adding song to playlist:', err);
    }
}
