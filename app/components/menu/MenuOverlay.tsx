'use client';

import { ReactNode } from 'react';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function MenuOverlay({ isOpen, onClose, children }: MenuOverlayProps) {
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
      
      {/* Menu content */}
      <div className="relative z-10 w-full max-w-md h-full bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Canales</h2>
          <p className="text-sm text-gray-400 mt-1">
            Usa ↑↓ para canales, ←→ para categorías
          </p>
        </div>
        
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
        
        <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
          Presiona M o Esc para cerrar
        </div>
      </div>
    </div>
  );
}
