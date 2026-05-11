import { render, screen, fireEvent } from '@testing-library/react';
import { ChannelsPanel } from '../../app/components/streaming-ui/ChannelsPanel';
import { useStreamingUIStore } from '../../app/store/streaming-ui-store';

const mockChannels = [
  { num: 1, name: 'CP || AZTECA UNO', stream_id: '101', stream_icon: '/logos/uno.png', category_id: '1', epg_channel_id: 'epg_101' },
  { num: 2, name: 'CP || LAS ESTRELLAS', stream_id: '102', stream_icon: '/logos/estrellas.png', category_id: '1', epg_channel_id: 'epg_102' },
  { num: 3, name: 'CP || AZTECA 7', stream_id: '103', stream_icon: '/logos/azteca7.png', category_id: '1', epg_channel_id: 'epg_103' },
];

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} alt="" />,
}));

describe('ChannelsPanel', () => {
  beforeEach(() => {
    useStreamingUIStore.setState({ selectedCategoryId: null, selectedChannelId: null });
  });

  it('should render all channels with numbers and names', () => {
    render(<ChannelsPanel channels={mockChannels} isLoading={false} selectedChannelId={null} onChannelSelect={() => {}} />);
    expect(screen.getByText('CP || AZTECA UNO')).toBeInTheDocument();
    expect(screen.getByText('CP || LAS ESTRELLAS')).toBeInTheDocument();
    expect(screen.getByText('CP || AZTECA 7')).toBeInTheDocument();
  });

  it('should display channel numbers', () => {
    render(<ChannelsPanel channels={mockChannels} isLoading={false} selectedChannelId={null} onChannelSelect={() => {}} />);
    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('2.')).toBeInTheDocument();
    expect(screen.getByText('3.')).toBeInTheDocument();
  });

  it('should call onChannelSelect when a channel is clicked', () => {
    const onChannelSelect = jest.fn();
    render(
      <ChannelsPanel
        channels={mockChannels}
        isLoading={false}
        selectedChannelId={null}
        onChannelSelect={onChannelSelect}
      />
    );
    fireEvent.click(screen.getByText('CP || AZTECA UNO'));
    expect(onChannelSelect).toHaveBeenCalledWith('101');
  });

  it('should highlight the selected channel', () => {
    render(
      <ChannelsPanel
        channels={mockChannels}
        isLoading={false}
        selectedChannelId="102"
        onChannelSelect={() => {}}
      />
    );
    const selectedChannel = screen.getByText('CP || LAS ESTRELLAS').closest('button');
    expect(selectedChannel).toHaveClass('bg-blue-600/30');
  });

  it('should show empty state when no channels', () => {
    render(<ChannelsPanel channels={[]} isLoading={false} selectedChannelId={null} onChannelSelect={() => {}} />);
    expect(screen.getByText('No hay canales disponibles')).toBeInTheDocument();
  });

  it('should show loading indicator when isLoading is true', () => {
    render(<ChannelsPanel channels={[]} isLoading={true} selectedChannelId={null} onChannelSelect={() => {}} />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });
});
