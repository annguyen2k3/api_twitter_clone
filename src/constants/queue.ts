import { QueueOptions, WorkerOptions } from 'bullmq'
import { REDIS_CONNECTION } from '~/constants/redis'

export const QUEUE_NAMES = {
  email: 'email-send',
  videoEncode: 'video-encode'
} as const

export const EMAIL_JOB_NAME = {
  verify: 'verify-email',
  forgotPassword: 'forgot-password',
  resendVerify: 'resend-verify'
} as const

export const VIDEO_RESOLUTIONS = ['720', '1080', '1440', 'original'] as const

const defaultQueueOptions: QueueOptions = {
  connection: REDIS_CONNECTION,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: {
      count: 100
    },
    removeOnFail: {
      count: 500
    }
  }
}

const defaultWorkerOptions: WorkerOptions = {
  connection: REDIS_CONNECTION
}

export const EMAIL_QUEUE_CONFIG: QueueOptions = {
  ...defaultQueueOptions
}

export const EMAIL_WORKER_CONFIG: WorkerOptions = {
  ...defaultWorkerOptions,
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 1000
  }
}

export const VIDEO_QUEUE_CONFIG: QueueOptions = {
  ...defaultQueueOptions,
  defaultJobOptions: {
    ...defaultQueueOptions.defaultJobOptions,
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: false,
    removeOnFail: {
      count: 50
    }
  }
}

export const VIDEO_WORKER_CONFIG: WorkerOptions = {
  ...defaultWorkerOptions,
  concurrency: 1
}
