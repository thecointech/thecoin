using Prism;
using Prism.Ioc;
using TheApp.ViewModels;
using TheApp.Views;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;
using Prism.DryIoc;
using DryIoc;
using NLog;

[assembly: XamlCompilation(XamlCompilationOptions.Compile)]
namespace TheApp
{
	public partial class App : PrismApplication
    {
		private static Logger logger = LogManager.GetCurrentClassLogger();

		/* 
         * The Xamarin Forms XAML Previewer in Visual Studio uses System.Activator.CreateInstance.
         * This imposes a limitation in which the App class must have a default constructor. 
         * App(IPlatformInitializer initializer = null) cannot be handled by the Activator.
         */
		public App() : this(null) { }

        public App(IPlatformInitializer initializer) : base(initializer) { }

        protected override async void OnInitialized()
        {
            InitializeComponent();

            await NavigationService.NavigateAsync("NavigationPage/MainPage");
        }

        protected override void RegisterTypes(IContainerRegistry containerRegistry)
        {
 			containerRegistry.RegisterSingleton<TheCoin.Balances>();

			containerRegistry.RegisterForNavigation<NavigationPage>();
            containerRegistry.RegisterForNavigation<MainPage>();
            containerRegistry.RegisterForNavigation<Connect>();
            containerRegistry.RegisterForNavigation<Scanner>();

			RegisterBackgroundServices(containerRegistry);
		}

		public static void RegisterBackgroundServices(IContainerRegistry containerRegistry)
		{
			// Register services you need in the Background Service
			containerRegistry.RegisterInstance(new TheCoin.TheContract());
			containerRegistry.RegisterInstance<ThePricing.Api.IRatesApi>(new ThePricing.Api.RatesApi());
			containerRegistry.RegisterInstance<TapCapManager.Client.Api.IStatusApi>(new TapCapManager.Client.Api.StatusApi()); // "http://192.168.0.99:8091"));
			containerRegistry.RegisterInstance<TapCapManager.Client.Api.ITransactionsApi>(new TapCapManager.Client.Api.TransactionsApi());
			containerRegistry.RegisterInstance<TapCapSupplier.Client.Api.ITransactionApi>(new TapCapSupplier.Client.Api.TransactionApi("http://thecoincad.tplinkdns.com:9361"));

			containerRegistry.RegisterSingleton<TheCoin.UserAccount>();
			containerRegistry.RegisterSingleton<Tap.TransactionProcessor>();
		}

		/// <summary>
		/// Used by 
		/// </summary>
		/// <returns></returns>
		public static IContainerProvider GetContainer()
		{
			App sthis = ((App)Application.Current);
			if (sthis.Container != null)
				return sthis.Container;

			logger.Info("Constructing new container");
			var container = new DryIocContainerExtension(new Container());
			RegisterBackgroundServices(container);
			return container;
		}
    }
}
