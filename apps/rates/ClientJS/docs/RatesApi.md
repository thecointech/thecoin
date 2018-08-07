# TheCoinCore.RatesApi

All URIs are relative to *https://thecoincore-212314.appspot.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getConversion**](RatesApi.md#getConversion) | **GET** /rates/{currencyCode} | Exchange Rate


<a name="getConversion"></a>
# **getConversion**
> FXRate getConversion(currencyCode, timestamp)

Exchange Rate

Query exchange rate for THE into the given currency

### Example
```javascript
var TheCoinCore = require('the_coin_core');

var apiInstance = new TheCoinCore.RatesApi();

var currencyCode = 56; // Number | The integer code for the countries currency

var timestamp = 56; // Number | The timestamp we are requesting valid values for

apiInstance.getConversion(currencyCode, timestamp).then(function(data) {
  console.log('API called successfully. Returned data: ' + data);
}, function(error) {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **currencyCode** | **Number**| The integer code for the countries currency | 
 **timestamp** | **Number**| The timestamp we are requesting valid values for | 

### Return type

[**FXRate**](FXRate.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

