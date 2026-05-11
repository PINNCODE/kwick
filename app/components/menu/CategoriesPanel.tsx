'use client';

import { useRef, useEffect } from 'react';
import { Category } from '../../types/xtream';

interface CategoriesPanelProps {
  categories: Category[];
  selectedId: string | null;
  focusedIndex: number;
  isActive: boolean;
  onSelect: (categoryId: string) => void;
}

export function CategoriesPanel({ categories, selectedId, focusedIndex, isActive, onSelect }: CategoriesPanelProps) {
  const itemRefs = useRef<HTMLButtonElement[]>([]);

  useEffect(() => {
    itemRefs.current[focusedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [focusedIndex]);

  return (
    <div 
      className={`flex flex-col h-full border-r border-gray-800 ${isActive ? 'bg-gray-800/30' : ''}`}
      style={{ flex: '0 0 25%' }}
    >
      <div className="p-4 border-b border-gray-800 flex-shrink-0">
        <h3 className="text-lg font-semibold text-white">Categorías</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {categories.map((category, index) => (
          <button
            key={category.category_id}
            ref={el => { itemRefs.current[index] = el!; }}
            onClick={() => onSelect(category.category_id)}
            className={`w-full text-left p-3 rounded-lg transition-all text-sm ${
              selectedId === category.category_id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            } ${
              focusedIndex === index ? 'ring-2 ring-blue-400' : ''
            }`}
          >
            {category.category_name}
          </button>
        ))}
      </div>
    </div>
  );
}
