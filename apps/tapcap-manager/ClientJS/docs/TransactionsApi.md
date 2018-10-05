# TapcapManager.TransactionsApi

All URIs are relative to *http://localhost:8080*

Method | HTTP request | Description
------------- | ------------- | -------------
[**tapCapBroker**](TransactionsApi.md#tapCapBroker) | **POST** /tap/broker | Broker: Register new TapCap transaction
[**tapCapClient**](TransactionsApi.md#tapCapClient) | **POST** /tap/client | Client: Confirm new TapCap transaction


<a name="tapCapBroker"></a>
# **tapCapBroker**
> Object tapCapBroker(messageSigned)

Broker: Register new TapCap transaction

### Example
```javascript
import TapcapManager from 'tapcap-manager';

let apiInstance = new TapcapManager.TransactionsApi();
let messageSigned = new TapcapManager.MessageSigned(); // MessageSigned | TapCap exchange request
apiInstance.tapCapBroker(messageSigned).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **messageSigned** | [**MessageSigned**](MessageSigned.md)| TapCap exchange request | 

### Return type

**Object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="tapCapClient"></a>
# **tapCapClient**
> MessageSigned tapCapClient(messageSigned)

Client: Confirm new TapCap transaction

### Example
```javascript
import TapcapManager from 'tapcap-manager';

let apiInstance = new TapcapManager.TransactionsApi();
let messageSigned = new TapcapManager.MessageSigned(); // MessageSigned | TapCap status request
apiInstance.tapCapClient(messageSigned).then((data) => {
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

[**MessageSigned**](MessageSigned.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

