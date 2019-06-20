java -jar .\swagger-codegen-cli.jar generate 	-i broker-cad\broker-cad.yaml -l nodejs-server 		-o broker-cad\Service\Generated

copy broker-cad\Service\Generated\api broker-cad\Service\src\api /Y

cd broker-cad\Service && npm run build