import { ObjectId, WithId } from 'mongodb'
import databaseService from './database.services'
import Bookmark from '~/models/schemas/Bookmark.schemas'

class BookmarksService {
  async bookmarkTweet(userId: string, tweetId: string) {
    const result = await databaseService.bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(userId),
        tweet_id: new ObjectId(tweetId)
      },
      {
        $setOnInsert: new Bookmark({
          user_id: new ObjectId(userId),
          tweet_id: new ObjectId(tweetId)
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result as WithId<Bookmark>
  }
}
const bookmarksService = new BookmarksService()
export default bookmarksService
