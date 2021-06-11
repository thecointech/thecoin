using Prism.Commands;
using Prism.Mvvm;
using System;
using System.Collections.Generic;
using System.Linq;

namespace TheApp.ViewModels
{
	public class HistoryViewModel : BindableBase
	{
		private string _DisplayName = "A History Entry";
		public string DisplayName
		{
			get { return this._DisplayName; }
			set { SetProperty(ref this._DisplayName, value); }
		}

		public HistoryViewModel()
        {

			//ObservableCollection<DB.CompletedTx> employees = new ObservableCollection<Employee>();

		}
	}
}
