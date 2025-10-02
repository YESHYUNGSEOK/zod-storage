import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import { createLocalStorage } from './storage';

describe('createLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should store and retrieve valid data', () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const storage = createLocalStorage('user', schema);

    const data = { name: 'John', age: 30 };
    storage.set(data);

    expect(storage.get()).toEqual(data);
  });

  it('should return null for non-existent key', () => {
    const schema = z.string();
    const storage = createLocalStorage('test', schema);

    expect(storage.get()).toBeNull();
  });

  it('should validate data with zod schema', () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const storage = createLocalStorage('user', schema);

    expect(() => storage.set({ name: 'John', age: '30' } as any)).toThrow();
  });

  it('should remove item', () => {
    const schema = z.string();
    const storage = createLocalStorage('test', schema);

    storage.set('value');
    storage.remove();

    expect(storage.get()).toBeNull();
  });
});
