const path = require('path');
const { TextEncoder, TextDecoder } = require('util');

// Hide debug logging
var cwd = process.cwd();
var name = cwd.split(path.sep).pop();
process.env.LOG_NAME = `${name}-jest`;
process.env.LOG_LEVEL = 40

// Polyfill TextEncoder/TextDecoder for jsdom
// These are needed by packages like react-router but aren't included in jsdom
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// jest.setup.js

// Check if window object exists (prevents errors if running in a non-jsdom environment)
if (typeof window !== 'undefined') {
  // Mock the missing function on the window object
  window.scrollTo = jest.fn();
}
