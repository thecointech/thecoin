# TapCapManager.Client.Api.StatusApi

All URIs are relative to *http://localhost:8091*

Method | HTTP request | Description
------------- | ------------- | -------------
[**TapCapHistory**](StatusApi.md#tapcaphistory) | **POST** /status/history | TapCap history
[**TapCapStatus**](StatusApi.md#tapcapstatus) | **POST** /status/summary | TapCap current status


<a name="tapcaphistory"></a>
# **TapCapHistory**
> TapCapHistoryResponse TapCapHistory (SignedMessage signedMessage)

TapCap history

User TapCap history in the ranges provided

### Example
```csharp
using System;
using System.Diagnostics;
using TapCapManager.Client.Api;
using TapCapManager.Client.Client;
using TapCapManager.Client.Model;

namespace Example
{
    public class TapCapHistoryExample
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

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **signedMessage** | [**SignedMessage**](SignedMessage.md)| Purchase Request info | 

### Return type

[**TapCapHistoryResponse**](TapCapHistoryResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

<a name="tapcapstatus"></a>
# **TapCapStatus**
> TapCapQueryResponse TapCapStatus (SignedMessage signedMessage)

TapCap current status

User TapCap status

### Example
```csharp
using System;
using System.Diagnostics;
using TapCapManager.Client.Api;
using TapCapManager.Client.Client;
using TapCapManager.Client.Model;

namespace Example
{
    public class TapCapStatusExample
    {
        public void main()
        {
            var apiInstance = new StatusApi();
            var signedMessage = new SignedMessage(); // SignedMessage | TapCap status request

            try
            {
                // TapCap current status
                TapCapQueryResponse result = apiInstance.TapCapStatus(signedMessage);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling StatusApi.TapCapStatus: " + e.Message );
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

