/*
 * THE TapCap supply
 *
 * The interace for TapCap between buyers & sellers.
 *
 * OpenAPI spec version: 0.1.0
 * Contact: stephen.taylor.dev@gmail.com
 */

using System;
using System.Linq;
using System.Text;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace TapCapSupplier.Models
{ 
    /// <summary>
    /// 
    /// </summary>
    public class StaticResponses
    { 
        /// <summary>
        /// Gets or Sets Address
        /// </summary>
        public string Address { get; set; }

        /// <summary>
        /// Gets or Sets GpoPdol
        /// </summary>
        public byte[] GpoPdol { get; set; }

        /// <summary>
        /// Gets or Sets CryptoPdol
        /// </summary>
        public byte[] CryptoPdol { get; set; }

        /// <summary>
        /// Gets or Sets Queries
        /// </summary>
        public List<byte[]> Queries { get; set; }

        /// <summary>
        /// Gets or Sets Responses
        /// </summary>
        public List<byte[]> Responses { get; set; }

        /// <summary>
        /// Gets or Sets ResponseParentIndex
        /// </summary>
        public List<int> ResponseParentIndex { get; set; }
    }
}
