# TapCap.Client.Api.TransactionsApi

All URIs are relative to *https://localhost:8080*

Method | HTTP request | Description
------------- | ------------- | -------------
[**TapCapBroker**](TransactionsApi.md#tapcapbroker) | **POST** /tap/broker | Broker: Register new TapCap transaction
[**TapCapClient**](TransactionsApi.md#tapcapclient) | **POST** /tap/client | Client: Confirm new TapCap transaction


<a name="tapcapbroker"></a>
# **TapCapBroker**
> InlineResponse200 TapCapBroker (SignedMessage request)

Broker: Register new TapCap transaction

### Example
```csharp
using System;
using System.Diagnostics;
using TapCap.Client.Api;
using TapCap.Client.Client;
using TapCap.Client.Model;

namespace Example
{
    public class TapCapBrokerExample
    {
        public void main()
        {
            var apiInstance = new TransactionsApi();
            var request = new SignedMessage(); // SignedMessage | TapCap exchange request

            try
            {
                // Broker: Register new TapCap transaction
                InlineResponse200 result = apiInstance.TapCapBroker(request);
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
 **request** | [**SignedMessage**](SignedMessage.md)| TapCap exchange request | 

### Return type

[**InlineResponse200**](InlineResponse200.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

<a name="tapcapclient"></a>
# **TapCapClient**
> SignedMessage TapCapClient (SignedMessage request)

Client: Confirm new TapCap transaction

### Example
```csharp
using System;
using System.Diagnostics;
using TapCap.Client.Api;
using TapCap.Client.Client;
using TapCap.Client.Model;

namespace Example
{
    public class TapCapClientExample
    {
        public void main()
        {
            var apiInstance = new TransactionsApi();
            var request = new SignedMessage(); // SignedMessage | TapCap status request

            try
            {
                // Client: Confirm new TapCap transaction
                SignedMessage result = apiInstance.TapCapClient(request);
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
 **request** | [**SignedMessage**](SignedMessage.md)| TapCap status request | 

### Return type

[**SignedMessage**](SignedMessage.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

