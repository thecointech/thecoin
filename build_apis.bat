
REM For now, we are going to stick with ASP as whydafuqnot?
REM java -jar .\APIs\swagger-codegen-cli.jar generate -i APIs\TheCoinCore.yaml -l nodejs-server -o ./CoreServer
REM java -jar .\APIs\swagger-codegen-cli.jar generate -i APIs\TheCoinCore.yaml -l go-server -o ./CoreServerGo

REM mkdir .\CoreServer\service\
REM move .\CoreServer\controllers\DefaultService.js .\CoreServer\service\

REM cd .\CoreServer
REM npm start

set JAVA_OPTS=-Dfile.encoding=UTF-8
java -jar .\swagger-codegen-cli.jar generate 		 -i TheCoinCore\TheCoinCore.yaml -l nodejs-server -o TheCoinCore\Service
java -jar .\openapi-generator-cli-3.2.3.jar generate -i TheCoinCore\TheCoinCore.yaml -l javascript -o TheCoinCore\ClientJS -c TheCoinCore\client-js-spec.json 
java -jar .\swagger-codegen-cli.jar generate 		 -i TheCoinCore\TheCoinCore.yaml -l csharp -o TheCoinCore\ClientCS -c TheCoinCore\client-cs-spec.json 

java -jar .\swagger-codegen-cli.jar generate 		 -i tapcap-manager\TapCapManager.yaml -o tapcap-manager\Service  -l nodejs-server 
java -jar .\swagger-codegen-cli.jar generate 		 -i tapcap-manager\TapCapManager.yaml -o tapcap-manager\ClientCS -l csharp 		-c tapcap-manager\client-cs-spec.json 

java -jar .\openapi-generator-cli.jar generate -i tapcap-manager\TapCapManager.yaml -o tapcap-manager\Service  -l nodejs-server
java -jar .\openapi-generator-cli-3.2.3.jar generate -i tapcap-manager\TapCapManager.yaml -o tapcap-manager\ClientJS -l javascript -c tapcap-manager\client-js-spec.json 

java -jar .\swagger-codegen-cli.jar generate -i BrokerCAD\BrokerCAD.yaml -l nodejs-server -o BrokerCAD\Service
java -jar .\openapi-generator-cli-3.2.3.jar generate -i BrokerCAD\BrokerCAD.yaml -l javascript -o BrokerCAD\ClientJS -c BrokerCAD\ClientSpec.json 

REM java -jar .\swagger-codegen-cli.jar generate -i TapCapManager\TapCapManager.yaml -l aspnetcore -c TheCoinBrokerServerSpec.json -o TheCoinBroker\ClientASP
REM java -jar .\APIs\swagger-codegen-cli.jar generate -i APIs\TheCoinBroker.yaml -l javascript -c APIs\TheCoinBrokerClientSpec.json -o TheCoinBroker/Client
REM java -jar .\APIs\openapi-generator-cli-3.0.0.jar generate -i APIs\e-Transfer_Public_API_selfreg_v2.0.yaml -l csharp -c APIs\InteracClientSpec.json -o InteracClient

REM dotnet run -p CoreServerASP\src\IO.Swagger\IO.Swagger.csproj --launch-profile web
