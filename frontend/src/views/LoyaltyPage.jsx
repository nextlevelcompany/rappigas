'use client';

import React from 'react';
import Breadcrumb from '../components/Common/Breadcrumb';
import GasLoyalty from '../components/Loyalty/GasLoyalty';
import ClubRappipuntosPremios from '../components/Project/ClubRappipuntosPremios';

const LoyaltyPage = () => {
  return (
    <div>
      <Breadcrumb Title="Club de Recompensas Rappipuntos" />
      <GasLoyalty />
      <ClubRappipuntosPremios />
    </div>
  );
};

export default LoyaltyPage;
