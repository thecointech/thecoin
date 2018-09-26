/* 
 * TheCoin Broker
 *
 * TheCoin broker services.  To be implemented allowing exchange of local currency to THESE
 *
 * OpenAPI spec version: 0.0.1
 * Contact: stephen.taylor.dev@gmail.com
 * Generated by: https://github.com/swagger-api/swagger-codegen.git
 */

using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using RestSharp.Portable;
using TapCap.Client.Client;
using TapCap.Client.Model;

namespace TapCap.Client.Api
{
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public interface ITransactionsApi : IApiAccessor
    {
        #region Synchronous Operations
        /// <summary>
        /// Broker: Register new TapCap transaction
        /// </summary>
        /// <remarks>
        /// 
        /// </remarks>
        /// <exception cref="TapCap.Client.Client.ApiException">Thrown when fails to make API call</exception>
        /// <param name="request">TapCap exchange request</param>
        /// <returns>InlineResponse200</returns>
        InlineResponse200 TapCapBroker (TapCapPurchaseBrokerSigned request);

        /// <summary>
        /// Broker: Register new TapCap transaction
        /// </summary>
        /// <remarks>
        /// 
        /// </remarks>
        /// <exception cref="TapCap.Client.Client.ApiException">Thrown when fails to make API call</exception>
        /// <param name="request">TapCap exchange request</param>
        /// <returns>ApiResponse of InlineResponse200</returns>
        ApiResponse<InlineResponse200> TapCapBrokerWithHttpInfo (TapCapPurchaseBrokerSigned request);
        /// <summary>
        /// Client: Confirm new TapCap transaction
        /// </summary>
        /// <remarks>
        /// 
        /// </remarks>
        /// <exception cref="TapCap.Client.Client.ApiException">Thrown when fails to make API call</exception>
        /// <param name="request">TapCap status request</param>
        /// <returns>TapCapPurchaseFinalSigned</returns>
        TapCapPurchaseFinalSigned TapCapClient (TapCapTokenSigned request);

        /// <summary>
        /// Client: Confirm new TapCap transaction
        /// </summary>
        /// <remarks>
        /// 
        /// </remarks>
        /// <exception cref="TapCap.Client.Client.ApiException">Thrown when fails to make API call</exception>
        /// <param name="request">TapCap status request</param>
        /// <returns>ApiResponse of TapCapPurchaseFinalSigned</returns>
        ApiResponse<TapCapPurchaseFinalSigned> TapCapClientWithHttpInfo (TapCapTokenSigned request);
        #endregion Synchronous Operations
        #region Asynchronous Operations
        /// <summary>
        /// Broker: Register new TapCap transaction
        /// </summary>
        /// <remarks>
        /// 
        /// </remarks>
        /// <exception cref="TapCap.Client.Client.ApiException">Thrown when fails to make API call</exception>
        /// <param name="request">TapCap exchange request</param>
        /// <returns>Task of InlineResponse200</returns>
        System.Threading.Tasks.Task<InlineResponse200> TapCapBrokerAsync (TapCapPurchaseBrokerSigned request);

        /// <summary>
        /// Broker: Register new TapCap transaction
        /// </summary>
        /// <remarks>
        /// 
        /// </remarks>
        /// <exception cref="TapCap.Client.Client.ApiException">Thrown when fails to make API call</exception>
        /// <param name="request">TapCap exchange request</param>
        /// <returns>Task of ApiResponse (InlineResponse200)</returns>
        System.Threading.Tasks.Task<ApiResponse<InlineResponse200>> TapCapBrokerAsyncWithHttpInfo (TapCapPurchaseBrokerSigned request);
        /// <summary>
        /// Client: Confirm new TapCap transaction
        /// </summary>
        /// <remarks>
        /// 
        /// </remarks>
        /// <exception cref="TapCap.Client.Client.ApiException">Thrown when fails to make API call</exception>
        /// <param name="request">TapCap status request</param>
        /// <returns>Task of TapCapPurchaseFinalSigned</returns>
        System.Threading.Tasks.Task<TapCapPurchaseFinalSigned> TapCapClientAsync (TapCapTokenSigned request);

        /// <summary>
        /// Client: Confirm new TapCap transaction
        /// </summary>
        /// <remarks>
        /// 
        /// </remarks>
        /// <exception cref="TapCap.Client.Client.ApiException">Thrown when fails to make API call</exception>
        /// <param name="request">TapCap status request</param>
        /// <returns>Task of ApiResponse (TapCapPurchaseFinalSigned)</returns>
        System.Threading.Tasks.Task<ApiResponse<TapCapPurchaseFinalSigned>> TapCapClientAsyncWithHttpInfo (TapCapTokenSigned request);
        #endregion Asynchronous Operations
    }

    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public partial class TransactionsApi : ITransactionsApi
    {
        private TapCap.Client.Client.ExceptionFactory _exceptionFactory = (name, response) => null;

        /// <summary>
        /// Initializes a new instance of the <see cref="TransactionsApi"/> class.
        /// </summary>
        /// <returns></returns>
        public TransactionsApi(String basePath)
        {
            this.Configuration = new Configuration { BasePath = basePath };

            ExceptionFactory = TapCap.Client.Client.Configuration.DefaultExceptionFactory;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="TransactionsApi"/> class
        /// using Configuration object
        /// </summary>
        /// <param name="configuration">An instance of Configuration</param>
        /// <returns></returns>
        public TransactionsApi(Configuration configuration = null)
        {
            if (configuration == null) // use the default one in Configuration
                this.Configuration = Configuration.Default;
            else
                this.Configuration = configuration;

            ExceptionFactory = TapCap.Client.Client.Configuration.DefaultExceptionFactory;
        }

        /// <summary>
        /// Gets the base path of the API client.
        /// </summary>
        /// <value>The base path</value>
        public String GetBasePath()
        {
            return this.Configuration.ApiClient.RestClient.BaseUrl.ToString();
        }

        /// <summary>
        /// Sets the base path of the API client.
        /// </summary>
        /// <value>The base path</value>
        [Obsolete("SetBasePath is deprecated, please do 'Configuration.ApiClient = new ApiClient(\"http://new-path\")' instead.")]
        public void SetBasePath(String basePath)
        {
            // do nothing
        }

        /// <summary>
        /// Gets or sets the configuration object
        /// </summary>
        /// <value>An instance of the Configuration</value>
        public Configuration Configuration {get; set;}

        /// <summary>
        /// Provides a factory method hook for the creation of exceptions.
        /// </summary>
        public TapCap.Client.Client.ExceptionFactory ExceptionFactory
        {
            get
            {
                if (_exceptionFactory != null && _exceptionFactory.GetInvocationList().Length > 1)
                {
                    throw new InvalidOperationException("Multicast delegate for ExceptionFactory is unsupported.");
                }
                return _exceptionFactory;
            }
            set { _exceptionFactory = value; }
        }

        /// <summary>
        /// Gets the default header.
        /// </summary>
        /// <returns>Dictionary of HTTP header</returns>
        [Obsolete("DefaultHeader is deprecated, please use Configuration.DefaultHeader instead.")]
        public IDictionary<String, String> DefaultHeader()
        {
            return new ReadOnlyDictionary<string, string>(this.Configuration.DefaultHeader);
        }

        /// <summary>
        /// Add default header.
        /// </summary>
        /// <param name="key">Header field name.</param>
        /// <param name="value">Header field value.</param>
        /// <returns></returns>
        [Obsolete("AddDefaultHeader is deprecated, please use Configuration.AddDefaultHeader instead.")]
        public void AddDefaultHeader(string key, string value)
        {
            this.Configuration.AddDefaultHeader(key, value);
        }

        /// <summary>
        /// Broker: Register new TapCap transaction 
        /// </summary>
        /// <exception cref="TapCap.Client.Client.ApiException">Thrown when fails to make API call</exception>
        /// <param name="request">TapCap exchange request</param>
        /// <returns>InlineResponse200</returns>
        public InlineResponse200 TapCapBroker (TapCapPurchaseBrokerSigned request)
        {
             ApiResponse<InlineResponse200> localVarResponse = TapCapBrokerWithHttpInfo(request);
             return localVarResponse.Data;
        }

        /// <summary>
        /// Broker: Register new TapCap transaction 
        /// </summary>
        /// <exception cref="TapCap.Client.Client.ApiException">Thrown when fails to make API call</exception>
        /// <param name="request">TapCap exchange request</param>
        /// <returns>ApiResponse of InlineResponse200</returns>
        public ApiResponse< InlineResponse200 > TapCapBrokerWithHttpInfo (TapCapPurchaseBrokerSigned request)
        {
            // verify the required parameter 'request' is set
            if (request == null)
                throw new ApiException(400, "Missing required parameter 'request' when calling TransactionsApi->TapCapBroker");

            var localVarPath = "./tap/broker";
            var localVarPathParams = new Dictionary<String, String>();
            var localVarQueryParams = new List<KeyValuePair<String, String>>();
            var localVarHeaderParams = new Dictionary<String, String>(Configuration.DefaultHeader);
            var localVarFormParams = new Dictionary<String, String>();
            var localVarFileParams = new Dictionary<String, FileParameter>();
            Object localVarPostBody = null;

            // to determine the Content-Type header
            String[] localVarHttpContentTypes = new String[] {
                "application/json"
            };
            String localVarHttpContentType = Configuration.ApiClient.SelectHeaderContentType(localVarHttpContentTypes);

            // to determine the Accept header
            String[] localVarHttpHeaderAccepts = new String[] {
                "application/json"
            };
            String localVarHttpHeaderAccept = Configuration.ApiClient.SelectHeaderAccept(localVarHttpHeaderAccepts);
            if (localVarHttpHeaderAccept != null)
                localVarHeaderParams.Add("Accept", localVarHttpHeaderAccept);

            if (request != null && request.GetType() != typeof(byte[]))
            {
                localVarPostBody = Configuration.ApiClient.Serialize(request); // http body (model) parameter
            }
            else
            {
                localVarPostBody = request; // byte array
            }


            // make the HTTP request
            IRestResponse localVarResponse = (IRestResponse) Configuration.ApiClient.CallApi(localVarPath,
                Method.POST, localVarQueryParams, localVarPostBody, localVarHeaderParams, localVarFormParams, localVarFileParams,
                localVarPathParams, localVarHttpContentType);

            int localVarStatusCode = (int) localVarResponse.StatusCode;

            if (ExceptionFactory != null)
            {
                Exception exception = ExceptionFactory("TapCapBroker", localVarResponse);
                if (exception != null) throw exception;
            }

            return new ApiResponse<InlineResponse200>(localVarStatusCode,
                localVarResponse.Headers.ToDictionary(x => x.Key, x => x.Value.ToString()),
                (InlineResponse200) Configuration.ApiClient.Deserialize(localVarResponse, typeof(InlineResponse200)));
        }

        /// <summary>
        /// Broker: Register new TapCap transaction 
        /// </summary>
        /// <exception cref="TapCap.Client.Client.ApiException">Thrown when fails to make API call</exception>
        /// <param name="request">TapCap exchange request</param>
        /// <returns>Task of InlineResponse200</returns>
        public async System.Threading.Tasks.Task<InlineResponse200> TapCapBrokerAsync (TapCapPurchaseBrokerSigned request)
        {
             ApiResponse<InlineResponse200> localVarResponse = await TapCapBrokerAsyncWithHttpInfo(request);
             return localVarResponse.Data;

        }

        /// <summary>
        /// Broker: Register new TapCap transaction 
        /// </summary>
        /// <exception cref="TapCap.Client.Client.ApiException">Thrown when fails to make API call</exception>
        /// <param name="request">TapCap exchange request</param>
        /// <returns>Task of ApiResponse (InlineResponse200)</returns>
        public async System.Threading.Tasks.Task<ApiResponse<InlineResponse200>> TapCapBrokerAsyncWithHttpInfo (TapCapPurchaseBrokerSigned request)
        {
            // verify the required parameter 'request' is set
            if (request == null)
                throw new ApiException(400, "Missing required parameter 'request' when calling TransactionsApi->TapCapBroker");

            var localVarPath = "./tap/broker";
            var localVarPathParams = new Dictionary<String, String>();
            var localVarQueryParams = new List<KeyValuePair<String, String>>();
            var localVarHeaderParams = new Dictionary<String, String>(Configuration.DefaultHeader);
            var localVarFormParams = new Dictionary<String, String>();
            var localVarFileParams = new Dictionary<String, FileParameter>();
            Object localVarPostBody = null;

            // to determine the Content-Type header
            String[] localVarHttpContentTypes = new String[] {
                "application/json"
            };
            String localVarHttpContentType = Configuration.ApiClient.SelectHeaderContentType(localVarHttpContentTypes);

            // to determine the Accept header
            String[] localVarHttpHeaderAccepts = new String[] {
                "application/json"
            };
            String localVarHttpHeaderAccept = Configuration.ApiClient.SelectHeaderAccept(localVarHttpHeaderAccepts);
            if (localVarHttpHeaderAccept != null)
                localVarHeaderParams.Add("Accept", localVarHttpHeaderAccept);

            if (request != null && request.GetType() != typeof(byte[]))
            {
                localVarPostBody = Configuration.ApiClient.Serialize(request); // http body (model) parameter
            }
            else
            {
                localVarPostBody = request; // byte array
            }


            // make the HTTP request
            IRestResponse localVarResponse = (IRestResponse) await Configuration.ApiClient.CallApiAsync(localVarPath,
                Method.POST, localVarQueryParams, localVarPostBody, localVarHeaderParams, localVarFormParams, localVarFileParams,
                localVarPathParams, localVarHttpContentType);

            int localVarStatusCode = (int) localVarResponse.StatusCode;

            if (ExceptionFactory != null)
            {
                Exception exception = ExceptionFactory("TapCapBroker", localVarResponse);
                if (exception != null) throw exception;
            }

            return new ApiResponse<InlineResponse200>(localVarStatusCode,
                localVarResponse.Headers.ToDictionary(x => x.Key, x => x.Value.ToString()),
                (InlineResponse200) Configuration.ApiClient.Deserialize(localVarResponse, typeof(InlineResponse200)));
        }

        /// <summary>
        /// Client: Confirm new TapCap transaction 
        /// </summary>
        /// <exception cref="TapCap.Client.Client.ApiException">Thrown when fails to make API call</exception>
        /// <param name="request">TapCap status request</param>
        /// <returns>TapCapPurchaseFinalSigned</returns>
        public TapCapPurchaseFinalSigned TapCapClient (TapCapTokenSigned request)
        {
             ApiResponse<TapCapPurchaseFinalSigned> localVarResponse = TapCapClientWithHttpInfo(request);
             return localVarResponse.Data;
        }

        /// <summary>
        /// Client: Confirm new TapCap transaction 
        /// </summary>
        /// <exception cref="TapCap.Client.Client.ApiException">Thrown when fails to make API call</exception>
        /// <param name="request">TapCap status request</param>
        /// <returns>ApiResponse of TapCapPurchaseFinalSigned</returns>
        public ApiResponse< TapCapPurchaseFinalSigned > TapCapClientWithHttpInfo (TapCapTokenSigned request)
        {
            // verify the required parameter 'request' is set
            if (request == null)
                throw new ApiException(400, "Missing required parameter 'request' when calling TransactionsApi->TapCapClient");

            var localVarPath = "./tap/client";
            var localVarPathParams = new Dictionary<String, String>();
            var localVarQueryParams = new List<KeyValuePair<String, String>>();
            var localVarHeaderParams = new Dictionary<String, String>(Configuration.DefaultHeader);
            var localVarFormParams = new Dictionary<String, String>();
            var localVarFileParams = new Dictionary<String, FileParameter>();
            Object localVarPostBody = null;

            // to determine the Content-Type header
            String[] localVarHttpContentTypes = new String[] {
                "application/json"
            };
            String localVarHttpContentType = Configuration.ApiClient.SelectHeaderContentType(localVarHttpContentTypes);

            // to determine the Accept header
            String[] localVarHttpHeaderAccepts = new String[] {
                "application/json"
            };
            String localVarHttpHeaderAccept = Configuration.ApiClient.SelectHeaderAccept(localVarHttpHeaderAccepts);
            if (localVarHttpHeaderAccept != null)
                localVarHeaderParams.Add("Accept", localVarHttpHeaderAccept);

            if (request != null && request.GetType() != typeof(byte[]))
            {
                localVarPostBody = Configuration.ApiClient.Serialize(request); // http body (model) parameter
            }
            else
            {
                localVarPostBody = request; // byte array
            }


            // make the HTTP request
            IRestResponse localVarResponse = (IRestResponse) Configuration.ApiClient.CallApi(localVarPath,
                Method.POST, localVarQueryParams, localVarPostBody, localVarHeaderParams, localVarFormParams, localVarFileParams,
                localVarPathParams, localVarHttpContentType);

            int localVarStatusCode = (int) localVarResponse.StatusCode;

            if (ExceptionFactory != null)
            {
                Exception exception = ExceptionFactory("TapCapClient", localVarResponse);
                if (exception != null) throw exception;
            }

            return new ApiResponse<TapCapPurchaseFinalSigned>(localVarStatusCode,
                localVarResponse.Headers.ToDictionary(x => x.Key, x => x.Value.ToString()),
                (TapCapPurchaseFinalSigned) Configuration.ApiClient.Deserialize(localVarResponse, typeof(TapCapPurchaseFinalSigned)));
        }

        /// <summary>
        /// Client: Confirm new TapCap transaction 
        /// </summary>
        /// <exception cref="TapCap.Client.Client.ApiException">Thrown when fails to make API call</exception>
        /// <param name="request">TapCap status request</param>
        /// <returns>Task of TapCapPurchaseFinalSigned</returns>
        public async System.Threading.Tasks.Task<TapCapPurchaseFinalSigned> TapCapClientAsync (TapCapTokenSigned request)
        {
             ApiResponse<TapCapPurchaseFinalSigned> localVarResponse = await TapCapClientAsyncWithHttpInfo(request);
             return localVarResponse.Data;

        }

        /// <summary>
        /// Client: Confirm new TapCap transaction 
        /// </summary>
        /// <exception cref="TapCap.Client.Client.ApiException">Thrown when fails to make API call</exception>
        /// <param name="request">TapCap status request</param>
        /// <returns>Task of ApiResponse (TapCapPurchaseFinalSigned)</returns>
        public async System.Threading.Tasks.Task<ApiResponse<TapCapPurchaseFinalSigned>> TapCapClientAsyncWithHttpInfo (TapCapTokenSigned request)
        {
            // verify the required parameter 'request' is set
            if (request == null)
                throw new ApiException(400, "Missing required parameter 'request' when calling TransactionsApi->TapCapClient");

            var localVarPath = "./tap/client";
            var localVarPathParams = new Dictionary<String, String>();
            var localVarQueryParams = new List<KeyValuePair<String, String>>();
            var localVarHeaderParams = new Dictionary<String, String>(Configuration.DefaultHeader);
            var localVarFormParams = new Dictionary<String, String>();
            var localVarFileParams = new Dictionary<String, FileParameter>();
            Object localVarPostBody = null;

            // to determine the Content-Type header
            String[] localVarHttpContentTypes = new String[] {
                "application/json"
            };
            String localVarHttpContentType = Configuration.ApiClient.SelectHeaderContentType(localVarHttpContentTypes);

            // to determine the Accept header
            String[] localVarHttpHeaderAccepts = new String[] {
                "application/json"
            };
            String localVarHttpHeaderAccept = Configuration.ApiClient.SelectHeaderAccept(localVarHttpHeaderAccepts);
            if (localVarHttpHeaderAccept != null)
                localVarHeaderParams.Add("Accept", localVarHttpHeaderAccept);

            if (request != null && request.GetType() != typeof(byte[]))
            {
                localVarPostBody = Configuration.ApiClient.Serialize(request); // http body (model) parameter
            }
            else
            {
                localVarPostBody = request; // byte array
            }


            // make the HTTP request
            IRestResponse localVarResponse = (IRestResponse) await Configuration.ApiClient.CallApiAsync(localVarPath,
                Method.POST, localVarQueryParams, localVarPostBody, localVarHeaderParams, localVarFormParams, localVarFileParams,
                localVarPathParams, localVarHttpContentType);

            int localVarStatusCode = (int) localVarResponse.StatusCode;

            if (ExceptionFactory != null)
            {
                Exception exception = ExceptionFactory("TapCapClient", localVarResponse);
                if (exception != null) throw exception;
            }

            return new ApiResponse<TapCapPurchaseFinalSigned>(localVarStatusCode,
                localVarResponse.Headers.ToDictionary(x => x.Key, x => x.Value.ToString()),
                (TapCapPurchaseFinalSigned) Configuration.ApiClient.Deserialize(localVarResponse, typeof(TapCapPurchaseFinalSigned)));
        }

    }
}
