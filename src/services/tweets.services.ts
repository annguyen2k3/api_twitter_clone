import { TweetReqBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schemas'
import { ObjectId } from 'mongodb'
import { result } from 'lodash'

class TweetsService {
  async createTweet(userId: string, payload: TweetReqBody) {
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        type: payload.type,
        audience: payload.audience,
        content: payload.content,
        parent_id: payload.parent_id,
        hashtags: [], // Làm sau
        mentions: payload.mentions,
        medias: payload.medias,
        user_id: new ObjectId(userId)
      })
    )
    const tweet = await databaseService.tweets.findOne({ _id: result.insertedId })
    return tweet
  }
}

const tweetsService = new TweetsService()
export default tweetsService
