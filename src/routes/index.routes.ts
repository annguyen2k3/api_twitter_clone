import { Express } from 'express'
import userRouter from './users.routes'
import mediasRouter from './medias.routes'
import staticRouter from './static.routes'
import bookmarksRouter from './bookmarks.routes'
import likesRouter from './likes.routes'
import tweetsRouter from './tweets.routes'

export default function (app: Express) {
  app.use('/users', userRouter)
  app.use('/medias', mediasRouter)
  app.use('/static', staticRouter)
  app.use('/tweets', tweetsRouter)
  app.use('/bookmarks', bookmarksRouter)
  app.use('/likes', likesRouter)
}
