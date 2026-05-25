import { Observable, throwError } from 'rxjs';
import { Category } from '../../domain/entities/category.entity';
import { IptvApiPort } from '../../ports/outbound/iptv-api.port';
import { IptvApiException } from '../../error/iptv-api.exception';
import { ErrorCode } from '../../error/error-codes';

export type GetCategoriesInput = void;

export type GetCategoriesOutput = Category[];

export type GetCategoriesError = IptvApiException;

export class GetCategoriesUseCase {
  constructor(
    private readonly apiPort: IptvApiPort,
    private readonly getAuthToken: () => string | null,
    private readonly getHost: () => string | null
  ) {}

  execute(): Observable<Category[]> {
    const host = this.getHost();
    const authToken = this.getAuthToken();

    if (!host || !authToken) {
      return throwError(() => new IptvApiException(ErrorCode.AUTH_REQUIRED, 'Authentication required'));
    }

    return this.apiPort.getCategories(host, authToken);
  }
}
