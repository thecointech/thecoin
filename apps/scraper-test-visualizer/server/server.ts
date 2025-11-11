import { existsSync } from 'node:fs';
import { getTests, getTestResults, getTestImagePath, getTest, getFailing } from './data';
import { getTestPath, openFolderInBrowser } from './paths';
import { run } from "@thecointech/site-base/internal/server";
import { updateTest, applyOverrideFromSnapshot } from './update';

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
      const failing = getFailing();
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

  app.post('/api/open-folder/:key', async (req, res) => {
    try {
      const { key } = req.params;
      const test = getTest(key);
      const folderPath = test.matchedFolder;
      await openFolderInBrowser(folderPath);
      res.json({ success: true, path: folderPath });
    } catch (error) {
      console.error('Failed to open folder:', error);
      res.status(500).json({
        error: 'Failed to open folder',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/api/apply-override/:key/:element', async (req, res) => {
    try {
      const { key, element } = req.params;
      const test = getTest(key);
      const result = await applyOverrideFromSnapshot(test, element);

      if (result.success) {
        // Clear the cache so next call to getTests will reload with new overrides
        delete global.allTests;
        res.json({
          success: true,
          changes: result.changes,
          message: 'Override applied successfully'
        });
      } else {
        res.json({
          success: false,
          message: 'No changes detected between original and latest snapshot'
        });
      }
    } catch (error) {
      console.error('Failed to apply override:', error);
      res.status(500).json({
        error: 'Failed to apply override',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
})
