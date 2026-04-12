import { RequestHandler, Router } from 'express'
import {
  bookmarkTweetController,
  unbookmarkTweetController
} from '~/controllers/bookmarks.controllers'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const bookmarksRouter = Router()

/**
 * Description: Bookmark a tweet
 * Path: /bookmarks/
 * Method: POST
 * Headers: {
 *   Authorization: Bearer <access_token>
 * }
 * Body: {
 *   tweet_id: string
 * }
 */
bookmarksRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(bookmarkTweetController)
)

/**
 * Description: Unbookmark a tweet
 * Path: /bookmarks/:tweet_id
 * Method: DELETE
 * Headers: {
 *   Authorization: Bearer <access_token>
 * }
 */
bookmarksRouter.delete(
  '/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unbookmarkTweetController as any)
)

export default bookmarksRouter
