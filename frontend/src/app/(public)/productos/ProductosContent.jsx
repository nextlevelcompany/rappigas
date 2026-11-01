'use client';

import React from 'react';
import Breadcrumb from '@/app/(public)/_layout/Breadcrumb';
import GasCatalog from './GasCatalog';
import GasPaymentMethods from './GasPaymentMethods';
import GasFaq from './GasFaq';

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