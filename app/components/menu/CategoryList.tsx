'use client';

import { Category } from '../../types/xtream';

interface CategoryListProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryList({
  categories,
  activeCategoryId,
  onSelectCategory,
}: CategoryListProps) {
  return (
    <div className="border-b border-gray-800">
      <div className="flex overflow-x-auto scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.category_id}
            onClick={() => onSelectCategory(category.category_id)}
            className={`
              px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors
              ${
                activeCategoryId === category.category_id
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }
            `}
          >
            {category.category_name}
          </button>
        ))}
      </div>
    </div>
  );
}
