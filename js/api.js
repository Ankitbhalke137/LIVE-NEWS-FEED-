/**
 * api.js — Data / Network Layer
 *
 * ARCHITECTURAL ROLE
 *   Sole responsibility for communicating with the external NewsAPI (or any
 *   future data source). No DOM manipulation, no UI state — only fetch calls,
 *   response parsing, and error normalization.
 *
 * PUBLIC INTERFACE
 *   fetchTopHeadlines(category, query?)
 *     → { articles: Article[] }   (throws on network / API error)
 *
 *   Article shape (normalised):
 *     { title, description, url, urlToImage, source: { name }, publishedAt }
 */

const API_BASE = 'https://newsapi.org/v2';
const API_KEY   = ''; //  ← Set your NewsAPI key here or wire via env

/**
 * Fetch top headlines, optionally filtered by category and/or keyword.
 * @param   {string}  category  - One of 'general','business','technology', etc.
 * @param   {string}  [query]   - Free-text keyword search.
 * @returns {Promise<Article[]>}
 * @throws  {Error}             - Wraps network / HTTP errors.
 */
export async function fetchTopHeadlines(category = 'general', query = '') {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    country: 'us',
    category,
  });

  if (query.trim()) {
    params.set('q', query.trim());
  }

  const url = `${API_BASE}/top-headlines?${params}`;

  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.message || `NewsAPI request failed (${res.status})`,
    );
  }

  const json = await res.json();
  return json.articles ?? [];
}
