/* 
 * TheCoin Broker
 *
 * TheCoin TapCap resolution.  This service is the trusted 3rd party that weekly settles TapCap purchases
 *
 * OpenAPI spec version: 0.0.1
 * Contact: stephen.taylor.dev@gmail.com
 * Generated by: https://github.com/swagger-api/swagger-codegen.git
 */

using System;
using System.Linq;
using System.IO;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Runtime.Serialization;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using SwaggerDateConverter = TapCap.Client.Client.SwaggerDateConverter;

namespace TapCap.Client.Model
{
    /// <summary>
    /// TapCapPurchase
    /// </summary>
    [DataContract]
    public partial class TapCapPurchase :  IEquatable<TapCapPurchase>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="TapCapPurchase" /> class.
        /// </summary>
        [JsonConstructorAttribute]
        protected TapCapPurchase() { }
        /// <summary>
        /// Initializes a new instance of the <see cref="TapCapPurchase" /> class.
        /// </summary>
        /// <param name="Fiat">Fiat (required).</param>
        /// <param name="CurrencyCode">CurrencyCode (required).</param>
        /// <param name="Timestamp">Timestamp (required).</param>
        /// <param name="GpoData">GpoData (required).</param>
        /// <param name="CertificateRequest">CertificateRequest (required).</param>
        /// <param name="Token">Token (required).</param>
        public TapCapPurchase(decimal? Fiat = default(decimal?), decimal? CurrencyCode = default(decimal?), decimal? Timestamp = default(decimal?), byte[] GpoData = default(byte[]), byte[] CertificateRequest = default(byte[]), SignedMessage Token = default(SignedMessage))
        {
            // to ensure "Fiat" is required (not null)
            if (Fiat == null)
            {
                throw new InvalidDataException("Fiat is a required property for TapCapPurchase and cannot be null");
            }
            else
            {
                this.Fiat = Fiat;
            }
            // to ensure "CurrencyCode" is required (not null)
            if (CurrencyCode == null)
            {
                throw new InvalidDataException("CurrencyCode is a required property for TapCapPurchase and cannot be null");
            }
            else
            {
                this.CurrencyCode = CurrencyCode;
            }
            // to ensure "Timestamp" is required (not null)
            if (Timestamp == null)
            {
                throw new InvalidDataException("Timestamp is a required property for TapCapPurchase and cannot be null");
            }
            else
            {
                this.Timestamp = Timestamp;
            }
            // to ensure "GpoData" is required (not null)
            if (GpoData == null)
            {
                throw new InvalidDataException("GpoData is a required property for TapCapPurchase and cannot be null");
            }
            else
            {
                this.GpoData = GpoData;
            }
            // to ensure "CertificateRequest" is required (not null)
            if (CertificateRequest == null)
            {
                throw new InvalidDataException("CertificateRequest is a required property for TapCapPurchase and cannot be null");
            }
            else
            {
                this.CertificateRequest = CertificateRequest;
            }
            // to ensure "Token" is required (not null)
            if (Token == null)
            {
                throw new InvalidDataException("Token is a required property for TapCapPurchase and cannot be null");
            }
            else
            {
                this.Token = Token;
            }
        }
        
        /// <summary>
        /// Gets or Sets Fiat
        /// </summary>
        [DataMember(Name="fiat", EmitDefaultValue=false)]
        public decimal? Fiat { get; set; }

        /// <summary>
        /// Gets or Sets CurrencyCode
        /// </summary>
        [DataMember(Name="currencyCode", EmitDefaultValue=false)]
        public decimal? CurrencyCode { get; set; }

        /// <summary>
        /// Gets or Sets Timestamp
        /// </summary>
        [DataMember(Name="timestamp", EmitDefaultValue=false)]
        public decimal? Timestamp { get; set; }

        /// <summary>
        /// Gets or Sets GpoData
        /// </summary>
        [DataMember(Name="gpoData", EmitDefaultValue=false)]
        public byte[] GpoData { get; set; }

        /// <summary>
        /// Gets or Sets CertificateRequest
        /// </summary>
        [DataMember(Name="certificateRequest", EmitDefaultValue=false)]
        public byte[] CertificateRequest { get; set; }

        /// <summary>
        /// Gets or Sets Token
        /// </summary>
        [DataMember(Name="token", EmitDefaultValue=false)]
        public SignedMessage Token { get; set; }

        /// <summary>
        /// Returns the string presentation of the object
        /// </summary>
        /// <returns>String presentation of the object</returns>
        public override string ToString()
        {
            var sb = new StringBuilder();
            sb.Append("class TapCapPurchase {\n");
            sb.Append("  Fiat: ").Append(Fiat).Append("\n");
            sb.Append("  CurrencyCode: ").Append(CurrencyCode).Append("\n");
            sb.Append("  Timestamp: ").Append(Timestamp).Append("\n");
            sb.Append("  GpoData: ").Append(GpoData).Append("\n");
            sb.Append("  CertificateRequest: ").Append(CertificateRequest).Append("\n");
            sb.Append("  Token: ").Append(Token).Append("\n");
            sb.Append("}\n");
            return sb.ToString();
        }
  
        /// <summary>
        /// Returns the JSON string presentation of the object
        /// </summary>
        /// <returns>JSON string presentation of the object</returns>
        public string ToJson()
        {
            return JsonConvert.SerializeObject(this, Formatting.Indented);
        }

        /// <summary>
        /// Returns true if objects are equal
        /// </summary>
        /// <param name="input">Object to be compared</param>
        /// <returns>Boolean</returns>
        public override bool Equals(object input)
        {
            return this.Equals(input as TapCapPurchase);
        }

        /// <summary>
        /// Returns true if TapCapPurchase instances are equal
        /// </summary>
        /// <param name="input">Instance of TapCapPurchase to be compared</param>
        /// <returns>Boolean</returns>
        public bool Equals(TapCapPurchase input)
        {
            if (input == null)
                return false;

            return 
                (
                    this.Fiat == input.Fiat ||
                    (this.Fiat != null &&
                    this.Fiat.Equals(input.Fiat))
                ) && 
                (
                    this.CurrencyCode == input.CurrencyCode ||
                    (this.CurrencyCode != null &&
                    this.CurrencyCode.Equals(input.CurrencyCode))
                ) && 
                (
                    this.Timestamp == input.Timestamp ||
                    (this.Timestamp != null &&
                    this.Timestamp.Equals(input.Timestamp))
                ) && 
                (
                    this.GpoData == input.GpoData ||
                    (this.GpoData != null &&
                    this.GpoData.Equals(input.GpoData))
                ) && 
                (
                    this.CertificateRequest == input.CertificateRequest ||
                    (this.CertificateRequest != null &&
                    this.CertificateRequest.Equals(input.CertificateRequest))
                ) && 
                (
                    this.Token == input.Token ||
                    (this.Token != null &&
                    this.Token.Equals(input.Token))
                );
        }

        /// <summary>
        /// Gets the hash code
        /// </summary>
        /// <returns>Hash code</returns>
        public override int GetHashCode()
        {
            unchecked // Overflow is fine, just wrap
            {
                int hashCode = 41;
                if (this.Fiat != null)
                    hashCode = hashCode * 59 + this.Fiat.GetHashCode();
                if (this.CurrencyCode != null)
                    hashCode = hashCode * 59 + this.CurrencyCode.GetHashCode();
                if (this.Timestamp != null)
                    hashCode = hashCode * 59 + this.Timestamp.GetHashCode();
                if (this.GpoData != null)
                    hashCode = hashCode * 59 + this.GpoData.GetHashCode();
                if (this.CertificateRequest != null)
                    hashCode = hashCode * 59 + this.CertificateRequest.GetHashCode();
                if (this.Token != null)
                    hashCode = hashCode * 59 + this.Token.GetHashCode();
                return hashCode;
            }
        }
    }

}
