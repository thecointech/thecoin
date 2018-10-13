/* 
 * THE TapCap supply
 *
 * The interace for TapCap between buyers & sellers.
 *
 * OpenAPI spec version: 0.1.0
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
using OpenAPIDateConverter = TapCap.Supplier.Client.OpenAPIDateConverter;

namespace TapCap.Supplier.Model
{
    /// <summary>
    /// SignedMessage
    /// </summary>
    [DataContract]
    public partial class SignedMessage :  IEquatable<SignedMessage>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="SignedMessage" /> class.
        /// </summary>
        [JsonConstructorAttribute]
        protected SignedMessage() { }
        /// <summary>
        /// Initializes a new instance of the <see cref="SignedMessage" /> class.
        /// </summary>
        /// <param name="message">message (required).</param>
        /// <param name="signature">signature (required).</param>
        public SignedMessage(string message = default(string), string signature = default(string))
        {
            // to ensure "message" is required (not null)
            if (message == null)
            {
                throw new InvalidDataException("message is a required property for SignedMessage and cannot be null");
            }
            else
            {
                this.Message = message;
            }
            // to ensure "signature" is required (not null)
            if (signature == null)
            {
                throw new InvalidDataException("signature is a required property for SignedMessage and cannot be null");
            }
            else
            {
                this.Signature = signature;
            }
        }
        
        /// <summary>
        /// Gets or Sets Message
        /// </summary>
        [DataMember(Name="message", EmitDefaultValue=false)]
        public string Message { get; set; }

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
            sb.Append("class SignedMessage {\n");
            sb.Append("  Message: ").Append(Message).Append("\n");
            sb.Append("  Signature: ").Append(Signature).Append("\n");
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
            return this.Equals(input as SignedMessage);
        }

        /// <summary>
        /// Returns true if SignedMessage instances are equal
        /// </summary>
        /// <param name="input">Instance of SignedMessage to be compared</param>
        /// <returns>Boolean</returns>
        public bool Equals(SignedMessage input)
        {
            if (input == null)
                return false;

            return 
                (
                    this.Message == input.Message ||
                    (this.Message != null &&
                    this.Message.Equals(input.Message))
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
                if (this.Message != null)
                    hashCode = hashCode * 59 + this.Message.GetHashCode();
                if (this.Signature != null)
                    hashCode = hashCode * 59 + this.Signature.GetHashCode();
                return hashCode;
            }
        }
    }

}
