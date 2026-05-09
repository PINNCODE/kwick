import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export interface SectionProps {
  children: ReactNode;
  variant?: 'default' | 'dark' | 'gradient';
  className?: string;
  id?: string;
}

export function Section({ children, variant = 'default', className, id }: SectionProps) {
  const variantStyles = {
    default: 'bg-black',
    dark: 'bg-gray-900',
    gradient: 'bg-gradient-to-b from-black to-gray-900',
  };

  return (
    <section
      id={id}
      className={cn(
        'w-full py-12 sm:py-16 lg:py-24',
        variantStyles[variant],
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {children}
      </div>
    </section>
  );
}
