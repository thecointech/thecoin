# @TheCoinTapcapManager.TransactionsApi

All URIs are relative to *https://tapcap-dot-thecoincore-212314.appspot.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**deleteBroker**](TransactionsApi.md#deleteBroker) | **DELETE** /tap/broker | Broker: Notify of an incomplete or failed transaction
[**tapCapBroker**](TransactionsApi.md#tapCapBroker) | **POST** /tap/broker | Broker: Register new TapCap transaction
[**tapCapClient**](TransactionsApi.md#tapCapClient) | **POST** /tap/client | Client: Confirm new TapCap transaction


<a name="deleteBroker"></a>
# **deleteBroker**
> ErrorMessage deleteBroker(tapCapUnCompleted)

Broker: Notify of an incomplete or failed transaction

### Example
```javascript
import @TheCoinTapcapManager from '@the-coin/tapcap-manager';

let apiInstance = new @TheCoinTapcapManager.TransactionsApi();
let tapCapUnCompleted = new @TheCoinTapcapManager.TapCapUnCompleted(); // TapCapUnCompleted | TapCap exchange request
apiInstance.deleteBroker(tapCapUnCompleted).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **tapCapUnCompleted** | [**TapCapUnCompleted**](TapCapUnCompleted.md)| TapCap exchange request | 

### Return type

[**ErrorMessage**](ErrorMessage.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="tapCapBroker"></a>
# **tapCapBroker**
> ErrorMessage tapCapBroker(signedMessage)

Broker: Register new TapCap transaction

### Example
```javascript
import @TheCoinTapcapManager from '@the-coin/tapcap-manager';

let apiInstance = new @TheCoinTapcapManager.TransactionsApi();
let signedMessage = new @TheCoinTapcapManager.SignedMessage(); // SignedMessage | TapCap exchange request
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
> TapCapQueryResponse tapCapClient(signedMessage)

Client: Confirm new TapCap transaction

### Example
```javascript
import @TheCoinTapcapManager from '@the-coin/tapcap-manager';

let apiInstance = new @TheCoinTapcapManager.TransactionsApi();
let signedMessage = new @TheCoinTapcapManager.SignedMessage(); // SignedMessage | TapCap status request
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

[**TapCapQueryResponse**](TapCapQueryResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

