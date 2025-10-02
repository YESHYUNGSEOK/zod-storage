import { z, ZodType } from 'zod';
import { SafeStorage } from './types';

/**
 * SafeStorage config 객체를 생성합니다.
 *
 * @template T 저장되는 값의 타입
 * @param {object} config - 스토리지 설정
 * @param {string} config.key - 로컬 스토리지 key
 * @param {T} config.defaultValue - 기본값
 * @returns {SafeStorage<T>} SafeStorage config 객체
 *
 * @example
 * ```ts
 * import { ss, safeStorage } from '@package/safe-storage';
 *
 * const CampaignReviewTooltipStorage = ss<number[]>({
 *   key: 'campaignReviewTooltipViewedIds',
 *   defaultValue: []
 * });
 *
 * safeStorage.set(CampaignReviewTooltipStorage, [1, 2, 3]);
 * const ids = safeStorage.get(CampaignReviewTooltipStorage);
 * safeStorage.remove(CampaignReviewTooltipStorage);
 * safeStorage.init(CampaignReviewTooltipStorage);
 * ```
 */
export function ss<T>(config: { key: string; defaultValue: T }): SafeStorage<T> {
  const schema = inferSchema(config.defaultValue);
  return {
    key: config.key,
    value: schema,
    defaultValue: config.defaultValue,
  };
}

/**
 * defaultValue로부터 zod schema를 자동 추론합니다.
 */
function inferSchema<T>(defaultValue: T): ZodType<T> {
  if (Array.isArray(defaultValue)) {
    if (defaultValue.length === 0) {
      return z.array(z.unknown()) as unknown as ZodType<T>;
    }

    const firstItem: unknown = defaultValue[0];

    return z.array(inferSchema(firstItem)) as unknown as ZodType<T>;
  }

  if (defaultValue !== null && typeof defaultValue === 'object') {
    const shape: Record<string, ZodType<unknown>> = {};
    for (const key in defaultValue) {
      shape[key] = inferSchema(defaultValue[key]);
    }
    return z.object(shape) as unknown as ZodType<T>;
  }

  switch (typeof defaultValue) {
    case 'string':
      return z.string() as unknown as ZodType<T>;
    case 'number':
      return z.number() as unknown as ZodType<T>;
    case 'boolean':
      return z.boolean() as unknown as ZodType<T>;
    default:
      return z.unknown() as unknown as ZodType<T>;
  }
}
