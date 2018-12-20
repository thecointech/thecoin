start gcloud beta emulators datastore start --no-legacy

TIMEOUT /T 3

gcloud beta emulators datastore env-init > %~dp0\datastoreVars.cmd && %~dp0\datastoreVars.cmd