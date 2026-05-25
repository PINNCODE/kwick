import { ErrorCode } from './error-codes';

export class IptvApiException extends Error {
  readonly code: ErrorCode;
  readonly timestamp: number;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'IptvApiException';
    this.code = code;
    this.timestamp = Date.now();
  }

  static fromHttpStatus(status: number): IptvApiException {
    switch (status) {
      case 0:
        return new IptvApiException(ErrorCode.NETWORK_ERROR, 'Network connectivity error');
      case 401:
      case 403:
        return new IptvApiException(ErrorCode.AUTH_FAILED, 'Authentication failed');
      case 404:
        return new IptvApiException(ErrorCode.AUTH_FAILED, 'Resource not found');
      case 500:
      case 502:
      case 503:
        return new IptvApiException(ErrorCode.SERVER_ERROR, 'Server error');
      default:
        return new IptvApiException(ErrorCode.NETWORK_ERROR, `HTTP error: ${status}`);
    }
  }
}
