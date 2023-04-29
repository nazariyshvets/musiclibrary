const songsData = JSON.parse(localStorage.getItem("songs")) ?? [];
const songsContainer = document.querySelector(".songs-container");
let selectedSongContainer;
//for mobile scrolling
let startX, startY;

const createSongContainer = (song) => {
  const songWrapper = document.createElement("div");
  songWrapper.classList.add("song-wrapper");
  songWrapper.dataset.id = song.id;
  songWrapper.dataset.audioSrc = song.audio;
  songWrapper.style.background = `url("${song.image}") no-repeat scroll center / cover`;
  songWrapper.innerHTML = `
    <div class="song-name">${song.name.replace(/&amp;/g, "&")}</div>
    <div class="song-author">${song.artist_name.replace(/&amp;/g, "&")}</div>
  `;
  return songWrapper;
};

songsData?.forEach((song) => {
  const songWrapper = createSongContainer(song);
  songsContainer.append(songWrapper);
});

const songContainers = Array.from(document.querySelectorAll(".song-wrapper"));

songsContainer.addEventListener("wheel", (event) => {
  event.preventDefault();
  const delta = event.deltaY || event.deltaX;
  songsContainer.scrollLeft -= delta * 2;
});

//for mobile scrolling
songsContainer.addEventListener("touchstart", (event) => {
  startX = event.touches[0].clientX;
  startY = event.touches[0].clientY;
});

songsContainer.addEventListener("touchmove", (event) => {
  const currentX = event.touches[0].clientX;
  const currentY = event.touches[0].clientY;
  const diffX = startX - currentX;
  const diffY = startY - currentY;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    event.preventDefault();
    songsContainer.scrollLeft += diffX;
  }
});

songContainers?.forEach((container) => {
  container.addEventListener("click", () => {
    if (container === selectedSongContainer) return;

    playNewSong(container.dataset.audioSrc);
    changeSelectedContainer(container);
  });
});

addEventListenersForMusicPlayer();
