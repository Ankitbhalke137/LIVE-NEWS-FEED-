/**
 * api.js — Data / Network Layer
 *
 * ARCHITECTURAL ROLE
 *   Closed data-access module. Encapsulates all communication with the
 *   external NewsAPI v2 endpoint. No DOM access, no UI state — only fetch
 *   calls, response parsing, error normalisation, and payload sanitisation.
 *
 * EXPORTS
 *   NewsAPI  — Singleton configuration object.
 *   fetchNews(query, category) → Promise<Article[]>
 *
 * Article shape (post-sanitisation):
 *   { title, description, url, urlToImage, source: { name }, publishedAt }
 */

/* ------------------------------------------------------------------ */
/*  Configuration                                                      */
/* ------------------------------------------------------------------ */

const API_KEY = ''; // ← Set your NewsAPI key here or wire via env

/**
 * NewsAPI — Encapsulated configuration object.
 * Consumers read `.baseUrl` but must never mutate it.
 */
export const NewsAPI = {
  baseUrl: 'https://newsapi.org/v2',

  /** @returns {string} The resolved endpoint for top-headlines. */
  get endpoint() {
    return `${this.baseUrl}/top-headlines`;
  },
};

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                   */
/* ------------------------------------------------------------------ */

/**
 * Determine whether an article is "broken" and should be excluded.
 * Heuristics:
 *  - title is empty or exactly "[Removed]"
 *  - description is empty or falsy
 *  - urlToImage is missing or null
 *  - source name is missing
 *
 * @param   {object}  article - Raw article from the API.
 * @returns {boolean}         - true when the article is unusable.
 */
function isArticleInvalid(article) {
  if (!article || typeof article !== 'object') return true;

  const title = (article.title ?? '').trim();
  if (!title || title === '[Removed]') return true;

  const desc = (article.description ?? '').trim();
  if (!desc) return true;

  if (!article.urlToImage || typeof article.urlToImage !== 'string') return true;

  const sourceName = article.source?.name;
  if (!sourceName) return true;

  return false;
}

/**
 * Build a descriptive error that includes the HTTP status code so the
 * UI layer can surface it meaningfully.
 *
 * @param   {number}  status  - HTTP status code.
 * @param   {string}  [body]  - Optional response body text for context.
 * @returns {Error}
 */
function createHttpError(status, body) {
  const messages = {
    401: 'Unauthorized — check your API key',
    429: 'Rate limit exceeded — please wait before retrying',
  };

  const reason = messages[status] || `Server error (${status})`;
  const extra  = body ? ` — ${body}` : '';
  const error  = new Error(`${reason}${extra}`);
  error.status = status;
  return error;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Fetch top headlines from NewsAPI, optionally filtered by keyword
 * and/or category.
 *
 * @param   {string}  [query='']     - Free-text keyword search.
 * @param   {string}  [category='']  - Category filter (e.g. 'business',
 *                                      'technology', 'science', etc.).
 *                                      Defaults to 'general' when empty.
 * @returns {Promise<Article[]>}      - Cleaned, usable articles array.
 * @throws  {Error}                   - HTTP or network error with `.status`.
 */
export async function fetchNews(query = '', category = '') {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    country: 'us',
  });

  if (category && category !== 'general') {
    params.set('category', category);
  }

  if (query.trim()) {
    params.set('q', query.trim());
  }

  const url = `${NewsAPI.endpoint}?${params}`;

  /* -------- network call -------- */
  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new Error(`Network failure — unable to reach NewsAPI: ${err.message}`);
  }

  /* -------- HTTP error handling -------- */
  if (!response.ok) {
    let bodyText = '';
    try {
      bodyText = (await response.json()).message || '';
    } catch {
      /* body may not be JSON — safe to ignore */
    }

    if (response.status >= 500) {
      const err = new Error(`NewsAPI server error (${response.status})`);
      err.status = response.status;
      throw err;
    }

    throw createHttpError(response.status, bodyText);
  }

  /* -------- parse -------- */
  let json;
  try {
    json = await response.json();
  } catch (err) {
    throw new Error(`Failed to parse NewsAPI response: ${err.message}`);
  }

  /* -------- sanitise -------- */
  const rawArticles = json.articles ?? [];
  const clean       = rawArticles.filter((a) => !isArticleInvalid(a));

  return clean;
}
