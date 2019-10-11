REM start gcloud beta emulators firestore start
REM cmd /c "C:\Users\kiwi_\AppData\Local\Google\Cloud SDK\google-cloud-sdk\platform\cloud-firestore-emulator\cloud_firestore_emulator.cmd" start --host=::1 --port=8377
call firebase emulators:start --only firestore
TIMEOUT /T 5

REM gcloud beta emulators firestore env-init > %~dp0\firestore_vars.cmd && %~dp0\firestore_vars.cmd