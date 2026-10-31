'use client';

import React from 'react';
import Breadcrumb from '@/components/Common/Breadcrumb';
import GasCatalog from '@/components/Products/GasCatalog';
import GasPaymentMethods from '@/components/PaymentMethods/GasPaymentMethods';
import GasFaq from '@/components/Faq/GasFaq';

const ProductosContent = () => {
  return (
    <div>
      <Breadcrumb Title="Catálogo de Gas de Cocina" />
      <GasCatalog />
      <GasPaymentMethods />
      <GasFaq />
    </div>
  );
};

export default ProductosContent;