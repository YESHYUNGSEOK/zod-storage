import z, { ZodType } from 'zod';
import { SafeStorage } from '@/types/ss.type';
import { StorageType } from '../types/storage.type';

/**
 * SafeStorage config 객체를 생성합니다.
 *
 * @template Schema zod schema 타입
 * @param {object} config - 스토리지 설정
 * @param {string} config.key - 스토리지 key
 * @param {Schema} config.schema - zod schema
 * @param {z.infer<Schema>} config.defaultValue - 기본값
 * @param {StorageType} config.storage - 스토리지 타입 (기본값: "local")
 * @returns {SafeStorage<z.infer<Schema>>} SafeStorage config 객체
 *
 * @example
 * ```ts
 * import { ss, safeStorage } from '@package/safe-storage';
 * import { z } from 'zod';
 *
 * // localStorage 사용 (기본)
 * const LocalData = ss({
 *   key: 'localData',
 *   schema: z.array(z.number()),
 *   defaultValue: []
 * });
 *
 * // sessionStorage 사용
 * const SessionData = ss({
 *   key: 'sessionData',
 *   schema: z.string(),
 *   defaultValue: '',
 *   storage: 'session'
 * });
 *
 * safeStorage.set(LocalData, [1, 2, 3]);
 * const ids = safeStorage.get(LocalData);
 * ```
 */
export function ss<Schema extends ZodType>(config: {
  key: string;
  schema: Schema;
  defaultValue: z.infer<Schema>;
  storage?: StorageType;
}): SafeStorage<z.infer<Schema>> {
  return {
    key: config.key,
    value: config.schema,
    defaultValue: config.defaultValue,
    storage: config.storage,
  };
}
