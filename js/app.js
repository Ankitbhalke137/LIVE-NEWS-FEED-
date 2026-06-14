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

import { fetchNews } from './api.js';
import {
  renderArticles,
  showSpinner,
  hideSpinner,
  showError,
} from './ui.js';

/* ---- State --------------------------------------------------------- */
let currentCategory = 'general';
let currentQuery   = '';

/* ---- DOM References ------------------------------------------------ */
const articlesGrid = document.getElementById('articles-grid');
const spinner      = document.getElementById('spinner');
const searchForm   = document.getElementById('search-form');
const searchInput  = document.getElementById('search-input');
const catBtns      = document.querySelectorAll('.cat-btn');

/* ---- Core fetch + render pipeline --------------------------------- */
async function loadNews() {
  showSpinner(spinner);
  articlesGrid.innerHTML = '';

  try {
    const articles = await fetchNews(currentQuery, currentCategory);
    renderArticles(articlesGrid, articles);
  } catch (err) {
    showError(articlesGrid, err.message);
  } finally {
    hideSpinner(spinner);
  }
}

/* ---- Event Wiring -------------------------------------------------- */

/* Category buttons */
catBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    catBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    currentCategory = btn.dataset.category;
    currentQuery    = '';         // clear search on category switch
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

  /* Deactivate category highlight — search is active */
  catBtns.forEach((b) => b.classList.remove('active'));

  loadNews();
});

/* ---- Bootstrap ----------------------------------------------------- */
loadNews();
