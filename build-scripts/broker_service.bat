
@echo off

setlocal

del broker-cad\Service\Generated /Q /S
del broker-cad\Service\src\controllers /Q

java -jar .\swagger-codegen-cli.jar generate 	-i broker-cad\broker-cad.yaml -l nodejs-server 		-o broker-cad\Service\Generated

robocopy broker-cad\Service\Generated\controllers broker-cad\Service\src\controllers *.* /XF *Service.js
copy broker-cad\Service\Generated\api broker-cad\Service\src\api /Y
cd broker-cad\Service && call npm run build

IF %ERRORLEVEL% NEQ 0 (
	echo !
	echo !build failed!
	echo !
	TIMEOUT /T 5
	exit /B 1
)

endlocal