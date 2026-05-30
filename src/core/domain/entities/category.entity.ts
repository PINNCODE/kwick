export type CategoryType = 'live';

export interface Category {
  id: number | string;
  name: string;
  type: CategoryType;
}
