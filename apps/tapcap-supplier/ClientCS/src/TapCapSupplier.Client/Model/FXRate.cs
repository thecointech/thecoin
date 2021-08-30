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
        /// <param name="target">target.</param>
        /// <param name="buy">buy (required).</param>
        /// <param name="sell">sell (required).</param>
        /// <param name="fxRate">fxRate (required).</param>
        /// <param name="validFrom">validFrom (required).</param>
        /// <param name="validTill">validTill (required).</param>
        public FXRate(int? target = default(int?), double? buy = default(double?), double? sell = default(double?), double? fxRate = default(double?), long? validFrom = default(long?), long? validTill = default(long?))
        {
            // to ensure "buy" is required (not null)
            if (buy == null)
            {
                throw new InvalidDataException("buy is a required property for FXRate and cannot be null");
            }
            else
            {
                this.Buy = buy;
            }
            // to ensure "sell" is required (not null)
            if (sell == null)
            {
                throw new InvalidDataException("sell is a required property for FXRate and cannot be null");
            }
            else
            {
                this.Sell = sell;
            }
            // to ensure "fxRate" is required (not null)
            if (fxRate == null)
            {
                throw new InvalidDataException("fxRate is a required property for FXRate and cannot be null");
            }
            else
            {
                this._FxRate = fxRate;
            }
            // to ensure "validFrom" is required (not null)
            if (validFrom == null)
            {
                throw new InvalidDataException("validFrom is a required property for FXRate and cannot be null");
            }
            else
            {
                this.ValidFrom = validFrom;
            }
            // to ensure "validTill" is required (not null)
            if (validTill == null)
            {
                throw new InvalidDataException("validTill is a required property for FXRate and cannot be null");
            }
            else
            {
                this.ValidTill = validTill;
            }
            this.Target = target;
        }
        
        /// <summary>
        /// Gets or Sets Target
        /// </summary>
        [DataMember(Name="target", EmitDefaultValue=false)]
        public int? Target { get; set; }

        /// <summary>
        /// Gets or Sets Buy
        /// </summary>
        [DataMember(Name="buy", EmitDefaultValue=false)]
        public double? Buy { get; set; }

        /// <summary>
        /// Gets or Sets Sell
        /// </summary>
        [DataMember(Name="sell", EmitDefaultValue=false)]
        public double? Sell { get; set; }

        /// <summary>
        /// Gets or Sets _FxRate
        /// </summary>
        [DataMember(Name="fxRate", EmitDefaultValue=false)]
        public double? _FxRate { get; set; }

        /// <summary>
        /// Gets or Sets ValidFrom
        /// </summary>
        [DataMember(Name="validFrom", EmitDefaultValue=false)]
        public long? ValidFrom { get; set; }

        /// <summary>
        /// Gets or Sets ValidTill
        /// </summary>
        [DataMember(Name="validTill", EmitDefaultValue=false)]
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