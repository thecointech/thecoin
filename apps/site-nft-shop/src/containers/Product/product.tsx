import { AppContainerWithShadow } from 'components/AppContainers';
import * as React from 'react';
import styles from './styles.module.less';

export const ProductSize = {
    small:"small",
    big:"big"
}

export const Product = (product: any) => {
    const productToDisplay = product.product;
    const classToDisplay = (product.size === ProductSize.big) ? styles.big : styles.small;
    const image = (product.size === ProductSize.big) ? productToDisplay.imageBig : productToDisplay.imageSmall;
    const description = (product.size === ProductSize.big) ? productToDisplay.descriptionBig : productToDisplay.descriptionSmall;

    return (
      <React.Fragment>
        <AppContainerWithShadow>
          <div key={productToDisplay.id} className={`${styles.product} ${classToDisplay}`}>
            <img src={image} title={productToDisplay.name}/>
            <h2>{productToDisplay.name}</h2>
            <p>{description}</p>
          </div>
        </AppContainerWithShadow>
      </React.Fragment>
    );
}
