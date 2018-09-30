# TheCoinCore.Api.RatesApi

All URIs are relative to *https://thecoincore-212314.appspot.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**GetConversion**](RatesApi.md#getconversion) | **GET** /rates/{currencyCode} | Exchange Rate


<a name="getconversion"></a>
# **GetConversion**
> FXRate GetConversion (int? currencyCode, double? timestamp)

Exchange Rate

Query exchange rate for THE into the given currency

### Example
```csharp
using System;
using System.Diagnostics;
using TheCoinCore.Api;
using TheCoinCore.Client;
using TheCoinCore.Model;

namespace Example
{
    public class GetConversionExample
    {
        public void main()
        {
            var apiInstance = new RatesApi();
            var currencyCode = 56;  // int? | The integer code for the countries currency
            var timestamp = 1.2;  // double? | The timestamp we are requesting valid values for

            try
            {
                // Exchange Rate
                FXRate result = apiInstance.GetConversion(currencyCode, timestamp);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling RatesApi.GetConversion: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **currencyCode** | **int?**| The integer code for the countries currency | 
 **timestamp** | **double?**| The timestamp we are requesting valid values for | 

### Return type

[**FXRate**](FXRate.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

