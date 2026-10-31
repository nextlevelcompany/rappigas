'use client';

import React from 'react';
import Breadcrumb from '@/components/Common/Breadcrumb';
import GasCoverage from '@/components/Coverage/GasCoverage';
import GasHowItWorks from '@/components/HowWork/GasHowItWorks';

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