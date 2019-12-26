# @TheCoinBrokerCad.ReferrersApi

All URIs are relative to *https://the-broker-cad.appspot.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**referralCreate**](ReferrersApi.md#referralCreate) | **POST** /referrers | Register the referral of new account
[**referrerValid**](ReferrersApi.md#referrerValid) | **GET** /referrers | Gets the validity of the passed referrer


<a name="referralCreate"></a>
# **referralCreate**
> Boolean referralCreate(newAccountReferal)

Register the referral of new account

Returns a boolean indicating whether the passed referrer is valid

### Example
```javascript
import @TheCoinBrokerCad from '@the-coin/broker-cad';

let apiInstance = new @TheCoinBrokerCad.ReferrersApi();
let newAccountReferal = new @TheCoinBrokerCad.NewAccountReferal(); // NewAccountReferal | Set referal for new account
apiInstance.referralCreate(newAccountReferal).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **newAccountReferal** | [**NewAccountReferal**](NewAccountReferal.md)| Set referal for new account | 

### Return type

**Boolean**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="referrerValid"></a>
# **referrerValid**
> Boolean referrerValid(referrer)

Gets the validity of the passed referrer

Returns a boolean indicating whether the passed referrer is valid

### Example
```javascript
import @TheCoinBrokerCad from '@the-coin/broker-cad';

let apiInstance = new @TheCoinBrokerCad.ReferrersApi();
let referrer = "referrer_example"; // String | Referrers ID.  This ID must have been previously registered with the system
apiInstance.referrerValid(referrer).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **referrer** | **String**| Referrers ID.  This ID must have been previously registered with the system | 

### Return type

**Boolean**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

