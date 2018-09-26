# TapCap.Client.Api.StatusApi

All URIs are relative to *https://tapcap.thecoincore-212314.appspot.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**TapCapHistory**](StatusApi.md#tapcaphistory) | **POST** /tap/status/history | TapCap current status
[**TapCapStatus**](StatusApi.md#tapcapstatus) | **POST** /tap/status/summary | TapCap current status


<a name="tapcaphistory"></a>
# **TapCapHistory**
> TapCapHistoryResponseSigned TapCapHistory (TapCapHistoryRequestSigned request)

TapCap current status

User TapCap status

### Example
```csharp
using System;
using System.Diagnostics;
using TapCap.Client.Api;
using TapCap.Client.Client;
using TapCap.Client.Model;

namespace Example
{
    public class TapCapHistoryExample
    {
        public void main()
        {
            var apiInstance = new StatusApi();
            var request = new TapCapHistoryRequestSigned(); // TapCapHistoryRequestSigned | Purchase Request info

            try
            {
                // TapCap current status
                TapCapHistoryResponseSigned result = apiInstance.TapCapHistory(request);
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
 **request** | [**TapCapHistoryRequestSigned**](TapCapHistoryRequestSigned.md)| Purchase Request info | 

### Return type

[**TapCapHistoryResponseSigned**](TapCapHistoryResponseSigned.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

<a name="tapcapstatus"></a>
# **TapCapStatus**
> TapCapQueryResponse TapCapStatus (TapCapQueryRequestSigned request)

TapCap current status

User TapCap status

### Example
```csharp
using System;
using System.Diagnostics;
using TapCap.Client.Api;
using TapCap.Client.Client;
using TapCap.Client.Model;

namespace Example
{
    public class TapCapStatusExample
    {
        public void main()
        {
            var apiInstance = new StatusApi();
            var request = new TapCapQueryRequestSigned(); // TapCapQueryRequestSigned | TapCap status request

            try
            {
                // TapCap current status
                TapCapQueryResponse result = apiInstance.TapCapStatus(request);
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
 **request** | [**TapCapQueryRequestSigned**](TapCapQueryRequestSigned.md)| TapCap status request | 

### Return type

[**TapCapQueryResponse**](TapCapQueryResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

