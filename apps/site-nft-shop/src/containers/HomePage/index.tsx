import { InvoiceList } from 'containers/Invoice';
import { ProductList } from 'containers/Product';
import * as React from 'react';

export const HomePage = () => {

  return (
    <React.Fragment>
      <ProductList />
      <br />
      <InvoiceList />
    </React.Fragment>
  );
}
