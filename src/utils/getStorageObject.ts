import { StorageType } from '@/types/storage.type';

/**
 * Returns the storage object.
 */
export const getStorageObject = (type: StorageType = 'local'): Storage => {
  return type === 'session' ? sessionStorage : localStorage;
};
