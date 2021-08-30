/*
 * THE TapCap supply
 *
 * The interace for TapCap between buyers & sellers.
 *
 * OpenAPI spec version: 0.1.0
 * Contact: stephen.taylor.dev@gmail.com
 * Generated by: https://openapi-generator.tech
 */

using System;
using System.Linq;
using System.Text;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace TapCapSupplier.Server.Models
{ 
    /// <summary>
    /// 
    /// </summary>
    [DataContract]
    public partial class TapCapClientRequest : IEquatable<TapCapClientRequest>
    { 
        /// <summary>
        /// Gets or Sets Timestamp
        /// </summary>
        [Required]
        [DataMember(Name="timestamp")]
        public long? Timestamp { get; set; }

        /// <summary>
        /// Gets or Sets GpoData
        /// </summary>
        [Required]
        [DataMember(Name="gpoData")]
        public byte[] GpoData { get; set; }

        /// <summary>
        /// Gets or Sets CryptoData
        /// </summary>
        [Required]
        [DataMember(Name="cryptoData")]
        public byte[] CryptoData { get; set; }

        /// <summary>
        /// Gets or Sets SupplierAddress
        /// </summary>
        [Required]
        [DataMember(Name="supplierAddress")]
        public string SupplierAddress { get; set; }

        /// <summary>
        /// Gets or Sets Token
        /// </summary>
        [Required]
        [DataMember(Name="token")]
        public SignedMessage Token { get; set; }

        /// <summary>
        /// Returns the string presentation of the object
        /// </summary>
        /// <returns>String presentation of the object</returns>
        public override string ToString()
        {
            var sb = new StringBuilder();
            sb.Append("class TapCapClientRequest {\n");
            sb.Append("  Timestamp: ").Append(Timestamp).Append("\n");
            sb.Append("  GpoData: ").Append(GpoData).Append("\n");
            sb.Append("  CryptoData: ").Append(CryptoData).Append("\n");
            sb.Append("  SupplierAddress: ").Append(SupplierAddress).Append("\n");
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
        /// <param name="obj">Object to be compared</param>
        /// <returns>Boolean</returns>
        public override bool Equals(object obj)
        {
            if (obj is null) return false;
            if (ReferenceEquals(this, obj)) return true;
            return obj.GetType() == GetType() && Equals((TapCapClientRequest)obj);
        }

        /// <summary>
        /// Returns true if TapCapClientRequest instances are equal
        /// </summary>
        /// <param name="other">Instance of TapCapClientRequest to be compared</param>
        /// <returns>Boolean</returns>
        public bool Equals(TapCapClientRequest other)
        {
            if (other is null) return false;
            if (ReferenceEquals(this, other)) return true;

            return 
                (
                    Timestamp == other.Timestamp ||
                    Timestamp != null &&
                    Timestamp.Equals(other.Timestamp)
                ) && 
                (
                    GpoData == other.GpoData ||
                    GpoData != null &&
                    GpoData.Equals(other.GpoData)
                ) && 
                (
                    CryptoData == other.CryptoData ||
                    CryptoData != null &&
                    CryptoData.Equals(other.CryptoData)
                ) && 
                (
                    SupplierAddress == other.SupplierAddress ||
                    SupplierAddress != null &&
                    SupplierAddress.Equals(other.SupplierAddress)
                ) && 
                (
                    Token == other.Token ||
                    Token != null &&
                    Token.Equals(other.Token)
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
                var hashCode = 41;
                // Suitable nullity checks etc, of course :)
                    if (Timestamp != null)
                    hashCode = hashCode * 59 + Timestamp.GetHashCode();
                    if (GpoData != null)
                    hashCode = hashCode * 59 + GpoData.GetHashCode();
                    if (CryptoData != null)
                    hashCode = hashCode * 59 + CryptoData.GetHashCode();
                    if (SupplierAddress != null)
                    hashCode = hashCode * 59 + SupplierAddress.GetHashCode();
                    if (Token != null)
                    hashCode = hashCode * 59 + Token.GetHashCode();
                return hashCode;
            }
        }

        #region Operators
        #pragma warning disable 1591

        public static bool operator ==(TapCapClientRequest left, TapCapClientRequest right)
        {
            return Equals(left, right);
        }

        public static bool operator !=(TapCapClientRequest left, TapCapClientRequest right)
        {
            return !Equals(left, right);
        }

        #pragma warning restore 1591
        #endregion Operators
    }
}