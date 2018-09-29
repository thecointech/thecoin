# TheBrokerCad.PurchaseApi

All URIs are relative to *http://localhost:8080*

Method | HTTP request | Description
------------- | ------------- | -------------
[**completeCoinPurchase**](PurchaseApi.md#completeCoinPurchase) | **POST** /exchange/buy/{user}/{id}/complete | Mark buy order complete
[**confirmCoinPurchase**](PurchaseApi.md#confirmCoinPurchase) | **POST** /exchange/buy/{user}/{id}/confirm | Confirm order opened
[**queryCoinPurchase**](PurchaseApi.md#queryCoinPurchase) | **GET** /exchange/buy/{user}/{id} | Query open buy orders
[**queryCoinPurchasesIds**](PurchaseApi.md#queryCoinPurchasesIds) | **GET** /exchange/buy/ | Query buy order id&#39;s
[**requestCoinPurchase**](PurchaseApi.md#requestCoinPurchase) | **POST** /exchange/buy/initiate | Request to buy Coin


<a name="completeCoinPurchase"></a>
# **completeCoinPurchase**
> PurchaseResponse completeCoinPurchase(user, id, signedMessage)

Mark buy order complete

Called by the broker to confirm CAD was deposited and coin disbursed

### Example
```javascript
import TheBrokerCad from 'the-broker-cad';

let apiInstance = new TheBrokerCad.PurchaseApi();
let user = "user_example"; // String | User address
let id = 56; // Number | Id of purchase order to complete
let signedMessage = new TheBrokerCad.SignedMessage(); // SignedMessage | Signed PurchaseComplete
apiInstance.completeCoinPurchase(user, id, signedMessage).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **user** | **String**| User address | 
 **id** | **Number**| Id of purchase order to complete | 
 **signedMessage** | [**SignedMessage**](SignedMessage.md)| Signed PurchaseComplete | 

### Return type

[**PurchaseResponse**](PurchaseResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="confirmCoinPurchase"></a>
# **confirmCoinPurchase**
> PurchaseResponse confirmCoinPurchase(user, id, signedPurchaseConfirm)

Confirm order opened

Called by the Broker once e-transfer initiated

### Example
```javascript
import TheBrokerCad from 'the-broker-cad';

let apiInstance = new TheBrokerCad.PurchaseApi();
let user = "user_example"; // String | User address
let id = 56; // Number | Id of purchase order to return
let signedPurchaseConfirm = new TheBrokerCad.SignedPurchaseConfirm(); // SignedPurchaseConfirm | Signed buy order confirm
apiInstance.confirmCoinPurchase(user, id, signedPurchaseConfirm).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **user** | **String**| User address | 
 **id** | **Number**| Id of purchase order to return | 
 **signedPurchaseConfirm** | [**SignedPurchaseConfirm**](SignedPurchaseConfirm.md)| Signed buy order confirm | 

### Return type

[**PurchaseResponse**](PurchaseResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="queryCoinPurchase"></a>
# **queryCoinPurchase**
> PurchaseState queryCoinPurchase(user, id, opts)

Query open buy orders

Called by the broker to retrieve all open buy orders.

### Example
```javascript
import TheBrokerCad from 'the-broker-cad';

let apiInstance = new TheBrokerCad.PurchaseApi();
let user = "user_example"; // String | User address
let id = 56; // Number | Id of purchase order to return
let opts = {
  'state': "state_example" // String | Numerical state identifier.  If not present, all states will be returned
};
apiInstance.queryCoinPurchase(user, id, opts).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **user** | **String**| User address | 
 **id** | **Number**| Id of purchase order to return | 
 **state** | **String**| Numerical state identifier.  If not present, all states will be returned | [optional] 

### Return type

[**PurchaseState**](PurchaseState.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="queryCoinPurchasesIds"></a>
# **queryCoinPurchasesIds**
> PurchaseIds queryCoinPurchasesIds(state)

Query buy order id&#39;s

Called by the broker to retrieve all buy orders ID&#39;s in the passed state.

### Example
```javascript
import TheBrokerCad from 'the-broker-cad';

let apiInstance = new TheBrokerCad.PurchaseApi();
let state = 3.4; // Number | Numerical state identifier.  Returned array will be all of type state
apiInstance.queryCoinPurchasesIds(state).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **state** | **Number**| Numerical state identifier.  Returned array will be all of type state | 

### Return type

[**PurchaseIds**](PurchaseIds.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="requestCoinPurchase"></a>
# **requestCoinPurchase**
> PurchaseResponse requestCoinPurchase(signedPurchaseRequest)

Request to buy Coin

Called by the client to exchange CAD for coin

### Example
```javascript
import TheBrokerCad from 'the-broker-cad';

let apiInstance = new TheBrokerCad.PurchaseApi();
let signedPurchaseRequest = new TheBrokerCad.SignedPurchaseRequest(); // SignedPurchaseRequest | Signed buy order request
apiInstance.requestCoinPurchase(signedPurchaseRequest).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **signedPurchaseRequest** | [**SignedPurchaseRequest**](SignedPurchaseRequest.md)| Signed buy order request | 

### Return type

[**PurchaseResponse**](PurchaseResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

