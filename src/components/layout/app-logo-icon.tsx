
'use client';

import React from 'react';
import Image from 'next/image'; // Aliased import

export const AppLogoIcon = () => {
  return (
    <Image
      src="/logo/logo.png"
      alt="PrabhAI Logo"
      width={32}
      height={32}
    />
  );
};
