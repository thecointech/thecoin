using Prism.Commands;
using Prism.Mvvm;
using Prism.Navigation;
using System;
using System.Collections.Generic;
using System.Linq;
using Xamarin.Forms;

namespace TheApp.ViewModels
{
    public class ScannerViewModel : ViewModelBase
    {
        private bool _isAnalyzing = true;
        private bool _isScanning = true;
        public ZXing.Result Result { get; set; }

        public bool IsAnalyzing
        {
            get { return _isAnalyzing; }
            set { SetProperty(ref _isAnalyzing, value); }
        }

        public bool IsScanning
        {
            get { return _isScanning; }
            set { SetProperty(ref _isScanning, value); }
        }

        public ZXing.Mobile.MobileBarcodeScanningOptions Options
        {
            get {
                return new ZXing.Mobile.MobileBarcodeScanningOptions
                {
                    PossibleFormats = new List<ZXing.BarcodeFormat>()
                    {
                        ZXing.BarcodeFormat.QR_CODE
                    }
                };
            }
        }

        public DelegateCommand QRScanResultCommand { get; private set; }

        public ScannerViewModel(INavigationService navigationService) : base(navigationService)
        {
            QRScanResultCommand = new DelegateCommand(QRScanResult);
            IsScanning = true;
            IsAnalyzing = true;
        }

        private void QRScanResult()
        {
            IsAnalyzing = false;
            IsScanning = false;
            Device.BeginInvokeOnMainThread(async () =>
            {
                var results = new NavigationParameters("account=" + Result.Text);
                await NavigationService.GoBackAsync(results);
            });

        }

        private bool CanNavigate()
        {
            return true;
        }
    }
}
