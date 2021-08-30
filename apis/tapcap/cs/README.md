# TapCapManager.Client - the C# library for the The TapCap Manager

The TapCap resolution.  This service is the trusted 3rd party that weekly settles TapCap purchases

This C# SDK is automatically generated by the [OpenAPI Generator](https://openapi-generator.tech) project:

- API version: 0.0.1
- SDK version: 1.0.0
- Build package: org.openapitools.codegen.languages.CSharpClientCodegen

<a name="frameworks-supported"></a>
## Frameworks supported
- .NET Core >=1.0
- .NET Framework >=4.6
- Mono/Xamarin >=vNext
- UWP >=10.0

<a name="dependencies"></a>
## Dependencies
- FubarCoder.RestSharp.Portable.Core >=4.0.7
- FubarCoder.RestSharp.Portable.HttpClient >=4.0.7
- Newtonsoft.Json >=10.0.3

<a name="installation"></a>
## Installation
Generate the DLL using your preferred tool

Then include the DLL (under the `bin` folder) in the C# project, and use the namespaces:
```csharp
using TapCapManager.Client.Api;
using TapCapManager.Client.Client;
using TapCapManager.Client.Model;
```
<a name="getting-started"></a>
## Getting Started

```csharp
using System;
using System.Diagnostics;
using TapCapManager.Client.Api;
using TapCapManager.Client.Client;
using TapCapManager.Client.Model;

namespace Example
{
    public class Example
    {
        public void main()
        {

            var apiInstance = new StatusApi();
            var signedMessage = new SignedMessage(); // SignedMessage | Purchase Request info

            try
            {
                // TapCap history
                TapCapHistoryResponse result = apiInstance.TapCapHistory(signedMessage);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling StatusApi.TapCapHistory: " + e.Message );
            }

        }
    }
}
```

<a name="documentation-for-api-endpoints"></a>
## Documentation for API Endpoints

All URIs are relative to *https://tapcap-dot-thecoincore-212314.appspot.com*

Class | Method | HTTP request | Description
------------ | ------------- | ------------- | -------------
*StatusApi* | [**TapCapHistory**](docs/StatusApi.md#tapcaphistory) | **POST** /status/history | TapCap history
*StatusApi* | [**TapCapStatus**](docs/StatusApi.md#tapcapstatus) | **POST** /status/summary | TapCap current status
*TransactionsApi* | [**DeleteBroker**](docs/TransactionsApi.md#deletebroker) | **DELETE** /tap/broker | Broker: Notify of an incomplete or failed transaction
*TransactionsApi* | [**TapCapBroker**](docs/TransactionsApi.md#tapcapbroker) | **POST** /tap/broker | Broker: Register new TapCap transaction
*TransactionsApi* | [**TapCapClient**](docs/TransactionsApi.md#tapcapclient) | **POST** /tap/client | Client: Confirm new TapCap transaction


<a name="documentation-for-models"></a>
## Documentation for Models

 - [Model.ErrorMessage](docs/ErrorMessage.md)
 - [Model.FXRate](docs/FXRate.md)
 - [Model.SignedMessage](docs/SignedMessage.md)
 - [Model.TapCapBrokerComplete](docs/TapCapBrokerComplete.md)
 - [Model.TapCapBrokerPurchase](docs/TapCapBrokerPurchase.md)
 - [Model.TapCapClientRequest](docs/TapCapClientRequest.md)
 - [Model.TapCapCompletedTransaction](docs/TapCapCompletedTransaction.md)
 - [Model.TapCapHistoryRequest](docs/TapCapHistoryRequest.md)
 - [Model.TapCapHistoryResponse](docs/TapCapHistoryResponse.md)
 - [Model.TapCapQueryRequest](docs/TapCapQueryRequest.md)
 - [Model.TapCapQueryResponse](docs/TapCapQueryResponse.md)
 - [Model.TapCapToken](docs/TapCapToken.md)
 - [Model.TapCapUnCompleted](docs/TapCapUnCompleted.md)


<a name="documentation-for-authorization"></a>
## Documentation for Authorization

All endpoints do not require authorization.