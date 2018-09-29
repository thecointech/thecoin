# TheBrokerCad.ExchangeApi

All URIs are relative to *http://localhost:8080*

Method | HTTP request | Description
------------- | ------------- | -------------
[**completeCoinPurchase**](ExchangeApi.md#completeCoinPurchase) | **POST** /exchange/buy/complete | Mark buy order complete
[**completeCoinSale**](ExchangeApi.md#completeCoinSale) | **POST** /exchange/sell/complete | Mark coin sale complete
[**confirmCoinPurchase**](ExchangeApi.md#confirmCoinPurchase) | **POST** /exchange/buy/confirm | Confirm order opened
[**queryCoinPurchases**](ExchangeApi.md#queryCoinPurchases) | **GET** /exchange/buy/ | Query open buy orders
[**requestCoinPurchase**](ExchangeApi.md#requestCoinPurchase) | **POST** /exchange/buy/initiate | Request to buy Coin
[**requestCoinSale**](ExchangeApi.md#requestCoinSale) | **POST** /exchange/sell/initiate | Request coin sale


<a name="completeCoinPurchase"></a>
# **completeCoinPurchase**
> PurchaseResponse completeCoinPurchase(signedMessage)

Mark buy order complete

Called by the broker to confirm CAD was deposited and coin disbursed

### Example
```javascript
import TheBrokerCad from 'the-broker-cad';

let apiInstance = new TheBrokerCad.ExchangeApi();
let signedMessage = new TheBrokerCad.SignedMessage(); // SignedMessage | Signed PurchaseComplete
apiInstance.completeCoinPurchase(signedMessage).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **signedMessage** | [**SignedMessage**](SignedMessage.md)| Signed PurchaseComplete | 

### Return type

[**PurchaseResponse**](PurchaseResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="completeCoinSale"></a>
# **completeCoinSale**
> SellResponse completeCoinSale(signedMessage)

Mark coin sale complete

Called by the client to exchange coin for CAD

### Example
```javascript
import TheBrokerCad from 'the-broker-cad';

let apiInstance = new TheBrokerCad.ExchangeApi();
let signedMessage = new TheBrokerCad.SignedMessage(); // SignedMessage | Signed sell order request
apiInstance.completeCoinSale(signedMessage).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **signedMessage** | [**SignedMessage**](SignedMessage.md)| Signed sell order request | 

### Return type

[**SellResponse**](SellResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="confirmCoinPurchase"></a>
# **confirmCoinPurchase**
> PurchaseResponse confirmCoinPurchase(signedPurchaseConfirm)

Confirm order opened

Called by the Broker once e-transfer initiated

### Example
```javascript
import TheBrokerCad from 'the-broker-cad';

let apiInstance = new TheBrokerCad.ExchangeApi();
let signedPurchaseConfirm = new TheBrokerCad.SignedPurchaseConfirm(); // SignedPurchaseConfirm | Signed buy order confirm
apiInstance.confirmCoinPurchase(signedPurchaseConfirm).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **signedPurchaseConfirm** | [**SignedPurchaseConfirm**](SignedPurchaseConfirm.md)| Signed buy order confirm | 

### Return type

[**PurchaseResponse**](PurchaseResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="queryCoinPurchases"></a>
# **queryCoinPurchases**
> OpenPurchases queryCoinPurchases()

Query open buy orders

Called by the broker to retrieve all open buy orders.

### Example
```javascript
import TheBrokerCad from 'the-broker-cad';

let apiInstance = new TheBrokerCad.ExchangeApi();
apiInstance.queryCoinPurchases().then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters
This endpoint does not need any parameter.

### Return type

[**OpenPurchases**](OpenPurchases.md)

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

let apiInstance = new TheBrokerCad.ExchangeApi();
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

<a name="requestCoinSale"></a>
# **requestCoinSale**
> SellResponse requestCoinSale(signedMessage)

Request coin sale

Called by the client to exchange coin for CAD

### Example
```javascript
import TheBrokerCad from 'the-broker-cad';

let apiInstance = new TheBrokerCad.ExchangeApi();
let signedMessage = new TheBrokerCad.SignedMessage(); // SignedMessage | Signed sell order request
apiInstance.requestCoinSale(signedMessage).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **signedMessage** | [**SignedMessage**](SignedMessage.md)| Signed sell order request | 

### Return type

[**SellResponse**](SellResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

