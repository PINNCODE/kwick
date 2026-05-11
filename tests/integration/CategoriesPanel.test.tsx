import { render, screen, fireEvent } from '@testing-library/react';
import { CategoriesPanel } from '../../app/components/streaming-ui/CategoriesPanel';
import { useStreamingUIStore } from '../../app/store/streaming-ui-store';

const mockCategories = [
  { category_id: '1', category_name: 'WORLD CUP 2026', parent_id: 0, isFeatured: true },
  { category_id: '2', category_name: 'LA MANSIÓN VIP', parent_id: 0, isFeatured: true },
  { category_id: '3', category_name: 'LCDF 2026', parent_id: 0, isFeatured: false },
  { category_id: '4', category_name: 'CANALES PREMIUM', parent_id: 0, isFeatured: true },
];

describe('CategoriesPanel', () => {
  beforeEach(() => {
    useStreamingUIStore.setState({ selectedCategoryId: null, selectedChannelId: null });
  });

  it('should render all categories', () => {
    render(<CategoriesPanel categories={mockCategories} isLoading={false} selectedCategoryId={null} onCategorySelect={() => {}} />);
    expect(screen.getByText('WORLD CUP 2026')).toBeInTheDocument();
    expect(screen.getByText('LA MANSIÓN VIP')).toBeInTheDocument();
    expect(screen.getByText('LCDF 2026')).toBeInTheDocument();
  });

  it('should call onCategorySelect when a category is clicked', () => {
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

  it('should highlight the selected category', () => {
    render(
      <CategoriesPanel
        categories={mockCategories}
        isLoading={false}
        selectedCategoryId="2"
        onCategorySelect={() => {}}
      />
    );
    const selectedCategory = screen.getByText('LA MANSIÓN VIP').closest('button');
    expect(selectedCategory).toHaveClass('bg-blue-600');
  });

  it('should show featured categories with blue emphasis', () => {
    render(<CategoriesPanel categories={mockCategories} isLoading={false} selectedCategoryId={null} onCategorySelect={() => {}} />);
    const featuredItem = screen.getByText('WORLD CUP 2026').closest('li');
    expect(featuredItem).toHaveClass('text-blue-400');
  });

  it('should show loading indicator when isLoading is true', () => {
    render(<CategoriesPanel categories={[]} isLoading={true} selectedCategoryId={null} onCategorySelect={() => {}} />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });
});
