import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import conversationCacheService from './conversationCache.services'

class ConversationsService {
  async getConversation({
    sender_id,
    receiver_id,
    limit,
    page
  }: {
    sender_id: string
    receiver_id: string
    limit: number
    page: number
  }) {
    const cached = await conversationCacheService.getConversation(sender_id, receiver_id, page, limit)
    if (cached) {
      return cached
    }

    const findCondition = {
      $or: [
        { sender_id: new ObjectId(sender_id), receiver_id: new ObjectId(receiver_id) },
        { sender_id: new ObjectId(receiver_id), receiver_id: new ObjectId(sender_id) }
      ]
    }

    const conversation = await databaseService.conversations
      .find(findCondition)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()
    const total = await databaseService.conversations.countDocuments(findCondition)

    const result = {
      conversations: conversation,
      limit,
      page,
      total_pages: Math.ceil(total / limit)
    }

    await conversationCacheService.setConversation(sender_id, receiver_id, page, limit, result)

    return result
  }
}

const conversationsService = new ConversationsService()
export default conversationsService
