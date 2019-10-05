@echo off
setlocal
cd the-utilities\ts

echo Building Package
call npm run build
IF %ERRORLEVEL% NEQ 0 (
	echo !
	echo !build failed!
	echo !
	TIMEOUT /T 5
	exit /B 1
)
call npm version patch
call npm publish

cd ..\..
call npm install @the-coin/utilities

cd broker-cad\Service
call npm install @the-coin/utilities

echo Complete
TIMEOUT /T 5


endlocal