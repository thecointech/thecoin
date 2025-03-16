// pre-make step fetches secrets and writes them to a file
// As our forge config is commonjs and cannot use async/await
const { getVqaSecretPath } = require('./vqa-path');
async function generateCertFile() {
  const { getSecret } = await import('@thecointech/secrets');
  const { writeFileSync } = await import('fs');

  const cert = await getSecret("VqaSslCertPublic");
  const apiKey = await getSecret("VqaApiKey");
  const content = {
    comment: "This is an auto-generated file",
    vqaCertificate: cert,
    vqaApiKey: apiKey
  };
  writeFileSync(getVqaSecretPath(), JSON.stringify(content, null, 2));
}

generateCertFile().catch(console.error);
