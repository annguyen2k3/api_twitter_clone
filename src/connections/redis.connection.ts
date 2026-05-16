import Redis from 'ioredis'
import { REDIS_CONFIG } from '~/constants/redis'

class RedisConnection {
  private client: Redis
  private _isConnected: boolean = false

  constructor() {
    this.client = new Redis(REDIS_CONFIG)

    this.client.on('error', (err) => {
      console.error('[RedisConnection] Error:', err.message)
      this._isConnected = false
    })

    this.client.on('ready', () => {
      console.log('[RedisConnection] Ready')
      this._isConnected = true
    })

    this.client.on('close', () => {
      console.log('[RedisConnection] Connection closed')
      this._isConnected = false
    })

    this.client.on('connect', () => {
      console.log('[RedisConnection] Connecting...')
    })
  }

  async connect(): Promise<boolean> {
    if (this.client.status === 'ready') {
      this._isConnected = true
      return true
    }

    if (this.client.status === 'connecting' || this.client.status === 'wait') {
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          this.client.off('ready', onReady)
          resolve(this._isConnected)
        }, 5000)

        const onReady = () => {
          clearTimeout(timeout)
          this._isConnected = true
          resolve(true)
        }

        this.client.once('ready', onReady)
      })
    }

    return this._isConnected
  }

  getClient(): Redis {
    return this.client
  }

  isConnected(): boolean {
    return this._isConnected || this.client.status === 'ready'
  }
}

const redisConnection = new RedisConnection()
export default redisConnection
