import { StorageType } from '@/types/storage.type';

/**
 * 스토리지 객체를 반환합니다.
 */
export const getStorageObject = (type: StorageType = 'local'): Storage => {
  return type === 'session' ? sessionStorage : localStorage;
};
