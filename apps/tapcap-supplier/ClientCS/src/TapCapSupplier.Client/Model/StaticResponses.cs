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
using OpenAPIDateConverter = TapCapSupplier.Client.Client.OpenAPIDateConverter;

namespace TapCapSupplier.Client.Model
{
    /// <summary>
    /// StaticResponses
    /// </summary>
    [DataContract]
    public partial class StaticResponses :  IEquatable<StaticResponses>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="StaticResponses" /> class.
        /// </summary>
        [JsonConstructorAttribute]
        protected StaticResponses() { }
        /// <summary>
        /// Initializes a new instance of the <see cref="StaticResponses" /> class.
        /// </summary>
        /// <param name="gpoPdol">gpoPdol (required).</param>
        /// <param name="cryptoPdol">cryptoPdol.</param>
        /// <param name="queries">queries (required).</param>
        /// <param name="responses">responses (required).</param>
        /// <param name="responseParentIndex">responseParentIndex (required).</param>
        public StaticResponses(byte[] gpoPdol = default(byte[]), byte[] cryptoPdol = default(byte[]), List<byte[]> queries = default(List<byte[]>), List<byte[]> responses = default(List<byte[]>), List<int?> responseParentIndex = default(List<int?>))
        {
            // to ensure "gpoPdol" is required (not null)
            if (gpoPdol == null)
            {
                throw new InvalidDataException("gpoPdol is a required property for StaticResponses and cannot be null");
            }
            else
            {
                this.GpoPdol = gpoPdol;
            }
            // to ensure "queries" is required (not null)
            if (queries == null)
            {
                throw new InvalidDataException("queries is a required property for StaticResponses and cannot be null");
            }
            else
            {
                this.Queries = queries;
            }
            // to ensure "responses" is required (not null)
            if (responses == null)
            {
                throw new InvalidDataException("responses is a required property for StaticResponses and cannot be null");
            }
            else
            {
                this.Responses = responses;
            }
            // to ensure "responseParentIndex" is required (not null)
            if (responseParentIndex == null)
            {
                throw new InvalidDataException("responseParentIndex is a required property for StaticResponses and cannot be null");
            }
            else
            {
                this.ResponseParentIndex = responseParentIndex;
            }
            this.CryptoPdol = cryptoPdol;
        }
        
        /// <summary>
        /// Gets or Sets GpoPdol
        /// </summary>
        [DataMember(Name="gpoPdol", EmitDefaultValue=false)]
        public byte[] GpoPdol { get; set; }

        /// <summary>
        /// Gets or Sets CryptoPdol
        /// </summary>
        [DataMember(Name="cryptoPdol", EmitDefaultValue=false)]
        public byte[] CryptoPdol { get; set; }

        /// <summary>
        /// Gets or Sets Queries
        /// </summary>
        [DataMember(Name="queries", EmitDefaultValue=false)]
        public List<byte[]> Queries { get; set; }

        /// <summary>
        /// Gets or Sets Responses
        /// </summary>
        [DataMember(Name="responses", EmitDefaultValue=false)]
        public List<byte[]> Responses { get; set; }

        /// <summary>
        /// Gets or Sets ResponseParentIndex
        /// </summary>
        [DataMember(Name="responseParentIndex", EmitDefaultValue=false)]
        public List<int?> ResponseParentIndex { get; set; }

        /// <summary>
        /// Returns the string presentation of the object
        /// </summary>
        /// <returns>String presentation of the object</returns>
        public override string ToString()
        {
            var sb = new StringBuilder();
            sb.Append("class StaticResponses {\n");
            sb.Append("  GpoPdol: ").Append(GpoPdol).Append("\n");
            sb.Append("  CryptoPdol: ").Append(CryptoPdol).Append("\n");
            sb.Append("  Queries: ").Append(Queries).Append("\n");
            sb.Append("  Responses: ").Append(Responses).Append("\n");
            sb.Append("  ResponseParentIndex: ").Append(ResponseParentIndex).Append("\n");
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
            return this.Equals(input as StaticResponses);
        }

        /// <summary>
        /// Returns true if StaticResponses instances are equal
        /// </summary>
        /// <param name="input">Instance of StaticResponses to be compared</param>
        /// <returns>Boolean</returns>
        public bool Equals(StaticResponses input)
        {
            if (input == null)
                return false;

            return 
                (
                    this.GpoPdol == input.GpoPdol ||
                    (this.GpoPdol != null &&
                    this.GpoPdol.Equals(input.GpoPdol))
                ) && 
                (
                    this.CryptoPdol == input.CryptoPdol ||
                    (this.CryptoPdol != null &&
                    this.CryptoPdol.Equals(input.CryptoPdol))
                ) && 
                (
                    this.Queries == input.Queries ||
                    this.Queries != null &&
                    this.Queries.SequenceEqual(input.Queries)
                ) && 
                (
                    this.Responses == input.Responses ||
                    this.Responses != null &&
                    this.Responses.SequenceEqual(input.Responses)
                ) && 
                (
                    this.ResponseParentIndex == input.ResponseParentIndex ||
                    this.ResponseParentIndex != null &&
                    this.ResponseParentIndex.SequenceEqual(input.ResponseParentIndex)
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
                if (this.GpoPdol != null)
                    hashCode = hashCode * 59 + this.GpoPdol.GetHashCode();
                if (this.CryptoPdol != null)
                    hashCode = hashCode * 59 + this.CryptoPdol.GetHashCode();
                if (this.Queries != null)
                    hashCode = hashCode * 59 + this.Queries.GetHashCode();
                if (this.Responses != null)
                    hashCode = hashCode * 59 + this.Responses.GetHashCode();
                if (this.ResponseParentIndex != null)
                    hashCode = hashCode * 59 + this.ResponseParentIndex.GetHashCode();
                return hashCode;
            }
        }
    }

}
