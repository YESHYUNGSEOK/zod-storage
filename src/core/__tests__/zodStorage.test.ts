import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import { zs } from '../zs';
import { zodStorage } from '../zodStorage';

describe('zodStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('primitive types', () => {
    it('should work with number array', () => {
      const storage = zs({
        key: 'numbers',
        schema: z.array(z.number()),
        defaultValue: [],
      });

      zodStorage.set(storage, [1, 2, 3]);
      expect(zodStorage.get(storage)).toEqual([1, 2, 3]);
    });

    it('should work with string array', () => {
      const storage = zs({
        key: 'strings',
        schema: z.array(z.string()),
        defaultValue: [],
      });

      zodStorage.set(storage, ['a', 'b', 'c']);
      expect(zodStorage.get(storage)).toEqual(['a', 'b', 'c']);
    });

    it('should work with boolean', () => {
      const storage = zs({
        key: 'flag',
        schema: z.boolean(),
        defaultValue: false,
      });

      zodStorage.set(storage, true);
      expect(zodStorage.get(storage)).toBe(true);
    });

    it('should work with number', () => {
      const storage = zs({
        key: 'count',
        schema: z.number(),
        defaultValue: 0,
      });

      zodStorage.set(storage, 42);
      expect(zodStorage.get(storage)).toBe(42);
    });

    it('should work with string', () => {
      const storage = zs({
        key: 'name',
        schema: z.string(),
        defaultValue: '',
      });

      zodStorage.set(storage, 'John');
      expect(zodStorage.get(storage)).toBe('John');
    });
  });

  describe('enum and union types', () => {
    it('should work with z.enum', () => {
      const storage = zs({
        key: 'theme',
        schema: z.enum(['light', 'dark', 'auto']),
        defaultValue: 'light',
      });

      zodStorage.set(storage, 'dark');
      expect(zodStorage.get(storage)).toBe('dark');
    });

    it('should reject invalid enum value when corrupted (onFailure: null)', () => {
      const storage = zs({
        key: 'theme',
        schema: z.enum(['light', 'dark', 'auto']),
        defaultValue: 'light',
      });

      // User manually corrupted localStorage
      localStorage.setItem('theme', JSON.stringify('invalid'));
      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should return defaultValue when enum value is invalid (onFailure: default)', () => {
      const storage = zs({
        key: 'theme',
        schema: z.enum(['light', 'dark', 'auto']),
        defaultValue: 'light',
      });

      localStorage.setItem('theme', JSON.stringify('invalid'));
      expect(zodStorage.get(storage, { onFailure: 'default' })).toBe('light');
    });

    it('should work with numeric enum', () => {
      const storage = zs({
        key: 'status',
        schema: z.union([z.literal(0), z.literal(1), z.literal(2)]),
        defaultValue: 0,
      });

      zodStorage.set(storage, 2);
      expect(zodStorage.get(storage)).toBe(2);
    });
  });

  describe('custom types', () => {
    it('should work with custom object type', () => {
      const userSchema = z.object({
        id: z.number(),
        name: z.string(),
        email: z.string(),
      });

      const storage = zs({
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

      zodStorage.set(storage, user);
      expect(zodStorage.get(storage)).toEqual(user);
    });

    it('should reject invalid object when corrupted (onFailure: null)', () => {
      const userSchema = z.object({
        id: z.number(),
        name: z.string(),
        email: z.string(),
      });

      const storage = zs({
        key: 'user',
        schema: userSchema,
        defaultValue: {
          id: 0,
          name: '',
          email: '',
        },
      });

      // Missing required fields
      localStorage.setItem('user', JSON.stringify({ id: 1 }));
      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should return defaultValue when object is invalid (onFailure: default)', () => {
      const userSchema = z.object({
        id: z.number(),
        name: z.string(),
        email: z.string(),
      });

      const storage = zs({
        key: 'user',
        schema: userSchema,
        defaultValue: {
          id: 0,
          name: '',
          email: '',
        },
      });

      localStorage.setItem('user', JSON.stringify({ id: 1 }));
      expect(zodStorage.get(storage, { onFailure: 'default' })).toEqual({
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

      const storage = zs({
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

      zodStorage.set(storage, profile);
      expect(zodStorage.get(storage)).toEqual(profile);
    });

    it('should work with array of custom objects', () => {
      const taskSchema = z.array(
        z.object({
          id: z.number(),
          title: z.string(),
          completed: z.boolean(),
        })
      );

      const storage = zs({
        key: 'tasks',
        schema: taskSchema,
        defaultValue: [],
      });

      const tasks = [
        { id: 1, title: 'Task 1', completed: false },
        { id: 2, title: 'Task 2', completed: true },
      ];

      zodStorage.set(storage, tasks);
      expect(zodStorage.get(storage)).toEqual(tasks);
    });

    it('should reject invalid array items when corrupted (onFailure: null)', () => {
      const taskSchema = z.array(
        z.object({
          id: z.number(),
          title: z.string(),
          completed: z.boolean(),
        })
      );

      const storage = zs({
        key: 'tasks',
        schema: taskSchema,
        defaultValue: [],
      });

      // Contains items with incorrect type
      localStorage.setItem(
        'tasks',
        JSON.stringify([
          { id: 1, title: 'Task 1', completed: false },
          { id: 'invalid', title: 'Task 2', completed: true },
        ])
      );

      expect(zodStorage.get(storage)).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should return null when key does not exist', () => {
      const storage = zs({
        key: 'nonexistent',
        schema: z.array(z.number()),
        defaultValue: [],
      });

      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should return defaultValue when stored value is invalid JSON (onFailure: default)', () => {
      const storage = zs({
        key: 'invalid',
        schema: z.array(z.number()),
        defaultValue: [1, 2, 3],
      });

      localStorage.setItem('invalid', 'invalid json');
      expect(zodStorage.get(storage, { onFailure: 'default' })).toEqual([1, 2, 3]);
    });

    it('should return null when stored value is invalid JSON (onFailure: null)', () => {
      const storage = zs({
        key: 'invalid',
        schema: z.array(z.number()),
        defaultValue: [1, 2, 3],
      });

      localStorage.setItem('invalid', 'invalid json');
      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should reject wrong type when corrupted (string instead of number)', () => {
      const storage = zs({
        key: 'count',
        schema: z.number(),
        defaultValue: 0,
      });

      localStorage.setItem('count', JSON.stringify('not a number'));
      expect(zodStorage.get(storage)).toBeNull();
      expect(zodStorage.get(storage, { onFailure: 'default' })).toBe(0);
    });

    it('should reject wrong array element type when corrupted', () => {
      const storage = zs({
        key: 'numbers',
        schema: z.array(z.number()),
        defaultValue: [],
      });

      localStorage.setItem('numbers', JSON.stringify([1, 2, 'three', 4]));
      expect(zodStorage.get(storage)).toBeNull();
      expect(zodStorage.get(storage, { onFailure: 'default' })).toEqual([]);
    });

    it('should work with empty array defaultValue', () => {
      const storage = zs({
        key: 'empty',
        schema: z.array(z.number()),
        defaultValue: [],
      });

      zodStorage.set(storage, []);
      expect(zodStorage.get(storage)).toEqual([]);
    });

    it('should work with complex union types', () => {
      const complexSchema = z.object({
        id: z.number(),
        data: z.union([z.string(), z.number(), z.boolean()]),
      });

      const storage = zs({
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

      zodStorage.set(storage, value);
      expect(zodStorage.get(storage)).toEqual(value);
    });

    it('should handle null values in storage', () => {
      const storage = zs({
        key: 'nullable',
        schema: z.nullable(z.string()),
        defaultValue: null,
      });

      zodStorage.set(storage, null);
      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should handle empty string as valid value', () => {
      const storage = zs({
        key: 'empty-string',
        schema: z.string(),
        defaultValue: 'default',
      });

      zodStorage.set(storage, '');
      expect(zodStorage.get(storage)).toBe('');
    });

    it('should handle zero as valid number', () => {
      const storage = zs({
        key: 'zero',
        schema: z.number(),
        defaultValue: 42,
      });

      zodStorage.set(storage, 0);
      expect(zodStorage.get(storage)).toBe(0);
    });

    it('should handle false as valid boolean', () => {
      const storage = zs({
        key: 'false-bool',
        schema: z.boolean(),
        defaultValue: true,
      });

      zodStorage.set(storage, false);
      expect(zodStorage.get(storage)).toBe(false);
    });

    it('should handle very large numbers', () => {
      const storage = zs({
        key: 'large-num',
        schema: z.number(),
        defaultValue: 0,
      });

      const largeNum = Number.MAX_SAFE_INTEGER;
      zodStorage.set(storage, largeNum);
      expect(zodStorage.get(storage)).toBe(largeNum);
    });

    it('should handle negative numbers', () => {
      const storage = zs({
        key: 'negative',
        schema: z.number(),
        defaultValue: 0,
      });

      zodStorage.set(storage, -999);
      expect(zodStorage.get(storage)).toBe(-999);
    });

    it('should handle floating point numbers', () => {
      const storage = zs({
        key: 'float',
        schema: z.number(),
        defaultValue: 0,
      });

      zodStorage.set(storage, 3.14159);
      expect(zodStorage.get(storage)).toBe(3.14159);
    });

    it('should reject NaN', () => {
      const storage = zs({
        key: 'nan',
        schema: z.number(),
        defaultValue: 0,
      });

      localStorage.setItem('nan', JSON.stringify(NaN));
      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should reject Infinity', () => {
      const storage = zs({
        key: 'infinity',
        schema: z.number(),
        defaultValue: 0,
      });

      localStorage.setItem('infinity', JSON.stringify(Infinity));
      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should handle unicode characters', () => {
      const storage = zs({
        key: 'unicode',
        schema: z.string(),
        defaultValue: '',
      });

      const unicode = '你好🌍こんにちは';
      zodStorage.set(storage, unicode);
      expect(zodStorage.get(storage)).toBe(unicode);
    });

    it('should handle special characters in strings', () => {
      const storage = zs({
        key: 'special',
        schema: z.string(),
        defaultValue: '',
      });

      const special = '\\n\\t\\"\\\\';
      zodStorage.set(storage, special);
      expect(zodStorage.get(storage)).toBe(special);
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

      const storage = zs({
        key: 'deep',
        schema: deepSchema,
        defaultValue: {
          level1: { level2: { level3: { level4: { value: '' } } } },
        },
      });

      const deepValue = {
        level1: { level2: { level3: { level4: { value: 'deep' } } } },
      };

      zodStorage.set(storage, deepValue);
      expect(zodStorage.get(storage)).toEqual(deepValue);
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

      const storage = zs({
        key: 'deep-invalid',
        schema: deepSchema,
        defaultValue: {
          level1: { level2: { level3: { value: '' } } },
        },
      });

      localStorage.setItem('deep-invalid', JSON.stringify({ level1: { level2: {} } }));
      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should handle very long strings', () => {
      const storage = zs({
        key: 'long-string',
        schema: z.string(),
        defaultValue: '',
      });

      const longString = 'a'.repeat(10000);
      zodStorage.set(storage, longString);
      expect(zodStorage.get(storage)).toBe(longString);
    });

    it('should handle very large arrays', () => {
      const storage = zs({
        key: 'large-array',
        schema: z.array(z.number()),
        defaultValue: [],
      });

      const largeArray = Array.from({ length: 1000 }, (_, i) => i);
      zodStorage.set(storage, largeArray);
      expect(zodStorage.get(storage)).toEqual(largeArray);
    });

    it('should handle optional properties', () => {
      const schema = z.object({
        required: z.string(),
        optional: z.string().optional(),
      });

      const storage = zs({
        key: 'optional',
        schema,
        defaultValue: { required: '' },
      });

      zodStorage.set(storage, { required: 'test' });
      expect(zodStorage.get(storage)).toEqual({ required: 'test' });

      zodStorage.set(storage, { required: 'test', optional: 'value' });
      expect(zodStorage.get(storage)).toEqual({
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

      const storage = zs({
        key: 'strict',
        schema,
        defaultValue: { id: 0, name: '' },
      });

      localStorage.setItem('strict', JSON.stringify({ id: 1, name: 'test', extra: 'field' }));
      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should handle Date objects serialization (as strings)', () => {
      const storage = zs({
        key: 'date',
        schema: z.string(),
        defaultValue: '',
      });

      const dateString = new Date().toISOString();
      zodStorage.set(storage, dateString);
      expect(zodStorage.get(storage)).toBe(dateString);
    });

    it('should handle Map-like objects (plain object)', () => {
      const storage = zs({
        key: 'map',
        schema: z.record(z.string()),
        defaultValue: {},
      });

      const map = { key1: 'value1', key2: 'value2' };
      zodStorage.set(storage, map);
      expect(zodStorage.get(storage)).toEqual(map);
    });

    it('should reject invalid record values', () => {
      const storage = zs({
        key: 'invalid-record',
        schema: z.record(z.number()),
        defaultValue: {},
      });

      localStorage.setItem('invalid-record', JSON.stringify({ a: 1, b: 'not-a-number' }));
      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should handle tuple types', () => {
      const storage = zs({
        key: 'tuple',
        schema: z.tuple([z.string(), z.number(), z.boolean()]),
        defaultValue: ['', 0, false],
      });

      zodStorage.set(storage, ['test', 42, true]);
      expect(zodStorage.get(storage)).toEqual(['test', 42, true]);
    });

    it('should reject tuple with wrong length', () => {
      const storage = zs({
        key: 'tuple-wrong-length',
        schema: z.tuple([z.string(), z.number()]),
        defaultValue: ['', 0],
      });

      localStorage.setItem('tuple-wrong-length', JSON.stringify(['test', 42, 'extra']));
      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should reject tuple with wrong type', () => {
      const storage = zs({
        key: 'tuple-wrong-type',
        schema: z.tuple([z.string(), z.number()]),
        defaultValue: ['', 0],
      });

      localStorage.setItem('tuple-wrong-type', JSON.stringify([42, 'test']));
      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should handle discriminated unions', () => {
      const schema = z.discriminatedUnion('type', [
        z.object({ type: z.literal('text'), value: z.string() }),
        z.object({ type: z.literal('number'), value: z.number() }),
      ]);

      const storage = zs({
        key: 'discriminated',
        schema,
        defaultValue: { type: 'text', value: '' },
      });

      zodStorage.set(storage, { type: 'number', value: 42 });
      expect(zodStorage.get(storage)).toEqual({ type: 'number', value: 42 });
    });

    it('should reject invalid discriminated union', () => {
      const schema = z.discriminatedUnion('type', [
        z.object({ type: z.literal('text'), value: z.string() }),
        z.object({ type: z.literal('number'), value: z.number() }),
      ]);

      const storage = zs({
        key: 'invalid-discriminated',
        schema,
        defaultValue: { type: 'text', value: '' },
      });

      localStorage.setItem(
        'invalid-discriminated',
        JSON.stringify({ type: 'number', value: 'not-a-number' })
      );
      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should handle transformed schemas', () => {
      const schema = z.string().transform((val) => val.toUpperCase());

      const storage = zs({
        key: 'transform',
        schema,
        defaultValue: '',
      });

      zodStorage.set(storage, 'hello');
      // Transform happens during parse, so get should return transformed value
      expect(zodStorage.get(storage)).toBe('HELLO');
    });

    it('should handle refined schemas with custom validation', () => {
      const schema = z.string().refine((val) => val.length >= 3, {
        message: 'String must be at least 3 characters',
      });

      const storage = zs({
        key: 'refined',
        schema,
        defaultValue: 'default',
      });

      zodStorage.set(storage, 'valid');
      expect(zodStorage.get(storage)).toBe('valid');

      // Set invalid value directly to localStorage
      localStorage.setItem('refined', JSON.stringify('ab'));
      expect(zodStorage.get(storage)).toBeNull();
      expect(zodStorage.get(storage, { onFailure: 'default' })).toBe('default');
    });

    it('should handle min/max constraints on numbers', () => {
      const schema = z.number().min(0).max(100);

      const storage = zs({
        key: 'constrained',
        schema,
        defaultValue: 50,
      });

      zodStorage.set(storage, 75);
      expect(zodStorage.get(storage)).toBe(75);

      localStorage.setItem('constrained', JSON.stringify(150));
      expect(zodStorage.get(storage)).toBeNull();

      localStorage.setItem('constrained', JSON.stringify(-10));
      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should handle email validation', () => {
      const storage = zs({
        key: 'email',
        schema: z.string().email(),
        defaultValue: '',
      });

      zodStorage.set(storage, 'test@example.com');
      expect(zodStorage.get(storage)).toBe('test@example.com');

      localStorage.setItem('email', JSON.stringify('not-an-email'));
      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should handle url validation', () => {
      const storage = zs({
        key: 'url',
        schema: z.string().url(),
        defaultValue: '',
      });

      zodStorage.set(storage, 'https://example.com');
      expect(zodStorage.get(storage)).toBe('https://example.com');

      localStorage.setItem('url', JSON.stringify('not-a-url'));
      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should handle regex pattern validation', () => {
      const storage = zs({
        key: 'pattern',
        schema: z.string().regex(/^[A-Z]{3}-\d{3}$/),
        defaultValue: '',
      });

      zodStorage.set(storage, 'ABC-123');
      expect(zodStorage.get(storage)).toBe('ABC-123');

      localStorage.setItem('pattern', JSON.stringify('invalid-pattern'));
      expect(zodStorage.get(storage)).toBeNull();
    });
  });

  describe('zodStorage methods', () => {
    it('should work with init method', () => {
      const storage = zs({
        key: 'initTest',
        schema: z.array(z.number()),
        defaultValue: [1, 2, 3],
      });

      zodStorage.init(storage);
      expect(zodStorage.get(storage)).toEqual([1, 2, 3]);
    });

    it('should work with remove method', () => {
      const storage = zs({
        key: 'removeTest',
        schema: z.array(z.number()),
        defaultValue: [],
      });

      zodStorage.set(storage, [1, 2, 3]);
      expect(zodStorage.get(storage)).toEqual([1, 2, 3]);

      zodStorage.remove(storage);
      expect(zodStorage.get(storage)).toBeNull();
    });
  });

  describe('data corruption scenarios', () => {
    it('should reject when user manually corrupts object with wrong type fields', () => {
      const storage = zs({
        key: 'user-profile',
        schema: z.object({
          id: z.number(),
          name: z.string(),
          age: z.number(),
          isActive: z.boolean(),
        }),
        defaultValue: { id: 0, name: '', age: 0, isActive: false },
      });

      // User changed types via developer tools
      localStorage.setItem(
        'user-profile',
        JSON.stringify({
          id: '123', // should be number but is string
          name: 'John',
          age: '25', // should be number but is string
          isActive: 'true', // should be boolean but is string
        })
      );

      expect(zodStorage.get(storage)).toBeNull();
      expect(zodStorage.get(storage, { onFailure: 'default' })).toEqual({
        id: 0,
        name: '',
        age: 0,
        isActive: false,
      });
    });

    it('should reject when array contains mixed types', () => {
      const storage = zs({
        key: 'scores',
        schema: z.array(z.number()),
        defaultValue: [],
      });

      // User added invalid values via developer tools
      localStorage.setItem('scores', JSON.stringify([100, 95, '80', 75, null, 60]));

      expect(zodStorage.get(storage)).toBeNull();
      expect(zodStorage.get(storage, { onFailure: 'default' })).toEqual([]);
    });

    it('should reject when required fields are missing', () => {
      const storage = zs({
        key: 'settings',
        schema: z.object({
          theme: z.string(),
          fontSize: z.number(),
          notifications: z.boolean(),
        }),
        defaultValue: { theme: 'light', fontSize: 14, notifications: true },
      });

      // User saved only some fields
      localStorage.setItem('settings', JSON.stringify({ theme: 'dark' }));

      expect(zodStorage.get(storage)).toBeNull();
      expect(zodStorage.get(storage, { onFailure: 'default' })).toEqual({
        theme: 'light',
        fontSize: 14,
        notifications: true,
      });
    });

    it('should reject when enum value is changed to invalid value', () => {
      const storage = zs({
        key: 'status',
        schema: z.enum(['pending', 'active', 'completed']),
        defaultValue: 'pending',
      });

      // User changed to invalid enum value
      localStorage.setItem('status', JSON.stringify('cancelled'));

      expect(zodStorage.get(storage)).toBeNull();
      expect(zodStorage.get(storage, { onFailure: 'default' })).toBe('pending');
    });

    it('should reject when array of objects has corrupted items', () => {
      const storage = zs({
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

      // Some items have incorrect format
      localStorage.setItem(
        'todos',
        JSON.stringify([
          { id: 1, text: 'Task 1', completed: false },
          { id: '2', text: 'Task 2', completed: false }, // id is string
          { id: 3, text: 'Task 3' }, // completed missing
          { id: 4, text: 'Task 4', completed: 'yes' }, // not a boolean
        ])
      );

      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should reject when nested object structure is broken', () => {
      const storage = zs({
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

      // nested object is flattened
      localStorage.setItem(
        'config',
        JSON.stringify({
          app: { name: 'MyApp' }, // version missing
          user: 'admin', // not an object
        })
      );

      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should reject when union type receives invalid value', () => {
      const storage = zs({
        key: 'value',
        schema: z.union([z.string(), z.number()]),
        defaultValue: '',
      });

      // Type not included in union
      localStorage.setItem('value', JSON.stringify({ invalid: 'object' }));

      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should reject when array contains objects instead of primitives', () => {
      const storage = zs({
        key: 'tags',
        schema: z.array(z.string()),
        defaultValue: [],
      });

      // Object in string array
      localStorage.setItem('tags', JSON.stringify(['tag1', { name: 'tag2' }, 'tag3']));

      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should reject when boolean receives truthy/falsy values instead of boolean', () => {
      const storage = zs({
        key: 'enabled',
        schema: z.boolean(),
        defaultValue: false,
      });

      // Truthy values instead of boolean
      localStorage.setItem('enabled', JSON.stringify(1));
      expect(zodStorage.get(storage)).toBeNull();

      localStorage.setItem('enabled', JSON.stringify('true'));
      expect(zodStorage.get(storage)).toBeNull();

      localStorage.setItem('enabled', JSON.stringify([]));
      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should reject when number receives numeric string', () => {
      const storage = zs({
        key: 'count',
        schema: z.number(),
        defaultValue: 0,
      });

      // Numeric-looking string
      localStorage.setItem('count', JSON.stringify('123'));

      expect(zodStorage.get(storage)).toBeNull();
      expect(zodStorage.get(storage, { onFailure: 'default' })).toBe(0);
    });

    it('should reject when object array receives primitive array', () => {
      const storage = zs({
        key: 'items',
        schema: z.array(z.object({ id: z.number() })),
        defaultValue: [],
      });

      // Primitive array instead of object array
      localStorage.setItem('items', JSON.stringify([1, 2, 3]));

      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should reject when literal type receives different value', () => {
      const storage = zs({
        key: 'version',
        schema: z.literal('v1.0.0'),
        defaultValue: 'v1.0.0',
      });

      localStorage.setItem('version', JSON.stringify('v2.0.0'));

      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should reject malformed JSON from manual editing', () => {
      const storage = zs({
        key: 'data',
        schema: z.object({ value: z.string() }),
        defaultValue: { value: '' },
      });

      // User manually wrote invalid JSON
      localStorage.setItem('data', '{value: "test"}'); // no quotes
      expect(zodStorage.get(storage)).toBeNull();

      localStorage.setItem('data', '{"value": "test",}'); // trailing comma
      expect(zodStorage.get(storage)).toBeNull();

      localStorage.setItem('data', "{'value': 'test'}"); // single quotes
      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should reject when accidentally storing stringified JSON twice', () => {
      const storage = zs({
        key: 'double-stringified',
        schema: z.object({ id: z.number() }),
        defaultValue: { id: 0 },
      });

      // Stringify JSON twice (can happen by mistake)
      const data = { id: 123 };
      const onceStringified = JSON.stringify(data); // '{"id":123}'
      const twiceStringified = JSON.stringify(onceStringified); // '"{\\"id\\":123}"'

      localStorage.setItem('double-stringified', twiceStringified);

      // One JSON.parse returns a string, which doesn't match the schema
      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should reject when type is completely wrong (array instead of object)', () => {
      const storage = zs({
        key: 'user',
        schema: z.object({ name: z.string() }),
        defaultValue: { name: '' },
      });

      localStorage.setItem('user', JSON.stringify(['John', 'Doe']));

      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should reject when type is completely wrong (object instead of array)', () => {
      const storage = zs({
        key: 'list',
        schema: z.array(z.string()),
        defaultValue: [],
      });

      localStorage.setItem('list', JSON.stringify({ 0: 'item1', 1: 'item2' }));

      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should reject empty object when non-empty object expected', () => {
      const storage = zs({
        key: 'required-fields',
        schema: z.object({
          id: z.number(),
          name: z.string(),
        }),
        defaultValue: { id: 0, name: '' },
      });

      localStorage.setItem('required-fields', JSON.stringify({}));

      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should reject when nested array structure is corrupted', () => {
      const storage = zs({
        key: 'matrix',
        schema: z.array(z.array(z.number())),
        defaultValue: [],
      });

      // Some nested arrays are flattened
      localStorage.setItem('matrix', JSON.stringify([[1, 2], 3, [4, 5]]));

      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should reject when record keys have invalid values', () => {
      const storage = zs({
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

      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should reject when optional field has wrong type', () => {
      const storage = zs({
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

      expect(zodStorage.get(storage)).toBeNull();
    });
  });

  describe('storage types', () => {
    beforeEach(() => {
      sessionStorage.clear();
    });

    it('should use localStorage by default', () => {
      const storage = zs({
        key: 'localData',
        schema: z.string(),
        defaultValue: '',
      });

      zodStorage.set(storage, 'test');
      expect(localStorage.getItem('localData')).toBe(JSON.stringify('test'));
      expect(sessionStorage.getItem('localData')).toBeNull();
    });

    it('should use sessionStorage when specified', () => {
      const storage = zs({
        key: 'sessionData',
        schema: z.string(),
        defaultValue: '',
        storage: 'session',
      });

      zodStorage.set(storage, 'test');
      expect(sessionStorage.getItem('sessionData')).toBe(JSON.stringify('test'));
      expect(localStorage.getItem('sessionData')).toBeNull();
    });

    it('should work with sessionStorage get/set/remove', () => {
      const storage = zs({
        key: 'sessionTest',
        schema: z.array(z.number()),
        defaultValue: [],
        storage: 'session',
      });

      zodStorage.set(storage, [1, 2, 3]);
      expect(zodStorage.get(storage)).toEqual([1, 2, 3]);

      zodStorage.remove(storage);
      expect(zodStorage.get(storage)).toBeNull();
    });

    it('should work with sessionStorage init', () => {
      const storage = zs({
        key: 'sessionInit',
        schema: z.number(),
        defaultValue: 42,
        storage: 'session',
      });

      zodStorage.init(storage);
      expect(zodStorage.get(storage)).toBe(42);
      expect(sessionStorage.getItem('sessionInit')).toBe(JSON.stringify(42));
    });

    it('should handle validation failures in sessionStorage', () => {
      const storage = zs({
        key: 'sessionValidation',
        schema: z.number(),
        defaultValue: 0,
        storage: 'session',
      });

      sessionStorage.setItem('sessionValidation', JSON.stringify('not a number'));
      expect(zodStorage.get(storage)).toBeNull();
      expect(zodStorage.get(storage, { onFailure: 'default' })).toBe(0);
    });
  });
});
