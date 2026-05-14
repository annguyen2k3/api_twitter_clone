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
