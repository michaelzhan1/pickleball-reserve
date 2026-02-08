import { CacheItem } from '../types/types';
import { decrypt, encrypt } from './crypto.util';

const cache = new Map<string, CacheItem>();

export function setCache(
  username: string,
  password: string,
  ttlMinutes: number,
): void {
  const expiry = new Date(Date.now() + ttlMinutes * 60 * 1000);
  cache.set(username, { data: encrypt(password), expiry });
}

export function checkCache(username: string, password: string): boolean {
  const cacheItem = cache.get(username);
  if (!cacheItem) {
    return false;
  }

  if (cacheItem.expiry < new Date()) {
    cache.delete(username);
    return false;
  }

  return password === decrypt(cacheItem.data);
}
