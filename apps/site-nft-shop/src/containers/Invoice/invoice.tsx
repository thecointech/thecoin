import { AppContainerWithShadow } from 'components/AppContainers';
import { Product, ProductSize } from 'containers/Product/product';
import * as React from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.less';

export const InvoiceSize = {
    small:"small",
    big:"big"
}

export const Invoice = (invoice: any) => {
    const invoiceToDisplay = invoice.invoice;
    const classToDisplay = (invoice.size === InvoiceSize.big) ? styles.big : styles.small;

    return (
      <React.Fragment>
        <AppContainerWithShadow>
          <div key={invoiceToDisplay.id} className={`${styles.product} ${classToDisplay}`}>
            <h2>#{invoiceToDisplay.id}</h2>
            <p>{invoiceToDisplay.status}</p>
            <p>{invoiceToDisplay.datetimeCreation}</p>
            {invoiceToDisplay.invoiceLines.map((invoiceLine: any) => 
              (<div>
                {invoiceLine.quantity}{" x "+(Math.round(invoiceLine.unitPrice) / 100).toFixed(2)}
                <Link to={"/product/"+invoiceLine.product.id}>
                  <Product product={invoiceLine.product} size={ProductSize.small} />
                </Link>
              </div>))}
          </div>
        </AppContainerWithShadow>
      </React.Fragment>
    );
}
