using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using TapCap.Supplier.Api;
using TapCap.Supplier.Model;

namespace TheApp.Tap
{
	internal class Supplier
	{
		private DefaultApi TapSupplier;
		private List<StaticResponse> StaticResponses;

		internal Supplier(string address)
		{
			TapSupplier = new DefaultApi(address);
			Task.Run(() => InitializeStaticResponses());
		}

		private void InitializeStaticResponses()
		{
			var supplierResponses = TapSupplier.GetStatic();
			StaticResponses = supplierResponses.Responses;
		}

		internal byte[] GetResponse(byte[] query)
		{
			foreach (var response in StaticResponses)
			{
				if (query == response.Query)
					return response.Response;
			}

			// Else, if this is a purchase PDOL, then query server

			return null;
		}
	}
}
