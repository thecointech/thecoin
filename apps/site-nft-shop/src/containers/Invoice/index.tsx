import invoices from './invoice.json'; // This import style requires "esModuleInterop", see "side notes"
import * as React from 'react';
import { Invoice, InvoiceSize } from './invoice';
import { Link } from 'react-router-dom';


function getActiveInvoices(){
  return invoices.invoices.filter( invoice => invoice.active == true );
}
//function getPendingInvoices(){
//  return invoices.invoices.filter( invoice => invoice.status === "pending" );
//}

export const InvoiceList = () => {
  const activeInvoices = getActiveInvoices();
  return (
    <>
      <div>
        {activeInvoices.map((invoice: any) => (<Link to={"/invoice/"+invoice.id}><Invoice invoice={invoice} size={InvoiceSize.small} /></Link>))}
      </div>
    </>
  );
}
