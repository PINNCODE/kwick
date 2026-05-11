import { render, screen, fireEvent } from '@testing-library/react';
import { CategoriesPanel } from '../../app/components/streaming-ui/CategoriesPanel';

const mockCategories = [
  { category_id: '1', category_name: 'WORLD CUP 2026', parent_id: 0, isFeatured: true },
  { category_id: '2', category_name: 'LA MANSIÓN VIP', parent_id: 0, isFeatured: true },
  { category_id: '3', category_name: 'LCDF 2026', parent_id: 0, isFeatured: false },
  { category_id: '4', category_name: 'CANALES PREMIUM', parent_id: 0, isFeatured: true },
  { category_id: '5', category_name: 'LCDFL COLOMBIA', parent_id: 0, isFeatured: false },
];

describe('CategoriesPanel - Featured Highlighting', () => {
  it('should highlight WORLD CUP 2026 as featured', () => {
    render(<CategoriesPanel categories={mockCategories} isLoading={false} selectedCategoryId={null} onCategorySelect={() => {}} />);
    const worldCupItem = screen.getByText('WORLD CUP 2026').closest('li');
    expect(worldCupItem).toHaveClass('text-blue-400');
  });

  it('should highlight LA MANSIÓN VIP as featured', () => {
    render(<CategoriesPanel categories={mockCategories} isLoading={false} selectedCategoryId={null} onCategorySelect={() => {}} />);
    const vipItem = screen.getByText('LA MANSIÓN VIP').closest('li');
    expect(vipItem).toHaveClass('text-blue-400');
  });

  it('should not highlight non-featured categories', () => {
    render(<CategoriesPanel categories={mockCategories} isLoading={false} selectedCategoryId={null} onCategorySelect={() => {}} />);
    const lcdfItem = screen.getByText('LCDF 2026').closest('li');
    expect(lcdfItem).not.toHaveClass('text-blue-400');
  });
});

describe('CategoriesPanel - Debounce Behavior', () => {
  it('should call onCategorySelect immediately on click', () => {
    const onCategorySelect = jest.fn();
    render(
      <CategoriesPanel
        categories={mockCategories}
        isLoading={false}
        selectedCategoryId={null}
        onCategorySelect={onCategorySelect}
      />
    );
    fireEvent.click(screen.getByText('WORLD CUP 2026'));
    expect(onCategorySelect).toHaveBeenCalledWith('1');
  });
});
