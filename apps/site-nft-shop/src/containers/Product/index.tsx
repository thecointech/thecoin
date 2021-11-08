import products from './product.json'; // This import style requires "esModuleInterop", see "side notes"
import * as React from 'react';
import { Product, ProductSize } from './product';
import { Link } from 'react-router-dom';


function getActiveProducts(){
  return products.products.filter( product => product.active == true );
}

export const ProductList = () => {
  const activeProducts = getActiveProducts();
  return (
    <>
      <div>
        {activeProducts.map((product: any) => (<Link to={"/product/"+product.id}><Product product={product} size={ProductSize.small} /></Link>))}
      </div>
    </>
  );
}
