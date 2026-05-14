import redisService from './redis.services'
import { CACHE_KEYS, CACHE_TTL } from '~/constants/redis'

interface SearchCacheData {
  tweets: unknown[]
  total: number
}

function hashSearchQuery(content: string, page: number, limit: number): string {
  return Buffer.from(`${content}:${page}:${limit}`).toString('base64')
}

class SearchCacheService {
  async getSearch(
    userId: string,
    content: string,
    page: number,
    limit: number
  ): Promise<SearchCacheData | null> {
    const hash = hashSearchQuery(content, page, limit)
    const key = CACHE_KEYS.search(userId, hash)
    const cached = await redisService.get<SearchCacheData>(key)
    if (cached) {
      console.log(`[Cache HIT] search:${userId}:${hash.slice(0, 8)}...`)
      return cached
    }
    console.log(`[Cache MISS] search:${userId}:${hash.slice(0, 8)}...`)
    return null
  }

  async setSearch(
    userId: string,
    content: string,
    page: number,
    limit: number,
    data: SearchCacheData
  ): Promise<void> {
    const hash = hashSearchQuery(content, page, limit)
    const key = CACHE_KEYS.search(userId, hash)
    await redisService.set(key, data, CACHE_TTL.search)
    console.log(
      `[Cache SET] search:${userId}:${hash.slice(0, 8)}..., TTL: ${CACHE_TTL.search}s`
    )
  }

  async invalidateSearch(userId: string): Promise<void> {
    try {
      const pattern = `search:${userId}:*`
      let cursor = '0'
      let deletedCount = 0

      do {
        const [nextCursor, keys] = await redisService.scanAndDelete(cursor, pattern)
        cursor = nextCursor
        deletedCount += keys.length
      } while (cursor !== '0')

      if (deletedCount > 0) {
        console.log(`[Cache INVALIDATE] search:${userId} (${deletedCount} keys)`)
      }
    } catch (error) {
      console.error('Search cache invalidation error:', error)
    }
  }
}

const searchCacheService = new SearchCacheService()
export default searchCacheService
