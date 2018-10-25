using Prism;
using Prism.Ioc;
using TheApp.ViewModels;
using TheApp.Views;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;
using Prism.DryIoc;
using System.Reflection;

[assembly: XamlCompilation(XamlCompilationOptions.Compile)]
namespace TheApp
{
	public partial class App : PrismApplication
    {
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
            // Register the contract
            var assembly = typeof(App).GetTypeInfo().Assembly;
            var theContractJson = TheCoin.LoadResource.Load(assembly, "TheCoin.json");
            containerRegistry.RegisterInstance(new TheUtils.TheContract(theContractJson));
            // Register a single RatesApi object
            containerRegistry.RegisterInstance<ThePricing.Api.IRatesApi>(new ThePricing.Api.RatesApi());
			containerRegistry.RegisterInstance<TapCapManager.Client.Api.IStatusApi>(new TapCapManager.Client.Api.StatusApi("http://localhost:8091"));
			containerRegistry.RegisterInstance<TapCapManager.Client.Api.ITransactionsApi>(new TapCapManager.Client.Api.TransactionsApi("http://localhost:8091"));
			containerRegistry.RegisterInstance<TapCapSupplier.Client.Api.ITransactionApi>(new TapCapSupplier.Client.Api.TransactionApi("http://localhost:8070"));


			containerRegistry.RegisterSingleton<TheCoin.UserAccount>();
			containerRegistry.RegisterSingleton<Tap.TransactionProcessor>();

			containerRegistry.RegisterForNavigation<NavigationPage>();
            containerRegistry.RegisterForNavigation<MainPage>();
            containerRegistry.RegisterForNavigation<Connect>();
            containerRegistry.RegisterForNavigation<Scanner>();
        }
    }
}
