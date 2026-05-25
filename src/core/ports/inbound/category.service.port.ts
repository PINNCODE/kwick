import { Observable } from 'rxjs';
import { Category } from '../../domain/entities/category.entity';

export interface CategoryService {
  getCategories(): Observable<Category[]>;
  getCategoryById(id: number): Observable<Category | null>;
}
