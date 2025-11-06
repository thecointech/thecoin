# Scraper Test Visualizer

A visual tool for viewing and comparing scraper element test results from `elements.bulk.test.ts`.

## Features

- 📊 Dashboard showing all test results with pass/fail status
- 🖼️ Side-by-side comparison of screenshots (blank, found element, expected element)
- 📈 Statistics showing total tests, passing/failing counts
- 🕒 View multiple test runs over time with timestamp selector
- ⚠️ Highlights failing tests for easy identification

## Prerequisites

Set the `PRIVATE_TESTING_PAGES` environment variable to point to your test data directory:

```bash
export PRIVATE_TESTING_PAGES=/path/to/test/data
```

## Usage

### Development Mode

The app runs two servers:
1. **API Server** (port 3011) - Express backend serving test data
2. **Dev Server** (port 3010) - Vite dev server with hot reload

In one terminal, start the API server:
```bash
yarn dev
```

In another terminal, start the Vite dev server:
```bash
cd apps/scraper-test-visualizer
yarn vite
```

Then open http://localhost:3010 in your browser.

**Tip**: You can also run both at once with:
```bash
yarn dev & yarn vite
```

### Build

```bash
yarn build
```

## How it Works

The app reads test data from the `PRIVATE_TESTING_PAGES` directory structure:

- `debugging/{test-name}/` - Contains screenshots for each test run
  - `{timestamp}-1-blank.png` - Page without highlighting
  - `{timestamp}-2-found.png` - Found element highlighted in red
  - `{timestamp}-3-original.png` - Expected element highlighted in blue
- `archive/overrides-{timestamp}.json` - Override data from test runs
- `archive/failing.json` - List of currently failing tests

## Architecture

- **Frontend**: React 18 with Semantic UI + Vite for hot reload
- **Backend**: Express server (port 3011) serving test data and images
- **Dev Server**: Vite (port 3010) with proxy to backend

## API Endpoints

- `GET /api/tests` - List all test folders
- `GET /api/tests/:testName` - Get files for a specific test
- `GET /api/overrides` - Get latest override data
- `GET /api/failing` - Get currently failing tests
- `GET /debugging/:path` - Serve screenshot images
