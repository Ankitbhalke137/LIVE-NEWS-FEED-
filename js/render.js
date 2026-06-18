/**
 * render.js — Presentation / DOM Layer
 *
 * Exclusively handles DOM manipulation. No data-fetching, no state.
 *
 * Exports:
 *   renderArticles(articles, fallbackCategory)
 *   appendArticles(articles, fallbackCategory)
 *   renderNewStoriesBanner(count)
 *   removeNewStoriesBanner()
 *   renderLoadMore()
 *   removeLoadMore()
 *   renderBackToTop()
 *   removeBackToTop()
 *   renderErrorMessage(messageText)
 *   toggleLoadingSpinner(isLoading)
 *   clearArticleGrid()
 *   getBookmarks()
 *   addBookmark(article)
 *   removeBookmark(articleId)
 *   isBookmarked(articleId)
 *   toggleBookmarkBtn(btn, state)
 */

/* ------------------------------------------------------------------ */
/*  Bookmarks — persisted in localStorage                             */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'chronicle_bookmarks';

function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveBookmarks(map) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

function articleId(article) {
  return article.link || article.title;
}

export function isBookmarked(article) {
  return !!getBookmarks()[articleId(article)];
}

export function addBookmark(article) {
  const map = getBookmarks();
  const id = articleId(article);
  map[id] = {
    title: article.title,
    link: article.link,
    image_url: article.image_url,
    source_name: article.source_name,
    pubDate: article.pubDate,
  };
  saveBookmarks(map);
}

export function removeBookmark(article) {
  const map = getBookmarks();
  delete map[articleId(article)];
  saveBookmarks(map);
}

export function toggleBookmarkBtn(btn, state) {
  btn.setAttribute('data-bookmarked', state ? 'true' : 'false');
  btn.querySelector('.bm-icon').textContent = state ? '\u2605' : '\u2606';
  btn.setAttribute('aria-label', state ? 'Remove bookmark' : 'Bookmark article');
}

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

function truncate(text, max = 120) {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s+\S*$/, '') + '\u2026';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    return new Date(normalized).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

function categoryLabel(cat) {
  const labels = {
    general: 'Latest',
    business: 'Business',
    technology: 'Technology',
    science: 'Science',
    health: 'Health',
    sports: 'Sports',
    entertainment: 'Entertainment',
  };
  return labels[cat] || cat;
}

function resolveCategory(article, fallbackCategory) {
  if (Array.isArray(article.category) && article.category.length > 0) {
    return categoryLabel(article.category[0]);
  }
  if (typeof article.category === 'string' && article.category) {
    return categoryLabel(article.category);
  }
  return categoryLabel(fallbackCategory);
}

function readingTime(text) {
  if (!text) return '1 min read';
  const words = text.trim().split(/\s+/).length;
  const min = Math.max(1, Math.round(words / 200));
  return `${min} min read`;
}

function renderImageFallback() {
  return '<div class="card__img-fallback" aria-hidden="true">' +
    '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="2" y="3" width="20" height="16" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/><circle cx="6" cy="14" r="1"/><circle cx="9" cy="14" r="1"/>' +
    '</svg>' +
    '<span>Image unavailable</span>' +
  '</div>';
}

function createSeparator() {
  const dot = document.createElement('span');
  dot.className = 'card__sep';
  return dot;
}

function buildCard(article, fallbackCategory, index) {
  const card = document.createElement('article');
  card.className = 'card';
  card.style.setProperty('--i', index);

  /* --- Image --- */
  const imageUrl = (article.image_url || '').trim();
  if (imageUrl) {
    const img = document.createElement('img');
    img.className = 'card__image';
    img.src = imageUrl;
    img.alt = article.title || '';
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    img.onerror = function () {
      this.onerror = null;
      this.outerHTML = renderImageFallback();
    };
    card.appendChild(img);
  } else {
    card.insertAdjacentHTML('beforeend', renderImageFallback());
  }

  /* --- Body --- */
  const body = document.createElement('div');
  body.className = 'card__body';

  /* Top row: tag + bookmark */
  const topRow = document.createElement('div');
  topRow.className = 'card__top';

  const tag = document.createElement('span');
  tag.className = 'card__tag';
  tag.textContent = resolveCategory(article, fallbackCategory);
  topRow.appendChild(tag);

  const bm = document.createElement('button');
  bm.className = 'card__bookmark';
  const bmState = isBookmarked(article);
  bm.setAttribute('data-bookmarked', bmState ? 'true' : 'false');
  bm.setAttribute('aria-label', bmState ? 'Remove bookmark' : 'Bookmark article');
  bm.innerHTML = '<span class="bm-icon">' + (bmState ? '\u2605' : '\u2606') + '</span>';
  topRow.appendChild(bm);

  body.appendChild(topRow);

  /* Meta row */
  const meta = document.createElement('div');
  meta.className = 'card__meta';

  if (article.source_name) {
    const sourceEl = document.createElement('span');
    sourceEl.className = 'card__source';
    sourceEl.textContent = article.source_name;
    meta.appendChild(sourceEl);
  }

  if (article.pubDate) {
    if (meta.children.length > 0) meta.appendChild(createSeparator());
    const dateEl = document.createElement('time');
    dateEl.className = 'card__date';
    dateEl.dateTime = article.pubDate;
    dateEl.textContent = formatDate(article.pubDate);
    meta.appendChild(dateEl);
  }

  if (meta.children.length > 0) meta.appendChild(createSeparator());

  const rt = document.createElement('span');
  rt.className = 'card__reading';
  rt.textContent = readingTime(article.description);
  meta.appendChild(rt);

  const creator = Array.isArray(article.creator) ? article.creator[0] : article.creator;
  if (creator) {
    if (meta.children.length > 0) meta.appendChild(createSeparator());
    const authorEl = document.createElement('span');
    authorEl.className = 'card__author';
    authorEl.textContent = creator;
    meta.appendChild(authorEl);
  }

  body.appendChild(meta);

  /* Title */
  const title = document.createElement('h2');
  title.className = 'card__title';
  title.textContent = truncate(article.title, 120);
  body.appendChild(title);

  /* Description */
  const desc = document.createElement('p');
  desc.className = 'card__desc';
  desc.textContent = article.description || '';
  body.appendChild(desc);

  /* Read More */
  const link = document.createElement('a');
  link.className = 'card__link';
  link.href = article.link || '#';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'Read more \u2192';
  body.appendChild(link);

  card.appendChild(body);
  return card;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export function renderArticles(articles, fallbackCategory = 'general') {
  const grid = getGrid();
  grid.innerHTML = '';

  if (!articles || articles.length === 0) {
    grid.innerHTML = `
      <div class="grid__empty">
        <span class="grid__empty-icon">&#128240;</span>
        <p class="grid__empty-text">No stories found</p>
        <p class="grid__empty-hint">
          Try a different keyword or browse another category above.
        </p>
      </div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  articles.forEach((article, i) => {
    fragment.appendChild(buildCard(article, fallbackCategory, i));
  });
  grid.appendChild(fragment);
}

export function appendArticles(articles, fallbackCategory = 'general') {
  const grid = getGrid();
  if (!grid) return;

  const startIndex = grid.children.length;
  const fragment = document.createDocumentFragment();
  articles.forEach((article, i) => {
    fragment.appendChild(buildCard(article, fallbackCategory, startIndex + i));
  });
  grid.appendChild(fragment);
}

/* --- Load More button ---------------------------------------------- */
export function renderLoadMore() {
  const grid = getGrid();
  if (!grid) return;
  const wrap = document.createElement('div');
  wrap.className = 'grid__load-wrap';
  wrap.id = 'load-more-wrap';
  wrap.innerHTML = '<button class="grid__load-btn" id="load-more-btn">Load more stories</button>';
  grid.after(wrap);
}

export function removeLoadMore() {
  const wrap = document.getElementById('load-more-wrap');
  if (wrap) wrap.remove();
}

/* --- New stories banner -------------------------------------------- */
export function renderNewStoriesBanner(count) {
  const existing = document.getElementById('new-stories-banner');
  if (existing) existing.remove();

  const banner = document.createElement('div');
  banner.className = 'banner';
  banner.id = 'new-stories-banner';
  banner.innerHTML =
    '<button class="banner__btn" id="new-stories-btn">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>' +
      '</svg>' +
      count + ' new storie' + (count > 1 ? 's' : '') + ' available — tap to refresh' +
    '</button>';
  document.querySelector('.main').insertBefore(banner, document.querySelector('.main').firstChild);
}

export function removeNewStoriesBanner() {
  const banner = document.getElementById('new-stories-banner');
  if (banner) banner.remove();
}

/* --- Back to top --------------------------------------------------- */
export function renderBackToTop() {
  const existing = document.getElementById('back-to-top');
  if (existing) return;
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.id = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>' +
    '</svg>';
  document.body.appendChild(btn);
}

export function removeBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (btn) btn.remove();
}

/* --- Error / spinner / clear --------------------------------------- */
export function toggleLoadingSpinner(isLoading) {
  const spinner = getSpinner();
  if (!spinner) return;
  spinner.hidden = !isLoading;
}

export function clearArticleGrid() {
  const grid = getGrid();
  if (grid) grid.innerHTML = '';
}

export function renderErrorMessage(messageText) {
  const grid = getGrid();
  if (!grid) return;

  grid.innerHTML = `
    <div class="grid__error" role="alert">
      <span class="grid__error-icon">&#9888;&#65039;</span>
      <div class="grid__error-body">
        <p class="grid__error-title">Connection issue</p>
        <p class="grid__error-text">${escapeHtml(messageText)}</p>
      </div>
    </div>`;
}
