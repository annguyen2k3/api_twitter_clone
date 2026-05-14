import redisService from './redis.services'
import { CACHE_KEYS, CACHE_TTL } from '~/constants/redis'

interface ConversationCacheData {
  conversations: unknown[]
  total_pages: number
}

class ConversationCacheService {
  private generateKey(senderId: string, receiverId: string): string {
    const sorted = [senderId, receiverId].sort()
    return CACHE_KEYS.conversation(sorted[0], sorted[1])
  }

  async getConversation(
    senderId: string,
    receiverId: string,
    page: number,
    limit: number
  ): Promise<ConversationCacheData | null> {
    const key = `${this.generateKey(senderId, receiverId)}:${page}:${limit}`
    const cached = await redisService.get<ConversationCacheData>(key)
    if (cached) {
      console.log(`[Cache HIT] conversation:${senderId}:${receiverId}:p${page}:l${limit}`)
      return cached
    }
    console.log(`[Cache MISS] conversation:${senderId}:${receiverId}:p${page}:l${limit}`)
    return null
  }

  async setConversation(
    senderId: string,
    receiverId: string,
    page: number,
    limit: number,
    data: ConversationCacheData
  ): Promise<void> {
    const key = `${this.generateKey(senderId, receiverId)}:${page}:${limit}`
    await redisService.set(key, data, CACHE_TTL.conversation)
    console.log(
      `[Cache SET] conversation:${senderId}:${receiverId}:p${page}:l${limit}, TTL: ${CACHE_TTL.conversation}s`
    )
  }

  async invalidateConversation(senderId: string, receiverId: string): Promise<void> {
    const keyPattern = `${this.generateKey(senderId, receiverId)}:*`
    let cursor = '0'
    let deletedCount = 0
    do {
      const [nextCursor, keys] = await redisService.scanAndDelete(cursor, keyPattern)
      cursor = nextCursor
      deletedCount += keys.length
    } while (cursor !== '0')
    if (deletedCount > 0) {
      console.log(
        `[Cache INVALIDATE] conversation:${senderId}:${receiverId}:* (${deletedCount} keys)`
      )
    }
  }
}

const conversationCacheService = new ConversationCacheService()
export default conversationCacheService
