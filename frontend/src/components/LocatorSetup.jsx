'use client';

import { useEffect } from 'react';

export default function LocatorSetup() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('@locator/runtime')
        .then((module) => {
          const setupLocatorUI = module.default;
          setupLocatorUI();
        })
        .catch((err) => {
          console.warn('[LocatorJS] No se pudo inicializar runtime:', err);
        });
    }
  }, []);

  return null;
}
