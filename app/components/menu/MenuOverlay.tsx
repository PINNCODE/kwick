'use client';

import { ReactNode } from 'react';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  activePanel: number;
  children: ReactNode;
}

export function MenuOverlay({ isOpen, onClose, activePanel, children }: MenuOverlayProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/70" />
      
      {/* Menu content - full width with 3 panels */}
      <div className="relative z-10 w-screen h-full bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 flex overflow-hidden">
        {children}
      </div>
      
      <div className="absolute bottom-4 left-4 text-xs text-gray-500 z-20">
        <p>Panel {activePanel + 1} de 3</p>
        <p>←→ para navegar, ↑↓ para items, Enter para seleccionar</p>
      </div>
    </div>
  );
}
