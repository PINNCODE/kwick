import { render, screen } from '@testing-library/react';
import { LiveBadge } from '../../app/components/ui/LiveBadge';

describe('LiveBadge', () => {
  it('should render "En Vivo" text', () => {
    render(<LiveBadge />);
    expect(screen.getByText('En Vivo')).toBeInTheDocument();
  });

  it('should have red background styling', () => {
    const { container } = render(<LiveBadge />);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('bg-red-500/80');
  });

  it('should include animated pulse indicator', () => {
    const { container } = render(<LiveBadge />);
    const pulse = container.querySelector('.animate-pulse');
    expect(pulse).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<LiveBadge className="custom-class" />);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('custom-class');
  });
});
