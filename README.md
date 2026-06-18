# LiveNews Aggregator

A vanilla JavaScript news feed aggregator powered by [NewsData.io](https://newsdata.io).

## Setup

1.  Get a free API key from [newsdata.io](https://newsdata.io/register).
2.  Copy the config template:
    ```
    cp js/config.example.js js/config.js
    ```
3.  Open `js/config.js` and paste your API key:
    ```js
    export const API_KEY = 'your-newsdata-io-api-key';
    ```
4.  Serve the project with any local HTTP server:
    ```sh
    npx serve .
    ```
    or
    ```sh
    python3 -m http.server 8000
    ```

## Project Structure

```
├── index.html      – HTML shell
├── styles.css      – All styles (responsive, 320px → desktop)
├── js/
│   ├── api.js      – Data/network layer (fetch, sanitise)
│   ├── render.js   – DOM rendering (cards, spinner, errors)
│   ├── app.js      – Controller/state (events, orchestration)
│   ├── config.js   – Your API key (git-ignored)
│   └── config.example.js – API key template
```

## Features

- Browse top headlines by category (Business, Tech, Science, …)
- Free-text keyword search
- Responsive grid (1→2→3 columns)
- Loading spinner, empty state, and error alerts
