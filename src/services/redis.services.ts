import Redis from 'ioredis'
import { REDIS_CONFIG } from '~/constants/redis'
import redisConnection from '~/connections/redis.connection'

class RedisService {
  private client: Redis

  constructor() {
    this.client = redisConnection.getClient()
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

  async scanAndDelete(cursor: string, pattern: string): Promise<[string, string[]]> {
    try {
      const [nextCursor, rawKeys] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100)
      const keys = rawKeys as string[]
      if (keys.length > 0) {
        await this.client.del(...keys)
      }
      return [nextCursor, keys]
    } catch (error) {
      console.error('Redis SCAN error:', error)
      return ['0', []]
    }
  }

  getClient(): Redis {
    return this.client
  }
}

const redisService = new RedisService()
export default redisService
