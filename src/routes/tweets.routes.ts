import { Router } from 'express'
import {
  createTweetController,
  getNewFeedsController,
  getTweetChildrenController,
  getTweetDetailController
} from '~/controllers/tweets.controllers'
import { paginationValidator } from '~/middlewares/common.middlewares'
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middlewares'
import {
  accessTokenValidator,
  isUserLoggedInValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetsRouter = Router()

/**
 * Description: Create a new tweet
 * Path: /tweets
 * Method: POST
 * Headers: {
 *   Authorization: Bearer <access_token>
 * }
 * Body: TweetReqBody
 */
tweetsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
)

/**
 * Description: Get new feeds
 * Path: /tweets/new-feeds
 * Method: GET
 * Headers: {
 *   Authorization: Bearer <access_token> (optional)
 * }
 * Query: {
 *   page: number
 *   limit: number
 * }
 */
tweetsRouter.get(
  '/new-feeds',
  paginationValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  wrapRequestHandler(getNewFeedsController)
)

/**
 * Description: Get Tweet Detail
 * Path: /tweets/:tweet_id
 * Method: GET
 * Headers: {
 *   Authorization: Bearer <access_token>
 * }
 */
tweetsRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetDetailController)
)

/**
 * Description: Get Tweet Children
 * Path: /tweets/:tweet_id/children
 * Method: GET
 * Headers: {
 *   Authorization: Bearer <access_token> (optional)
 * }
 * Query: {
 *   page: number
 *   limit: number
 *   tweet_type: TweetType
 * }
 */
tweetsRouter.get(
  '/:tweet_id/children',
  tweetIdValidator,
  paginationValidator,
  getTweetChildrenValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetChildrenController)
)

export default tweetsRouter
