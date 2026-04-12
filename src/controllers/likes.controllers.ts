import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { LIKE_MESSAGES } from '~/constants/messages'
import { LikeReqBody, UnlikeReqParams } from '~/models/requests/Like.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import likesService from '~/services/likes.services'

// POST: /likes/
export const likeTweetController = async (
  req: Request<ParamsDictionary, any, LikeReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.body
  const result = await likesService.likeTweet(user_id, tweet_id)
  res.status(HTTP_STATUS.OK).json({
    message: LIKE_MESSAGES.LIKE_TWEET_SUCCESS,
    result
  })
}

// DELETE: /likes/
export const unlikeTweetController = async (req: Request<UnlikeReqParams>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.params
  const result = await likesService.unlikeTweet(user_id, tweet_id as string)
  res.status(HTTP_STATUS.OK).json({
    message: LIKE_MESSAGES.UNLIKE_TWEET_SUCCESS,
    result
  })
}
