# @TheCoinPricing.RatesApi

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
import @TheCoinPricing from '@the-coin/pricing';

let apiInstance = new @TheCoinPricing.RatesApi();
let currencyCode = 56; // Number | The integer code for the countries currency
let timestamp = 789; // Number | The timestamp we are requesting valid values for
apiInstance.getConversion(currencyCode, timestamp).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
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

 - **Content-Type**: Not defined
 - **Accept**: application/json

