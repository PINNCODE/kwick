'use client';

import { GlassPanel } from '../ui/GlassPanel';
import { Category } from '../../types/streaming';
import { cn } from '../../lib/utils';

interface CategoriesPanelProps {
  categories: Category[];
  selectedCategoryId: string | null;
  isLoading: boolean;
  onCategorySelect: (categoryId: string) => void;
}

const FEATURED_KEYWORDS = ['WORLD CUP', 'PREMIUM', 'VIP', 'MANSIÓN'];

function isFeatured(category: Category): boolean {
  return FEATURED_KEYWORDS.some((keyword) =>
    category.category_name.toUpperCase().includes(keyword)
  );
}

export function CategoriesPanel({
  categories,
  selectedCategoryId,
  isLoading,
  onCategorySelect,
}: CategoriesPanelProps) {
  if (isLoading) {
    return (
      <GlassPanel title="Categorías" className="w-64 h-full">
        <div className="flex items-center justify-center py-8">
          <div className="text-blue-400 text-sm">Cargando...</div>
        </div>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel title="Categorías" className="w-64 h-full">
      <ul className="space-y-1 max-h-full overflow-y-auto scrollbar-hide">
        {categories.map((category) => {
          const featured = isFeatured(category);
          const isSelected = category.category_id === selectedCategoryId;

          return (
            <li
              key={category.category_id}
              className={cn(
                'rounded-lg transition-colors duration-150',
                featured && 'text-blue-400',
                !featured && !isSelected && 'text-gray-300'
              )}
            >
              <button
                onClick={() => onCategorySelect(category.category_id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm',
                  'hover:bg-white/10 transition-colors duration-150',
                  isSelected && 'bg-blue-600 text-white',
                  !isSelected && featured && 'hover:text-blue-300'
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="text-xs opacity-60">TV</span>
                  {category.category_name}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </GlassPanel>
  );
}
