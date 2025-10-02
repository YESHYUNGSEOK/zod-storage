import { ZodType } from 'zod';

/**
 * Storage type
 */
export type StorageType = 'local' | 'session';

/**
 * Type defining type-safe storage entry configuration
 *
 * @template T The type of the stored value
 *
 * @property {string} key
 *   - Storage key
 *   - The string used when calling localStorage/sessionStorage.getItem / setItem
 *
 * @property {ZodType<T>} value
 *   - Zod schema to validate/parse stored data
 *   - Validates with schema.safeParse after JSON.parse on get
 *
 * @property {T} defaultValue
 *   - Default value for initialization
 *
 * @property {StorageType} storage
 *   - Storage type to use ("local" | "session")
 *   - Default: "local"
 */
export type SafeStorage<T> = {
  key: string;
  value: ZodType<T>;
  defaultValue: T;
  storage?: StorageType;
};

/**
 * Options type for SafeStorage get method
 */
export interface SafeStorageGetOptions {
  /**
   * Specifies behavior on parsing/validation failure.
   *
   * - "null": Returns `null` on failure (default)
   * - "default": Returns `defaultValue` on failure
   * - "throw": Throws an exception on failure
   */
  onFailure?: 'default' | 'null' | 'throw';
}
