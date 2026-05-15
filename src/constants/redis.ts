export const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true
} as const

export const CACHE_KEYS = {
  feed: (userId: string) => `feed:${userId}`,
  tweet: (tweetId: string) => `tweet:${tweetId}`,
  user: (userId: string) => `user:${userId}`,
  tweetChildren: (tweetId: string) => `tweet_children:${tweetId}`,
  search: (userId: string, hash: string) => `search:${userId}:${hash}`,
  conversation: (userId: string, receiverId: string) => `conversation:${userId}:${receiverId}`
} as const

export const CACHE_TTL = {
  feed: 60,
  tweet: 300,
  user: 300,
  tweetChildren: 300,
  search: 60,
  conversation: 120
} as const

export const RATE_LIMIT_WINDOW = 15 * 60 * 1000

export const RATE_LIMIT = {
  auth: 10,
  forgotPassword: 5,
  register: 5,
  verifyEmail: 10,
  resendVerifyEmail: 5,
  mediaImage: 20,
  mediaVideo: 5,
  mediaVideoHls: 5,
  tweet: 30,
  like: 200,
  bookmark: 100,
  follow: 100,
  userMe: 100,
  userMePatch: 20,
  search: 30,
  conversation: 100,
  refreshToken: 50,
  logout: 50,
  publicFeeds: 60,
  publicTweetDetail: 60,
  publicTweetChildren: 60
} as const

export const RATE_LIMIT_KEYS = {
  rateLimit: (type: string, identifier: string) => `rl:${type}:${identifier}`
} as const
