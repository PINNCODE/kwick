'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50';
    
    const variantStyles = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500',
      secondary: 'bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-600 focus:ring-gray-500 border border-gray-700',
      ghost: 'bg-transparent text-white hover:bg-gray-800 active:bg-gray-700 focus:ring-gray-500',
    };
    
    const sizeStyles = {
      sm: 'px-4 py-2 text-sm min-h-[36px] min-w-[36px]',
      md: 'px-6 py-3 text-base min-h-[44px] min-w-[44px]',
      lg: 'px-8 py-4 text-lg min-h-[48px] min-w-[48px]',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
