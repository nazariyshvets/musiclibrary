const API_KEY = "326cde79";
const currentPage = document.querySelector(".current-page");
let selectedSongContainer;
let songsData = [];
let songContainers = [];
let page = 1;
const limit = 5;

const getSongsData = async (fuzzyTags = "", search = "", offset = 0) => {
  const tracksEndpoint = `https://api.jamendo.com/v3.0/tracks/?client_id=${API_KEY}&limit=${
    limit * 4
  }&fuzzytags=${fuzzyTags}&search=${search}&offset=${offset}&imagesize=35&order=popularity_total`;

  try {
    const response = await fetch(tracksEndpoint);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const renderSongContainers = () => {
  const userSongsData = JSON.parse(localStorage.getItem("songs")) ?? [];
  const songsContainer = document.querySelector(".songs-container");
  const data = songsData?.slice((page - 1) * limit, page * limit);

  songsContainer.innerHTML = "";
  data?.forEach((song) => {
    const isInLibrary =
      userSongsData.findIndex((record) => record.id === song.id) !== -1;
    const songWrapper = document.createElement("div");
    const songImgInfo = document.createElement("div");
    const songImg = document.createElement("img");
    const songInfo = document.createElement("div");
    const songName = document.createElement("div");
    const songAuthor = document.createElement("div");
    const songPlayAdd = document.createElement("div");
    const songPlayWrapper = document.createElement("div");
    const songAddWrapper = document.createElement("div");

    songWrapper.dataset.id = song.id;
    songWrapper.dataset.audioSrc = song.audio;
    songWrapper.classList.add("song-wrapper");
    songImgInfo.classList.add("song-img-info");
    songImg.src = song.image;
    songImg.alt = song.name.replace(/&amp;/g, "&");
    songImg.draggable = false;
    songImg.classList.add("song-img");
    songInfo.classList.add("song-info");
    songName.classList.add("song-name");
    songName.textContent = song.name.replace(/&amp;/g, "&");
    songAuthor.classList.add("song-author");
    songAuthor.textContent = song.artist_name.replace(/&amp;/g, "&");
    songPlayAdd.classList.add("song-play-add");
    songPlayWrapper.classList.add("song-play-wrapper");
    songPlayWrapper.innerHTML = '<i class="fa-solid fa-play" title="Play"></i>';
    songAddWrapper.classList.add("song-add-wrapper");
    songAddWrapper.innerHTML = isInLibrary
      ? '<i class="fa-solid fa-check" title="Added"></i>'
      : '<i class="fa-solid fa-square-plus" title="Add to library"></i>';

    songsContainer.appendChild(songWrapper);
    songWrapper.append(songImgInfo, songPlayAdd);
    songImgInfo.append(songImg, songInfo);
    songInfo.append(songName, songAuthor);
    songPlayAdd.append(songPlayWrapper, songAddWrapper);

    if (song.id === selectedSongContainer?.dataset.id) {
      changeSelectedContainer(songWrapper);
    }
  });
};

const addSongToLibrary = async (songId) => {
  const userSongsData = JSON.parse(localStorage.getItem("songs")) ?? [];
  const trackEndpoint = `https://api.jamendo.com/v3.0/tracks/?client_id=${API_KEY}&id=${songId}&imagesize=400`;

  if (userSongsData.findIndex((song) => song.id === songId) !== -1) return;

  try {
    const response = await fetch(trackEndpoint);
    const data = await response.json();
    userSongsData.push(data.results[0]);
    localStorage.setItem("songs", JSON.stringify(userSongsData));
  } catch (error) {
    console.error(error);
  }
};

const handleSearchFormSubmit = async (event) => {
  event.preventDefault();

  const search = document.querySelector(".search-input").value;
  const genre = document.querySelector(".genre-select").value;

  resetPlayer();
  songsData = await getSongsData(genre, search);
  page = 1;
  renderSongContainers();
  songContainers = [...document.querySelectorAll(".song-wrapper")];

  addEventListenersForPlayBtns();
  addEventListenersForAddBtns();

  currentPage.textContent = page;
};

const addEventListenersForSearchForm = () => {
  const form = document.querySelector(".search-form");

  form.addEventListener("submit", handleSearchFormSubmit);
};

const addEventListenersForGenreSelect = () => {
  const genreSelect = document.querySelector(".genre-select");

  genreSelect.addEventListener("change", handleSearchFormSubmit);
};

const addEventListenersForPlayBtns = () => {
  const playBtns = [...document.querySelectorAll(".song-play-wrapper > i")];

  playBtns?.forEach((btn) => {
    btn.addEventListener("click", () => {
      const songContainer = btn.parentNode.parentNode.parentNode;

      if (songContainer === selectedSongContainer) return;

      changeSelectedContainer(songContainer);
      playNewSong(songContainer.dataset.audioSrc);
    });
  });
};

const addEventListenersForAddBtns = () => {
  const addBtns = [...document.querySelectorAll(".song-add-wrapper > i")];

  addBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (btn.classList.contains("fa-check")) return;

      const songId = btn.parentNode.parentNode.parentNode.dataset.id;
      await addSongToLibrary(songId);
      btn.classList.replace("fa-square-plus", "fa-check");
      btn.title = "Added";
    });
  });
};

const addEventListenersForPrevPage = () => {
  const prevPage = document.querySelector(".prev-page");

  prevPage.addEventListener("click", () => {
    if (page <= 1) return;

    page--;
    renderSongContainers();
    songContainers = [...document.querySelectorAll(".song-wrapper")];

    addEventListenersForPlayBtns();
    addEventListenersForAddBtns();

    currentPage.textContent = page;
  });
};

const addEventListenersForNextPage = () => {
  const nextPage = document.querySelector(".next-page");

  nextPage.addEventListener("click", async () => {
    const songsNum = songsData.length;

    //run out of songs - fetch new ones
    if (page >= Math.ceil(songsNum / limit)) {
      const searchForm = document.querySelector(".search-form");
      const search = searchForm.elements["search"].value;
      const genre = searchForm.elements["genre"].value;
      const newSongsData = await getSongsData(genre, search, songsNum);

      if (newSongsData.length > 0) {
        songsData.push(...newSongsData);
      } else {
        return;
      }
    }

    page++;
    renderSongContainers();
    songContainers = [...document.querySelectorAll(".song-wrapper")];

    addEventListenersForPlayBtns();
    addEventListenersForAddBtns();

    currentPage.textContent = page;
  });
};

const main = async () => {
  songsData = await getSongsData();
  renderSongContainers();
  songContainers = [...document.querySelectorAll(".song-wrapper")];

  addEventListenersForSearchForm();
  addEventListenersForGenreSelect();

  addEventListenersForPlayBtns();
  addEventListenersForAddBtns();

  addEventListenersForMusicPlayer(songContainers);

  addEventListenersForPrevPage();
  addEventListenersForNextPage();
};

main();
