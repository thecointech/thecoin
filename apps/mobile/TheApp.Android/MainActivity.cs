using Android.App;
using Android.Content;
using Android.Content.PM;
using Android.Nfc;
using Android.Nfc.CardEmulators;
using Android.OS;
using NLog;
using NLog.Targets;
using Prism;
using Prism.Ioc;
using System;

namespace TheApp.Droid
{
    [Activity(Label = "TheApp", Icon = "@mipmap/ic_launcher", Theme = "@style/MainTheme", MainLauncher = true, ConfigurationChanges = ConfigChanges.ScreenSize | ConfigChanges.Orientation)]
    public class MainActivity : global::Xamarin.Forms.Platform.Android.FormsAppCompatActivity
    {

		public static LogTarget target = new LogTarget();

		protected override void OnCreate(Bundle bundle)
        {
            TabLayoutResource = Resource.Layout.Tabbar;
            ToolbarResource = Resource.Layout.Toolbar;

            base.OnCreate(bundle);

			SetupLogging();
			CheckThisIsDefault();

			Xamarin.Forms.Forms.Init(this, bundle);
            ZXing.Net.Mobile.Forms.Android.Platform.Init();
            LoadApplication(new App(new AndroidInitializer()));
        }

        public override void OnRequestPermissionsResult(int requestCode, string[] permissions, Permission[] grantResults)
        {
            ZXing.Net.Mobile.Android.PermissionsHandler.OnRequestPermissionsResult(requestCode, permissions, grantResults);
        }

		private CardEmulation GetEmulation()
		{
			var nfcAdapter = NfcAdapter.GetDefaultAdapter(ApplicationContext);
			return CardEmulation.GetInstance(nfcAdapter);
		}
		
		protected override void OnResume()
		{
			var wasSet = GetEmulation().SetPreferredService(this, ServiceName);
			base.OnResume();
		}

		protected override void OnPause()
		{
			GetEmulation().UnsetPreferredService(this);
			base.OnPause();
		}

		private void SetupLogging()
		{
			var externalFolder = GetExternalFilesDir(null);
			var config = new NLog.Config.LoggingConfiguration();

			var filename = String.Format("{0}/{1}.log", externalFolder, DateTime.Now.ToString("yyyy-MM-dd H-mm"));
			var layout = "${time}|${threadid}|${message}";
			var logfile = new FileTarget() { FileName = filename, Name = "logfile", Layout=layout };
			config.LoggingRules.Add(new NLog.Config.LoggingRule("*", LogLevel.Trace, logfile));

			target.Layout= "${time}|${message} ${exception}";
			config.LoggingRules.Add(new NLog.Config.LoggingRule("*", LogLevel.Trace, target));
			LogManager.Configuration = config;
		}

		private ComponentName ServiceName => new ComponentName(this, Java.Lang.Class.FromType(typeof(CloudHostCardService)).Name);
		private void CheckThisIsDefault()
		{
			// set default payment app
			var emulation = GetEmulation();

			var selMode = emulation.GetSelectionModeForCategory(CardEmulation.CategoryPayment);
			var aids = emulation.GetAidsForService(ServiceName, CardEmulation.CategoryPayment);
			var allowsFG = emulation.CategoryAllowsForegroundPreference(CardEmulation.CategoryPayment);

			if (!emulation.IsDefaultServiceForCategory(ServiceName, CardEmulation.CategoryPayment))
			{
				Intent intent = new Intent();
				intent.SetAction(CardEmulation.ActionChangeDefault);
				intent.PutExtra(CardEmulation.ExtraServiceComponent, ServiceName);
				intent.PutExtra(CardEmulation.ExtraCategory, CardEmulation.CategoryPayment);
				StartActivity(intent);
			}
		}
	}

    public class AndroidInitializer : IPlatformInitializer
    {
        public void RegisterTypes(IContainerRegistry container)
        {
            // Register any platform specific implementations
			container.RegisterInstance<LogTarget>(MainActivity.target);
        }
    }
}

