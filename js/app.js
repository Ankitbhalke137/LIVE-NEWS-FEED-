/**
 * app.js — Orchestration / Controller Layer
 *
 * ARCHITECTURAL ROLE
 *   Application entry-point and coordinator. Imports api.js (data) and ui.js
 *   (view), wires them together through event handlers and lifecycle.
 *   Holds the "current state" (active category, active query). Never
 *   touches the DOM directly — delegates all rendering to ui.js.
 *
 * BOOTSTRAP
 *  1. Grab DOM references.
 *  2. Attach event listeners (category buttons, search form).
 *  3. Kick off initial load.
 */

import { fetchNews, NewsAPI } from './api.js';
import {
  renderArticles,
  renderErrorMessage,
  toggleLoadingSpinner,
  clearArticleGrid,
} from './ui.js';

/* ---- State --------------------------------------------------------- */
let currentCategory = 'general';
let currentQuery   = '';

/* ---- DOM References ------------------------------------------------ */
const searchForm   = document.getElementById('search-form');
const searchInput  = document.getElementById('search-input');
const catBtns      = document.querySelectorAll('.cat-btn');

/* ---- Core fetch + render pipeline --------------------------------- */
async function loadNews() {
  clearArticleGrid();
  toggleLoadingSpinner(true);

  try {
    const articles = await fetchNews(currentQuery, currentCategory);
    renderArticles(articles);
  } catch (err) {
    renderErrorMessage(err.message);
  } finally {
    toggleLoadingSpinner(false);
  }
}

/* ---- Event Wiring -------------------------------------------------- */

/* Category buttons */
catBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    catBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    currentCategory = btn.dataset.category;
    currentQuery    = '';
    searchInput.value = '';

    loadNews();
  });
});

/* Search form */
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = searchInput.value.trim();
  if (!value) return;

  currentQuery = value;
  catBtns.forEach((b) => b.classList.remove('active'));

  loadNews();
});

/* ---- Bootstrap ----------------------------------------------------- */
loadNews();
