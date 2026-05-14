import Redis from 'ioredis'
import { REDIS_CONFIG } from '~/constants/redis'

class RedisService {
  private client: Redis

  constructor() {
    this.client = new Redis(REDIS_CONFIG)

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err)
    })

    this.client.on('ready', () => {
      console.log('Redis is ready')
    })

    this.client.on('reconnecting', () => {
      console.log('Redis reconnecting...')
    })
  }

  async connect() {
    try {
      await this.client.connect()
      await this.client.ping()
      console.log('Connected to Redis')
    } catch (error) {
      console.error('Failed to connect to Redis:', error)
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key)
      if (!value) return null
      return JSON.parse(value) as T
    } catch (error) {
      console.error('Redis GET error:', error)
      return null
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value)
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serialized)
      } else {
        await this.client.set(key, serialized)
      }
      return true
    } catch (error) {
      console.error('Redis SET error:', error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.client.del(key)
      return true
    } catch (error) {
      console.error('Redis DEL error:', error)
      return false
    }
  }

  async delMany(keys: string[]): Promise<boolean> {
    try {
      if (keys.length === 0) return true
      await this.client.del(...keys)
      return true
    } catch (error) {
      console.error('Redis DEL many error:', error)
      return false
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key)
      return result === 1
    } catch (error) {
      console.error('Redis EXISTS error:', error)
      return false
    }
  }

  async getOrThrow<T>(key: string): Promise<T> {
    const value = await this.get<T>(key)
    if (!value) {
      throw new Error(`Cache miss for key: ${key}`)
    }
    return value
  }

  async setNX(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value)
      const result = await this.client.setnx(key, serialized)
      if (result && ttlSeconds) {
        await this.client.expire(key, ttlSeconds)
      }
      return result === 1
    } catch (error) {
      console.error('Redis SETNX error:', error)
      return false
    }
  }

  getClient(): Redis {
    return this.client
  }
}

const redisService = new RedisService()
export default redisService
