/* 
 * The TapCap Manager
 *
 * The TapCap resolution.  This service is the trusted 3rd party that weekly settles TapCap purchases
 *
 * OpenAPI spec version: 0.0.1
 * Contact: stephen.taylor.dev@gmail.com
 * Generated by: https://github.com/openapitools/openapi-generator.git
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
using OpenAPIDateConverter = TapCap.Client.Client.OpenAPIDateConverter;

namespace TapCap.Client.Model
{
    /// <summary>
    /// TapCapQueryResponse
    /// </summary>
    [DataContract]
    public partial class TapCapQueryResponse :  IEquatable<TapCapQueryResponse>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="TapCapQueryResponse" /> class.
        /// </summary>
        [JsonConstructorAttribute]
        protected TapCapQueryResponse() { }
        /// <summary>
        /// Initializes a new instance of the <see cref="TapCapQueryResponse" /> class.
        /// </summary>
        /// <param name="balance">balance (required).</param>
        /// <param name="token">token (required).</param>
        public TapCapQueryResponse(double? balance = default(double?), SignedMessage token = default(SignedMessage))
        {
            // to ensure "balance" is required (not null)
            if (balance == null)
            {
                throw new InvalidDataException("balance is a required property for TapCapQueryResponse and cannot be null");
            }
            else
            {
                this.Balance = balance;
            }
            // to ensure "token" is required (not null)
            if (token == null)
            {
                throw new InvalidDataException("token is a required property for TapCapQueryResponse and cannot be null");
            }
            else
            {
                this.Token = token;
            }
        }
        
        /// <summary>
        /// Gets or Sets Balance
        /// </summary>
        [DataMember(Name="balance", EmitDefaultValue=false)]
        public double? Balance { get; set; }

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
            sb.Append("class TapCapQueryResponse {\n");
            sb.Append("  Balance: ").Append(Balance).Append("\n");
            sb.Append("  Token: ").Append(Token).Append("\n");
            sb.Append("}\n");
            return sb.ToString();
        }
  
        /// <summary>
        /// Returns the JSON string presentation of the object
        /// </summary>
        /// <returns>JSON string presentation of the object</returns>
        public virtual string ToJson()
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
            return this.Equals(input as TapCapQueryResponse);
        }

        /// <summary>
        /// Returns true if TapCapQueryResponse instances are equal
        /// </summary>
        /// <param name="input">Instance of TapCapQueryResponse to be compared</param>
        /// <returns>Boolean</returns>
        public bool Equals(TapCapQueryResponse input)
        {
            if (input == null)
                return false;

            return 
                (
                    this.Balance == input.Balance ||
                    (this.Balance != null &&
                    this.Balance.Equals(input.Balance))
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
                if (this.Balance != null)
                    hashCode = hashCode * 59 + this.Balance.GetHashCode();
                if (this.Token != null)
                    hashCode = hashCode * 59 + this.Token.GetHashCode();
                return hashCode;
            }
        }
    }

}
