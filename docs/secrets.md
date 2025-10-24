## Secret management

Secrets are entirely managed via the lib/secrets package.

Our secrets are mostly stored on bitwarden, however a few GAE-specific
secrets are stored in the Google Secrets manager.  Both versions are
accessed through the secrets package.

Less sensitive secrets are stored in Bitwardens `{config-name}-online` projects.  These can be read by online services & github deployments.

Bitwarden access can be from 3 different methods:
1. Environment variables
  - `BWS_*` env variables are defined in environment
  - Used by VQA-service(?), GitHub Actions
2. Google Secrets Manager
  - Single secret is defined with full JSON object
  - Used by broker/rates-service on GAE Only
3. Env Files
  - `.env` files contain variables matching `BWS_*`
  - `.env` files are loaded from `THECOIN_SECRETS` environment variable
  - Used by tx-processor, local development

### Electron: Access to BrokerDB firestore

Go to firebase => project overview => * => project settings => General => Your Apps

In the SDK setup & config
```
const firebaseConfig = {
  apiKey: "..."
  ...
}
```

Use these values to set env vars:
```
TCCC_FIRESTORE_*=...
```

These variables are used to initialize firebase to the project.  In Firebase init, it creates a sign-in page with popup.  The user signs in with their google account.

Each environment has it's own Firestore.  The following accounts are granted read/write on the DB
prod:
  `autodeposit@thecoin.io`
test:
  `*@thecoin.io`
  `*@test.thecoin.io`

### User Data

See Encryption.md
