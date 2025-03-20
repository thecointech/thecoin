
// const { loadEnvVars } = require("@thecointech/setenv");

// Expose production environment variables to allow these tests
// access to our bank acc...
// loadEnvVars("prod");

// Can't import this directly from @thecointech/jestutils because jest isn't setup yet...
const IsManualRun = process.argv.find(v => v === "--testNamePattern") !== undefined
if (IsManualRun) {
  process.env.RUN_SCRAPER_HEADLESS = "false";
}
