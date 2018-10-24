
REM For now, we are going to stick with ASP as whydafuqnot?
REM java -jar .\APIs\swagger-codegen-cli.jar generate -i APIs\TheCoinCore.yaml -l nodejs-server -o ./CoreServer
REM java -jar .\APIs\swagger-codegen-cli.jar generate -i APIs\TheCoinCore.yaml -l go-server -o ./CoreServerGo

REM mkdir .\CoreServer\service\
REM move .\CoreServer\controllers\DefaultService.js .\CoreServer\service\

REM cd .\CoreServer
REM npm start

REM 
REM NOTE: We are forced to use the older version of swagger-codegemn
set JAVA_OPTS=-Dfile.encoding=UTF-8
java -jar .\swagger-codegen-cli.jar generate 	-i the-pricing\the-pricing.yaml -l nodejs-server 	-o the-pricing\Service
java -jar .\openapi-generator-cli.jar generate 	-i the-pricing\the-pricing.yaml -g javascript 		-o the-pricing\ClientJS -c the-pricing\client-js-spec.json 
java -jar .\openapi-generator-cli.jar generate 	-i the-pricing\the-pricing.yaml -g csharp 			-o the-pricing\ClientCS -c the-pricing\client-cs-spec.json 

java -jar .\swagger-codegen-cli.jar generate 	-i tapcap-manager\tapcap-manager.yaml -o tapcap-manager\Service  -l nodejs-server 
java -jar .\openapi-generator-cli.jar generate 	-i tapcap-manager\tapcap-manager.yaml -o tapcap-manager\ClientCS -g csharp 		-c tapcap-manager\client-cs-spec.json
java -jar .\openapi-generator-cli.jar generate 	-i tapcap-manager\tapcap-manager.yaml -o tapcap-manager\ClientJS -g javascript 	-c tapcap-manager\client-js-spec.json

java -jar .\swagger-codegen-cli.jar generate 	-i broker-cad\broker-cad.yaml -l nodejs-server 	-o broker-cad\Service
java -jar .\openapi-generator-cli.jar generate 	-i broker-cad\broker-cad.yaml -l javascript 	-o broker-cad\ClientJS -c broker-cad\client-js-spec.json 

java -jar .\openapi-generator-cli.jar generate 		 -i tapcap-supplier\tapcap-supplier.yaml -o tapcap-supplier\ClientCS -g csharp 	 	-c tapcap-supplier\client-cs-spec.json
java -jar .\openapi-generator-cli.jar generate 		 -i tapcap-supplier\tapcap-supplier.yaml -o tapcap-supplier\Server 	 -g aspnetcore 	-c tapcap-supplier\server-cs-spec.json

REM java -jar .\swagger-codegen-cli.jar generate -i TapCapManager\TapCapManager.yaml -l aspnetcore -c TheCoinBrokerServerSpec.json -o TheCoinBroker\ClientASP
REM java -jar .\APIs\swagger-codegen-cli.jar generate -i APIs\TheCoinBroker.yaml -l javascript -c APIs\TheCoinBrokerClientSpec.json -o TheCoinBroker/Client
REM java -jar .\APIs\openapi-generator-cli-3.0.0.jar generate -i APIs\e-Transfer_Public_API_selfreg_v2.0.yaml -l csharp -c APIs\InteracClientSpec.json -o InteracClient

REM dotnet run -p CoreServerASP\src\IO.Swagger\IO.Swagger.csproj --launch-profile web
