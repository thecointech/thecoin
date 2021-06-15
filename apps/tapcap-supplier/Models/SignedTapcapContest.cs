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
using System.Text;
using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace TapCapSupplier.Models
{
    /// <summary>
    ///
    /// </summary>
    public class SignedTapcapContest
    {
        /// <summary>
        /// Gets or Sets Timestamp
        /// </summary>
        public long? Timestamp { get; set; }

        /// <summary>
        /// Gets or Sets FiatAmount
        /// </summary>
        public double? FiatAmount { get; set; }

        /// <summary>
        /// Gets or Sets Pdol
        /// </summary>
        [Required]
        public byte[] Pdol { get; set; }

        /// <summary>
        /// Gets or Sets Token
        /// </summary>
        [Required]
        public SignedMessage Token { get; set; }

        /// <summary>
        /// Gets or Sets Signature
        /// </summary>
        [Required]
        public string Signature { get; set; }
    }
}
