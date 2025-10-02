import { describe, it, expect, beforeEach } from 'vitest';
import { ss } from '../ss';
import { safeStorage } from '../safe-storage';

describe('ss function', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('primitive types', () => {
    it('should work with number array', () => {
      const storage = ss<number[]>({
        key: 'numbers',
        defaultValue: [],
      });

      safeStorage.set(storage, [1, 2, 3]);
      expect(safeStorage.get(storage)).toEqual([1, 2, 3]);
    });

    it('should work with string array', () => {
      const storage = ss<string[]>({
        key: 'strings',
        defaultValue: [],
      });

      safeStorage.set(storage, ['a', 'b', 'c']);
      expect(safeStorage.get(storage)).toEqual(['a', 'b', 'c']);
    });

    it('should work with boolean', () => {
      const storage = ss<boolean>({
        key: 'flag',
        defaultValue: false,
      });

      safeStorage.set(storage, true);
      expect(safeStorage.get(storage)).toBe(true);
    });

    it('should work with number', () => {
      const storage = ss<number>({
        key: 'count',
        defaultValue: 0,
      });

      safeStorage.set(storage, 42);
      expect(safeStorage.get(storage)).toBe(42);
    });

    it('should work with string', () => {
      const storage = ss<string>({
        key: 'name',
        defaultValue: '',
      });

      safeStorage.set(storage, 'John');
      expect(safeStorage.get(storage)).toBe('John');
    });
  });

  describe('custom types', () => {
    it('should work with custom object type', () => {
      type User = {
        id: number;
        name: string;
        email: string;
      };

      const storage = ss<User>({
        key: 'user',
        defaultValue: {
          id: 0,
          name: '',
          email: '',
        },
      });

      const user: User = {
        id: 1,
        name: 'John',
        email: 'john@example.com',
      };

      safeStorage.set(storage, user);
      expect(safeStorage.get(storage)).toEqual(user);
    });

    it('should work with nested object type', () => {
      type Profile = {
        user: {
          id: number;
          name: string;
        };
        settings: {
          theme: string;
          notifications: boolean;
        };
      };

      const storage = ss<Profile>({
        key: 'profile',
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

      const profile: Profile = {
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
      type Task = {
        id: number;
        title: string;
        completed: boolean;
      };

      const storage = ss<Task[]>({
        key: 'tasks',
        defaultValue: [],
      });

      const tasks: Task[] = [
        { id: 1, title: 'Task 1', completed: false },
        { id: 2, title: 'Task 2', completed: true },
      ];

      safeStorage.set(storage, tasks);
      expect(safeStorage.get(storage)).toEqual(tasks);
    });
  });

  describe('enum types', () => {
    it('should work with string enum', () => {
      enum Theme {
        Light = 'light',
        Dark = 'dark',
        Auto = 'auto',
      }

      const storage = ss<Theme>({
        key: 'theme',
        defaultValue: Theme.Light,
      });

      safeStorage.set(storage, Theme.Dark);
      expect(safeStorage.get(storage)).toBe(Theme.Dark);
    });

    it('should work with numeric enum', () => {
      enum Status {
        Pending = 0,
        InProgress = 1,
        Completed = 2,
      }

      const storage = ss<Status>({
        key: 'status',
        defaultValue: Status.Pending,
      });

      safeStorage.set(storage, Status.Completed);
      expect(safeStorage.get(storage)).toBe(Status.Completed);
    });

    it('should work with array of enums', () => {
      enum Color {
        Red = 'red',
        Green = 'green',
        Blue = 'blue',
      }

      const storage = ss<Color[]>({
        key: 'colors',
        defaultValue: [],
      });

      const colors: Color[] = [Color.Red, Color.Blue];
      safeStorage.set(storage, colors);
      expect(safeStorage.get(storage)).toEqual(colors);
    });

    it('should work with object containing enums', () => {
      enum Role {
        Admin = 'admin',
        User = 'user',
        Guest = 'guest',
      }

      type UserWithRole = {
        id: number;
        name: string;
        role: Role;
      };

      const storage = ss<UserWithRole>({
        key: 'userWithRole',
        defaultValue: {
          id: 0,
          name: '',
          role: Role.Guest,
        },
      });

      const user: UserWithRole = {
        id: 1,
        name: 'John',
        role: Role.Admin,
      };

      safeStorage.set(storage, user);
      expect(safeStorage.get(storage)).toEqual(user);
    });
  });

  describe('edge cases', () => {
    it('should return null when key does not exist', () => {
      const storage = ss<number[]>({
        key: 'nonexistent',
        defaultValue: [],
      });

      expect(safeStorage.get(storage)).toBeNull();
    });

    it('should return defaultValue when stored value is invalid (non-strict mode)', () => {
      const storage = ss<number[]>({
        key: 'invalid',
        defaultValue: [1, 2, 3],
      });

      localStorage.setItem('invalid', 'invalid json');
      expect(safeStorage.get(storage)).toEqual([1, 2, 3]);
    });

    it('should return null when stored value is invalid (strict mode)', () => {
      const storage = ss<number[]>({
        key: 'invalid',
        defaultValue: [1, 2, 3],
      });

      localStorage.setItem('invalid', 'invalid json');
      expect(safeStorage.get(storage, { strict: true })).toBeNull();
    });

    it('should work with empty array defaultValue', () => {
      const storage = ss<number[]>({
        key: 'empty',
        defaultValue: [],
      });

      safeStorage.set(storage, []);
      expect(safeStorage.get(storage)).toEqual([]);
    });

    it('should work with complex union types', () => {
      type ComplexType = {
        id: number;
        data: string | number | boolean;
      };

      const storage = ss<ComplexType>({
        key: 'complex',
        defaultValue: {
          id: 0,
          data: '',
        },
      });

      const value: ComplexType = {
        id: 1,
        data: 'test',
      };

      safeStorage.set(storage, value);
      expect(safeStorage.get(storage)).toEqual(value);
    });
  });

  describe('safeStorage methods', () => {
    it('should work with init method', () => {
      const storage = ss<number[]>({
        key: 'initTest',
        defaultValue: [1, 2, 3],
      });

      safeStorage.init(storage);
      expect(safeStorage.get(storage)).toEqual([1, 2, 3]);
    });

    it('should work with remove method', () => {
      const storage = ss<number[]>({
        key: 'removeTest',
        defaultValue: [],
      });

      safeStorage.set(storage, [1, 2, 3]);
      expect(safeStorage.get(storage)).toEqual([1, 2, 3]);

      safeStorage.remove(storage);
      expect(safeStorage.get(storage)).toBeNull();
    });
  });
});
