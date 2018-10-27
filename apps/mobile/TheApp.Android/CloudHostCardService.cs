using System;
using Android.App;
using Android.Content;
using Android.Nfc.CardEmulators;
using Android.OS;
using NLog;

namespace TheApp.Droid
{
    [Service(Exported = true,
        Name = "com.TheCoinTech.TheWallet.CloudHostApduService",
        Permission = "android.permission.BIND_NFC_SERVICE")]
    [IntentFilter(new[] { "android.nfc.cardemulation.action.HOST_APDU_SERVICE" })]
    [MetaData("android.nfc.cardemulation.host_apdu_service", Resource = "@xml/apduservice")]
    class CloudHostCardService : HostApduService
    {
        private Logger logger = LogManager.GetCurrentClassLogger();
		private App _app => (App)Xamarin.Forms.Application.Current;
		private Tap.TransactionProcessor processor;

        public CloudHostCardService()
        {
			logger.Trace("Start Service");

			var type = typeof(Tap.TransactionProcessor);
			processor = (Tap.TransactionProcessor)_app.Container.Resolve(type);
		}

        public override void OnDeactivated(DeactivationReason reason)
        {
			processor.Terminated();

            Android.Media.Stream amStream = Android.Media.Stream.Music;
            int iTonGeneratorVolume = 100;

            var toneG = new Android.Media.ToneGenerator(amStream, iTonGeneratorVolume);
            toneG.StartTone(Android.Media.Tone.PropBeep);
        }

        // When our service is started up, we ensure we have a communications channel open
        public override void OnCreate()
        {
            logger.Info("OnCreate");
            base.OnCreate();
        }

        // Entry point for Android API
        public override byte[] ProcessCommandApdu(byte[] commandApdu, Bundle extras)
        {
            // Log all messages passing here (from a terminal)
            logger.Debug("Received APDU");
            logger.Trace(BitConverter.ToString(commandApdu));
            var response = processor.ProcessCommand(commandApdu);
            logger.Debug("Response");
            logger.Trace(BitConverter.ToString(response));
            return response;
        }

        public override void OnDestroy()
        {
            logger.Trace("OnDestroy");
        }
    }
}
