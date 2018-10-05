# TapcapManager.StatusApi

All URIs are relative to *http://localhost:8080*

Method | HTTP request | Description
------------- | ------------- | -------------
[**tapCapHistory**](StatusApi.md#tapCapHistory) | **POST** /status/history | TapCap history
[**tapCapStatus**](StatusApi.md#tapCapStatus) | **POST** /status/summary | TapCap current status


<a name="tapCapHistory"></a>
# **tapCapHistory**
> TapCapHistoryResponse tapCapHistory(messageSigned)

TapCap history

User TapCap history in the ranges provided

### Example
```javascript
import TapcapManager from 'tapcap-manager';

let apiInstance = new TapcapManager.StatusApi();
let messageSigned = new TapcapManager.MessageSigned(); // MessageSigned | Purchase Request info
apiInstance.tapCapHistory(messageSigned).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **messageSigned** | [**MessageSigned**](MessageSigned.md)| Purchase Request info | 

### Return type

[**TapCapHistoryResponse**](TapCapHistoryResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="tapCapStatus"></a>
# **tapCapStatus**
> TapCapQueryResponse tapCapStatus(messageSigned)

TapCap current status

User TapCap status

### Example
```javascript
import TapcapManager from 'tapcap-manager';

let apiInstance = new TapcapManager.StatusApi();
let messageSigned = new TapcapManager.MessageSigned(); // MessageSigned | TapCap status request
apiInstance.tapCapStatus(messageSigned).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **messageSigned** | [**MessageSigned**](MessageSigned.md)| TapCap status request | 

### Return type

[**TapCapQueryResponse**](TapCapQueryResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

