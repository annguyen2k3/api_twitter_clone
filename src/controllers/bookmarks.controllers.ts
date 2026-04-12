import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { BOOKMARK_MESSAGES } from '~/constants/messages'
import { BookmarkReqBody } from '~/models/requests/Bookmark.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import bookmarksService from '~/services/bookmarks.services'

// POST: /bookmarks/
export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.body
  const result = await bookmarksService.bookmarkTweet(user_id, tweet_id)
  res.status(HTTP_STATUS.OK).json({
    message: BOOKMARK_MESSAGES.BOOKMARK_TWEET_SUCCESS,
    result
  })
}
