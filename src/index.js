import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import './css/styles.css';

let gallery = new SimpleLightbox('.gallery a');

const API = 'https://pixabay.com/api/';
const keyAPI = '32898789-bb69a622d84d8c3b35ac89d94';

const formEl = document.querySelector('#search-form');
const inputEl = document.querySelector('.search-form__input');
const divGalleryEl = document.querySelector('.gallery');
const buttonMoreEl = document.querySelector('.load-more');
const alertEl = document.querySelector('.text');

let page;
let keyValue = '';
let totalPages = 0;

formEl.addEventListener('submit', onFormSubmit);
buttonMoreEl.addEventListener('click', onButtonClick);

function onFormSubmit(event) {
  event.preventDefault();
  keyValue = inputEl.value;

  page = 1;
  divGalleryEl.innerHTML = '';
  alertEl.classList.add('hidden');

  if (!keyValue.trim()) {
    Notiflix.Notify.info('Oops! Please, enter smth to search.');
    buttonMoreEl.classList.add('hidden');
    return;
  }

  getImg(keyValue);

  event.currentTarget.reset();
}

function onButtonClick() {
  getImg(keyValue);
}

async function getImg(keyWord) {
  try {
    const response = await axios.get(
      `${API}?key=${keyAPI}&q=${keyWord}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`
    );

    if (response.data.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      buttonMoreEl.classList.add('hidden');
      alertEl.classList.add('hidden');
      return;
    }

    if (page === 1) {
      Notiflix.Notify.success(
        `Hooray! We found ${response.data.totalHits} images.`
      );
    }

    buttonMoreEl.classList.remove('hidden');
    totalPages = Math.ceil(response.data.totalHits / 40);

    renderGallery(response.data.hits);
    page += 1;

    if (page > totalPages) {
      Notiflix.Notify.info(
        ` We're sorry, but you've reached the end of search results.`
      );
      buttonMoreEl.classList.add('hidden');
    }
  } catch (error) {
    console.error(error);
  }
}

function renderGallery(images) {
  const markup = images
    .map(image => {
      return `
        <div class="photo-card">
            <a href="${image.largeImageURL}">
                <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
            </a>
            <div class="info">
            <p class="info-item">
            <b>Likes</b>
            ${image.likes}
            </p>
            <p class="info-item">
            <b>Views</b>
            ${image.views}
            </p>
            <p class="info-item">
            <b>Comments</b>
            ${image.comments}
            </p>
            <p class="info-item">
            <b>Downloads</b>
            ${image.downloads}
            </p>
            </div>
        </div>
        `;
    })
    .join('');
  divGalleryEl.insertAdjacentHTML('beforeend', markup);

  if (page > 1) {
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }

  gallery.refresh();
}

gallery.on('show.simplelightbox', function () {
  gallery.options.captionsData = 'alt';
  gallery.options.captionDelay = 250;
  gallery.options.scrollZoom = false;
  gallery.options.scrollZoomFactor = 0;
});
