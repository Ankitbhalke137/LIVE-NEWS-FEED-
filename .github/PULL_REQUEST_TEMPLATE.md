## Description

<!-- Briefly explain what this PR introduces and why. -->

## Checklist

- [ ] **Responsiveness verified** — app layout tested down to 320px viewport width (no horizontal scroll, readable text, tap targets ≥ 44 px).
- [ ] **Error catching verified** — 401, 429, 5xx, and network failures produce a styled `.error-alert` box (no silent console breaks).
- [ ] **Empty results handled** — zero-article search renders the `.empty-card` prompt instead of a blank screen.
- [ ] **Spinner toggles correctly** — loading state is shown during fetch and hidden after resolution or error.
- [ ] **Semantic HTML** — `<header>`, `<main>`, `<aside>`, `<footer>`, `<article>`, `<time>`, `role` attributes used throughout.
- [ ] **No framework dependencies** — all code is vanilla HTML / CSS / ES6 modules.
- [ ] **API key absent from committed code** — `API_KEY` is set at runtime and never committed.

## How to run locally

```bash
# 1. Clone the repo
git clone https://github.com/Ankitbhalke137/LIVE-NEWS-FEED-.git
cd LIVE-NEWS-FEED-

# 2. Open js/api.js and set your NewsAPI key
#    const API_KEY = 'your-key-here';

# 3. Serve with any static HTTP server (required for ES6 modules)
npx serve .
#    or
python3 -m http.server 8080

# 4. Open http://localhost:8080 (or the port serve gives you)
```

## Verification plan

| Scenario | Steps | Expected result |
|---|---|---|
| Happy path — category | Click "Tech" | Spinner appears, then article cards render with images, dates, author, description. |
| Happy path — search | Type "bitcoin" and submit | Articles matching the keyword appear. |
| Empty search | Type "zzzznotexisting" and submit | Empty-card prompt: "No articles found matching that search term." |
| Invalid API key | Set `API_KEY` to `"invalid"` | Error-alert box: "Unauthorized — check your API key." |
| Network off | Disconnect Wi‑Fi, reload | Error-alert box: "Network failure — unable to reach NewsAPI: ..." |
| Responsive | Resize from 320px to 1440px | Grid reflows: 1 col → 2 col (600 px) → sidebar + 2 col (900 px) → sidebar + 3 col (1200 px). |

## Related issues

<!-- Link to any tracked issues, e.g. Closes #42. -->
