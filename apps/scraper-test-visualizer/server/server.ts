import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { getTests, getTestResults, getTestImagePath } from './data';
import { getTestPath } from './paths';
import { run } from "@thecointech/site-base/internal/server";
import { getLastFailing } from '@thecointech/scraper-archive';
import { updateTest } from './update';

const testingPages = getTestPath();

run(
  [],
  app => {

  // Enable CORS for development
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  // API: List all tests
  app.get('/api/tests', (req, res) => {
    try {
      const allTests = getTests();
      res.json(allTests);
    } catch (error) {
      console.error('Failed to read test folders:', error);
      res.status(500).json({ error: 'Failed to read test folders' });
    }
  });

  app.get('/api/results/:key/:element', (req, res) => {
    try {
      const { key, element } = req.params;
      const results = getTestResults(key, element);
      res.json(results);
    } catch (error) {
      console.error('Failed to read test results:', error);
      res.status(500).json({ error: 'Failed to read test results' });
    }
  });

  app.get('/api/image/:key', (req, res) => {
    try {
      const { key } = req.params;
      const imagePath = getTestImagePath(key);
      if (!existsSync(imagePath)) {
        return res.status(404).json({ error: 'Image not found' });
      }
      return res.sendFile(imagePath);
    } catch (error) {
      console.error('Failed to read test image:', error);
      return res.status(500).json({ error: 'Failed to read test image' });
    }
  });

  // API: Get failing tests
  app.get('/api/failing', (req, res) => {
    try {
      const failing = getLastFailing();
      return res.json(failing);
    } catch (error) {
      console.error('Failed to read failing tests:', error);
      return res.status(500).json({ error: 'Failed to read failing tests' });
    }
  });

  app.get('/api/update/:key/:element', async (req, res) => {
    try {
      const { key, element } = req.params;
      const results = await updateTest(key, element);
      res.json({ success: results });
    } catch (error) {
      console.error('Failed to run test:', error);
      res.status(500).json({ error: 'Failed to run test' });
    }
  });
})

