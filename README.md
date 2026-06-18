# Chronicle News — Live News Feed

A production-grade, framework-free news aggregator built with vanilla HTML, CSS, and JavaScript (ES6 modules). Powered by [NewsData.io](https://newsdata.io).

## Features

- Browse headlines by category (Business, Tech, Science, Health, Sports, Entertainment)
- Free-text keyword search with debounced input
- Pagination — "Load more stories" button
- Bookmark articles (persisted in localStorage)
- Auto-refresh — polls every 60s, banner on new content
- Reading time estimate on each card
- Dark mode toggle (persisted in localStorage)
- Responsive grid (1 → 2 → 3 columns)
- Animated card entrance, loading spinner, error/empty states
- Back-to-top button

## Project Structure

```
├── index.html      – Semantic HTML shell
├── styles.css      – BEM-scoped CSS (888 lines, responsive)
├── js/
│   ├── api.js      – Data layer (NewsData.io fetch, sanitise, pagination)
│   ├── render.js   – DOM layer (cards, bookmarks, spinner, errors, banners)
│   └── app.js      – Controller (state, events, auto-refresh, scroll)
```

## Quick Start

Serve the project root with any HTTP server:

```sh
npx serve .
# or
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.
