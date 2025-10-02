import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import { ss } from '../ss';
import { safeStorage } from '../safe-storage';

describe('ss function', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('primitive types', () => {
    it('should work with number array', () => {
      const storage = ss({
        key: 'numbers',
        schema: z.array(z.number()),
        defaultValue: [],
      });

      safeStorage.set(storage, [1, 2, 3]);
      expect(safeStorage.get(storage)).toEqual([1, 2, 3]);
    });

    it('should work with string array', () => {
      const storage = ss({
        key: 'strings',
        schema: z.array(z.string()),
        defaultValue: [],
      });

      safeStorage.set(storage, ['a', 'b', 'c']);
      expect(safeStorage.get(storage)).toEqual(['a', 'b', 'c']);
    });

    it('should work with boolean', () => {
      const storage = ss({
        key: 'flag',
        schema: z.boolean(),
        defaultValue: false,
      });

      safeStorage.set(storage, true);
      expect(safeStorage.get(storage)).toBe(true);
    });

    it('should work with number', () => {
      const storage = ss({
        key: 'count',
        schema: z.number(),
        defaultValue: 0,
      });

      safeStorage.set(storage, 42);
      expect(safeStorage.get(storage)).toBe(42);
    });

    it('should work with string', () => {
      const storage = ss({
        key: 'name',
        schema: z.string(),
        defaultValue: '',
      });

      safeStorage.set(storage, 'John');
      expect(safeStorage.get(storage)).toBe('John');
    });
  });

  describe('enum and union types', () => {
    it('should work with z.enum', () => {
      const storage = ss({
        key: 'theme',
        schema: z.enum(['light', 'dark', 'auto']),
        defaultValue: 'light',
      });

      safeStorage.set(storage, 'dark');
      expect(safeStorage.get(storage)).toBe('dark');
    });

    it('should reject invalid enum value when corrupted', () => {
      const storage = ss({
        key: 'theme',
        schema: z.enum(['light', 'dark', 'auto']),
        defaultValue: 'light',
      });

      // 사용자가 직접 localStorage를 오염시킨 경우
      localStorage.setItem('theme', JSON.stringify('invalid'));
      expect(safeStorage.get(storage, { strict: true })).toBeNull();
    });

    it('should return defaultValue when enum value is invalid (non-strict mode)', () => {
      const storage = ss({
        key: 'theme',
        schema: z.enum(['light', 'dark', 'auto']),
        defaultValue: 'light',
      });

      localStorage.setItem('theme', JSON.stringify('invalid'));
      expect(safeStorage.get(storage)).toBe('light');
    });

    it('should work with numeric enum', () => {
      const storage = ss({
        key: 'status',
        schema: z.union([z.literal(0), z.literal(1), z.literal(2)]),
        defaultValue: 0,
      });

      safeStorage.set(storage, 2);
      expect(safeStorage.get(storage)).toBe(2);
    });
  });

  describe('custom types', () => {
    it('should work with custom object type', () => {
      const userSchema = z.object({
        id: z.number(),
        name: z.string(),
        email: z.string(),
      });

      const storage = ss({
        key: 'user',
        schema: userSchema,
        defaultValue: {
          id: 0,
          name: '',
          email: '',
        },
      });

      const user = {
        id: 1,
        name: 'John',
        email: 'john@example.com',
      };

      safeStorage.set(storage, user);
      expect(safeStorage.get(storage)).toEqual(user);
    });

    it('should reject invalid object when corrupted', () => {
      const userSchema = z.object({
        id: z.number(),
        name: z.string(),
        email: z.string(),
      });

      const storage = ss({
        key: 'user',
        schema: userSchema,
        defaultValue: {
          id: 0,
          name: '',
          email: '',
        },
      });

      // 필수 필드 누락
      localStorage.setItem('user', JSON.stringify({ id: 1 }));
      expect(safeStorage.get(storage, { strict: true })).toBeNull();
    });

    it('should return defaultValue when object is invalid (non-strict mode)', () => {
      const userSchema = z.object({
        id: z.number(),
        name: z.string(),
        email: z.string(),
      });

      const storage = ss({
        key: 'user',
        schema: userSchema,
        defaultValue: {
          id: 0,
          name: '',
          email: '',
        },
      });

      localStorage.setItem('user', JSON.stringify({ id: 1 }));
      expect(safeStorage.get(storage)).toEqual({
        id: 0,
        name: '',
        email: '',
      });
    });

    it('should work with nested object type', () => {
      const profileSchema = z.object({
        user: z.object({
          id: z.number(),
          name: z.string(),
        }),
        settings: z.object({
          theme: z.string(),
          notifications: z.boolean(),
        }),
      });

      const storage = ss({
        key: 'profile',
        schema: profileSchema,
        defaultValue: {
          user: {
            id: 0,
            name: '',
          },
          settings: {
            theme: 'light',
            notifications: true,
          },
        },
      });

      const profile = {
        user: {
          id: 1,
          name: 'John',
        },
        settings: {
          theme: 'dark',
          notifications: false,
        },
      };

      safeStorage.set(storage, profile);
      expect(safeStorage.get(storage)).toEqual(profile);
    });

    it('should work with array of custom objects', () => {
      const taskSchema = z.array(
        z.object({
          id: z.number(),
          title: z.string(),
          completed: z.boolean(),
        })
      );

      const storage = ss({
        key: 'tasks',
        schema: taskSchema,
        defaultValue: [],
      });

      const tasks = [
        { id: 1, title: 'Task 1', completed: false },
        { id: 2, title: 'Task 2', completed: true },
      ];

      safeStorage.set(storage, tasks);
      expect(safeStorage.get(storage)).toEqual(tasks);
    });

    it('should reject invalid array items when corrupted', () => {
      const taskSchema = z.array(
        z.object({
          id: z.number(),
          title: z.string(),
          completed: z.boolean(),
        })
      );

      const storage = ss({
        key: 'tasks',
        schema: taskSchema,
        defaultValue: [],
      });

      // 잘못된 타입의 아이템 포함
      localStorage.setItem(
        'tasks',
        JSON.stringify([
          { id: 1, title: 'Task 1', completed: false },
          { id: 'invalid', title: 'Task 2', completed: true },
        ])
      );

      expect(safeStorage.get(storage, { strict: true })).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should return null when key does not exist', () => {
      const storage = ss({
        key: 'nonexistent',
        schema: z.array(z.number()),
        defaultValue: [],
      });

      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should return defaultValue when stored value is invalid JSON (non-strict mode)', () => {
      const storage = ss({
        key: 'invalid',
        schema: z.array(z.number()),
        defaultValue: [1, 2, 3],
      });

      localStorage.setItem('invalid', 'invalid json');
      expect(safeStorage.get(storage)).toEqual([1, 2, 3]);
    });

    it('should return null when stored value is invalid JSON (strict mode)', () => {
      const storage = ss({
        key: 'invalid',
        schema: z.array(z.number()),
        defaultValue: [1, 2, 3],
      });

      localStorage.setItem('invalid', 'invalid json');
      expect(safeStorage.get(storage, { strict: true })).toBeNull();
    });

    it('should reject wrong type when corrupted (string instead of number)', () => {
      const storage = ss({
        key: 'count',
        schema: z.number(),
        defaultValue: 0,
      });

      localStorage.setItem('count', JSON.stringify('not a number'));
      expect(safeStorage.get(storage, { strict: true })).toBeNull();
      expect(safeStorage.get(storage)).toBe(0);
    });

    it('should reject wrong array element type when corrupted', () => {
      const storage = ss({
        key: 'numbers',
        schema: z.array(z.number()),
        defaultValue: [],
      });

      localStorage.setItem('numbers', JSON.stringify([1, 2, 'three', 4]));
      expect(safeStorage.get(storage, { strict: true })).toBeNull();
      expect(safeStorage.get(storage)).toEqual([]);
    });

    it('should work with empty array defaultValue', () => {
      const storage = ss({
        key: 'empty',
        schema: z.array(z.number()),
        defaultValue: [],
      });

      safeStorage.set(storage, []);
      expect(safeStorage.get(storage)).toEqual([]);
    });

    it('should work with complex union types', () => {
      const complexSchema = z.object({
        id: z.number(),
        data: z.union([z.string(), z.number(), z.boolean()]),
      });

      const storage = ss({
        key: 'complex',
        schema: complexSchema,
        defaultValue: {
          id: 0,
          data: '',
        },
      });

      const value = {
        id: 1,
        data: 'test',
      };

      safeStorage.set(storage, value);
      expect(safeStorage.get(storage)).toEqual(value);
    });
  });

  describe('safeStorage methods', () => {
    it('should work with init method', () => {
      const storage = ss({
        key: 'initTest',
        schema: z.array(z.number()),
        defaultValue: [1, 2, 3],
      });

      safeStorage.init(storage);
      expect(safeStorage.get(storage)).toEqual([1, 2, 3]);
    });

    it('should work with remove method', () => {
      const storage = ss({
        key: 'removeTest',
        schema: z.array(z.number()),
        defaultValue: [],
      });

      safeStorage.set(storage, [1, 2, 3]);
      expect(safeStorage.get(storage)).toEqual([1, 2, 3]);

      safeStorage.remove(storage);
      expect(safeStorage.get(storage)).toBeNull();
    });
  });
});
