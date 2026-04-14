import { Router } from 'express'
import { createTweetController, getTweetDetailController } from '~/controllers/tweets.controllers'
import {
  audienceValidator,
  createTweetValidator,
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

export default tweetsRouter
