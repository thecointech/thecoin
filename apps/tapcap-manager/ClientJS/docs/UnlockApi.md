# TapcapManager.UnlockApi

All URIs are relative to *https://tapcap-dot-thecoincore-212314.appspot.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**unlock**](UnlockApi.md#unlock) | **POST** /unlock | 


<a name="unlock"></a>
# **unlock**
> ErrorMessage unlock(xRequestKey)



### Example
```javascript
import TapcapManager from 'tapcap-manager';

let apiInstance = new TapcapManager.UnlockApi();
let xRequestKey = "xRequestKey_example"; // String | 
apiInstance.unlock(xRequestKey).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xRequestKey** | **String**|  | 

### Return type

[**ErrorMessage**](ErrorMessage.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

