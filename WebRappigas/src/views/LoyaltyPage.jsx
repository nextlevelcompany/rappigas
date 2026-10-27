'use client';

import React from 'react';
import Breadcrumb from '../Components/Common/Breadcrumb';
import GasLoyalty from '../Components/Loyalty/GasLoyalty';
import ClubRappipuntosPremios from '../Components/Project/ClubRappipuntosPremios';

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
