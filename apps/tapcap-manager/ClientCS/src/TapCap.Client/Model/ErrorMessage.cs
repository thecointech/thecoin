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
    /// ErrorMessage
    /// </summary>
    [DataContract]
    public partial class ErrorMessage :  IEquatable<ErrorMessage>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ErrorMessage" /> class.
        /// </summary>
        [JsonConstructorAttribute]
        protected ErrorMessage() { }
        /// <summary>
        /// Initializes a new instance of the <see cref="ErrorMessage" /> class.
        /// </summary>
        /// <param name="eventId">eventId (required).</param>
        /// <param name="message">message (required).</param>
        public ErrorMessage(int? eventId = default(int?), string message = default(string))
        {
            // to ensure "eventId" is required (not null)
            if (eventId == null)
            {
                throw new InvalidDataException("eventId is a required property for ErrorMessage and cannot be null");
            }
            else
            {
                this.EventId = eventId;
            }
            // to ensure "message" is required (not null)
            if (message == null)
            {
                throw new InvalidDataException("message is a required property for ErrorMessage and cannot be null");
            }
            else
            {
                this.Message = message;
            }
        }
        
        /// <summary>
        /// Gets or Sets EventId
        /// </summary>
        [DataMember(Name="eventId", EmitDefaultValue=false)]
        public int? EventId { get; set; }

        /// <summary>
        /// Gets or Sets Message
        /// </summary>
        [DataMember(Name="message", EmitDefaultValue=false)]
        public string Message { get; set; }

        /// <summary>
        /// Returns the string presentation of the object
        /// </summary>
        /// <returns>String presentation of the object</returns>
        public override string ToString()
        {
            var sb = new StringBuilder();
            sb.Append("class ErrorMessage {\n");
            sb.Append("  EventId: ").Append(EventId).Append("\n");
            sb.Append("  Message: ").Append(Message).Append("\n");
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
            return this.Equals(input as ErrorMessage);
        }

        /// <summary>
        /// Returns true if ErrorMessage instances are equal
        /// </summary>
        /// <param name="input">Instance of ErrorMessage to be compared</param>
        /// <returns>Boolean</returns>
        public bool Equals(ErrorMessage input)
        {
            if (input == null)
                return false;

            return 
                (
                    this.EventId == input.EventId ||
                    (this.EventId != null &&
                    this.EventId.Equals(input.EventId))
                ) && 
                (
                    this.Message == input.Message ||
                    (this.Message != null &&
                    this.Message.Equals(input.Message))
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
                if (this.EventId != null)
                    hashCode = hashCode * 59 + this.EventId.GetHashCode();
                if (this.Message != null)
                    hashCode = hashCode * 59 + this.Message.GetHashCode();
                return hashCode;
            }
        }
    }

}
