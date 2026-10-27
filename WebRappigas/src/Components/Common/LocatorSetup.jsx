'use client';

import { useEffect } from 'react';

export default function LocatorSetup() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('@locator/runtime').then((module) => {
        const setupLocatorUI = module.default;
        if (typeof setupLocatorUI === 'function') {
          setupLocatorUI({
            adapter: 'jsx',
          });
        }
      });
    }
  }, []);

  return null;
}
