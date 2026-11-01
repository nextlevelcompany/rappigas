'use client';

import React from 'react';
import Breadcrumb from '@/app/(public)/_layout/Breadcrumb';
import GasCoverage from './GasCoverage';
import GasHowItWorks from './GasHowItWorks';

const CoberturaContent = () => {
  return (
    <div>
      <Breadcrumb Title="Zonas de Cobertura y Delivery" />
      <GasCoverage />
      <GasHowItWorks />
    </div>
  );
};

export default CoberturaContent;