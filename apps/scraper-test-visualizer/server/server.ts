import express from 'express';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { getTests } from './tests.ts';

const app = express();
const PORT = 3011;

const testingPages = process.env.PRIVATE_TESTING_PAGES;

if (!testingPages) {
  console.error('⚠️  PRIVATE_TESTING_PAGES environment variable not set');
  console.error('   Please set it to the path of your test data directory');
  process.exit(1);
}

if (!existsSync(testingPages)) {
  console.error(`⚠️  PRIVATE_TESTING_PAGES directory does not exist: ${testingPages}`);
  process.exit(1);
}

console.log(`📁 Using test data from: ${testingPages}`);

// Enable CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Serve static files from debugging folder
app.use('/debugging', express.static(join(testingPages, 'debugging')));

// API: List all tests
app.get('/api/tests', (req, res) => {
  try {
    const allTests = getTests(testingPages);
    res.json(allTests);
  } catch (error) {
    console.error('Failed to read test folders:', error);
    res.status(500).json({ error: 'Failed to read test folders' });
  }
});

// API: Get files for a specific test
app.get('/api/tests/:testName', (req, res) => {
  try {
    const { testName } = req.params;
    const testPath = join(testingPages, 'debugging', testName);

    if (!existsSync(testPath)) {
      return res.json({ testName, groups: [] });
    }

    const files = readdirSync(testPath)
      .filter(file => extname(file) === '.png')
      .sort();

    // Group files by timestamp
    const groups = {};
    files.forEach(file => {
      const match = file.match(/^(\d+)-(\d+)-(.+)\.png$/);
      if (match) {
        const [, timestamp, order, type] = match;
        if (!groups[timestamp]) {
          groups[timestamp] = {};
        }
        groups[timestamp][type] = file;
      }
    });

    res.json({
      testName,
      groups: Object.entries(groups).map(([timestamp, files]) => ({
        timestamp: parseInt(timestamp),
        files
      })).sort((a, b) => b.timestamp - a.timestamp) // Most recent first
    });
  } catch (error) {
    console.error(`Failed to read test ${req.params.testName}:`, error);
    res.status(500).json({ error: 'Failed to read test data' });
  }
});

// API: Get override data
app.get('/api/overrides', (req, res) => {
  try {
    const archivePath = join(testingPages, 'archive');
    if (!existsSync(archivePath)) {
      return res.json({ file: null, data: null });
    }

    const files = readdirSync(archivePath)
      .filter(file => file.startsWith('overrides-') && file.endsWith('.json'))
      .sort()
      .reverse(); // Most recent first

    if (files.length > 0) {
      const latestOverride = files[0];
      const data = JSON.parse(readFileSync(join(archivePath, latestOverride), 'utf-8'));
      res.json({ file: latestOverride, data });
    } else {
      res.json({ file: null, data: null });
    }
  } catch (error) {
    console.error('Failed to read overrides:', error);
    res.status(500).json({ error: 'Failed to read overrides' });
  }
});

// API: Get failing tests
app.get('/api/failing', (req, res) => {
  try {
    const failingPath = join(testingPages, 'archive', 'failing-elm.json');
    if (!existsSync(failingPath)) {
      return res.json({ include: [], exclude: [] });
    }
    const data = JSON.parse(readFileSync(failingPath, 'utf-8'));
    res.json(data);
  } catch (error) {
    console.error('Failed to read failing tests:', error);
    res.status(500).json({ error: 'Failed to read failing tests' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', testingPages });
});

app.listen(PORT, () => {
  console.log(`🚀 API server running at http://localhost:${PORT}`);
  console.log(`📊 Access the visualizer at http://localhost:3010`);
  console.log('');
  console.log('Press Ctrl+C to stop');
});
