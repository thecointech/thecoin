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
    /// TapCapQueryRequest
    /// </summary>
    [DataContract]
    public partial class TapCapQueryRequest :  IEquatable<TapCapQueryRequest>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="TapCapQueryRequest" /> class.
        /// </summary>
        [JsonConstructorAttribute]
        protected TapCapQueryRequest() { }
        /// <summary>
        /// Initializes a new instance of the <see cref="TapCapQueryRequest" /> class.
        /// </summary>
        /// <param name="Timestamp">Timestamp (required).</param>
        public TapCapQueryRequest(decimal? Timestamp = default(decimal?))
        {
            // to ensure "Timestamp" is required (not null)
            if (Timestamp == null)
            {
                throw new InvalidDataException("Timestamp is a required property for TapCapQueryRequest and cannot be null");
            }
            else
            {
                this.Timestamp = Timestamp;
            }
        }
        
        /// <summary>
        /// Gets or Sets Timestamp
        /// </summary>
        [DataMember(Name="timestamp", EmitDefaultValue=false)]
        public decimal? Timestamp { get; set; }

        /// <summary>
        /// Returns the string presentation of the object
        /// </summary>
        /// <returns>String presentation of the object</returns>
        public override string ToString()
        {
            var sb = new StringBuilder();
            sb.Append("class TapCapQueryRequest {\n");
            sb.Append("  Timestamp: ").Append(Timestamp).Append("\n");
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
            return this.Equals(input as TapCapQueryRequest);
        }

        /// <summary>
        /// Returns true if TapCapQueryRequest instances are equal
        /// </summary>
        /// <param name="input">Instance of TapCapQueryRequest to be compared</param>
        /// <returns>Boolean</returns>
        public bool Equals(TapCapQueryRequest input)
        {
            if (input == null)
                return false;

            return 
                (
                    this.Timestamp == input.Timestamp ||
                    (this.Timestamp != null &&
                    this.Timestamp.Equals(input.Timestamp))
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
                if (this.Timestamp != null)
                    hashCode = hashCode * 59 + this.Timestamp.GetHashCode();
                return hashCode;
            }
        }
    }

}
