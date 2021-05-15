// const { get } = require("browser-sync");

function testWebP(callback) {
  var webP = new Image();
  webP.onload = webP.onerror = function () {
    callback(webP.height == 2);
  };
  webP.src =
    "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
}

testWebP(function (support) {
  if (support == true) {
    document.querySelector("body").classList.add("webp");
  } else {
    document.querySelector("body").classList.add("no-webp");
  }
});

// FETCHING

const auth = "563492ad6f91700001000001a6e08dc6f87848cd8d2726fd9f1a792d";
const gallery = document.querySelector(".gallery");
const searchInp = document.querySelector(".searchInp");
const form = document.querySelector(".search-form");
const moreBtn = document.querySelector(".more");

let searchValue;
let page = 1;
let fetchLink;
let currentSearch;

// event listeners
searchInp.addEventListener("input", updateValue);
function updateValue(e) {
  searchValue = e.target.value;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  currentSearch = searchValue;
  searchPhotos(searchValue);
});

moreBtn.addEventListener("click", showMore);

// submitBtn.addEventListener();

async function fetchApi(url) {
  const dataFetch = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: auth,
    },
  });
  const data = dataFetch.json();
  return data;
}

function generatePic(data) {
  data.photos.forEach((item) => {
    console.log(item);
    const galleryImage = document.createElement("div");
    galleryImage.classList.add("galleryImg");
    galleryImage.innerHTML = `
    <div class='gallery-info'>
    <a href=${item.photographer_url}>${item.photographer}</a>
    <a href=${item.src.original}>Download</a>
    </div>
    <img src=${item.src.large}>`;

    gallery.appendChild(galleryImage);
  });
}

async function curatedPhoto() {
  fetchLink = "https://api.pexels.com/v1/curated?per_page=15&page=1";
  const data = await fetchApi(fetchLink);
  generatePic(data);
}

async function searchPhotos(query) {
  clear();
  fetchLink = `https://api.pexels.com/v1/search?query=${query}+nature&per_page=15&page=1`;
  const data = await fetchApi(fetchLink);
  generatePic(data);
}

function clear() {
  gallery.innerHTML = "";
  searchInp.value = "";
}

async function showMore() {
  page++;
  if (currentSearch) {
    fetchLink = `https://api.pexels.com/v1/search?query=${currentSearch}+nature&per_page=15&page=${page}`;
  } else {
    fetchLink = `https://api.pexels.com/v1/curated?per_page=15&page=${page}`;
  }
  const data = await fetchApi(fetchLink);
  generatePic(data);
}

curatedPhoto();
searchPhotos();
