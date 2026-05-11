import { render, screen, fireEvent } from '@testing-library/react';
import { ProgramGuidePanel } from '../../app/components/streaming-ui/ProgramGuidePanel';

const mockPrograms = [
  { id: '1', title: 'RTC', start: '1715364780', end: '1715379000', isLive: true },
  { id: '2', title: 'Inova', start: '1715364780', end: '1715382000', isLive: false },
];

describe('ProgramGuidePanel', () => {
  it('should render programs with time ranges', () => {
    render(
      <ProgramGuidePanel
        programs={mockPrograms}
        isLoading={false}
        error={null}
        onRetry={() => {}}
      />
    );
    expect(screen.getByText('RTC')).toBeInTheDocument();
    expect(screen.getByText('Inova')).toBeInTheDocument();
  });

  it('should display "En Vivo" badge for live programs', () => {
    const now = Math.floor(Date.now() / 1000);
    const livePrograms = [
      { id: '1', title: 'RTC', start: String(now - 3600), end: String(now + 3600), isLive: true },
    ];
    render(
      <ProgramGuidePanel
        programs={livePrograms}
        isLoading={false}
        error={null}
        onRetry={() => {}}
      />
    );
    expect(screen.getByText('En Vivo')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(
      <ProgramGuidePanel
        programs={[]}
        isLoading={true}
        error={null}
        onRetry={() => {}}
      />
    );
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('should show error state with retry button', () => {
    render(
      <ProgramGuidePanel
        programs={[]}
        isLoading={false}
        error={new Error('Failed')}
        onRetry={jest.fn()}
      />
    );
    expect(
      screen.getByText('Información del programa temporalmente no disponible')
    ).toBeInTheDocument();
    expect(screen.getByText('Reintentar')).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', () => {
    const onRetry = jest.fn();
    render(
      <ProgramGuidePanel
        programs={[]}
        isLoading={false}
        error={new Error('Failed')}
        onRetry={onRetry}
      />
    );
    fireEvent.click(screen.getByText('Reintentar'));
    expect(onRetry).toHaveBeenCalled();
  });

  it('should show empty state when no programs', () => {
    render(
      <ProgramGuidePanel
        programs={[]}
        isLoading={false}
        error={null}
        onRetry={() => {}}
      />
    );
    expect(screen.getByText('Sin programación disponible')).toBeInTheDocument();
  });
});
