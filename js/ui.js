/**
 * ui.js — Presentation / DOM Layer
 *
 * ARCHITECTURAL ROLE
 *   Pure view layer. Reads data (articles), renders markup, manages the
 *   loading spinner, and exposes helpers for error and empty-state display.
 *   Never makes fetch calls, never holds application state. All side-effects
 *   are confined to DOM queries and manipulation.
 *
 * EXPORTS
 *   renderArticles(articles)
 *   renderErrorMessage(messageText)
 *   toggleLoadingSpinner(isLoading)
 *   clearArticleGrid()
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
    grid.innerHTML = `
      <div class="empty-card">
        <span class="empty-card__icon">📭</span>
        <p class="empty-card__text">No articles found matching that search term.</p>
        <p class="empty-card__hint">Try a different keyword or browse a category above.</p>
      </div>`;
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
 * Clear the grid and display a prominent alert box with the error detail.
 * The message is intentionally vague to the public but descriptive enough
 * for debugging — no raw stack traces reach the user.
 *
 * @param {string} messageText — Human-readable error description.
 */
export function renderErrorMessage(messageText) {
  const grid = getGrid();
  if (!grid) return;

  grid.innerHTML = `
    <div class="error-alert" role="alert">
      <span class="error-alert__icon">⚠️</span>
      <div class="error-alert__content">
        <p class="error-alert__title">Something went wrong</p>
        <p class="error-alert__text">${escapeHtml(messageText)}</p>
      </div>
    </div>`;
}
