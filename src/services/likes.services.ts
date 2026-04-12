import { ObjectId, WithId } from 'mongodb'
import databaseService from './database.services'
import Like from '~/models/schemas/Like.schemas'

class LikesService {
  async likeTweet(userId: string, tweetId: string) {
    const result = await databaseService.likes.findOneAndUpdate(
      {
        user_id: new ObjectId(userId),
        tweet_id: new ObjectId(tweetId)
      },
      {
        $setOnInsert: new Like({
          user_id: new ObjectId(userId),
          tweet_id: new ObjectId(tweetId)
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result as WithId<Like>
  }

  async unlikeTweet(userId: string, tweetId: string) {
    const result = await databaseService.likes.findOneAndDelete({
      user_id: new ObjectId(userId),
      tweet_id: new ObjectId(tweetId)
    })
    return result as WithId<Like>
  }
}
const likesService = new LikesService()
export default likesService
