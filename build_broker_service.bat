
@echo off

call build_types.bat

setlocal

java -jar .\swagger-codegen-cli.jar generate 	-i broker-cad\broker-cad.yaml -l nodejs-server 		-o broker-cad\Service\Generated
copy broker-cad\Service\Generated\api broker-cad\Service\src\api /Y
cd broker-cad\Service && call npm run build

endlocal
setlocal

java -jar .\openapi-generator-cli.jar generate 	-i broker-cad\broker-cad.yaml -g typescript-fetch 	-o broker-cad\ClientTS -c broker-cad\client-ts-spec.json 

cd broker-cad\ClientTS
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

cd ..\..\the-website-ts
call npm install @the-coin/broker-cad

echo Complete
TIMEOUT /T 5

endlocal