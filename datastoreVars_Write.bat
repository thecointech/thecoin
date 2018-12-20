@echo off

setlocal enableextensions enabledelayedexpansion

set dsfile=%~dp0datastoreVars
del %dsfile%.env 2>nul

for /f "delims=" %%f in ('gcloud beta emulators datastore env-init') do (
	set a=%%f
	echo !a:~4!>>%dsfile%.env
)
