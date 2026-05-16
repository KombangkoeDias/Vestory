import { CategoryId, CategoryMeta } from '../types';
import Colors from './Colors';

export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  food: {
    id: 'food',
    label: 'Food & Drinks',
    icon: 'restaurant',
    color: Colors.dark.food,
  },
  transport: {
    id: 'transport',
    label: 'Transport',
    icon: 'car',
    color: Colors.dark.transport,
  },
  groceries: {
    id: 'groceries',
    label: 'Groceries',
    icon: 'cart',
    color: Colors.dark.groceries,
  },
  shopping: {
    id: 'shopping',
    label: 'Shopping',
    icon: 'bag-handle',
    color: Colors.dark.shopping,
  },
  entertainment: {
    id: 'entertainment',
    label: 'Entertainment',
    icon: 'film',
    color: Colors.dark.entertainment,
  },
  health: {
    id: 'health',
    label: 'Health',
    icon: 'medkit',
    color: Colors.dark.health,
  },
  utilities: {
    id: 'utilities',
    label: 'Utilities',
    icon: 'flash',
    color: Colors.dark.utilities,
  },
  travel: {
    id: 'travel',
    label: 'Travel',
    icon: 'airplane',
    color: Colors.dark.travel,
  },
  others: {
    id: 'others',
    label: 'Others',
    icon: 'ellipsis-horizontal',
    color: Colors.dark.others,
  },
};

export const CATEGORY_LIST: CategoryMeta[] = Object.values(CATEGORIES);
