/**
 * app.js — Orchestration / Controller Layer
 *
 * Imports data (api.js) and view (render.js) layers, wires them
 * together through event handlers, and holds application state.
 */

import { fetchNews } from './api.js';
import {
  renderArticles,
  appendArticles,
  renderNewStoriesBanner,
  removeNewStoriesBanner,
  renderLoadMore,
  removeLoadMore,
  renderBackToTop,
  removeBackToTop,
  renderErrorMessage,
  toggleLoadingSpinner,
  clearArticleGrid,
  addBookmark,
  removeBookmark,
  isBookmarked,
  toggleBookmarkBtn,
} from './render.js';

/* ---- Section-to-category map --------------------------------------- */
const SECTION_MAP = {
  home: 'general',
  politics: 'general',
  tech: 'technology',
  market: 'business',
  science: 'science',
  health: 'health',
};

/* ---- State --------------------------------------------------------- */
let currentCategory = 'general';
let currentQuery   = '';
let nextPageToken  = null;
let isLoadingMore  = false;
let refreshTimer   = null;
let firstArticleId = null;

/* ---- DOM References ------------------------------------------------ */
const searchForm     = document.getElementById('search-form');
const searchInput    = document.getElementById('search-input');
const categorySelect = document.getElementById('category-select');
const themeToggle    = document.getElementById('theme-toggle');
const navLinks       = document.querySelectorAll('.nav__link');

/* ---- Theme --------------------------------------------------------- */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

const savedTheme = localStorage.getItem('theme');
applyTheme(savedTheme || 'light');
themeToggle.addEventListener('click', toggleTheme);

/* ---- Navigation links ---------------------------------------------- */
navLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navLinks.forEach((l) => l.classList.remove('nav__link--active'));
    link.classList.add('nav__link--active');

    const section = link.dataset.section;
    const category = SECTION_MAP[section] || 'general';

    currentCategory = category;
    currentQuery = '';
    searchInput.value = '';
    categorySelect.value = category;
    scheduleRefresh();

    loadNews();
  });
});

/* ---- Bookmark delegation ------------------------------------------- */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.card__bookmark');
  if (!btn) return;

  const card = btn.closest('.card');
  const article = extractArticleFromCard(card);
  if (!article) return;

  const was = isBookmarked(article);
  if (was) {
    removeBookmark(article);
    toggleBookmarkBtn(btn, false);
  } else {
    addBookmark(article);
    toggleBookmarkBtn(btn, true);
  }
});

function extractArticleFromCard(card) {
  const titleEl = card.querySelector('.card__title');
  const linkEl  = card.querySelector('.card__link');
  const imgEl   = card.querySelector('.card__image');
  const source  = card.querySelector('.card__source');
  const dateEl  = card.querySelector('.card__date');
  if (!titleEl || !linkEl) return null;
  return {
    title: titleEl.textContent,
    link: linkEl.getAttribute('href'),
    image_url: imgEl ? imgEl.getAttribute('src') : '',
    source_name: source ? source.textContent : '',
    pubDate: dateEl ? dateEl.getAttribute('datetime') : '',
  };
}

/* ---- Core fetch + render pipeline --------------------------------- */
async function loadNews() {
  clearArticleGrid();
  removeLoadMore();
  removeNewStoriesBanner();
  toggleLoadingSpinner(true);
  nextPageToken = null;

  try {
    const { articles, nextPage } = await fetchNews(currentQuery, currentCategory);
    renderArticles(articles, currentCategory);
    nextPageToken = nextPage;
    if (nextPageToken) renderLoadMore();
    trackFirstArticle(articles);
  } catch (err) {
    renderErrorMessage(err.message);
  } finally {
    toggleLoadingSpinner(false);
  }
}

/* ---- Load More ----------------------------------------------------- */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('#load-more-btn');
  if (!btn || isLoadingMore) return;

  isLoadingMore = true;
  btn.disabled = true;
  btn.textContent = 'Loading\u2026';

  fetchNews(currentQuery, currentCategory, nextPageToken)
    .then(({ articles, nextPage }) => {
      appendArticles(articles, currentCategory);
      nextPageToken = nextPage;
      if (nextPageToken) {
        btn.disabled = false;
        btn.textContent = 'Load more stories';
      } else {
        removeLoadMore();
      }
    })
    .catch((err) => {
      btn.disabled = false;
      btn.textContent = 'Load more stories';
      renderErrorMessage(err.message);
    })
    .finally(() => {
      isLoadingMore = false;
    });
});

/* ---- Auto-refresh -------------------------------------------------- */
function trackFirstArticle(articles) {
  firstArticleId = articles.length > 0 ? (articles[0].link || articles[0].title) : null;
}

function scheduleRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(checkForNewStories, 60000);
}

async function checkForNewStories() {
  try {
    const { articles } = await fetchNews(currentQuery, currentCategory);
    const newFirstId = articles.length > 0 ? (articles[0].link || articles[0].title) : null;
    if (newFirstId && newFirstId !== firstArticleId) {
      renderNewStoriesBanner(articles.length);
    }
  } catch {
    /* silent — don't annoy the user */
  }
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('#new-stories-btn');
  if (!btn) return;
  removeNewStoriesBanner();
  loadNews();
});

scheduleRefresh();

/* ---- Debounced search ---------------------------------------------- */
let searchDebounce = null;
searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounce);
  const value = searchInput.value.trim();
  if (value.length < 2) return;
  searchDebounce = setTimeout(() => {
    currentQuery = value;
    currentCategory = 'general';
    categorySelect.value = 'general';
    navLinks.forEach((l) => l.classList.remove('nav__link--active'));
    document.querySelector('.nav__link[data-section="home"]')?.classList.add('nav__link--active');
    scheduleRefresh();
    loadNews();
  }, 400);
});

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  clearTimeout(searchDebounce);
  const value = searchInput.value.trim();
  if (!value) return;

  currentQuery = value;
  currentCategory = 'general';
  categorySelect.value = 'general';
  navLinks.forEach((l) => l.classList.remove('nav__link--active'));
  document.querySelector('.nav__link[data-section="home"]')?.classList.add('nav__link--active');
  scheduleRefresh();
  loadNews();
});

/* ---- Category dropdown --------------------------------------------- */
categorySelect.addEventListener('change', () => {
  currentCategory = categorySelect.value;
  currentQuery = '';
  searchInput.value = '';
  navLinks.forEach((l) => l.classList.remove('nav__link--active'));
  const match = document.querySelector(`.nav__link[data-section="${currentCategory}"]`);
  if (match) match.classList.add('nav__link--active');
  scheduleRefresh();
  loadNews();
});

/* ---- Back to top --------------------------------------------------- */
renderBackToTop();

window.addEventListener('scroll', () => {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  btn.classList.toggle('back-to-top--visible', window.scrollY > 500);
});

document.addEventListener('click', (e) => {
  const btn = e.target.closest('#back-to-top');
  if (!btn) return;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ---- Bootstrap ----------------------------------------------------- */
loadNews();
