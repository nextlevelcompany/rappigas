'use client';

import React from 'react';
import Breadcrumb from '@/components/Common/Breadcrumb';
import GasLoyalty from '@/components/Loyalty/GasLoyalty';
import ClubRappipuntosPremios from '@/components/Project/ClubRappipuntosPremios';

const PremiosContent = () => {
  return (
    <div>
      <Breadcrumb Title="Club de Premios y Recompensas" />
      <GasLoyalty />
      <ClubRappipuntosPremios />
    </div>
  );
};

export default PremiosContent;