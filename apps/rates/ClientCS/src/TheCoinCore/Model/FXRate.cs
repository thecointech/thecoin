/* 
 * TheCoin Core
 *
 * TheCoin core services.  Published by TheCoin Tech
 *
 * OpenAPI spec version: 0.1.0
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
using SwaggerDateConverter = TheCoinCore.Client.SwaggerDateConverter;

namespace TheCoinCore.Model
{
    /// <summary>
    /// FXRate
    /// </summary>
    [DataContract]
    public partial class FXRate :  IEquatable<FXRate>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="FXRate" /> class.
        /// </summary>
        [JsonConstructorAttribute]
        protected FXRate() { }
        /// <summary>
        /// Initializes a new instance of the <see cref="FXRate" /> class.
        /// </summary>
        /// <param name="Target">Target.</param>
        /// <param name="Buy">Buy (required).</param>
        /// <param name="Sell">Sell (required).</param>
        /// <param name="_FxRate">_FxRate (required).</param>
        /// <param name="ValidFrom">ValidFrom (required).</param>
        /// <param name="ValidTill">ValidTill (required).</param>
        public FXRate(int? Target = default(int?), double? Buy = default(double?), double? Sell = default(double?), double? _FxRate = default(double?), long? ValidFrom = default(long?), long? ValidTill = default(long?))
        {
            // to ensure "Buy" is required (not null)
            if (Buy == null)
            {
                throw new InvalidDataException("Buy is a required property for FXRate and cannot be null");
            }
            else
            {
                this.Buy = Buy;
            }
            // to ensure "Sell" is required (not null)
            if (Sell == null)
            {
                throw new InvalidDataException("Sell is a required property for FXRate and cannot be null");
            }
            else
            {
                this.Sell = Sell;
            }
            // to ensure "_FxRate" is required (not null)
            if (_FxRate == null)
            {
                throw new InvalidDataException("_FxRate is a required property for FXRate and cannot be null");
            }
            else
            {
                this._FxRate = _FxRate;
            }
            // to ensure "ValidFrom" is required (not null)
            if (ValidFrom == null)
            {
                throw new InvalidDataException("ValidFrom is a required property for FXRate and cannot be null");
            }
            else
            {
                this.ValidFrom = ValidFrom;
            }
            // to ensure "ValidTill" is required (not null)
            if (ValidTill == null)
            {
                throw new InvalidDataException("ValidTill is a required property for FXRate and cannot be null");
            }
            else
            {
                this.ValidTill = ValidTill;
            }
            this.Target = Target;
        }
        
        /// <summary>
        /// Gets or Sets Target
        /// </summary>
        [DataMember(Name="target", EmitDefaultValue=false)]
        public int? Target { get; set; }

        /// <summary>
        /// Gets or Sets Buy
        /// </summary>
        [DataMember(Name="Buy", EmitDefaultValue=false)]
        public double? Buy { get; set; }

        /// <summary>
        /// Gets or Sets Sell
        /// </summary>
        [DataMember(Name="Sell", EmitDefaultValue=false)]
        public double? Sell { get; set; }

        /// <summary>
        /// Gets or Sets _FxRate
        /// </summary>
        [DataMember(Name="FxRate", EmitDefaultValue=false)]
        public double? _FxRate { get; set; }

        /// <summary>
        /// Gets or Sets ValidFrom
        /// </summary>
        [DataMember(Name="ValidFrom", EmitDefaultValue=false)]
        public long? ValidFrom { get; set; }

        /// <summary>
        /// Gets or Sets ValidTill
        /// </summary>
        [DataMember(Name="ValidTill", EmitDefaultValue=false)]
        public long? ValidTill { get; set; }

        /// <summary>
        /// Returns the string presentation of the object
        /// </summary>
        /// <returns>String presentation of the object</returns>
        public override string ToString()
        {
            var sb = new StringBuilder();
            sb.Append("class FXRate {\n");
            sb.Append("  Target: ").Append(Target).Append("\n");
            sb.Append("  Buy: ").Append(Buy).Append("\n");
            sb.Append("  Sell: ").Append(Sell).Append("\n");
            sb.Append("  _FxRate: ").Append(_FxRate).Append("\n");
            sb.Append("  ValidFrom: ").Append(ValidFrom).Append("\n");
            sb.Append("  ValidTill: ").Append(ValidTill).Append("\n");
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
            return this.Equals(input as FXRate);
        }

        /// <summary>
        /// Returns true if FXRate instances are equal
        /// </summary>
        /// <param name="input">Instance of FXRate to be compared</param>
        /// <returns>Boolean</returns>
        public bool Equals(FXRate input)
        {
            if (input == null)
                return false;

            return 
                (
                    this.Target == input.Target ||
                    (this.Target != null &&
                    this.Target.Equals(input.Target))
                ) && 
                (
                    this.Buy == input.Buy ||
                    (this.Buy != null &&
                    this.Buy.Equals(input.Buy))
                ) && 
                (
                    this.Sell == input.Sell ||
                    (this.Sell != null &&
                    this.Sell.Equals(input.Sell))
                ) && 
                (
                    this._FxRate == input._FxRate ||
                    (this._FxRate != null &&
                    this._FxRate.Equals(input._FxRate))
                ) && 
                (
                    this.ValidFrom == input.ValidFrom ||
                    (this.ValidFrom != null &&
                    this.ValidFrom.Equals(input.ValidFrom))
                ) && 
                (
                    this.ValidTill == input.ValidTill ||
                    (this.ValidTill != null &&
                    this.ValidTill.Equals(input.ValidTill))
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
                if (this.Target != null)
                    hashCode = hashCode * 59 + this.Target.GetHashCode();
                if (this.Buy != null)
                    hashCode = hashCode * 59 + this.Buy.GetHashCode();
                if (this.Sell != null)
                    hashCode = hashCode * 59 + this.Sell.GetHashCode();
                if (this._FxRate != null)
                    hashCode = hashCode * 59 + this._FxRate.GetHashCode();
                if (this.ValidFrom != null)
                    hashCode = hashCode * 59 + this.ValidFrom.GetHashCode();
                if (this.ValidTill != null)
                    hashCode = hashCode * 59 + this.ValidTill.GetHashCode();
                return hashCode;
            }
        }
    }

}
