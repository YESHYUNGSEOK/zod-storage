import z, { ZodType } from 'zod';
import { SafeStorage } from './types';

/**
 * SafeStorage config 객체를 생성합니다.
 *
 * @template Schema zod schema 타입
 * @param {object} config - 스토리지 설정
 * @param {string} config.key - 로컬 스토리지 key
 * @param {Schema} config.schema - zod schema
 * @param {z.infer<Schema>} config.defaultValue - 기본값
 * @returns {SafeStorage<z.infer<Schema>>} SafeStorage config 객체
 *
 * @example
 * ```ts
 * import { ss, safeStorage } from '@package/safe-storage';
 * import { z } from 'zod';
 *
 * const CampaignReviewTooltipStorage = ss({
 *   key: 'campaignReviewTooltipViewedIds',
 *   schema: z.array(z.number()),
 *   defaultValue: []
 * });
 *
 * const GenderStorage = ss({
 *   key: 'gender',
 *   schema: z.enum(['Man', 'Woman', 'Other']),
 *   defaultValue: 'Man'
 * });
 *
 * safeStorage.set(CampaignReviewTooltipStorage, [1, 2, 3]);
 * const ids = safeStorage.get(CampaignReviewTooltipStorage);
 * ```
 */
export function ss<Schema extends ZodType>(config: {
  key: string;
  schema: Schema;
  defaultValue: z.infer<Schema>;
}): SafeStorage<z.infer<Schema>> {
  return {
    key: config.key,
    value: config.schema,
    defaultValue: config.defaultValue,
  };
}
