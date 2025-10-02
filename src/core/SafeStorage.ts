import { SafeStorage } from '@/types/safe-storage';

/**
 * 로컬 스토리지에서 값을 가져옵니다.
 * - JSON parse 및 zod schema validation을 통과하지 못하면 strict 옵션에 따라 null 또는 defaultValue 반환
 *
 * @template T 저장되는 값의 타입
 * @param {SafeStorage<T>} storageConfig - key, schema, defaultValue를 포함한 스토리지 설정
 * @returns {T | null} 저장된 값. 값이 없으면 `null`, 잘못된 값이면 `defaultValue`
 */
function get<T>(storageConfig: SafeStorage<T>): T | null;
/**
 * 로컬 스토리지에서 값을 가져옵니다.
 * - JSON parse 및 zod schema validation을 통과하지 못하면 strict 옵션에 따라 null 또는 defaultValue 반환
 *
 * @template T 저장되는 값의 타입
 * @param {SafeStorage<T>} storageConfig - key, schema, defaultValue를 포함한 스토리지 설정
 * @param {object} options - 선택적 옵션
 * @param {boolean} options.strict - true일 경우 parse 실패 시 null 반환, false일 경우 defaultValue 반환 (기본값: false)
 * @returns {T | null} 저장된 값. 값이 없으면 `null`, 잘못된 값이면 옵션에 따라 `defaultValue` 또는 `null`
 */
function get<T>(storageConfig: SafeStorage<T>, options: { strict?: boolean }): T | null;
function get<T>(storageConfig: SafeStorage<T>, options?: { strict?: boolean }): T | null {
  const { key, value: schema, defaultValue } = storageConfig;
  const { strict = false } = options ?? {};

  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    const result = schema.safeParse(parsed);

    return result.success ? result.data : strict ? null : defaultValue;
  } catch {
    return strict ? null : defaultValue;
  }
}

/**
 * 로컬 스토리지에 값을 저장합니다.
 *
 * @template T 저장되는 값의 타입
 * @param {SafeStorage<T>} storageConfig - key, schema, defaultValue를 포함한 스토리지 설정
 * @param {T} data - 저장할 데이터
 * @returns {void}
 */
function set<T>(storageConfig: SafeStorage<T>, data: T): void {
  const { key } = storageConfig;
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * 로컬 스토리지에서 해당 키의 값을 제거합니다.
 *
 * @template T 저장되는 값의 타입
 * @param {SafeStorage<T>} storageConfig - key, schema, defaultValue를 포함한 스토리지 설정
 * @returns {void}
 */
function remove<T>(storageConfig: SafeStorage<T>): void {
  const { key } = storageConfig;
  localStorage.removeItem(key);
}

/**
 * 로컬 스토리지 값을 기본값(defaultValue)으로 초기화합니다.
 * (존재 여부 확인 없이 무조건 덮어씀)
 *
 * @template T 저장되는 값의 타입
 * @param {SafeStorage<T>} storageConfig - key, schema, defaultValue를 포함한 스토리지 설정
 * @returns {void}
 */
function init<T>(storageConfig: SafeStorage<T>): void {
  const { defaultValue } = storageConfig;
  set(storageConfig, defaultValue);
}

/**
 * Zod 스키마 기반 타입 안전한 로컬 스토리지 유틸
 *
 * @example
 * ```ts
 * import { CampaignTooltipViewedIdsStorage } from "@/storages/campaign";
 *
 * safeStorage.set(CampaignTooltipViewedIdsStorage, [1, 2, 3]);
 * const ids = safeStorage.get(CampaignTooltipViewedIdsStorage);
 * safeStorage.remove(CampaignTooltipViewedIdsStorage);
 * safeStorage.init(CampaignTooltipViewedIdsStorage);
 * ```
 */
export const safeStorage = { get, set, remove, init };
