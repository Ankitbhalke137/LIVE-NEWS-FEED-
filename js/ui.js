/**
 * ui.js — Presentation / DOM Layer
 *
 * ARCHITECTURAL ROLE
 *   Pure view layer. Reads data (articles), renders markup, attaches trivial
 *   event listeners. Never makes fetch calls, never holds application state.
 *   All side-effects are confined to DOM manipulation.
 *
 * PUBLIC INTERFACE
 *   renderArticles(container, articles)
 *   showSpinner(container)
 *   hideSpinner(container)
 *   showError(container, message)
 */

/**
 * Render an array of articles into the given container.
 * Each article is displayed as a card with image, source, title, description,
 * and a link to the full story.
 *
 * @param {HTMLElement} container - The #articles-grid element.
 * @param {Article[]}   articles  - Normalised article objects.
 */
export function renderArticles(container, articles) {
  container.innerHTML = '';

  if (!articles || articles.length === 0) {
    container.innerHTML =
      '<p class="empty-state">No articles found. Try a different category or search term.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const article of articles) {
    const card = document.createElement('article');
    card.className = 'article-card';

    /* Image */
    const img = document.createElement('img');
    img.className = 'article-card__image';
    img.src = article.urlToImage || 'https://via.placeholder.com/480x270?text=No+Image';
    img.alt = article.title || '';
    img.loading = 'lazy';

    /* Body wrapper */
    const body = document.createElement('div');
    body.className = 'article-card__body';

    const source = document.createElement('span');
    source.className = 'article-card__source';
    source.textContent = article.source?.name || 'Unknown source';

    const title = document.createElement('h2');
    title.className = 'article-card__title';
    title.textContent = article.title || 'Untitled';

    const desc = document.createElement('p');
    desc.className = 'article-card__description';
    desc.textContent = article.description || '';

    const link = document.createElement('a');
    link.className = 'article-card__link';
    link.href = article.url || '#';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Read full story →';

    body.append(source, title, desc, link);
    card.append(img, body);
    fragment.appendChild(card);
  }

  container.appendChild(fragment);
}

/**
 * Show the loading spinner.
 * @param {HTMLElement} spinner - The #spinner element.
 */
export function showSpinner(spinner) {
  spinner.hidden = false;
}

/**
 * Hide the loading spinner.
 * @param {HTMLElement} spinner - The #spinner element.
 */
export function hideSpinner(spinner) {
  spinner.hidden = true;
}

/**
 * Display a user-friendly error message inside the articles container.
 * @param {HTMLElement} container - The #articles-grid element.
 * @param {string}      message   - Error description.
 */
export function showError(container, message) {
  container.innerHTML =
    `<p class="error-state" role="alert">⚠️ ${escapeHtml(message)}</p>`;
}

/* ---- tiny helper --------------------------------------------------- */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
