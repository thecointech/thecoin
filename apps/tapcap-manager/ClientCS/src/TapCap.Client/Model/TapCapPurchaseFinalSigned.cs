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
    /// TapCapPurchaseFinalSigned
    /// </summary>
    [DataContract]
    public partial class TapCapPurchaseFinalSigned :  IEquatable<TapCapPurchaseFinalSigned>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="TapCapPurchaseFinalSigned" /> class.
        /// </summary>
        [JsonConstructorAttribute]
        protected TapCapPurchaseFinalSigned() { }
        /// <summary>
        /// Initializes a new instance of the <see cref="TapCapPurchaseFinalSigned" /> class.
        /// </summary>
        /// <param name="BrokerSigned">BrokerSigned (required).</param>
        /// <param name="Signature">Signature (required).</param>
        public TapCapPurchaseFinalSigned(string BrokerSigned = default(string), string Signature = default(string))
        {
            // to ensure "BrokerSigned" is required (not null)
            if (BrokerSigned == null)
            {
                throw new InvalidDataException("BrokerSigned is a required property for TapCapPurchaseFinalSigned and cannot be null");
            }
            else
            {
                this.BrokerSigned = BrokerSigned;
            }
            // to ensure "Signature" is required (not null)
            if (Signature == null)
            {
                throw new InvalidDataException("Signature is a required property for TapCapPurchaseFinalSigned and cannot be null");
            }
            else
            {
                this.Signature = Signature;
            }
        }
        
        /// <summary>
        /// Gets or Sets BrokerSigned
        /// </summary>
        [DataMember(Name="brokerSigned", EmitDefaultValue=false)]
        public string BrokerSigned { get; set; }

        /// <summary>
        /// Gets or Sets Signature
        /// </summary>
        [DataMember(Name="signature", EmitDefaultValue=false)]
        public string Signature { get; set; }

        /// <summary>
        /// Returns the string presentation of the object
        /// </summary>
        /// <returns>String presentation of the object</returns>
        public override string ToString()
        {
            var sb = new StringBuilder();
            sb.Append("class TapCapPurchaseFinalSigned {\n");
            sb.Append("  BrokerSigned: ").Append(BrokerSigned).Append("\n");
            sb.Append("  Signature: ").Append(Signature).Append("\n");
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
            return this.Equals(input as TapCapPurchaseFinalSigned);
        }

        /// <summary>
        /// Returns true if TapCapPurchaseFinalSigned instances are equal
        /// </summary>
        /// <param name="input">Instance of TapCapPurchaseFinalSigned to be compared</param>
        /// <returns>Boolean</returns>
        public bool Equals(TapCapPurchaseFinalSigned input)
        {
            if (input == null)
                return false;

            return 
                (
                    this.BrokerSigned == input.BrokerSigned ||
                    (this.BrokerSigned != null &&
                    this.BrokerSigned.Equals(input.BrokerSigned))
                ) && 
                (
                    this.Signature == input.Signature ||
                    (this.Signature != null &&
                    this.Signature.Equals(input.Signature))
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
                if (this.BrokerSigned != null)
                    hashCode = hashCode * 59 + this.BrokerSigned.GetHashCode();
                if (this.Signature != null)
                    hashCode = hashCode * 59 + this.Signature.GetHashCode();
                return hashCode;
            }
        }
    }

}
