const songsData = JSON.parse(localStorage.getItem("songs")) ?? [];
const songsContainer = document.querySelector(".songs-container");
const songContainers = [];
let selectedSongContainer;

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
  songContainers.push(songWrapper);
  songsContainer.append(songWrapper);
  songWrapper.addEventListener("click", () => {
    if (songWrapper === selectedSongContainer) return;

    changeSelectedContainer(songWrapper);
    playNewSong(songWrapper.dataset.audioSrc);
  });
});

addEventListenersForMusicPlayer(songContainers);
