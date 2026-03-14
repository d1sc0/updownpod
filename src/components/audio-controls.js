document.addEventListener('DOMContentLoaded', function () {
  const audio = document.getElementById('audio-element');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const progressFill = document.getElementById('progress-fill');
  const progressSlider = document.getElementById('progress-slider');
  const currentTimeEl = document.getElementById('current-time');
  const durationEl = document.getElementById('duration');
  const volumeSlider = document.getElementById('volume-slider');
  const volumeBtn = document.getElementById('volume-btn');
  const progressBar = document.querySelector('.progress-bar');

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
    console.log('Audio duration loaded:', audio.duration);
    if (audio.duration && !isNaN(audio.duration)) {
      durationEl.textContent = formatTime(audio.duration);
      progressSlider.max = 100;
    }
  });

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
    } else {
      audio.play();
      playPauseBtn.classList.remove('paused');
      playPauseBtn.setAttribute('aria-label', 'Pause');
    }
    isPlaying = !isPlaying;
  });

  // Handle audio end
  audio.addEventListener('ended', function () {
    isPlaying = false;
    playPauseBtn.classList.add('paused');
    playPauseBtn.setAttribute('aria-label', 'Play');
  });

  // Progress bar click to seek
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
