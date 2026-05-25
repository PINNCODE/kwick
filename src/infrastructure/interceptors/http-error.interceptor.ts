import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { IptvApiException } from '../../core/error/iptv-api.exception';
import { ErrorCode } from '../../core/error/error-codes';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        return throwError(() => new IptvApiException(ErrorCode.NETWORK_ERROR, err.message));
      }
      return throwError(() => IptvApiException.fromHttpStatus(err.status));
    })
  );
};
