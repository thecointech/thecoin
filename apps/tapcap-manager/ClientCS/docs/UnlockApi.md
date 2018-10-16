# TapCapManager.Client.Api.UnlockApi

All URIs are relative to *http://localhost:8091*

Method | HTTP request | Description
------------- | ------------- | -------------
[**Unlock**](UnlockApi.md#unlock) | **POST** /unlock | 


<a name="unlock"></a>
# **Unlock**
> ErrorMessage Unlock (string xRequestKey)



### Example
```csharp
using System;
using System.Diagnostics;
using TapCapManager.Client.Api;
using TapCapManager.Client.Client;
using TapCapManager.Client.Model;

namespace Example
{
    public class UnlockExample
    {
        public void main()
        {
            var apiInstance = new UnlockApi();
            var xRequestKey = xRequestKey_example;  // string | 

            try
            {
                ErrorMessage result = apiInstance.Unlock(xRequestKey);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling UnlockApi.Unlock: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xRequestKey** | **string**|  | 

### Return type

[**ErrorMessage**](ErrorMessage.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

