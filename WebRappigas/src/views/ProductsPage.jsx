'use client';

import React from 'react';
import Breadcrumb from '../Components/Common/Breadcrumb';
import GasCatalog from '../Components/Products/GasCatalog';
import GasPaymentMethods from '../Components/PaymentMethods/GasPaymentMethods';
import GasFaq from '../Components/Faq/GasFaq';

const ProductsPage = () => {
  return (
    <div>
      <Breadcrumb Title="Catálogo de Gas de Cocina" />
      <GasCatalog />
      <GasPaymentMethods />
      <GasFaq />
    </div>
  );
};

export default ProductsPage;
