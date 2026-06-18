/**
 * api.js — Data / Network Layer
 *
 * Closed data-access module. Encapsulates all communication with the
 * external NewsData.io API. No DOM access, no UI state — only fetch
 * calls, response parsing, error normalisation, and payload sanitisation.
 *
 * EXPORTS
 *   fetchNews(query, category, page) → Promise<{ articles, nextPage }>
 *
 * Article shape (post-sanitisation):
 *   { title, description, link, image_url, source_name, pubDate, creator }
 */

const API_KEY = 'pub_1d5c730f1af64ad28fa004955561585f';
const BASE_URL = 'https://newsdata.io/api/1';

const CATEGORY_MAP = {
  general: '',
  business: 'business',
  technology: 'technology',
  science: 'science',
  health: 'health',
  sports: 'sports',
  entertainment: 'entertainment',
};

function mapCategory(appCategory) {
  return CATEGORY_MAP[appCategory] || '';
}

function isArticleInvalid(article) {
  if (!article || typeof article !== 'object') return true;

  const title = (article.title ?? '').trim();
  if (!title) return true;

  const desc = (article.description ?? '').trim();
  if (!desc) return true;

  if (!article.link) return true;

  return false;
}

function createError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * Fetch top headlines from NewsData.io.
 *
 * @param   {string}  [query='']      Free-text keyword search.
 * @param   {string}  [category='']   Category filter.
 * @param   {string}  [page='']       Pagination token from a previous response.
 * @returns {{ articles: object[], nextPage: string|null }}
 */
export async function fetchNews(query = '', category = '', page = '') {
  const params = new URLSearchParams({ apikey: API_KEY, language: 'en' });

  const mappedCategory = mapCategory(category);
  if (mappedCategory) {
    params.set('category', mappedCategory);
  }

  if (query.trim()) {
    params.set('q', query.trim());
  }

  if (page) {
    params.set('page', page);
  }

  const url = `${BASE_URL}/latest?${params}`;

  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw createError(`Network failure — unable to reach NewsData.io: ${err.message}`);
  }

  if (!response.ok) {
    let bodyText = '';
    try {
      bodyText = (await response.json()).results?.message || '';
    } catch {}
    throw createError(
      bodyText ? `NewsData.io error (${response.status}) — ${bodyText}` : `NewsData.io error (${response.status})`,
      response.status
    );
  }

  let json;
  try {
    json = await response.json();
  } catch (err) {
    throw createError(`Failed to parse NewsData.io response: ${err.message}`);
  }

  if (json.status === 'error') {
    const msg = json.results?.message || 'Unknown API error';
    throw createError(`NewsData.io error — ${msg}`);
  }

  const rawArticles = json.results ?? [];
  const articles = rawArticles.filter((a) => !isArticleInvalid(a));
  const nextPage = json.nextPage || null;

  return { articles, nextPage };
}
