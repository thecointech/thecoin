# TapcapManager.TransactionsApi

All URIs are relative to *http://localhost:8091*

Method | HTTP request | Description
------------- | ------------- | -------------
[**tapCapBroker**](TransactionsApi.md#tapCapBroker) | **POST** /tap/broker | Broker: Register new TapCap transaction
[**tapCapClient**](TransactionsApi.md#tapCapClient) | **POST** /tap/client | Client: Confirm new TapCap transaction


<a name="tapCapBroker"></a>
# **tapCapBroker**
> ErrorMessage tapCapBroker(signedMessage)

Broker: Register new TapCap transaction

### Example
```javascript
import TapcapManager from 'tapcap-manager';

let apiInstance = new TapcapManager.TransactionsApi();
let signedMessage = new TapcapManager.SignedMessage(); // SignedMessage | TapCap exchange request
apiInstance.tapCapBroker(signedMessage).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

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

<a name="tapCapClient"></a>
# **tapCapClient**
> SignedMessage tapCapClient(signedMessage)

Client: Confirm new TapCap transaction

### Example
```javascript
import TapcapManager from 'tapcap-manager';

let apiInstance = new TapcapManager.TransactionsApi();
let signedMessage = new TapcapManager.SignedMessage(); // SignedMessage | TapCap status request
apiInstance.tapCapClient(signedMessage).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **signedMessage** | [**SignedMessage**](SignedMessage.md)| TapCap status request | 

### Return type

[**SignedMessage**](SignedMessage.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

