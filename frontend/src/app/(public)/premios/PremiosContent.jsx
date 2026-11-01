'use client';

import React from 'react';
import Breadcrumb from '@/app/(public)/_layout/Breadcrumb';
import GasLoyalty from './GasLoyalty';
import ClubRappipuntosPremios from './ClubRappipuntosPremios';

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