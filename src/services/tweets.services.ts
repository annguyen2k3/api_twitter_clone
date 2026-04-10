import { TweetReqBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schemas'
import { ObjectId, WithId } from 'mongodb'
import { result } from 'lodash'
import Hashtag from '~/models/schemas/Hashtag.schemas'

class TweetsService {
  async checkAndCreateHashtags(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtags.map(async (hashtag) => {
        return databaseService.hashtags.findOneAndUpdate(
          { name: hashtag },
          { $setOnInsert: new Hashtag({ name: hashtag }) },
          { upsert: true, returnDocument: 'after' }
        )
      })
    )
    return hashtagDocuments.map((hashtag) => (hashtag as WithId<Hashtag>)._id)
  }

  async createTweet(userId: string, payload: TweetReqBody) {
    const hashTags = await this.checkAndCreateHashtags(payload.hashtags)
    console.log(hashTags)
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        type: payload.type,
        audience: payload.audience,
        content: payload.content,
        parent_id: payload.parent_id,
        hashtags: hashTags,
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
