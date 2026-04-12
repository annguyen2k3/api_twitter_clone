import { Router } from 'express'
import {
  likeTweetController,
  unlikeTweetController
} from '~/controllers/likes.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const likesRouter = Router()

/**
 * Description: Like a tweet
 * Path: /likes/
 * Method: POST
 * Headers: {
 *   Authorization: Bearer <access_token>
 * }
 * Body: {
 *   tweet_id: string
 * }
 */
likesRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(likeTweetController)
)

/**
 * Description: Unlike a tweet
 * Path: /likes/:tweet_id
 * Method: DELETE
 * Headers: {
 *   Authorization: Bearer <access_token>
 * }
 */
likesRouter.delete(
  '/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(unlikeTweetController as any)
)

export default likesRouter