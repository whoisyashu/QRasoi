/**
 * In-Memory TTL Cache Service for Read-Heavy Resources (e.g. Public Digital Menus)
 * Prevents redundant DB queries & cuts menu loading time to <5ms
 */
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class CacheService {
  private store: Map<string, CacheEntry<any>> = new Map();

  /**
   * Get cached entry if present and not expired
   */
  public get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached entry with TTL in milliseconds (default 5 minutes)
   */
  public set<T>(key: string, data: T, ttlMs: number = 300000): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Invalidate specific key or keys matching prefix
   */
  public invalidate(keyOrPrefix: string): void {
    for (const key of this.store.keys()) {
      if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear entire cache
   */
  public clear(): void {
    this.store.clear();
  }
}

export const cacheService = new CacheService();
