import type { CategoryId } from './ids';

export type CategoryDefinition = {
  id: CategoryId;
  name: string;
  color: string;
  priority: number;
  icon?: string;
};
