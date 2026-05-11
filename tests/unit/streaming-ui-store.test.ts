import { useStreamingUIStore } from '../../app/store/streaming-ui-store';

describe('streaming-ui-store', () => {
  beforeEach(() => {
    useStreamingUIStore.setState({
      selectedCategoryId: null,
      selectedChannelId: null,
    });
  });

  it('should initialize with null selections', () => {
    const state = useStreamingUIStore.getState();
    expect(state.selectedCategoryId).toBeNull();
    expect(state.selectedChannelId).toBeNull();
  });

  it('should set selected category', () => {
    useStreamingUIStore.getState().setSelectedCategory('cat-1');
    expect(useStreamingUIStore.getState().selectedCategoryId).toBe('cat-1');
  });

  it('should set selected channel', () => {
    useStreamingUIStore.getState().setSelectedChannel('ch-1');
    expect(useStreamingUIStore.getState().selectedChannelId).toBe('ch-1');
  });

  it('should reset all selections', () => {
    useStreamingUIStore.getState().setSelectedCategory('cat-1');
    useStreamingUIStore.getState().setSelectedChannel('ch-1');
    useStreamingUIStore.getState().resetSelection();
    const state = useStreamingUIStore.getState();
    expect(state.selectedCategoryId).toBeNull();
    expect(state.selectedChannelId).toBeNull();
  });

  it('should allow null category selection', () => {
    useStreamingUIStore.getState().setSelectedCategory('cat-1');
    useStreamingUIStore.getState().setSelectedCategory(null);
    expect(useStreamingUIStore.getState().selectedCategoryId).toBeNull();
  });
});
