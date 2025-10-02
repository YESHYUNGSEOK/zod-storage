/**
 * SafeStorage get 메서드의 옵션 타입
 */
export interface SafeStorageGetOptions {
  /**
   * 파싱/검증 실패 시 동작 방식을 지정합니다.
   *
   * - "null": 실패 시 `null` 반환 (기본값)
   * - "default": 실패 시 `defaultValue` 반환
   * - "throw": 실패 시 예외를 던짐
   */
  onFailure?: 'default' | 'null' | 'throw';
}
