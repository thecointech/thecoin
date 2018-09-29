# TheBrokerCad.SellApi

All URIs are relative to *http://localhost:8080*

Method | HTTP request | Description
------------- | ------------- | -------------
[**completeCoinSale**](SellApi.md#completeCoinSale) | **POST** /exchange/sell/{user}/{id}/complete | Mark coin sale complete
[**requestCoinSale**](SellApi.md#requestCoinSale) | **POST** /exchange/sell/initiate | Request coin sale


<a name="completeCoinSale"></a>
# **completeCoinSale**
> SellResponse completeCoinSale(user, id, signedMessage)

Mark coin sale complete

Called by the client to exchange coin for CAD

### Example
```javascript
import TheBrokerCad from 'the-broker-cad';

let apiInstance = new TheBrokerCad.SellApi();
let user = "user_example"; // String | User address
let id = 56; // Number | Id of purchase order to return
let signedMessage = new TheBrokerCad.SignedMessage(); // SignedMessage | Signed sell order request
apiInstance.completeCoinSale(user, id, signedMessage).then((data) => {
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
 **signedMessage** | [**SignedMessage**](SignedMessage.md)| Signed sell order request | 

### Return type

[**SellResponse**](SellResponse.md)

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

let apiInstance = new TheBrokerCad.SellApi();
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

