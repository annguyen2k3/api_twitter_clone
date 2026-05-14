import redisService from './redis.services'
import databaseService from './database.services'
import { CACHE_KEYS, CACHE_TTL } from '~/constants/redis'
import { ObjectId } from 'mongodb'

interface FeedCacheData {
  tweets: unknown[]
  total: number
}

class FeedCacheService {
  async getFeed(userId: string): Promise<FeedCacheData | null> {
    const key = CACHE_KEYS.feed(userId)
    const cached = await redisService.get<FeedCacheData>(key)
    if (cached) {
      console.log(`[Cache HIT] feed:${userId}`)
      return cached
    }
    console.log(`[Cache MISS] feed:${userId}`)
    return null
  }

  async setFeed(userId: string, data: FeedCacheData): Promise<void> {
    const key = CACHE_KEYS.feed(userId)
    await redisService.set(key, data, CACHE_TTL.feed)
    console.log(`[Cache SET] feed:${userId}, TTL: ${CACHE_TTL.feed}s`)
  }

  async invalidateFeed(userId: string): Promise<void> {
    const key = CACHE_KEYS.feed(userId)
    await redisService.del(key)
    console.log(`[Cache INVALIDATE] feed:${userId}`)
  }

  async invalidateFeeds(userIds: string[]): Promise<void> {
    const keys = userIds.map((id) => CACHE_KEYS.feed(id))
    await redisService.delMany(keys)
    console.log(`[Cache INVALIDATE] ${userIds.length} feeds`)
  }

  async invalidateFollowersFeeds(followerUserId: string): Promise<void> {
    const followers = await databaseService.followers
      .find(
        { followed_user_id: new ObjectId(followerUserId) },
        { projection: { user_id: 1, _id: 0 } }
      )
      .toArray()

    if (followers.length === 0) return

    const followerIds = followers.map((f) => f.user_id.toString())
    await this.invalidateFeeds(followerIds)
  }
}

const feedCacheService = new FeedCacheService()
export default feedCacheService
