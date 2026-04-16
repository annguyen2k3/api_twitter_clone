import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetType } from '~/constants/enums'
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

// GET: /tweets/:tweet_id/children
export const getTweetChildrenController = async (req: Request, res: Response) => {
  const tweet_type = Number(req.query.tweet_type as string) as TweetType
  const limit = Number.parseInt(req.query.limit as string) || 10
  const page = Number.parseInt(req.query.page as string) || 1
  const user_id = req.decoded_authorization?.user_id as string
  const { tweets, total } = await tweetsService.getTweetChildren({
    tweetId: req.params.tweet_id as string,
    page,
    limit,
    tweetType: tweet_type,
    userId: user_id
  })
  res.status(HTTP_STATUS.OK).json({
    message: TWEET_MESSAGES.GET_TWEET_CHILDREN_SUCCESS,
    result: {
      tweets,
      tweet_type,
      limit,
      page,
      total_page: Math.ceil(total / limit)
    }
  })
}
