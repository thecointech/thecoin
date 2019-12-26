using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.FileProviders;

namespace TapCapSupplier.Tests
{
	internal class MockHosting : Microsoft.AspNetCore.Hosting.IHostingEnvironment
	{
		private string basePath;
		internal MockHosting()
		{
			basePath = Path.GetTempPath();
		} 
		string IHostingEnvironment.EnvironmentName { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }
		string IHostingEnvironment.ApplicationName { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }
		string IHostingEnvironment.WebRootPath { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }
		IFileProvider IHostingEnvironment.WebRootFileProvider { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }
		string IHostingEnvironment.ContentRootPath { get => basePath; set => throw new NotImplementedException(); }
		IFileProvider IHostingEnvironment.ContentRootFileProvider { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }
	}
}
