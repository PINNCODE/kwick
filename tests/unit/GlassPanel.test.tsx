import { render, screen } from '@testing-library/react';
import { GlassPanel } from '../../app/components/ui/GlassPanel';

describe('GlassPanel', () => {
  it('should render children', () => {
    render(
      <GlassPanel>
        <span>Test Content</span>
      </GlassPanel>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render title when provided', () => {
    render(
      <GlassPanel title="Categorías">
        <span>Content</span>
      </GlassPanel>
    );
    expect(screen.getByText('Categorías')).toBeInTheDocument();
  });

  it('should not render title when not provided', () => {
    const { container } = render(
      <GlassPanel>
        <span>Content</span>
      </GlassPanel>
    );
    const headings = container.querySelectorAll('h2');
    expect(headings.length).toBe(0);
  });

  it('should apply custom className', () => {
    const { container } = render(
      <GlassPanel className="custom-class">
        <span>Content</span>
      </GlassPanel>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
