## Secret management


Where secrets are stored, and how to restore them

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
