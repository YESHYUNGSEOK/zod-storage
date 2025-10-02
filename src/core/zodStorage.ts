import { SafeStorage, SafeStorageGetOptions } from '@/types/type';
import { getStorageObject } from '../utils/getStorageObject';

/**
 * Retrieves a value from storage.
 * - Returns null or defaultValue based on options if JSON parse or Zod schema validation fails
 *
 * @template T The type of the stored value
 * @param {SafeStorage<T>} storageConfig - Storage configuration including key, schema, and defaultValue
 * @returns {T | null} The stored value, or `null` if not found
 */
function get<T>(storageConfig: SafeStorage<T>): T | null;
/**
 * Retrieves a value from storage.
 * - Returns null or defaultValue based on options if JSON parse or Zod schema validation fails
 *
 * @template T The type of the stored value
 * @param {SafeStorage<T>} storageConfig - Storage configuration including key, schema, and defaultValue
 * @param {SafeStorageGetOptions} options - Optional options
 * @returns {T | null} The stored value, `null` if not found, or `defaultValue`/`null` based on options if invalid
 */
function get<T>(storageConfig: SafeStorage<T>, options: SafeStorageGetOptions): T | null;
function get<T>(storageConfig: SafeStorage<T>, options?: SafeStorageGetOptions): T | null {
  const { key, value: schema, defaultValue, storage = 'local' } = storageConfig;
  const { onFailure = 'null' } = options ?? {};

  const storageObj = getStorageObject(storage);

  try {
    const raw = storageObj.getItem(key);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    const result = schema.safeParse(parsed);

    if (result.success) {
      return result.data;
    }

    // Zod validation failed
    if (onFailure === 'throw') {
      throw result.error;
    }

    return onFailure === 'default' ? defaultValue : null;
  } catch (err) {
    // JSON.parse or other runtime error
    if (onFailure === 'throw') {
      if (err instanceof Error) {
        throw new Error(`SafeStorage parsing error: ${err.message}`);
      }

      throw new Error('SafeStorage: Unknown error');
    }

    return onFailure === 'default' ? defaultValue : null;
  }
}

/**
 * Stores a value in storage.
 *
 * @template T The type of the stored value
 * @param {SafeStorage<T>} storageConfig - Storage configuration including key, schema, and defaultValue
 * @param {T} data - The data to store
 * @returns {void}
 */
function set<T>(storageConfig: SafeStorage<T>, data: T): void {
  const { key, storage = 'local' } = storageConfig;
  const storageObj = getStorageObject(storage);

  storageObj.setItem(key, JSON.stringify(data));
}

/**
 * Removes a value from storage for the given key.
 *
 * @template T The type of the stored value
 * @param {SafeStorage<T>} storageConfig - Storage configuration including key, schema, and defaultValue
 * @returns {void}
 */
function remove<T>(storageConfig: SafeStorage<T>): void {
  const { key, storage = 'local' } = storageConfig;
  const storageObj = getStorageObject(storage);

  storageObj.removeItem(key);
}

/**
 * Initializes storage with the default value.
 * (Overwrites unconditionally without checking existence)
 *
 * @template T The type of the stored value
 * @param {SafeStorage<T>} storageConfig - Storage configuration including key, schema, and defaultValue
 * @returns {void}
 */
function init<T>(storageConfig: SafeStorage<T>): void {
  const { defaultValue } = storageConfig;
  set(storageConfig, defaultValue);
}

/**
 * Type-safe Web Storage utility based on Zod schema
 * Supports both localStorage and sessionStorage.
 *
 * @example
 * ```ts
 * import { zs, zodStorage } from "zod-storage";
 * import { z } from "zod";
 *
 * // Using localStorage (default)
 * const LocalData = zs({
 *   key: 'localData',
 *   schema: z.array(z.number()),
 *   defaultValue: []
 * });
 *
 * // Using sessionStorage
 * const SessionData = zs({
 *   key: 'sessionData',
 *   schema: z.string(),
 *   defaultValue: '',
 *   storage: 'session'
 * });
 *
 * zodStorage.set(LocalData, [1, 2, 3]);
 * const ids = zodStorage.get(LocalData);
 *
 * zodStorage.set(SessionData, 'hello');
 * const data = zodStorage.get(SessionData);
 * ```
 */
export const zodStorage = { get, set, remove, init };
