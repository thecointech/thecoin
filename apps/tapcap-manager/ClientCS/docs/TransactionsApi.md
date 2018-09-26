# TapCap.Client.Api.TransactionsApi

All URIs are relative to *https://tapcap.thecoincore-212314.appspot.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**TapCapBroker**](TransactionsApi.md#tapcapbroker) | **POST** /tap/broker | Broker: Register new TapCap transaction
[**TapCapClient**](TransactionsApi.md#tapcapclient) | **POST** /tap/client | Client: Confirm new TapCap transaction


<a name="tapcapbroker"></a>
# **TapCapBroker**
> InlineResponse200 TapCapBroker (TapCapPurchaseBrokerSigned request)

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
            var request = new TapCapPurchaseBrokerSigned(); // TapCapPurchaseBrokerSigned | TapCap exchange request

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
 **request** | [**TapCapPurchaseBrokerSigned**](TapCapPurchaseBrokerSigned.md)| TapCap exchange request | 

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
> TapCapPurchaseFinalSigned TapCapClient (TapCapTokenSigned request)

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
            var request = new TapCapTokenSigned(); // TapCapTokenSigned | TapCap status request

            try
            {
                // Client: Confirm new TapCap transaction
                TapCapPurchaseFinalSigned result = apiInstance.TapCapClient(request);
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
 **request** | [**TapCapTokenSigned**](TapCapTokenSigned.md)| TapCap status request | 

### Return type

[**TapCapPurchaseFinalSigned**](TapCapPurchaseFinalSigned.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

