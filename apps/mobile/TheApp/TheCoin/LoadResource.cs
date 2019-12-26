using System.IO;
using Xamarin.Essentials;
using System.Threading.Tasks;

namespace TheApp.TheCoin
{
	class LoadResource
    {
        public static async Task<string> Load(string filename)
        {
			#region How to load an txt file embedded resource

			using (var stream = await FileSystem.OpenAppPackageFileAsync(filename))
			{
				using (var reader = new StreamReader(stream))
				{
					var fileContents = await reader.ReadToEndAsync();
					return fileContents;
				}
			}

			//// NOTE: use for debugging, not in released app code!
			//foreach (var res in assembly.GetManifestResourceNames()) 
   //         	System.Diagnostics.Debug.WriteLine("found resource: " + res);

   //         Stream stream = assembly.GetManifestResourceStream("TheApp.TheCoin." + filename);

   //         using (var reader = new System.IO.StreamReader(stream))
   //         {
   //             return reader.ReadToEnd();
   //         }
            #endregion
        }
    }
}
