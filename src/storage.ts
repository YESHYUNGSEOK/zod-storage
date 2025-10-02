import { z } from 'zod';

export interface StorageOptions {
  prefix?: string;
}

export function createLocalStorage<T extends z.ZodType>(
  key: string,
  schema: T,
  options: StorageOptions = {}
) {
  const fullKey = options.prefix ? `${options.prefix}:${key}` : key;

  return {
    get(): z.infer<T> | null {
      const item = localStorage.getItem(fullKey);
      if (item === null) return null;

      try {
        const parsed = JSON.parse(item) as unknown;
        return schema.parse(parsed);
      } catch {
        return null;
      }
    },

    set(value: z.infer<T>): void {
      const validated = schema.parse(value);
      localStorage.setItem(fullKey, JSON.stringify(validated));
    },

    remove(): void {
      localStorage.removeItem(fullKey);
    },

    clear(): void {
      localStorage.clear();
    },
  };
}
