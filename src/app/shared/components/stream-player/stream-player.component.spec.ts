import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StreamPlayerComponent } from './stream-player.component';
import { StreamPlayerState } from './stream-player.state';
import { ErrorCode } from '../../../../core/error/error-codes';
import Hls from 'hls.js';

let mockHlsInstance: any;

vi.mock('hls.js', () => {
  mockHlsInstance = {
    loadSource: vi.fn(),
    attachMedia: vi.fn(),
    on: vi.fn(),
    destroy: vi.fn(),
  };

  function MockHls() {
    return mockHlsInstance;
  }
  (MockHls as any).isSupported = vi.fn(() => true);
  (MockHls as any).Events = {
    MANIFEST_PARSED: 'hlsManifestParsed',
    ERROR: 'hlsError',
    MEDIA_ATTACHED: 'hlsMediaAttached',
    FRAG_BUFFERED: 'hlsFragBuffered',
    BUFFER_APPENDING: 'hlsBufferAppending',
  };

  return {
    default: MockHls,
  };
});

describe('StreamPlayerComponent', () => {
  let component: StreamPlayerComponent;
  let fixture: ComponentFixture<StreamPlayerComponent>;
  let streamPlayerState: StreamPlayerState;
  let videoElement: HTMLVideoElement;
  let videoEventListeners: Record<string, (() => void)[]>;

  const testUrl = 'http://example.com/live/user/pass/123.m3u8';

  beforeEach(async () => {
    vi.clearAllMocks();

    mockHlsInstance = {
      loadSource: vi.fn(),
      attachMedia: vi.fn(),
      on: vi.fn(),
      destroy: vi.fn(),
    };

    videoEventListeners = {};

    await TestBed.configureTestingModule({
      imports: [StreamPlayerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StreamPlayerComponent);
    component = fixture.componentInstance;
    streamPlayerState = fixture.componentRef.injector.get(StreamPlayerState);

    videoElement = fixture.nativeElement.querySelector('video');

    const originalAddEventListener = videoElement.addEventListener.bind(videoElement);
    videoElement.addEventListener = (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
      if (!videoEventListeners[type]) {
        videoEventListeners[type] = [];
      }
      videoEventListeners[type].push(() => {
        if (typeof listener === 'function') {
          listener({} as Event);
        }
      });
      originalAddEventListener(type, listener, options);
    };

    fixture.componentRef.setInput('streamUrl', testUrl);
    fixture.detectChanges();
  });

  function triggerVideoEvent(event: string): void {
    const listeners = videoEventListeners[event] || [];
    listeners.forEach((listener) => listener());
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a video element', () => {
    const video = fixture.nativeElement.querySelector('video');
    expect(video).toBeTruthy();
  });

  it('should initialize state to loading on init', () => {
    expect(streamPlayerState.state()).toBe('loading');
  });

  describe('inputs', () => {
    it('should set autoplay, muted, controls on video element', async () => {
      fixture.componentRef.setInput('autoplay', true);
      fixture.componentRef.setInput('muted', true);
      fixture.componentRef.setInput('controls', true);
      fixture.detectChanges();
      await fixture.whenStable();

      const video = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
      expect(video.autoplay).toBe(true);
      expect(video.muted).toBe(true);
      expect(video.controls).toBe(true);
    });

    it('should set thumbnail as poster when provided', async () => {
      fixture.componentRef.setInput('thumbnail', 'http://example.com/thumb.jpg');
      fixture.detectChanges();
      await fixture.whenStable();

      const mediaAttachedCallback = mockHlsInstance.on.mock.calls.find(
        (call: any[]) => call[0] === 'hlsMediaAttached'
      )?.[1];

      mediaAttachedCallback();

      const video = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
      expect(video.poster).toBe('http://example.com/thumb.jpg');
    });
  });

  describe('HLS initialization', () => {
    it('should create Hls instance and load source', async () => {
      await fixture.whenStable();

      expect(mockHlsInstance.loadSource).toHaveBeenCalledWith(testUrl);
      expect(mockHlsInstance.attachMedia).toHaveBeenCalled();
    });
  });

  describe('video event listeners', () => {
    it('should emit playing state on video play event', () => {
      triggerVideoEvent('play');
      expect(streamPlayerState.state()).toBe('playing');
    });

    it('should emit paused state on video pause event', () => {
      triggerVideoEvent('pause');
      expect(streamPlayerState.state()).toBe('paused');
    });

    it('should emit waiting state on video waiting event', () => {
      triggerVideoEvent('waiting');
      expect(streamPlayerState.state()).toBe('waiting');
    });

    it('should emit playing state on video playing event', () => {
      triggerVideoEvent('playing');
      expect(streamPlayerState.state()).toBe('playing');
    });
  });

  describe('buffering state', () => {
    it('should emit waiting state on BUFFER_APPENDING', async () => {
      await fixture.whenStable();

      const bufferCallback = mockHlsInstance.on.mock.calls.find(
        (call: any[]) => call[0] === 'hlsBufferAppending'
      )?.[1];

      bufferCallback();

      expect(streamPlayerState.state()).toBe('waiting');
    });

    it('should emit playing state on FRAG_BUFFERED', async () => {
      await fixture.whenStable();

      const fragCallback = mockHlsInstance.on.mock.calls.find(
        (call: any[]) => call[0] === 'hlsFragBuffered'
      )?.[1];

      fragCallback();

      expect(streamPlayerState.state()).toBe('playing');
    });
  });

  describe('error handling', () => {
    it('should emit error with correlationId on HLS error', async () => {
      await fixture.whenStable();

      const errorCallback = mockHlsInstance.on.mock.calls.find(
        (call: any[]) => call[0] === 'hlsError'
      )?.[1];

      const errorData = { details: 'manifestLoadError' };
      errorCallback({}, errorData);

      expect(streamPlayerState.state()).toBe('error');
      expect(streamPlayerState.error()).toEqual(
        expect.objectContaining({
          code: ErrorCode.PLAYER_ERROR,
          correlationId: expect.stringMatching(/^[0-9a-f-]+$/),
        })
      );
    });
  });

  describe('cleanup', () => {
    it('should destroy Hls instance on destroy', () => {
      component.ngOnDestroy();
      expect(mockHlsInstance.destroy).toHaveBeenCalled();
    });

    it('should reset state on destroy', () => {
      component.ngOnDestroy();
      expect(streamPlayerState.state()).toBe('idle');
      expect(streamPlayerState.error()).toBeNull();
    });
  });
});
