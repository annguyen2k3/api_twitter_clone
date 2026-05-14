import redisService from './redis.services'
import { CACHE_KEYS, CACHE_TTL } from '~/constants/redis'

interface TweetChildrenCacheData {
  tweets: unknown[]
  total: number
}

class TweetCacheService {
  async getTweetChildren(tweetId: string): Promise<TweetChildrenCacheData | null> {
    const key = CACHE_KEYS.tweetChildren(tweetId)
    const cached = await redisService.get<TweetChildrenCacheData>(key)
    if (cached) {
      console.log(`[Cache HIT] tweet_children:${tweetId}`)
      return cached
    }
    console.log(`[Cache MISS] tweet_children:${tweetId}`)
    return null
  }

  async setTweetChildren(tweetId: string, data: TweetChildrenCacheData): Promise<void> {
    const key = CACHE_KEYS.tweetChildren(tweetId)
    await redisService.set(key, data, CACHE_TTL.tweetChildren)
    console.log(`[Cache SET] tweet_children:${tweetId}, TTL: ${CACHE_TTL.tweetChildren}s`)
  }

  async invalidateTweetChildren(tweetId: string): Promise<void> {
    const key = CACHE_KEYS.tweetChildren(tweetId)
    await redisService.del(key)
    console.log(`[Cache INVALIDATE] tweet_children:${tweetId}`)
  }
}

const tweetCacheService = new TweetCacheService()
export default tweetCacheService
