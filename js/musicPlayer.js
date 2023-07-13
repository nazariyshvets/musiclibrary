const prevBtn = document.querySelector(".prev-wrapper > i");
const playStopBtn = document.querySelector(".play-stop-wrapper > i");
const nextBtn = document.querySelector(".next-wrapper > i");
const trackController = document.querySelector(".track");
const time = document.querySelector(".time");
const volumeBtn = document.querySelector(".volume-wrapper > i");
const audio = document.querySelector(".audio");
const trackControllerMaxValue = trackController.max;
let trackControllerIsHeld;
let trackControllerInterval;
let timeInterval;
let songVisualizationInterval;
let containers = [];

const resetPlayer = () => {
  clearAllIntervals();

  if (!audio.paused) audio.pause();

  audio.src = "";
  trackController.value = 0;
  time.textContent = "00:00/00:00";
  selectedSongContainer = undefined;

  songVisualization.clearVisualization();

  if (playStopBtn.classList.contains("fa-stop")) {
    playStopBtn.classList.replace("fa-stop", "fa-play");
  }
};

const toggleAudioPlayback = () => {
  if (!selectedSongContainer) return;

  if (playStopBtn.classList.contains("fa-play")) {
    audio.play();
    playStopBtn.classList.replace("fa-play", "fa-stop");
  } else {
    if (!audio.paused) audio.pause();
    playStopBtn.classList.replace("fa-stop", "fa-play");
  }
};

const playNewSong = (newAudioSrc) => {
  if (!audio.paused) audio.pause();

  audio.src = newAudioSrc;
  audio.load();
  audio.play();
};

const changeSelectedContainer = (container) => {
  selectedSongContainer?.classList.remove("selected");
  container.classList.add("selected");
  selectedSongContainer = container;
};

const toMinutesStr = (value) => {
  value = Math.round(value);
  let minutes = parseInt(value / 60);
  let seconds = value % 60;

  if (minutes < 10) minutes = "0" + minutes;
  if (seconds < 10) seconds = "0" + seconds;

  return `${minutes}:${seconds}`;
};

const setTrackControllerInterval = () => {
  const audioDuration = audio.duration;

  trackControllerInterval = setInterval(() => {
    if (trackControllerIsHeld) return;

    trackController.value =
      (audio.currentTime / audioDuration) * trackControllerMaxValue;
  }, 200);
};

const setTimeInterval = () => {
  const audioDurationStr = toMinutesStr(audio.duration);

  timeInterval = setInterval(() => {
    time.textContent = `${toMinutesStr(audio.currentTime)}/${audioDurationStr}`;
  }, 1000);
};

const setSongVisualizationInterval = () => {
  const audioDuration = audio.duration;
  const songData = songsData.find(
    (song) => song.id === selectedSongContainer.dataset.id
  );
  const peaks = JSON.parse(songData.waveform).peaks;
  const maxPeakValue = Math.max(...peaks);

  songVisualizationInterval = setInterval(() => {
    const start = parseInt((audio.currentTime / audioDuration) * peaks.length);
    const data = peaks.slice(start, start + 10);
    songVisualization.visualizeSong(data, maxPeakValue);
  }, 100);
};

const clearAllIntervals = () => {
  if (trackControllerInterval) {
    clearInterval(trackControllerInterval);
    trackControllerInterval = null;
  }
  if (timeInterval) {
    clearInterval(timeInterval);
    timeInterval = null;
  }
  if (songVisualizationInterval) {
    clearInterval(songVisualizationInterval);
    songVisualizationInterval = null;
  }
};

const playPrevSong = () => {
  if (!selectedSongContainer) return;

  const currentSongContainerIndex = songContainers.includes(
    selectedSongContainer
  )
    ? songContainers.indexOf(selectedSongContainer)
    : 1;
  const prevSongContainer =
    songContainers[
      currentSongContainerIndex === 0
        ? songContainers.length - 1
        : currentSongContainerIndex - 1
    ];

  changeSelectedContainer(prevSongContainer);
  playNewSong(prevSongContainer.dataset.audioSrc);
};

const playNextSong = () => {
  if (!selectedSongContainer) return;

  const currentSongContainerIndex = songContainers.indexOf(
    selectedSongContainer
  );
  const nextSongContainer =
    songContainers[
      currentSongContainerIndex === songContainers.length - 1
        ? 0
        : currentSongContainerIndex + 1
    ];

  changeSelectedContainer(nextSongContainer);
  playNewSong(nextSongContainer.dataset.audioSrc);
};

const addEventListenersForWindow = () => {
  window.addEventListener("keydown", (event) => {
    if (event.target.tagName === "INPUT") return;

    if (event.code === "Space") {
      event.preventDefault();
      toggleAudioPlayback();
    } else if (event.code === "ArrowLeft" && audio.readyState >= 2) {
      event.preventDefault();
      audio.currentTime -= 10;
      audio.play();
    } else if (event.code === "ArrowRight" && audio.readyState >= 2) {
      event.preventDefault();
      audio.currentTime += 10;
      audio.play();
    }
  });
};

const addEventListenersForPrevBtn = () => {
  prevBtn.addEventListener("click", playPrevSong);
};

const addEventListenersForPlayStopBtn = () => {
  playStopBtn.addEventListener("click", toggleAudioPlayback);
};

const addEventListenersForNextBtn = () => {
  nextBtn.addEventListener("click", playNextSong);
};

const addEventListenersForTrackController = () => {
  trackController.addEventListener("change", () => {
    if (!selectedSongContainer) return;

    audio.currentTime =
      (trackController.value / trackController.max) * (audio.duration || 0);
  });

  trackController.addEventListener(
    "mousedown",
    () => (trackControllerIsHeld = true)
  );

  trackController.addEventListener(
    "mouseup",
    () => (trackControllerIsHeld = false)
  );

  //for mobile
  trackController.addEventListener(
    "touchstart",
    () => (trackControllerIsHeld = true)
  );

  trackController.addEventListener(
    "touchend",
    () => (trackControllerIsHeld = false)
  );
};

const addEventListenersForVolumeBtn = () => {
  volumeBtn.addEventListener("click", () => {
    if (!selectedSongContainer) return;

    if (volumeBtn.classList.contains("fa-volume-high")) {
      audio.muted = true;
      volumeBtn.classList.replace("fa-volume-high", "fa-volume-off");
    } else {
      audio.muted = false;
      volumeBtn.classList.replace("fa-volume-off", "fa-volume-high");
    }
  });
};

const addEventListenersForAudio = () => {
  audio.addEventListener("playing", () => {
    clearAllIntervals();

    setTrackControllerInterval();
    setTimeInterval();
    setSongVisualizationInterval();

    if (playStopBtn.classList.contains("fa-play")) {
      playStopBtn.classList.replace("fa-play", "fa-stop");
    }
  });

  audio.addEventListener("pause", clearAllIntervals);

  audio.addEventListener("ended", playNextSong);
};

const addEventListenersForMusicPlayer = (songContainers) => {
  containers = songContainers;

  addEventListenersForWindow();
  addEventListenersForPrevBtn();
  addEventListenersForPlayStopBtn();
  addEventListenersForNextBtn();
  addEventListenersForTrackController();
  addEventListenersForVolumeBtn();
  addEventListenersForAudio();
};
