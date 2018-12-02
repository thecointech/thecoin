using System;
using System.Collections.Generic;
using System.Text;

namespace TheBankAPI
{
	public class Transaction
	{
		public DateTime Date { get; set; }
		public string Desc { get; set; }
		public uint Withdrawal { get; set; }
		public uint Deposit { get; set; }
		public uint Balance { get; set; }
		public override string ToString() => $"Date: {Date} Amt: {((int)Deposit - (int)Withdrawal) / 100.0}\t Balance: {Balance}\t Desc: {Desc} ";
	}
}
