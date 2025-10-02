import { SafeStorage } from '@/types/ss.type';
import { SafeStorageGetOptions } from '../types/safe-storage.type';
import { getStorageObject } from '../utils/getStorageObject';

/**
 * 스토리지에서 값을 가져옵니다.
 * - JSON parse 및 zod schema validation을 통과하지 못하면 옵션에 따라 null 또는 defaultValue 반환
 *
 * @template T 저장되는 값의 타입
 * @param {SafeStorage<T>} storageConfig - key, schema, defaultValue를 포함한 스토리지 설정
 * @returns {T | null} 저장된 값. 값이 없으면 `null`
 */
function get<T>(storageConfig: SafeStorage<T>): T | null;
/**
 * 스토리지에서 값을 가져옵니다.
 * - JSON parse 및 zod schema validation을 통과하지 못하면 옵션에 따라 null 또는 defaultValue 반환
 *
 * @template T 저장되는 값의 타입
 * @param {SafeStorage<T>} storageConfig - key, schema, defaultValue를 포함한 스토리지 설정
 * @param {SafeStorageGetOptions} options - 선택적 옵션
 * @returns {T | null} 저장된 값. 값이 없으면 `null`, 잘못된 값이면 옵션에 따라 `defaultValue` 또는 `null`
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

    // ❌ Zod validation 실패
    if (onFailure === 'throw') {
      throw result.error;
    }

    return onFailure === 'default' ? defaultValue : null;
  } catch (err) {
    // ❌ JSON.parse 등 런타임 에러
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
 * 스토리지에 값을 저장합니다.
 *
 * @template T 저장되는 값의 타입
 * @param {SafeStorage<T>} storageConfig - key, schema, defaultValue를 포함한 스토리지 설정
 * @param {T} data - 저장할 데이터
 * @returns {void}
 */
function set<T>(storageConfig: SafeStorage<T>, data: T): void {
  const { key, storage = 'local' } = storageConfig;
  const storageObj = getStorageObject(storage);

  storageObj.setItem(key, JSON.stringify(data));
}

/**
 * 스토리지에서 해당 키의 값을 제거합니다.
 *
 * @template T 저장되는 값의 타입
 * @param {SafeStorage<T>} storageConfig - key, schema, defaultValue를 포함한 스토리지 설정
 * @returns {void}
 */
function remove<T>(storageConfig: SafeStorage<T>): void {
  const { key, storage = 'local' } = storageConfig;
  const storageObj = getStorageObject(storage);

  storageObj.removeItem(key);
}

/**
 * 스토리지 값을 기본값(defaultValue)으로 초기화합니다.
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
 * Zod 스키마 기반 타입 안전한 Web Storage 유틸
 * localStorage와 sessionStorage를 지원합니다.
 *
 * @example
 * ```ts
 * import { ss, safeStorage } from "@package/safe-storage";
 * import { z } from "zod";
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
 *
 * safeStorage.set(SessionData, 'hello');
 * const data = safeStorage.get(SessionData);
 * ```
 */
export const safeStorage = { get, set, remove, init };
