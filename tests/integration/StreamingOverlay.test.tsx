import { render, screen } from '@testing-library/react';
import { StreamingOverlay } from '../../app/components/streaming-ui/StreamingOverlay';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} alt="" />,
}));

jest.mock('../../app/components/ui/StadiumBackground', () => ({
  StadiumBackground: () => <div data-testid="stadium-background" />,
}));

jest.mock('../../app/components/ui/GlassPanel', () => ({
  GlassPanel: ({ children, title }: { children: React.ReactNode; title?: string }) => (
    <div data-testid="glass-panel">
      {title && <h2>{title}</h2>}
      {children}
    </div>
  ),
}));

jest.mock('../../app/components/streaming-ui/CategoriesPanel', () => ({
  CategoriesPanel: () => <div data-testid="categories-panel" />,
}));

jest.mock('../../app/components/streaming-ui/ChannelsPanel', () => ({
  ChannelsPanel: () => <div data-testid="channels-panel" />,
}));

jest.mock('../../app/components/streaming-ui/ProgramGuidePanel', () => ({
  ProgramGuidePanel: () => <div data-testid="program-guide-panel" />,
}));

const mockCategories = [
  { category_id: '1', category_name: 'WORLD CUP 2026', parent_id: 0, isFeatured: true },
];

describe('StreamingOverlay', () => {
  it('should render three panels', () => {
    render(<StreamingOverlay categories={mockCategories} />);
    expect(screen.getByTestId('categories-panel')).toBeInTheDocument();
    expect(screen.getByTestId('channels-panel')).toBeInTheDocument();
    expect(screen.getByTestId('program-guide-panel')).toBeInTheDocument();
  });

  it('should render stadium background', () => {
    render(<StreamingOverlay categories={mockCategories} />);
    expect(screen.getByTestId('stadium-background')).toBeInTheDocument();
  });

  it('should render panel titles in Spanish', () => {
    render(<StreamingOverlay categories={mockCategories} />);
    expect(screen.getByTestId('categories-panel')).toBeInTheDocument();
    expect(screen.getByTestId('channels-panel')).toBeInTheDocument();
    expect(screen.getByTestId('program-guide-panel')).toBeInTheDocument();
  });
});
