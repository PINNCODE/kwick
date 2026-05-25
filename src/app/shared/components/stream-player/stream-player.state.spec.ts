import { TestBed } from '@angular/core/testing';
import { StreamPlayerState, PlayerState } from './stream-player.state';
import { ErrorCode } from '../../../../core/error/error-codes';

describe('StreamPlayerState', () => {
  let service: StreamPlayerState;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StreamPlayerState],
    });
    service = TestBed.inject(StreamPlayerState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with idle state and null error', () => {
    expect(service.state()).toBe('idle');
    expect(service.error()).toBeNull();
  });

  describe('setState', () => {
    it('should update state signal', () => {
      service.setState('loading');
      expect(service.state()).toBe('loading');
    });

    it('should not affect error signal', () => {
      service.setState('playing');
      expect(service.error()).toBeNull();
    });
  });

  describe('setError', () => {
    it('should set error signal with correlationId', () => {
      const playerError = {
        code: ErrorCode.PLAYER_ERROR,
        message: 'Test error',
        correlationId: 'test-123',
      };
      service.setError(playerError);

      expect(service.error()).toEqual(playerError);
      expect(service.state()).toBe('error');
    });

    it('should set state to error', () => {
      service.setError({
        code: ErrorCode.PLAYER_ERROR,
        message: 'Test',
        correlationId: 'test',
      });
      expect(service.state()).toBe('error');
    });
  });

  describe('reset', () => {
    it('should return state to idle and clear error', () => {
      service.setState('playing');
      service.setError({
        code: ErrorCode.PLAYER_ERROR,
        message: 'Test',
        correlationId: 'test',
      });

      service.reset();

      expect(service.state()).toBe('idle');
      expect(service.error()).toBeNull();
    });
  });
});
