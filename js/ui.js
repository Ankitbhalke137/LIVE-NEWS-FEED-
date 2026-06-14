/**
 * ui.js — Presentation / DOM Layer
 *
 * ARCHITECTURAL ROLE
 *   Pure view layer. Reads data (articles), renders markup, manages the
 *   loading spinner, and exposes an error display helper. Never makes fetch
 *   calls, never holds application state. All side-effects are confined to
 *   DOM queries and manipulation.
 *
 * EXPORTS
 *   renderArticles(articles)
 *   toggleLoadingSpinner(isLoading)
 *   clearArticleGrid()
 *   showError(message)
 */

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                   */
/* ------------------------------------------------------------------ */

function getGrid() {
  return document.getElementById('articles-grid');
}

function getSpinner() {
  return document.getElementById('spinner');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function truncate(text, max = 100) {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

function formatDate(isoString) {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Render an array of articles into the articles grid.
 * Each card displays: image, publication date, title snippet, author,
 * description, and a "Read More" link.
 *
 * @param {Article[]} articles — Normalised article objects.
 */
export function renderArticles(articles) {
  const grid = getGrid();
  grid.innerHTML = '';

  if (!articles || articles.length === 0) {
    grid.innerHTML =
      '<p class="empty-state">No articles found. Try a different category or search term.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const article of articles) {
    const card = document.createElement('article');
    card.className = 'article-card';

    const img = document.createElement('img');
    img.className = 'article-card__image';
    img.src = article.urlToImage || '';
    img.alt = article.title || '';
    img.loading = 'lazy';

    const body = document.createElement('div');
    body.className = 'article-card__body';

    const meta = document.createElement('div');
    meta.className = 'article-card__meta';

    if (article.publishedAt) {
      const dateEl = document.createElement('time');
      dateEl.className = 'article-card__date';
      dateEl.dateTime = article.publishedAt;
      dateEl.textContent = formatDate(article.publishedAt);
      meta.appendChild(dateEl);
    }

    if (article.author) {
      const authorEl = document.createElement('span');
      authorEl.className = 'article-card__author';
      authorEl.textContent = article.author;
      meta.appendChild(authorEl);
    }

    const title = document.createElement('h2');
    title.className = 'article-card__title';
    title.textContent = truncate(article.title, 100);

    const desc = document.createElement('p');
    desc.className = 'article-card__description';
    desc.textContent = article.description || '';

    const link = document.createElement('a');
    link.className = 'article-card__link';
    link.href = article.url || '#';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Read More →';

    body.append(meta, title, desc, link);
    card.append(img, body);
    fragment.appendChild(card);
  }

  grid.appendChild(fragment);
}

/**
 * Show or hide the loading spinner.
 * @param {boolean} isLoading — true to show, false to hide.
 */
export function toggleLoadingSpinner(isLoading) {
  const spinner = getSpinner();
  if (!spinner) return;
  spinner.hidden = !isLoading;
}

/**
 * Clear all content from the articles grid (cards, errors, empty states).
 */
export function clearArticleGrid() {
  const grid = getGrid();
  if (grid) grid.innerHTML = '';
}

/**
 * Display a user-friendly error message inside the articles grid.
 * @param {string} message — Error description to show.
 */
export function showError(message) {
  const grid = getGrid();
  if (!grid) return;
  grid.innerHTML =
    `<p class="error-state" role="alert">${escapeHtml(message)}</p>`;
}
