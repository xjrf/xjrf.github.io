document.addEventListener('DOMContentLoaded', function() {
    if (window.__musicPlayerInited__) return;
    window.__musicPlayerInited__ = true;
    
    // Check if config exists
    if (typeof musicConfig === 'undefined' || !musicConfig.playlist || musicConfig.playlist.length === 0) {
        return;
    }

    const playlist = musicConfig.playlist;
    let currentSongIndex = 0;
    let isPlaying = false;

    // Get DOM elements
    const audio = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');
    const playIcon = document.getElementById('playIcon');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.getElementById('progressBar');
    const progressContainer = document.getElementById('progressContainer');
    const songTitle = document.getElementById('songTitle');
    const albumArt = document.getElementById('albumArt');
    const widget = document.querySelector('.music-widget');

    // Initialize player
    function loadSong(song) {
        songTitle.innerText = `${song.title} - ${song.artist}`;
        audio.src = song.url;
        albumArt.style.backgroundImage = `url("${song.cover}")`;

        // Reset progress bar
        progressBar.style.width = '0%';
    }

    // Play song
    function playSong() {
        widget.classList.add('playing');
        playIcon.classList.remove('ri-play-large-fill');
        playIcon.classList.add('ri-pause-large-fill');
        audio.play().catch(e => console.log("Auto-play prevented:", e));
        isPlaying = true;
    }

    // Pause song
    function pauseSong() {
        widget.classList.remove('playing');
        playIcon.classList.remove('ri-pause-large-fill');
        playIcon.classList.add('ri-play-large-fill');
        audio.pause();
        isPlaying = false;
    }

    // Save player state
    function savePlayerState() {
        localStorage.setItem('musicPlayerState', JSON.stringify({
            songIndex: currentSongIndex,
            currentTime: audio.currentTime,
            isPlaying: !audio.paused
        }));
    }

    // Restore player state
    function restorePlayerState() {
        const savedState = localStorage.getItem('musicPlayerState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                currentSongIndex = state.songIndex;
                loadSong(playlist[currentSongIndex]);

                // Wait for audio metadata to load before setting time
                const onLoaded = () => {
                    audio.currentTime = state.currentTime;
                    if (state.isPlaying) {
                        // Try to play, handle failure silently
                        playSong();
                    }
                };

                // If metadata already loaded, execute directly
                if (audio.readyState >= 1) {
                    onLoaded();
                } else {
                    audio.addEventListener('loadedmetadata', onLoaded, { once: true });
                }

                return true;
            } catch (e) {
                console.error('Failed to restore player state:', e);
                localStorage.removeItem('musicPlayerState');
            }
        }
        return false;
    }

    // Toggle play state
    playBtn.addEventListener('click', () => {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    });

    // Previous track
    prevBtn.addEventListener('click', () => {
        currentSongIndex--;
        if (currentSongIndex < 0) {
            currentSongIndex = playlist.length - 1;
        }
        loadSong(playlist[currentSongIndex]);
        playSong();
    });

    // Next track
    nextBtn.addEventListener('click', () => {
        currentSongIndex++;
        if (currentSongIndex > playlist.length - 1) {
            currentSongIndex = 0;
        }
        loadSong(playlist[currentSongIndex]);
        playSong();
    });

    // Update progress bar
    audio.addEventListener('timeupdate', (e) => {
        const { duration, currentTime } = e.srcElement;
        if(isNaN(duration)) return;
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
    });

    // Click progress bar to seek
    progressContainer.addEventListener('click', (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const duration = audio.duration;

        if (!isNaN(duration)) {
            audio.currentTime = (clickX / width) * duration;
        }
    });

    // Auto-play next track when current ends
    audio.addEventListener('ended', () => {
        nextBtn.click();
    });

    // Save state before page unload
    window.addEventListener('beforeunload', savePlayerState);

    // Initialize: try to restore state, otherwise start randomly or from beginning
    const restored = restorePlayerState();
    if (!restored) {
        // Random starting song
        if (musicConfig.randomStart !== false) {
            currentSongIndex = Math.floor(Math.random() * playlist.length);
        }
        loadSong(playlist[currentSongIndex]);

        if (musicConfig.autoplay) {
            playSong();
        }
    }
});