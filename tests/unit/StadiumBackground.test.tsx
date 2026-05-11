import { render } from '@testing-library/react';
import { StadiumBackground } from '../../app/components/ui/StadiumBackground';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    return <img {...props} alt="" />;
  },
}));

describe('StadiumBackground', () => {
  it('should render with full screen dimensions', () => {
    const { container } = render(<StadiumBackground />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('h-screen');
    expect(wrapper).toHaveClass('w-full');
  });

  it('should include ambient lights overlay', () => {
    const { container } = render(<StadiumBackground />);
    const ambient = container.querySelector('.ambient-lights');
    expect(ambient).toBeInTheDocument();
  });

  it('should include gradient overlay', () => {
    const { container } = render(<StadiumBackground />);
    const gradients = container.querySelectorAll('.bg-gradient-to-b');
    expect(gradients.length).toBeGreaterThan(0);
  });

  it('should apply custom className', () => {
    const { container } = render(<StadiumBackground className="custom-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });
});
