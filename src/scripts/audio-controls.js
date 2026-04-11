// Initialize audio players for all instances on the page
document.addEventListener('DOMContentLoaded', function () {
  const players = document.querySelectorAll('.custom-audio-player');

  players.forEach(player => {
    const playerId = player.getAttribute('data-player-id');

    const audio = document.getElementById(`audio-element-${playerId}`);
    const playPauseBtn = document.getElementById(`play-pause-btn-${playerId}`);
    const progressFill = document.getElementById(`progress-fill-${playerId}`);
    const progressSlider = document.getElementById(
      `progress-slider-${playerId}`,
    );
    const currentTimeEl = document.getElementById(`current-time-${playerId}`);
    const durationEl = document.getElementById(`duration-${playerId}`);
    const volumeSlider = document.getElementById(`volume-slider-${playerId}`);
    const volumeBtn = document.getElementById(`volume-btn-${playerId}`);
    const progressBar = player.querySelector('.progress-bar');
    const trackTitleEl = document.getElementById(`track-title-${playerId}`);

    let isPlaying = false;

    // Format time in MM:SS format
    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Update progress bar and time displays
    function updateProgress() {
      const progress = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = `${progress}%`;
      progressSlider.value = progress;
      currentTimeEl.textContent = formatTime(audio.currentTime);
    }

    // Update duration when metadata loads
    audio.addEventListener('loadedmetadata', function () {
      if (audio.duration && !isNaN(audio.duration)) {
        durationEl.textContent = formatTime(audio.duration);
        progressSlider.max = 100;
      }

      updateTrackTitle();
    });

    // Function to update track title and Media Session
    function updateTrackTitle() {
      // Set up Media Session API for better metadata display
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: trackTitleEl.textContent,
          artist: 'Upstairs Downstairs Podcast',
          album: 'Up Down Pod',
        });

        // Set up media session action handlers
        navigator.mediaSession.setActionHandler('play', () => {
          audio.play();
          isPlaying = true;
          playPauseBtn.classList.remove('paused');
        });

        navigator.mediaSession.setActionHandler('pause', () => {
          audio.pause();
          isPlaying = false;
          playPauseBtn.classList.add('paused');
        });

        navigator.mediaSession.setActionHandler('seekbackward', () => {
          audio.currentTime = Math.max(audio.currentTime - 10, 0);
        });

        navigator.mediaSession.setActionHandler('seekforward', () => {
          audio.currentTime = Math.min(audio.currentTime + 10, audio.duration);
        });
      }

      console.log('Track title and Media Session updated');
    }

    // Handle audio load errors
    audio.addEventListener('error', function (e) {
      console.error('Audio load error:', e);
      durationEl.textContent = 'N/A';
    });

    // Try to load the audio explicitly
    audio.load();

    // Fallback: try to get duration after a short delay
    setTimeout(function () {
      if (
        audio.duration &&
        !isNaN(audio.duration) &&
        durationEl.textContent === '0:00'
      ) {
        durationEl.textContent = formatTime(audio.duration);
        progressSlider.max = 100;
      }
    }, 2000);

    // Update progress as audio plays
    audio.addEventListener('timeupdate', updateProgress);

    // Play/pause functionality
    playPauseBtn.addEventListener('click', function () {
      if (isPlaying) {
        audio.pause();
        playPauseBtn.classList.add('paused');
        playPauseBtn.setAttribute('aria-label', 'Play');
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused';
        }
      } else {
        audio.play();
        playPauseBtn.classList.remove('paused');
        playPauseBtn.setAttribute('aria-label', 'Pause');
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
      }
      isPlaying = !isPlaying;
    });

    // Handle play event for button animation
    audio.addEventListener('play', function () {
      playPauseBtn.classList.add('playing');
    });

    // Handle pause event for button animation
    audio.addEventListener('pause', function () {
      playPauseBtn.classList.remove('playing');
    });

    // Progress bar click
    progressBar.addEventListener('click', function (e) {
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * audio.duration;
      audio.currentTime = newTime;
    });

    // Progress slider input
    progressSlider.addEventListener('input', function () {
      const percentage = progressSlider.value;
      const newTime = (percentage / 100) * audio.duration;
      audio.currentTime = newTime;
    });

    // Volume control
    volumeSlider.addEventListener('input', function () {
      audio.volume = volumeSlider.value;
    });

    // Volume button (mute/unmute)
    volumeBtn.addEventListener('click', function () {
      if (audio.volume > 0) {
        audio.volume = 0;
        volumeSlider.value = 0;
      } else {
        audio.volume = 1;
        volumeSlider.value = 1;
      }
    });

    // Update volume slider when volume changes
    audio.addEventListener('volumechange', function () {
      volumeSlider.value = audio.volume;
    });
  });
});
