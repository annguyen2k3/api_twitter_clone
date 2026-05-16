import rateLimit, { ipKeyGenerator as defaultIpKeyGenerator } from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import { Request, Response } from 'express'
import redisService from '~/services/redis.services'
import { RATE_LIMIT_WINDOW, RATE_LIMIT } from '~/constants/redis'
import { rateLimitLogger as logger } from '~/utils/logger'

interface RateLimiterOptions {
  max?: number
  keyPrefix: string
}

const rateLimitResponse = (req: Request, res: Response) => {
  const rateLimitInfo = req.rateLimit
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    path: req.path,
    limit: rateLimitInfo.limit,
    window: '15 minutes'
  })
  res.status(429).json({
    message: 'Too many requests, please try again later.',
    error: 'TOO_MANY_REQUESTS',
    details: {
      limit: rateLimitInfo.limit,
      window: '15 minutes',
      retryAfter: Math.ceil(
        ((rateLimitInfo.resetTime?.getTime() ?? Date.now()) - Date.now()) / 1000
      )
    }
  })
}

const createRateLimiter = (options: RateLimiterOptions) => {
  const store = new RedisStore({
    sendCommand: (...args: string[]) =>
      redisService.getClient().call(args[0], ...args.slice(1)) as ReturnType<
        RedisStore['sendCommand']
      >,
    prefix: `rl:${options.keyPrefix}:`
  })

  return rateLimit({
    store,
    windowMs: RATE_LIMIT_WINDOW,
    max: options.max ?? 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      const user = (req as Request & { user?: { _id?: string } }).user
      if (user?._id) {
        return `user:${user._id}`
      }
      return defaultIpKeyGenerator(req.ip || '127.0.0.1')
    },
    handler: rateLimitResponse
  })
}

export const authLimiter = createRateLimiter({
  max: RATE_LIMIT.auth,
  keyPrefix: 'auth'
})

export const registerLimiter = createRateLimiter({
  max: RATE_LIMIT.register,
  keyPrefix: 'register'
})

export const forgotPasswordLimiter = createRateLimiter({
  max: RATE_LIMIT.forgotPassword,
  keyPrefix: 'forgot_password'
})

export const verifyEmailLimiter = createRateLimiter({
  max: RATE_LIMIT.verifyEmail,
  keyPrefix: 'verify_email'
})

export const resendVerifyEmailLimiter = createRateLimiter({
  max: RATE_LIMIT.resendVerifyEmail,
  keyPrefix: 'resend_verify_email'
})

export const mediaImageLimiter = createRateLimiter({
  max: RATE_LIMIT.mediaImage,
  keyPrefix: 'media_image'
})

export const mediaVideoLimiter = createRateLimiter({
  max: RATE_LIMIT.mediaVideo,
  keyPrefix: 'media_video'
})

export const mediaVideoHlsLimiter = createRateLimiter({
  max: RATE_LIMIT.mediaVideoHls,
  keyPrefix: 'media_video_hls'
})

export const tweetLimiter = createRateLimiter({
  max: RATE_LIMIT.tweet,
  keyPrefix: 'tweet'
})

export const likeLimiter = createRateLimiter({
  max: RATE_LIMIT.like,
  keyPrefix: 'like'
})

export const bookmarkLimiter = createRateLimiter({
  max: RATE_LIMIT.bookmark,
  keyPrefix: 'bookmark'
})

export const followLimiter = createRateLimiter({
  max: RATE_LIMIT.follow,
  keyPrefix: 'follow'
})

export const userMeLimiter = createRateLimiter({
  max: RATE_LIMIT.userMe,
  keyPrefix: 'user_me'
})

export const userMePatchLimiter = createRateLimiter({
  max: RATE_LIMIT.userMePatch,
  keyPrefix: 'user_me_patch'
})

export const searchLimiter = createRateLimiter({
  max: RATE_LIMIT.search,
  keyPrefix: 'search'
})

export const conversationLimiter = createRateLimiter({
  max: RATE_LIMIT.conversation,
  keyPrefix: 'conversation'
})

export const refreshTokenLimiter = createRateLimiter({
  max: RATE_LIMIT.refreshToken,
  keyPrefix: 'refresh_token'
})

export const logoutLimiter = createRateLimiter({
  max: RATE_LIMIT.logout,
  keyPrefix: 'logout'
})

export const publicFeedsLimiter = createRateLimiter({
  max: RATE_LIMIT.publicFeeds,
  keyPrefix: 'public_feeds'
})

export const publicTweetDetailLimiter = createRateLimiter({
  max: RATE_LIMIT.publicTweetDetail,
  keyPrefix: 'public_tweet_detail'
})

export const publicTweetChildrenLimiter = createRateLimiter({
  max: RATE_LIMIT.publicTweetChildren,
  keyPrefix: 'public_tweet_children'
})
