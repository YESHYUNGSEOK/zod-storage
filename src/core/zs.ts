import z, { ZodType } from 'zod';
import { SafeStorage, StorageType } from '@/types/type';

/**
 * Creates a SafeStorage configuration object.
 *
 * @template Schema The Zod schema type
 * @param {object} config - Storage configuration
 * @param {string} config.key - Storage key
 * @param {Schema} config.schema - Zod schema
 * @param {z.infer<Schema>} config.defaultValue - Default value
 * @param {StorageType} config.storage - Storage type (default: "local")
 * @returns {SafeStorage<z.infer<Schema>>} SafeStorage configuration object
 *
 * @example
 * ```ts
 * import { zs, zodStorage } from 'zod-storage';
 * import { z } from 'zod';
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
 * ```
 */
export const zs = <Schema extends ZodType>(config: {
  key: string;
  schema: Schema;
  defaultValue: z.infer<Schema>;
  storage?: StorageType;
}): SafeStorage<z.infer<Schema>> => {
  return {
    key: config.key,
    value: config.schema,
    defaultValue: config.defaultValue,
    storage: config.storage,
  };
};
