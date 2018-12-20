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
using System.IO;
using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using Swashbuckle.AspNetCore.Swagger;
using Swashbuckle.AspNetCore.SwaggerGen;
using TapCapSupplier.Server.Filters;

using TapCapSupplier.Server.Card;
using ThePricing.Api;
using TapCapSupplier.Server.TapCap;
using Nethereum.Web3.Accounts;
using TapCapManager.Client.Api;
using TheBankAPI;
using Microsoft.Extensions.Logging;

namespace TapCapSupplier.Server
{
	/// <summary>
	/// Startup
	/// </summary>
	public class Startup
	{
		/// <summary>
		/// Constructor
		/// </summary>
		/// <param name="configuration"></param>
		public Startup(IConfiguration configuration)
		{
			Configuration = configuration;
		}

		/// <summary>
		/// The application configuration.
		/// </summary>
		public IConfiguration Configuration { get; }

		/// <summary>
		/// This method gets called by the runtime. Use this method to add services to the container.
		/// </summary>
		/// <param name="services"></param>
		public void ConfigureServices(IServiceCollection services)
		{
			services.AddCors();

			// Add framework services.
			services
				.AddMvc()
				.SetCompatibilityVersion(CompatibilityVersion.Version_2_1)
				.AddJsonOptions(opts =>
				{
					opts.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
					opts.SerializerSettings.Converters.Add(new StringEnumConverter
					{
						CamelCaseText = true
					});
				});

			services
				.AddSwaggerGen(c =>
				{
					c.SwaggerDoc("0.1.0", new Info
					{
						Version = "0.1.0",
						Title = "THE TapCap supply",
						Description = "THE TapCap supply (ASP.NET Core 2.0)",
						Contact = new Contact()
						{
							Name = "OpenAPI-Generator Contributors",
							Url = "https://github.com/openapitools/openapi-generator",
							Email = "stephen.taylor.dev@gmail.com"
						},
						TermsOfService = ""
					});
					c.CustomSchemaIds(type => type.FriendlyId(true));
					c.DescribeAllEnumsAsStrings();
					c.IncludeXmlComments($"{AppContext.BaseDirectory}{Path.DirectorySeparatorChar}{Assembly.GetEntryAssembly().GetName().Name}.xml");

					// Include DataAnnotation attributes on Controller Action parameters as Swagger validation rules (e.g required, pattern, ..)
					// Use [ValidateModelState] on Actions to actually validate it in C# as well!
					c.OperationFilter<GeneratePathParamsValidationFilter>();
				});

			services.AddSingleton(AccountFactory.Load);
			services.AddSingleton<IEmvCard, EmvCard>();
			services.AddTransient<IRatesApi, RatesApi>();
			services.AddTransient<ITransactionsApi, TransactionsApi>(); // sp => new TransactionsApi("http://localhost:8091"));

			services.AddSingleton<ITransactionVerifier, TransactionVerifier>(sp =>
				new TransactionVerifier(
					sp.GetService<ILogger<ITransactionVerifier>>(),
					Utils.Utils.GetDataPath(sp.GetService<IHostingEnvironment>())
				)
			);

			services.AddSingleton<HandleTx>();
			services.AddSingleton<ExchangeRateService>();
			services.AddHostedService<ExchangeRateUpdateService>();
		}

		/// <summary>
		/// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
		/// </summary>
		/// <param name="app"></param>
		/// <param name="env"></param>
		public void Configure(IApplicationBuilder app, IHostingEnvironment env)
		{
			// TODO: Least-privileges for headers etc
			app.UseCors(builder =>
				builder
					.AllowAnyOrigin()
					.AllowAnyMethod()
					.AllowAnyHeader()
			);

			//app.UseHttpsRedirection();
			app
				.UseMvc()
				.UseDefaultFiles()
				.UseStaticFiles()
				.UseSwagger(c =>
				{
					c.RouteTemplate = "swagger/{documentName}/openapi.json";
				})
				.UseSwaggerUI(c =>
				{
					//TODO: Either use the SwaggerGen generated Swagger contract (generated from C# classes)
					c.SwaggerEndpoint("/swagger/0.1.0/openapi.json", "THE TapCap supply");

					//TODO: Or alternatively use the original Swagger contract that's included in the static files
					// c.SwaggerEndpoint("/openapi-original.json", "THE TapCap supply Original");
				});

			if (env.IsDevelopment())
			{
				app.UseDeveloperExceptionPage();
			}
			else
			{
				app.UseHsts();
			}

			// Warm up some necessary services
			app.ApplicationServices.GetService<ITransactionVerifier>();
			app.ApplicationServices.GetService<Account>();
		}
	}
}
