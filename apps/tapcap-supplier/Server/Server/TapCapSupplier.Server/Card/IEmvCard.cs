using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TapCapSupplier.Server.Models;

namespace TapCapSupplier.Server.Card
{
	public interface IEmvCard
	{
		List<StaticResponse> CardStaticResponses();

		byte[] GenerateCrypto(TapCapRequest request);
	}
}
