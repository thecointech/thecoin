# @TheCoinBrokerCad.StatusApi

All URIs are relative to *https://the-broker-cad.appspot.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**status**](StatusApi.md#status) | **GET** /status | Gets the operating status of the broker


<a name="status"></a>
# **status**
> BrokerStatus status()

Gets the operating status of the broker

Returns info like brokers address, available balance, etc (?)

### Example
```javascript
import @TheCoinBrokerCad from '@the-coin/broker-cad';

let apiInstance = new @TheCoinBrokerCad.StatusApi();
apiInstance.status().then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters
This endpoint does not need any parameter.

### Return type

[**BrokerStatus**](BrokerStatus.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

