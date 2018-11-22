# @TheCoinBrokerCad.TransferApi

All URIs are relative to *https://the-broker-cad.appspot.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**makeCertifiedTransfer**](TransferApi.md#makeCertifiedTransfer) | **POST** /certifiedTransfer | Request Transfer from-&gt;to


<a name="makeCertifiedTransfer"></a>
# **makeCertifiedTransfer**
> CertifiedTransferResponse makeCertifiedTransfer(certifiedTransferRequest)

Request Transfer from-&gt;to

A client may request that the Broker initiate a transfer from their account to another.  The transfer includes a fee paid to the broker to cover the cost of the transfer.  This allows a user to operate on the Ethereum blockchain without requiring their own ether

### Example
```javascript
import @TheCoinBrokerCad from '@the-coin/broker-cad';

let apiInstance = new @TheCoinBrokerCad.TransferApi();
let certifiedTransferRequest = new @TheCoinBrokerCad.CertifiedTransferRequest(); // CertifiedTransferRequest | A request appropriately filled out and signed as described in the comments
apiInstance.makeCertifiedTransfer(certifiedTransferRequest).then((data) => {
  console.log('API called successfully. Returned data: ' + data);
}, (error) => {
  console.error(error);
});

```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **certifiedTransferRequest** | [**CertifiedTransferRequest**](CertifiedTransferRequest.md)| A request appropriately filled out and signed as described in the comments | 

### Return type

[**CertifiedTransferResponse**](CertifiedTransferResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

