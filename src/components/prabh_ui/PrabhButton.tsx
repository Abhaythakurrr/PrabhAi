// src/components/prabh_ui/PrabhButton.tsx
'use client';
import React from 'react';

interface PrabhButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline'; // Example variants
}

export function PrabhButton({ children, onClick, variant = 'default', className, ...props }: PrabhButtonProps) {
  const baseStyle = "px-5 py-2.5 rounded-2xl shadow-card font-semibold hover:opacity-90 transition ease-in-out duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  let variantStyle = "";
  if (variant === 'default') {
    variantStyle = "bg-gradient-to-r from-akshu-saffron to-akshu-green text-white focus:ring-akshu-saffron";
  } else if (variant === 'outline') {
    variantStyle = "border-2 border-prabh-primary text-prabh-primary hover:bg-prabh-primary hover:text-white dark:border-dark_prabh-primary dark:text-dark_prabh-primary dark:hover:bg-dark_prabh-primary dark:hover:text-dark_prabh-text focus:ring-prabh-primary";
  }

  return (
    <button
      className={`${baseStyle} ${variantStyle} ${className || ''}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
