using System;
using Xamarin.Forms;
using System.Reflection;
using System.IO;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace TheApp.TheCoin
{
    class LoadResource
    {
        public static string Load(Assembly assembly, string filename)
        {
            #region How to load an txt file embedded resource

            // NOTE: use for debugging, not in released app code!
            foreach (var res in assembly.GetManifestResourceNames()) 
            	System.Diagnostics.Debug.WriteLine("found resource: " + res);

            Stream stream = assembly.GetManifestResourceStream("TheApp.TheCoin." + filename);

            using (var reader = new System.IO.StreamReader(stream))
            {
                return reader.ReadToEnd();
            }
            #endregion
        }
    }
}
