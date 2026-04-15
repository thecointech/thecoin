import { getEnvVars } from "@thecointech/setenv";

// Smoke test verifies that the given URL returns a 200 status code
// Run directly by action-smoke-tests.yml
const configName = process.argv[2];
const envVarName = process.argv[3];
const suffix = process.argv[4] ?? '';

// Validate arguments
if (!configName || !envVarName) {
  console.error('Usage: smoke-test.ts <config-name> <env-var-name> [url-suffix]');
  console.error('Example: node smoke-test.ts prodtest URL_SITE_LANDING');
  console.error('Example: node smoke-test.ts prodtest URL_SERVICE_RATES /rates/124');
  process.exit(1);
}

// Load environment and get URL
const env = getEnvVars(configName);
const baseUrl = env[envVarName];

if (!baseUrl) {
  console.error(`❌ Environment variable ${envVarName} is not defined in config ${configName}`);
  process.exit(1);
}

const url = baseUrl + suffix;
console.log(`Testing ${envVarName}: ${url}`);

// Make the request
try {
  const response = await fetch(url);
  const status = response.status;

  if (status === 200) {
    console.log(`✅ Success (HTTP ${status})`);
    process.exit(0);
  } else {
    console.error(`❌ Failed with HTTP ${status}`);
    process.exit(1);
  }
} catch (error) {
  console.error(`❌ Request failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
