import { Observable } from 'rxjs';
import { Category } from '../../domain/entities/category.entity';
import { IptvApiPort } from '../../ports/outbound/iptv-api.port';

export interface GetCategoriesInput {
  credentials: {
    host: string;
    authToken: string;
  };
}

export type GetCategoriesOutput = Category[];

export class GetCategoriesUseCase {
  constructor(
    private readonly apiPort: IptvApiPort
  ) {}

  execute(input: GetCategoriesInput): Observable<Category[]> {
    return this.apiPort.getCategories(input.credentials.host, input.credentials.authToken);
  }
}