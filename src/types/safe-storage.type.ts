/**
 * Options type for SafeStorage get method
 */
export interface SafeStorageGetOptions {
  /**
   * Specifies behavior on parsing/validation failure.
   *
   * - "null": Returns `null` on failure (default)
   * - "default": Returns `defaultValue` on failure
   * - "throw": Throws an exception on failure
   */
  onFailure?: 'default' | 'null' | 'throw';
}
