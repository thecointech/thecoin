# TapCapManager.Client.Api.TransactionsApi

All URIs are relative to *http://localhost:8091*

Method | HTTP request | Description
------------- | ------------- | -------------
[**TapCapBroker**](TransactionsApi.md#tapcapbroker) | **POST** /tap/broker | Broker: Register new TapCap transaction
[**TapCapClient**](TransactionsApi.md#tapcapclient) | **POST** /tap/client | Client: Confirm new TapCap transaction


<a name="tapcapbroker"></a>
# **TapCapBroker**
> ErrorMessage TapCapBroker (SignedMessage signedMessage)

Broker: Register new TapCap transaction

### Example
```csharp
using System;
using System.Diagnostics;
using TapCapManager.Client.Api;
using TapCapManager.Client.Client;
using TapCapManager.Client.Model;

namespace Example
{
    public class TapCapBrokerExample
    {
        public void main()
        {
            var apiInstance = new TransactionsApi();
            var signedMessage = new SignedMessage(); // SignedMessage | TapCap exchange request

            try
            {
                // Broker: Register new TapCap transaction
                ErrorMessage result = apiInstance.TapCapBroker(signedMessage);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling TransactionsApi.TapCapBroker: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **signedMessage** | [**SignedMessage**](SignedMessage.md)| TapCap exchange request | 

### Return type

[**ErrorMessage**](ErrorMessage.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

<a name="tapcapclient"></a>
# **TapCapClient**
> TapCapQueryResponse TapCapClient (SignedMessage signedMessage)

Client: Confirm new TapCap transaction

### Example
```csharp
using System;
using System.Diagnostics;
using TapCapManager.Client.Api;
using TapCapManager.Client.Client;
using TapCapManager.Client.Model;

namespace Example
{
    public class TapCapClientExample
    {
        public void main()
        {
            var apiInstance = new TransactionsApi();
            var signedMessage = new SignedMessage(); // SignedMessage | TapCap status request

            try
            {
                // Client: Confirm new TapCap transaction
                TapCapQueryResponse result = apiInstance.TapCapClient(signedMessage);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling TransactionsApi.TapCapClient: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **signedMessage** | [**SignedMessage**](SignedMessage.md)| TapCap status request | 

### Return type

[**TapCapQueryResponse**](TapCapQueryResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

