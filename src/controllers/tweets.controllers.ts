import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { TWEET_MESSAGES } from '~/constants/messages'
import { TweetReqBody } from '~/models/requests/Tweet.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import tweetsService from '~/services/tweets.services'

// POST: /tweets
export const createTweetController = async (
  req: Request<ParamsDictionary, any, TweetReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsService.createTweet(user_id, req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: TWEET_MESSAGES.CREATE_TWEET_SUCCESS,
    result
  })
}

// GET: /tweets/:tweet_id
export const getTweetDetailController = async (req: Request, res: Response) => {
  const result = await tweetsService.increaseView(
    req.params.tweet_id as string,
    req.decoded_authorization?.user_id as string
  )
  const tweet = {
    ...req.tweet,
    guest_views: result.guest_views,
    user_views: result.user_views,
    views: result.guest_views + result.user_views
  }
  res.status(HTTP_STATUS.OK).json({
    message: TWEET_MESSAGES.GET_TWEET_DETAIL_SUCCESS,
    result: tweet
  })
}
