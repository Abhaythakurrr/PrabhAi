
'use client';

import React from 'react';
import NextImage from 'next/image'; // Aliased import

// Define AppLogoIcon as a React component
export const AppLogoIcon = () => {
  return (
    <NextImage // Using aliased import
      src="/logo/logo.png"
      alt="PrabhAI Logo"
      width={32} // Added explicit width
      height={32} // Added explicit height
    />
  );
};
