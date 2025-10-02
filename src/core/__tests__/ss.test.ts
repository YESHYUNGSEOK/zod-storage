import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import { ss } from '../ss';
import { safeStorage } from '../SafeStorage';

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

    it('should reject invalid enum value when corrupted (onFailure: null)', () => {
      const storage = ss({
        key: 'theme',
        schema: z.enum(['light', 'dark', 'auto']),
        defaultValue: 'light',
      });

      // 사용자가 직접 localStorage를 오염시킨 경우
      localStorage.setItem('theme', JSON.stringify('invalid'));
      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should return defaultValue when enum value is invalid (onFailure: default)', () => {
      const storage = ss({
        key: 'theme',
        schema: z.enum(['light', 'dark', 'auto']),
        defaultValue: 'light',
      });

      localStorage.setItem('theme', JSON.stringify('invalid'));
      expect(safeStorage.get(storage, { onFailure: 'default' })).toBe('light');
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

    it('should reject invalid object when corrupted (onFailure: null)', () => {
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
      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should return defaultValue when object is invalid (onFailure: default)', () => {
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
      expect(safeStorage.get(storage, { onFailure: 'default' })).toEqual({
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

    it('should reject invalid array items when corrupted (onFailure: null)', () => {
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

      expect(safeStorage.get(storage)).toBeNull();
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

    it('should return defaultValue when stored value is invalid JSON (onFailure: default)', () => {
      const storage = ss({
        key: 'invalid',
        schema: z.array(z.number()),
        defaultValue: [1, 2, 3],
      });

      localStorage.setItem('invalid', 'invalid json');
      expect(safeStorage.get(storage, { onFailure: 'default' })).toEqual([1, 2, 3]);
    });

    it('should return null when stored value is invalid JSON (onFailure: null)', () => {
      const storage = ss({
        key: 'invalid',
        schema: z.array(z.number()),
        defaultValue: [1, 2, 3],
      });

      localStorage.setItem('invalid', 'invalid json');
      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should reject wrong type when corrupted (string instead of number)', () => {
      const storage = ss({
        key: 'count',
        schema: z.number(),
        defaultValue: 0,
      });

      localStorage.setItem('count', JSON.stringify('not a number'));
      expect(safeStorage.get(storage)).toBeNull();
      expect(safeStorage.get(storage, { onFailure: 'default' })).toBe(0);
    });

    it('should reject wrong array element type when corrupted', () => {
      const storage = ss({
        key: 'numbers',
        schema: z.array(z.number()),
        defaultValue: [],
      });

      localStorage.setItem('numbers', JSON.stringify([1, 2, 'three', 4]));
      expect(safeStorage.get(storage)).toBeNull();
      expect(safeStorage.get(storage, { onFailure: 'default' })).toEqual([]);
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

    it('should handle null values in storage', () => {
      const storage = ss({
        key: 'nullable',
        schema: z.nullable(z.string()),
        defaultValue: null,
      });

      safeStorage.set(storage, null);
      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should handle empty string as valid value', () => {
      const storage = ss({
        key: 'empty-string',
        schema: z.string(),
        defaultValue: 'default',
      });

      safeStorage.set(storage, '');
      expect(safeStorage.get(storage)).toBe('');
    });

    it('should handle zero as valid number', () => {
      const storage = ss({
        key: 'zero',
        schema: z.number(),
        defaultValue: 42,
      });

      safeStorage.set(storage, 0);
      expect(safeStorage.get(storage)).toBe(0);
    });

    it('should handle false as valid boolean', () => {
      const storage = ss({
        key: 'false-bool',
        schema: z.boolean(),
        defaultValue: true,
      });

      safeStorage.set(storage, false);
      expect(safeStorage.get(storage)).toBe(false);
    });

    it('should handle very large numbers', () => {
      const storage = ss({
        key: 'large-num',
        schema: z.number(),
        defaultValue: 0,
      });

      const largeNum = Number.MAX_SAFE_INTEGER;
      safeStorage.set(storage, largeNum);
      expect(safeStorage.get(storage)).toBe(largeNum);
    });

    it('should handle negative numbers', () => {
      const storage = ss({
        key: 'negative',
        schema: z.number(),
        defaultValue: 0,
      });

      safeStorage.set(storage, -999);
      expect(safeStorage.get(storage)).toBe(-999);
    });

    it('should handle floating point numbers', () => {
      const storage = ss({
        key: 'float',
        schema: z.number(),
        defaultValue: 0,
      });

      safeStorage.set(storage, 3.14159);
      expect(safeStorage.get(storage)).toBe(3.14159);
    });

    it('should reject NaN', () => {
      const storage = ss({
        key: 'nan',
        schema: z.number(),
        defaultValue: 0,
      });

      localStorage.setItem('nan', JSON.stringify(NaN));
      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should reject Infinity', () => {
      const storage = ss({
        key: 'infinity',
        schema: z.number(),
        defaultValue: 0,
      });

      localStorage.setItem('infinity', JSON.stringify(Infinity));
      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should handle unicode characters', () => {
      const storage = ss({
        key: 'unicode',
        schema: z.string(),
        defaultValue: '',
      });

      const unicode = '你好🌍こんにちは';
      safeStorage.set(storage, unicode);
      expect(safeStorage.get(storage)).toBe(unicode);
    });

    it('should handle special characters in strings', () => {
      const storage = ss({
        key: 'special',
        schema: z.string(),
        defaultValue: '',
      });

      const special = '\\n\\t\\"\\\\';
      safeStorage.set(storage, special);
      expect(safeStorage.get(storage)).toBe(special);
    });

    it('should handle deeply nested objects', () => {
      const deepSchema = z.object({
        level1: z.object({
          level2: z.object({
            level3: z.object({
              level4: z.object({
                value: z.string(),
              }),
            }),
          }),
        }),
      });

      const storage = ss({
        key: 'deep',
        schema: deepSchema,
        defaultValue: {
          level1: { level2: { level3: { level4: { value: '' } } } },
        },
      });

      const deepValue = {
        level1: { level2: { level3: { level4: { value: 'deep' } } } },
      };

      safeStorage.set(storage, deepValue);
      expect(safeStorage.get(storage)).toEqual(deepValue);
    });

    it('should reject missing deep nested property', () => {
      const deepSchema = z.object({
        level1: z.object({
          level2: z.object({
            level3: z.object({
              value: z.string(),
            }),
          }),
        }),
      });

      const storage = ss({
        key: 'deep-invalid',
        schema: deepSchema,
        defaultValue: {
          level1: { level2: { level3: { value: '' } } },
        },
      });

      localStorage.setItem('deep-invalid', JSON.stringify({ level1: { level2: {} } }));
      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should handle very long strings', () => {
      const storage = ss({
        key: 'long-string',
        schema: z.string(),
        defaultValue: '',
      });

      const longString = 'a'.repeat(10000);
      safeStorage.set(storage, longString);
      expect(safeStorage.get(storage)).toBe(longString);
    });

    it('should handle very large arrays', () => {
      const storage = ss({
        key: 'large-array',
        schema: z.array(z.number()),
        defaultValue: [],
      });

      const largeArray = Array.from({ length: 1000 }, (_, i) => i);
      safeStorage.set(storage, largeArray);
      expect(safeStorage.get(storage)).toEqual(largeArray);
    });

    it('should handle optional properties', () => {
      const schema = z.object({
        required: z.string(),
        optional: z.string().optional(),
      });

      const storage = ss({
        key: 'optional',
        schema,
        defaultValue: { required: '' },
      });

      safeStorage.set(storage, { required: 'test' });
      expect(safeStorage.get(storage)).toEqual({ required: 'test' });

      safeStorage.set(storage, { required: 'test', optional: 'value' });
      expect(safeStorage.get(storage)).toEqual({
        required: 'test',
        optional: 'value',
      });
    });

    it('should reject extra properties with strict schema', () => {
      const schema = z
        .object({
          id: z.number(),
          name: z.string(),
        })
        .strict();

      const storage = ss({
        key: 'strict',
        schema,
        defaultValue: { id: 0, name: '' },
      });

      localStorage.setItem('strict', JSON.stringify({ id: 1, name: 'test', extra: 'field' }));
      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should handle Date objects serialization (as strings)', () => {
      const storage = ss({
        key: 'date',
        schema: z.string(),
        defaultValue: '',
      });

      const dateString = new Date().toISOString();
      safeStorage.set(storage, dateString);
      expect(safeStorage.get(storage)).toBe(dateString);
    });

    it('should handle Map-like objects (plain object)', () => {
      const storage = ss({
        key: 'map',
        schema: z.record(z.string()),
        defaultValue: {},
      });

      const map = { key1: 'value1', key2: 'value2' };
      safeStorage.set(storage, map);
      expect(safeStorage.get(storage)).toEqual(map);
    });

    it('should reject invalid record values', () => {
      const storage = ss({
        key: 'invalid-record',
        schema: z.record(z.number()),
        defaultValue: {},
      });

      localStorage.setItem('invalid-record', JSON.stringify({ a: 1, b: 'not-a-number' }));
      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should handle tuple types', () => {
      const storage = ss({
        key: 'tuple',
        schema: z.tuple([z.string(), z.number(), z.boolean()]),
        defaultValue: ['', 0, false],
      });

      safeStorage.set(storage, ['test', 42, true]);
      expect(safeStorage.get(storage)).toEqual(['test', 42, true]);
    });

    it('should reject tuple with wrong length', () => {
      const storage = ss({
        key: 'tuple-wrong-length',
        schema: z.tuple([z.string(), z.number()]),
        defaultValue: ['', 0],
      });

      localStorage.setItem('tuple-wrong-length', JSON.stringify(['test', 42, 'extra']));
      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should reject tuple with wrong type', () => {
      const storage = ss({
        key: 'tuple-wrong-type',
        schema: z.tuple([z.string(), z.number()]),
        defaultValue: ['', 0],
      });

      localStorage.setItem('tuple-wrong-type', JSON.stringify([42, 'test']));
      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should handle discriminated unions', () => {
      const schema = z.discriminatedUnion('type', [
        z.object({ type: z.literal('text'), value: z.string() }),
        z.object({ type: z.literal('number'), value: z.number() }),
      ]);

      const storage = ss({
        key: 'discriminated',
        schema,
        defaultValue: { type: 'text', value: '' },
      });

      safeStorage.set(storage, { type: 'number', value: 42 });
      expect(safeStorage.get(storage)).toEqual({ type: 'number', value: 42 });
    });

    it('should reject invalid discriminated union', () => {
      const schema = z.discriminatedUnion('type', [
        z.object({ type: z.literal('text'), value: z.string() }),
        z.object({ type: z.literal('number'), value: z.number() }),
      ]);

      const storage = ss({
        key: 'invalid-discriminated',
        schema,
        defaultValue: { type: 'text', value: '' },
      });

      localStorage.setItem(
        'invalid-discriminated',
        JSON.stringify({ type: 'number', value: 'not-a-number' })
      );
      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should handle transformed schemas', () => {
      const schema = z.string().transform((val) => val.toUpperCase());

      const storage = ss({
        key: 'transform',
        schema,
        defaultValue: '',
      });

      safeStorage.set(storage, 'hello');
      // Transform happens during parse, so get should return transformed value
      expect(safeStorage.get(storage)).toBe('HELLO');
    });

    it('should handle refined schemas with custom validation', () => {
      const schema = z.string().refine((val) => val.length >= 3, {
        message: 'String must be at least 3 characters',
      });

      const storage = ss({
        key: 'refined',
        schema,
        defaultValue: 'default',
      });

      safeStorage.set(storage, 'valid');
      expect(safeStorage.get(storage)).toBe('valid');

      // Set invalid value directly to localStorage
      localStorage.setItem('refined', JSON.stringify('ab'));
      expect(safeStorage.get(storage)).toBeNull();
      expect(safeStorage.get(storage, { onFailure: 'default' })).toBe('default');
    });

    it('should handle min/max constraints on numbers', () => {
      const schema = z.number().min(0).max(100);

      const storage = ss({
        key: 'constrained',
        schema,
        defaultValue: 50,
      });

      safeStorage.set(storage, 75);
      expect(safeStorage.get(storage)).toBe(75);

      localStorage.setItem('constrained', JSON.stringify(150));
      expect(safeStorage.get(storage)).toBeNull();

      localStorage.setItem('constrained', JSON.stringify(-10));
      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should handle email validation', () => {
      const storage = ss({
        key: 'email',
        schema: z.string().email(),
        defaultValue: '',
      });

      safeStorage.set(storage, 'test@example.com');
      expect(safeStorage.get(storage)).toBe('test@example.com');

      localStorage.setItem('email', JSON.stringify('not-an-email'));
      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should handle url validation', () => {
      const storage = ss({
        key: 'url',
        schema: z.string().url(),
        defaultValue: '',
      });

      safeStorage.set(storage, 'https://example.com');
      expect(safeStorage.get(storage)).toBe('https://example.com');

      localStorage.setItem('url', JSON.stringify('not-a-url'));
      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should handle regex pattern validation', () => {
      const storage = ss({
        key: 'pattern',
        schema: z.string().regex(/^[A-Z]{3}-\d{3}$/),
        defaultValue: '',
      });

      safeStorage.set(storage, 'ABC-123');
      expect(safeStorage.get(storage)).toBe('ABC-123');

      localStorage.setItem('pattern', JSON.stringify('invalid-pattern'));
      expect(safeStorage.get(storage)).toBeNull();
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

  describe('data corruption scenarios', () => {
    it('should reject when user manually corrupts object with wrong type fields', () => {
      const storage = ss({
        key: 'user-profile',
        schema: z.object({
          id: z.number(),
          name: z.string(),
          age: z.number(),
          isActive: z.boolean(),
        }),
        defaultValue: { id: 0, name: '', age: 0, isActive: false },
      });

      // 사용자가 개발자 도구로 타입을 바꿈
      localStorage.setItem(
        'user-profile',
        JSON.stringify({
          id: '123', // number여야 하는데 string
          name: 'John',
          age: '25', // number여야 하는데 string
          isActive: 'true', // boolean이어야 하는데 string
        })
      );

      expect(safeStorage.get(storage)).toBeNull();
      expect(safeStorage.get(storage, { onFailure: 'default' })).toEqual({
        id: 0,
        name: '',
        age: 0,
        isActive: false,
      });
    });

    it('should reject when array contains mixed types', () => {
      const storage = ss({
        key: 'scores',
        schema: z.array(z.number()),
        defaultValue: [],
      });

      // 사용자가 개발자 도구로 잘못된 값 추가
      localStorage.setItem('scores', JSON.stringify([100, 95, '80', 75, null, 60]));

      expect(safeStorage.get(storage)).toBeNull();
      expect(safeStorage.get(storage, { onFailure: 'default' })).toEqual([]);
    });

    it('should reject when required fields are missing', () => {
      const storage = ss({
        key: 'settings',
        schema: z.object({
          theme: z.string(),
          fontSize: z.number(),
          notifications: z.boolean(),
        }),
        defaultValue: { theme: 'light', fontSize: 14, notifications: true },
      });

      // 사용자가 일부 필드만 저장
      localStorage.setItem('settings', JSON.stringify({ theme: 'dark' }));

      expect(safeStorage.get(storage)).toBeNull();
      expect(safeStorage.get(storage, { onFailure: 'default' })).toEqual({
        theme: 'light',
        fontSize: 14,
        notifications: true,
      });
    });

    it('should reject when enum value is changed to invalid value', () => {
      const storage = ss({
        key: 'status',
        schema: z.enum(['pending', 'active', 'completed']),
        defaultValue: 'pending',
      });

      // 사용자가 잘못된 enum 값으로 변경
      localStorage.setItem('status', JSON.stringify('cancelled'));

      expect(safeStorage.get(storage)).toBeNull();
      expect(safeStorage.get(storage, { onFailure: 'default' })).toBe('pending');
    });

    it('should reject when array of objects has corrupted items', () => {
      const storage = ss({
        key: 'todos',
        schema: z.array(
          z.object({
            id: z.number(),
            text: z.string(),
            completed: z.boolean(),
          })
        ),
        defaultValue: [],
      });

      // 일부 아이템이 잘못된 형식
      localStorage.setItem(
        'todos',
        JSON.stringify([
          { id: 1, text: 'Task 1', completed: false },
          { id: '2', text: 'Task 2', completed: false }, // id가 string
          { id: 3, text: 'Task 3' }, // completed 누락
          { id: 4, text: 'Task 4', completed: 'yes' }, // boolean이 아님
        ])
      );

      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should reject when nested object structure is broken', () => {
      const storage = ss({
        key: 'config',
        schema: z.object({
          app: z.object({
            name: z.string(),
            version: z.string(),
          }),
          user: z.object({
            id: z.number(),
            role: z.string(),
          }),
        }),
        defaultValue: {
          app: { name: '', version: '' },
          user: { id: 0, role: '' },
        },
      });

      // nested object가 평탄화됨
      localStorage.setItem(
        'config',
        JSON.stringify({
          app: { name: 'MyApp' }, // version 누락
          user: 'admin', // object가 아님
        })
      );

      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should reject when union type receives invalid value', () => {
      const storage = ss({
        key: 'value',
        schema: z.union([z.string(), z.number()]),
        defaultValue: '',
      });

      // union에 포함되지 않는 타입
      localStorage.setItem('value', JSON.stringify({ invalid: 'object' }));

      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should reject when array contains objects instead of primitives', () => {
      const storage = ss({
        key: 'tags',
        schema: z.array(z.string()),
        defaultValue: [],
      });

      // string array인데 object가 들어감
      localStorage.setItem('tags', JSON.stringify(['tag1', { name: 'tag2' }, 'tag3']));

      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should reject when boolean receives truthy/falsy values instead of boolean', () => {
      const storage = ss({
        key: 'enabled',
        schema: z.boolean(),
        defaultValue: false,
      });

      // boolean이 아닌 truthy 값들
      localStorage.setItem('enabled', JSON.stringify(1));
      expect(safeStorage.get(storage)).toBeNull();

      localStorage.setItem('enabled', JSON.stringify('true'));
      expect(safeStorage.get(storage)).toBeNull();

      localStorage.setItem('enabled', JSON.stringify([]));
      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should reject when number receives numeric string', () => {
      const storage = ss({
        key: 'count',
        schema: z.number(),
        defaultValue: 0,
      });

      // 숫자처럼 보이는 문자열
      localStorage.setItem('count', JSON.stringify('123'));

      expect(safeStorage.get(storage)).toBeNull();
      expect(safeStorage.get(storage, { onFailure: 'default' })).toBe(0);
    });

    it('should reject when object array receives primitive array', () => {
      const storage = ss({
        key: 'items',
        schema: z.array(z.object({ id: z.number() })),
        defaultValue: [],
      });

      // object array인데 primitive array
      localStorage.setItem('items', JSON.stringify([1, 2, 3]));

      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should reject when literal type receives different value', () => {
      const storage = ss({
        key: 'version',
        schema: z.literal('v1.0.0'),
        defaultValue: 'v1.0.0',
      });

      localStorage.setItem('version', JSON.stringify('v2.0.0'));

      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should reject malformed JSON from manual editing', () => {
      const storage = ss({
        key: 'data',
        schema: z.object({ value: z.string() }),
        defaultValue: { value: '' },
      });

      // 사용자가 수동으로 잘못된 JSON 작성
      localStorage.setItem('data', '{value: "test"}'); // 따옴표 없음
      expect(safeStorage.get(storage)).toBeNull();

      localStorage.setItem('data', '{"value": "test",}'); // trailing comma
      expect(safeStorage.get(storage)).toBeNull();

      localStorage.setItem('data', "{'value': 'test'}"); // 작은따옴표
      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should reject when accidentally storing stringified JSON twice', () => {
      const storage = ss({
        key: 'double-stringified',
        schema: z.object({ id: z.number() }),
        defaultValue: { id: 0 },
      });

      // JSON을 두 번 stringify (실수로 발생 가능)
      const data = { id: 123 };
      const onceStringified = JSON.stringify(data); // '{"id":123}'
      const twiceStringified = JSON.stringify(onceStringified); // '"{\\"id\\":123}"'

      localStorage.setItem('double-stringified', twiceStringified);

      // JSON.parse 한 번 하면 문자열이 나오고, 그게 스키마와 안 맞음
      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should reject when type is completely wrong (array instead of object)', () => {
      const storage = ss({
        key: 'user',
        schema: z.object({ name: z.string() }),
        defaultValue: { name: '' },
      });

      localStorage.setItem('user', JSON.stringify(['John', 'Doe']));

      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should reject when type is completely wrong (object instead of array)', () => {
      const storage = ss({
        key: 'list',
        schema: z.array(z.string()),
        defaultValue: [],
      });

      localStorage.setItem('list', JSON.stringify({ 0: 'item1', 1: 'item2' }));

      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should reject empty object when non-empty object expected', () => {
      const storage = ss({
        key: 'required-fields',
        schema: z.object({
          id: z.number(),
          name: z.string(),
        }),
        defaultValue: { id: 0, name: '' },
      });

      localStorage.setItem('required-fields', JSON.stringify({}));

      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should reject when nested array structure is corrupted', () => {
      const storage = ss({
        key: 'matrix',
        schema: z.array(z.array(z.number())),
        defaultValue: [],
      });

      // 일부 중첩 배열이 평탄화됨
      localStorage.setItem('matrix', JSON.stringify([[1, 2], 3, [4, 5]]));

      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should reject when record keys have invalid values', () => {
      const storage = ss({
        key: 'prices',
        schema: z.record(z.number()),
        defaultValue: {},
      });

      localStorage.setItem(
        'prices',
        JSON.stringify({
          apple: 100,
          banana: '200', // string instead of number
          orange: 150,
        })
      );

      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should reject when optional field has wrong type', () => {
      const storage = ss({
        key: 'profile',
        schema: z.object({
          name: z.string(),
          email: z.string().optional(),
        }),
        defaultValue: { name: '' },
      });

      localStorage.setItem(
        'profile',
        JSON.stringify({
          name: 'John',
          email: 123, // optional이지만 타입이 틀림
        })
      );

      expect(safeStorage.get(storage)).toBeNull();
    });
  });

  describe('storage types', () => {
    beforeEach(() => {
      sessionStorage.clear();
    });

    it('should use localStorage by default', () => {
      const storage = ss({
        key: 'localData',
        schema: z.string(),
        defaultValue: '',
      });

      safeStorage.set(storage, 'test');
      expect(localStorage.getItem('localData')).toBe(JSON.stringify('test'));
      expect(sessionStorage.getItem('localData')).toBeNull();
    });

    it('should use sessionStorage when specified', () => {
      const storage = ss({
        key: 'sessionData',
        schema: z.string(),
        defaultValue: '',
        storage: 'session',
      });

      safeStorage.set(storage, 'test');
      expect(sessionStorage.getItem('sessionData')).toBe(JSON.stringify('test'));
      expect(localStorage.getItem('sessionData')).toBeNull();
    });

    it('should work with sessionStorage get/set/remove', () => {
      const storage = ss({
        key: 'sessionTest',
        schema: z.array(z.number()),
        defaultValue: [],
        storage: 'session',
      });

      safeStorage.set(storage, [1, 2, 3]);
      expect(safeStorage.get(storage)).toEqual([1, 2, 3]);

      safeStorage.remove(storage);
      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should work with sessionStorage init', () => {
      const storage = ss({
        key: 'sessionInit',
        schema: z.number(),
        defaultValue: 42,
        storage: 'session',
      });

      safeStorage.init(storage);
      expect(safeStorage.get(storage)).toBe(42);
      expect(sessionStorage.getItem('sessionInit')).toBe(JSON.stringify(42));
    });

    it('should handle validation failures in sessionStorage', () => {
      const storage = ss({
        key: 'sessionValidation',
        schema: z.number(),
        defaultValue: 0,
        storage: 'session',
      });

      sessionStorage.setItem('sessionValidation', JSON.stringify('not a number'));
      expect(safeStorage.get(storage)).toBeNull();
      expect(safeStorage.get(storage, { onFailure: 'default' })).toBe(0);
    });
  });
});
