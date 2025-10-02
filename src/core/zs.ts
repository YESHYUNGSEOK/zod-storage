import z, { ZodType } from 'zod';
import { SafeStorage, StorageType } from '@/types/type';

/**
 * ZsConfig type definition
 *
 * Represents the configuration for creating a type-safe storage entry.
 *
 * @template Schema - A Zod schema type
 * @property {string} key - The storage key used to identify the stored value
 * @property {Schema} schema - The Zod schema used for validation
 * @property {z.infer<Schema>} defaultValue - The default value if no data is found
 * @property {StorageType} [storage] - The storage type (e.g., "local" or "session"), defaults to "local"
 */
export type ZsConfig<Schema extends ZodType> = {
  key: string;
  schema: Schema;
  defaultValue: z.infer<Schema>;
  storage?: StorageType;
};

/**
 * Creates a SafeStorage configuration object.
 *
 * @template Schema The Zod schema type
 * @param {ZsConfig<Schema>} config - Storage configuration
 * @returns {SafeStorage<z.infer<Schema>>} SafeStorage configuration object
 */
export const zs = <Schema extends ZodType>(
  config: ZsConfig<Schema>
): SafeStorage<z.infer<Schema>> => {
  return {
    key: config.key,
    value: config.schema,
    defaultValue: config.defaultValue,
    storage: config.storage,
  };
};
