import { ZodType } from 'zod';

/**
 * 타입 안전한 로컬 스토리지 엔트리 설정을 정의하는 타입
 *
 * @template T 저장되는 값의 타입
 *
 * @property {string} key
 *   - 로컬 스토리지 key
 *   - 실제 localStorage.getItem / setItem 시 사용되는 문자열
 *
 * @property {ZodType<T>} value
 *   - 저장된 데이터를 검증/파싱할 zod schema
 *   - get 시에 JSON.parse 후 schema.safeParse로 검증
 *
 * @property {T | undefined} defaultValue
 *   - init을 위한 기본값 (선택적)
 *   - 없으면 get 시 파싱 실패 시 에러 발생하거나 null 반환
 */
export type SafeStorage<T> = {
  key: string;
  value: ZodType<T>;
  defaultValue?: T;
};
