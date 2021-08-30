# TapCapSupplier.Client.Api.TransactionApi

All URIs are relative to *https://thecoincad.tplinkdns.com:9361*

Method | HTTP request | Description
------------- | ------------- | -------------
[**ContestTapCap**](TransactionApi.md#contesttapcap) | **POST** /contest | Notify of a contested transaction
[**GetStatic**](TransactionApi.md#getstatic) | **POST** /static | Get the list of static responses to cache for terminal queries
[**GetStaticSingle**](TransactionApi.md#getstaticsingle) | **POST** /static/single | Query the server for a single message if it is unknown
[**RequestTapCap**](TransactionApi.md#requesttapcap) | **POST** /tap | Request TapCap transaction


<a name="contesttapcap"></a>
# **ContestTapCap**
> ContestResponse ContestTapCap (SignedTapcapContest signedTapcapContest)

Notify of a contested transaction

Notify supplier that the client will contest the passed transaction.  This is not necessary, a supplier should auotomatically undo any incompelete transactions, but it is a courtesy to the supplier

### Example
```csharp
using System;
using System.Diagnostics;
using TapCapSupplier.Client.Api;
using TapCapSupplier.Client.Client;
using TapCapSupplier.Client.Model;

namespace Example
{
    public class ContestTapCapExample
    {
        public void main()
        {
            var apiInstance = new TransactionApi();
            var signedTapcapContest = new SignedTapcapContest(); // SignedTapcapContest | TapCap exchange request

            try
            {
                // Notify of a contested transaction
                ContestResponse result = apiInstance.ContestTapCap(signedTapcapContest);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling TransactionApi.ContestTapCap: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **signedTapcapContest** | [**SignedTapcapContest**](SignedTapcapContest.md)| TapCap exchange request | 

### Return type

[**ContestResponse**](ContestResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

<a name="getstatic"></a>
# **GetStatic**
> StaticResponses GetStatic (SignedMessage signedMessage)

Get the list of static responses to cache for terminal queries

### Example
```csharp
using System;
using System.Diagnostics;
using TapCapSupplier.Client.Api;
using TapCapSupplier.Client.Client;
using TapCapSupplier.Client.Model;

namespace Example
{
    public class GetStaticExample
    {
        public void main()
        {
            var apiInstance = new TransactionApi();
            var signedMessage = new SignedMessage(); // SignedMessage | Static data request

            try
            {
                // Get the list of static responses to cache for terminal queries
                StaticResponses result = apiInstance.GetStatic(signedMessage);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling TransactionApi.GetStatic: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **signedMessage** | [**SignedMessage**](SignedMessage.md)| Static data request | 

### Return type

[**StaticResponses**](StaticResponses.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

<a name="getstaticsingle"></a>
# **GetStaticSingle**
> StaticResponse GetStaticSingle (QueryWithHistory queryWithHistory)

Query the server for a single message if it is unknown

### Example
```csharp
using System;
using System.Diagnostics;
using TapCapSupplier.Client.Api;
using TapCapSupplier.Client.Client;
using TapCapSupplier.Client.Model;

namespace Example
{
    public class GetStaticSingleExample
    {
        public void main()
        {
            var apiInstance = new TransactionApi();
            var queryWithHistory = new QueryWithHistory(); // QueryWithHistory | Static data request

            try
            {
                // Query the server for a single message if it is unknown
                StaticResponse result = apiInstance.GetStaticSingle(queryWithHistory);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling TransactionApi.GetStaticSingle: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **queryWithHistory** | [**QueryWithHistory**](QueryWithHistory.md)| Static data request | 

### Return type

[**StaticResponse**](StaticResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

<a name="requesttapcap"></a>
# **RequestTapCap**
> SignedMessage RequestTapCap (SignedMessage signedMessage)

Request TapCap transaction

This is sent in response to a terminal request.  The supplier is expected to return a valid certificate to pass to the terminal

### Example
```csharp
using System;
using System.Diagnostics;
using TapCapSupplier.Client.Api;
using TapCapSupplier.Client.Client;
using TapCapSupplier.Client.Model;

namespace Example
{
    public class RequestTapCapExample
    {
        public void main()
        {
            var apiInstance = new TransactionApi();
            var signedMessage = new SignedMessage(); // SignedMessage | TapCap exchange request

            try
            {
                // Request TapCap transaction
                SignedMessage result = apiInstance.RequestTapCap(signedMessage);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling TransactionApi.RequestTapCap: " + e.Message );
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

[**SignedMessage**](SignedMessage.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
