import z, { ZodType } from 'zod';
import { SafeStorage } from './types';

/**
 * SafeStorage config 객체를 생성합니다 (defaultValue 있음).
 *
 * @template Schema zod schema 타입
 * @param {object} config - 스토리지 설정
 * @param {string} config.key - 로컬 스토리지 key
 * @param {Schema} config.schema - zod schema
 * @param {z.infer<Schema>} config.defaultValue - 기본값
 * @returns {SafeStorage<z.infer<Schema>>} SafeStorage config 객체
 */
export function ss<Schema extends ZodType>(config: {
  key: string;
  schema: Schema;
  defaultValue: z.infer<Schema>;
}): SafeStorage<z.infer<Schema>>;

/**
 * SafeStorage config 객체를 생성합니다 (defaultValue 없음).
 *
 * @template Schema zod schema 타입
 * @param {object} config - 스토리지 설정
 * @param {string} config.key - 로컬 스토리지 key
 * @param {Schema} config.schema - zod schema
 * @returns {SafeStorage<z.infer<Schema>>} SafeStorage config 객체
 *
 * @example
 * ```ts
 * import { ss, safeStorage } from '@package/safe-storage';
 * import { z } from 'zod';
 *
 * // defaultValue 있음 - 파싱 실패 시 defaultValue 반환
 * const WithDefault = ss({
 *   key: 'withDefault',
 *   schema: z.array(z.number()),
 *   defaultValue: []
 * });
 *
 * // defaultValue 없음 - 파싱 실패 시 무조건 null 반환
 * const WithoutDefault = ss({
 *   key: 'withoutDefault',
 *   schema: z.enum(['Man', 'Woman', 'Other'])
 * });
 *
 * safeStorage.set(WithDefault, [1, 2, 3]);
 * const ids = safeStorage.get(WithDefault);
 * ```
 */
export function ss<Schema extends ZodType>(config: {
  key: string;
  schema: Schema;
}): SafeStorage<z.infer<Schema>>;

export function ss<Schema extends ZodType>(config: {
  key: string;
  schema: Schema;
  defaultValue?: z.infer<Schema>;
}): SafeStorage<z.infer<Schema>> {
  return {
    key: config.key,
    value: config.schema,
    defaultValue: config.defaultValue,
  };
}
