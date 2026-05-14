import { ObjectId, WithId } from 'mongodb'
import databaseService from './database.services'
import Like from '~/models/schemas/Like.schemas'
import feedCacheService from './feedCache.services'

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

    const tweet = await databaseService.tweets.findOne(
      { _id: new ObjectId(tweetId) },
      { projection: { user_id: 1 } }
    )
    if (tweet) {
      await feedCacheService.invalidateFeed((tweet.user_id as ObjectId).toString())
    }

    return result as WithId<Like>
  }

  async unlikeTweet(userId: string, tweetId: string) {
    const result = await databaseService.likes.findOneAndDelete({
      user_id: new ObjectId(userId),
      tweet_id: new ObjectId(tweetId)
    })

    const tweet = await databaseService.tweets.findOne(
      { _id: new ObjectId(tweetId) },
      { projection: { user_id: 1 } }
    )
    if (tweet) {
      await feedCacheService.invalidateFeed((tweet.user_id as ObjectId).toString())
    }

    return result as WithId<Like>
  }
}
const likesService = new LikesService()
export default likesService
