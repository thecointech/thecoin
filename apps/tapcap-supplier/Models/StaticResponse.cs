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
    public class StaticResponse 
    { 
        /// <summary>
        /// Gets or Sets Response
        /// </summary>
        public byte[] Response { get; set; }
    }
}
