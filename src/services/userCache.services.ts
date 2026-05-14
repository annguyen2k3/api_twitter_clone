import redisService from './redis.services'
import { CACHE_KEYS, CACHE_TTL } from '~/constants/redis'

export interface UserCacheData {
  _id: string
  name: string
  username: string
  email: string
  avatar: string
  cover_photo: string
  bio: string
  location: string
  website: string
  date_of_birth: string
  verify: number
  created_at: string
  follower: number
  followed: number
}

class UserCacheService {
  async getUser(userId: string): Promise<UserCacheData | null> {
    const key = CACHE_KEYS.user(userId)
    const cached = await redisService.get<UserCacheData>(key)
    if (cached) {
      console.log(`[Cache HIT] user:${userId}`)
      return cached
    }
    console.log(`[Cache MISS] user:${userId}`)
    return null
  }

  async setUser(userId: string, data: UserCacheData): Promise<void> {
    const key = CACHE_KEYS.user(userId)
    await redisService.set(key, data, CACHE_TTL.user)
    console.log(`[Cache SET] user:${userId}, TTL: ${CACHE_TTL.user}s`)
  }

  async invalidateUser(userId: string): Promise<void> {
    const key = CACHE_KEYS.user(userId)
    await redisService.del(key)
    console.log(`[Cache INVALIDATE] user:${userId}`)
  }

  async invalidateUsers(userIds: string[]): Promise<void> {
    const keys = userIds.map((id) => CACHE_KEYS.user(id))
    await redisService.delMany(keys)
    console.log(`[Cache INVALIDATE] ${userIds.length} users`)
  }
}

const userCacheService = new UserCacheService()
export default userCacheService
