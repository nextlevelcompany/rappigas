'use client';

import React from 'react';
import Breadcrumb from '../Components/Common/Breadcrumb';
import GasCoverage from '../Components/Coverage/GasCoverage';
import GasHowItWorks from '../Components/HowWork/GasHowItWorks';

const CoveragePage = () => {
  return (
    <div>
      <Breadcrumb Title="Zonas de Cobertura y Delivery" />
      <GasCoverage />
      <GasHowItWorks />
    </div>
  );
};

export default CoveragePage;
