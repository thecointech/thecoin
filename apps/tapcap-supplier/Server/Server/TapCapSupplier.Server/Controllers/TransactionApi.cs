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
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using Swashbuckle.AspNetCore.SwaggerGen;
using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;
using TapCapSupplier.Server.Attributes;
using TapCapSupplier.Server.Models;

namespace TapCapSupplier.Server.Controllers
{ 
    /// <summary>
    /// 
    /// </summary>
    public class TransactionApiController : ControllerBase
    { 
        /// <summary>
        /// Notify of a contested transaction
        /// </summary>
        /// <remarks>Notify supplier that the client will contest the passed transaction.  This is not necessary, a supplier should auotomatically undo any incompelete transactions, but it is a courtesy to the supplier</remarks>
        /// <param name="signedTapcapContest">TapCap exchange request</param>
        /// <response code="200">Server status</response>
        /// <response code="405">Invalid input</response>
        [HttpPost]
        [Route("/contest")]
        [ValidateModelState]
        [SwaggerOperation("ContestTapCap")]
        [SwaggerResponse(statusCode: 200, type: typeof(ContestResponse), description: "Server status")]
        public virtual IActionResult ContestTapCap([FromBody]SignedTapcapContest signedTapcapContest)
        { 
            //TODO: Uncomment the next line to return response 200 or use other options such as return this.NotFound(), return this.BadRequest(..), ...
            // return StatusCode(200, default(ContestResponse));

            //TODO: Uncomment the next line to return response 405 or use other options such as return this.NotFound(), return this.BadRequest(..), ...
            // return StatusCode(405);

            string exampleJson = null;
            exampleJson = "{\r\n  \"code\" : 0\r\n}";
            
            var example = exampleJson != null
            ? JsonConvert.DeserializeObject<ContestResponse>(exampleJson)
            : default(ContestResponse);
            //TODO: Change the data returned
            return new ObjectResult(example);
        }

        /// <summary>
        /// Get the list of static responses to cache for terminal queries
        /// </summary>
        /// <param name="signedMessage">Static data request</param>
        /// <response code="200">Static response cache</response>
        /// <response code="405">Invalid input</response>
        [HttpPost]
        [Route("/static")]
        [ValidateModelState]
        [SwaggerOperation("GetStatic")]
        [SwaggerResponse(statusCode: 200, type: typeof(StaticResponses), description: "Static response cache")]
        [SwaggerResponse(statusCode: 405, type: typeof(ErrorMessage), description: "Invalid input")]
        public virtual IActionResult GetStatic([FromBody]SignedMessage signedMessage)
        { 
            //TODO: Uncomment the next line to return response 200 or use other options such as return this.NotFound(), return this.BadRequest(..), ...
            // return StatusCode(200, default(StaticResponses));

            //TODO: Uncomment the next line to return response 405 or use other options such as return this.NotFound(), return this.BadRequest(..), ...
            // return StatusCode(405, default(ErrorMessage));

            string exampleJson = null;
            exampleJson = "{\r\n  \"address\" : \"address\",\r\n  \"responseParentIndex\" : [ 0, 0 ],\r\n  \"gpoPdol\" : \"gpoPdol\",\r\n  \"responses\" : [ \"responses\", \"responses\" ],\r\n  \"queries\" : [ \"queries\", \"queries\" ],\r\n  \"cryptoPdol\" : \"cryptoPdol\"\r\n}";
            
            var example = exampleJson != null
            ? JsonConvert.DeserializeObject<StaticResponses>(exampleJson)
            : default(StaticResponses);
            //TODO: Change the data returned
            return new ObjectResult(example);
        }

        /// <summary>
        /// Query the server for a single message if it is unknown
        /// </summary>
        /// <param name="queryWithHistory">Static data request</param>
        /// <response code="200">Static response cache</response>
        /// <response code="405">Invalid input</response>
        [HttpPost]
        [Route("/static/single")]
        [ValidateModelState]
        [SwaggerOperation("GetStaticSingle")]
        [SwaggerResponse(statusCode: 200, type: typeof(StaticResponse), description: "Static response cache")]
        [SwaggerResponse(statusCode: 405, type: typeof(ErrorMessage), description: "Invalid input")]
        public virtual IActionResult GetStaticSingle([FromBody]QueryWithHistory queryWithHistory)
        { 
            //TODO: Uncomment the next line to return response 200 or use other options such as return this.NotFound(), return this.BadRequest(..), ...
            // return StatusCode(200, default(StaticResponse));

            //TODO: Uncomment the next line to return response 405 or use other options such as return this.NotFound(), return this.BadRequest(..), ...
            // return StatusCode(405, default(ErrorMessage));

            string exampleJson = null;
            exampleJson = "{\r\n  \"response\" : \"response\"\r\n}";
            
            var example = exampleJson != null
            ? JsonConvert.DeserializeObject<StaticResponse>(exampleJson)
            : default(StaticResponse);
            //TODO: Change the data returned
            return new ObjectResult(example);
        }

        /// <summary>
        /// Request TapCap transaction
        /// </summary>
        /// <remarks>This is sent in response to a terminal request.  The supplier is expected to return a valid certificate to pass to the terminal</remarks>
        /// <param name="signedMessage">TapCap exchange request</param>
        /// <response code="200">Info required to complete the transaction, including coin charged, and the data to be returned to the teriminal</response>
        /// <response code="405">Invalid input</response>
        [HttpPost]
        [Route("/tap")]
        [ValidateModelState]
        [SwaggerOperation("RequestTapCap")]
        [SwaggerResponse(statusCode: 200, type: typeof(SignedMessage), description: "Info required to complete the transaction, including coin charged, and the data to be returned to the teriminal")]
        [SwaggerResponse(statusCode: 405, type: typeof(ErrorMessage), description: "Invalid input")]
        public virtual IActionResult RequestTapCap([FromBody]SignedMessage signedMessage)
        { 
            //TODO: Uncomment the next line to return response 200 or use other options such as return this.NotFound(), return this.BadRequest(..), ...
            // return StatusCode(200, default(SignedMessage));

            //TODO: Uncomment the next line to return response 405 or use other options such as return this.NotFound(), return this.BadRequest(..), ...
            // return StatusCode(405, default(ErrorMessage));

            string exampleJson = null;
            exampleJson = "{\r\n  \"signature\" : \"signature\",\r\n  \"message\" : \"message\"\r\n}";
            
            var example = exampleJson != null
            ? JsonConvert.DeserializeObject<SignedMessage>(exampleJson)
            : default(SignedMessage);
            //TODO: Change the data returned
            return new ObjectResult(example);
        }
    }
}