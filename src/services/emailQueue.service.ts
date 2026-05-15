import { Queue, Worker } from 'bullmq'
import Redis from 'ioredis'
import {
  QUEUE_NAMES,
  EMAIL_QUEUE_CONFIG,
  EMAIL_WORKER_CONFIG
} from '~/constants/queue'
import { BULLMQ_REDIS_CONFIG } from '~/constants/redis'
import emailService from '~/services/email.services'

export interface EmailJobData {
  to: string
  template: 'verify' | 'forgot_password' | 'resend_verify'
  emailVerifyToken?: string
  forgotPasswordToken?: string
}

let emailQueue: Queue<EmailJobData> | null = null
let emailWorker: Worker<EmailJobData> | null = null

function isBullMQCompatible(): boolean {
  const redisVersion = parseInt(process.env.REDIS_VERSION || '5')
  return redisVersion >= 5
}

function createBullMQConnection(): Redis {
  return new Redis(BULLMQ_REDIS_CONFIG)
}

export function initEmailQueue(): { queue: Queue<EmailJobData> | null; worker: Worker<EmailJobData> | null } {
  if (!isBullMQCompatible()) {
    console.warn('[EmailQueue] BullMQ requires Redis >= 5.0.0. Email queue disabled.')
    return { queue: null, worker: null }
  }

  try {
    const connection = createBullMQConnection()

    emailQueue = new Queue<EmailJobData>(QUEUE_NAMES.email, {
      ...EMAIL_QUEUE_CONFIG,
      connection
    })

    emailWorker = new Worker<EmailJobData>(
      QUEUE_NAMES.email,
      async (job) => {
        const { to, template, emailVerifyToken, forgotPasswordToken } = job.data

        switch (template) {
          case 'verify':
          case 'resend_verify':
            if (!emailVerifyToken) {
              throw new Error('Missing emailVerifyToken for verify/resend_verify email')
            }
            await emailService.sendVerifyRegisterEmail(to, emailVerifyToken)
            break
          case 'forgot_password':
            if (!forgotPasswordToken) {
              throw new Error('Missing forgotPasswordToken for forgot_password email')
            }
            await emailService.sendForgotPasswordEmail(to, forgotPasswordToken)
            break
          default:
            throw new Error(`Unknown email template: ${template}`)
        }
      },
      {
        ...EMAIL_WORKER_CONFIG,
        connection
      }
    )

    emailWorker.on('completed', (job) => {
      console.log(`[EmailWorker] Job ${job.id} completed for ${job.data.to}`)
    })

    emailWorker.on('failed', (job, err) => {
      console.error(`[EmailWorker] Job ${job?.id} failed:`, err.message)
    })

    emailWorker.on('error', (err) => {
      console.error('[EmailWorker] Error:', err.message)
    })

    console.log('[EmailQueue] Initialized successfully')
    return { queue: emailQueue, worker: emailWorker }
  } catch (error) {
    console.error('[EmailQueue] Failed to initialize:', error)
    return { queue: null, worker: null }
  }
}

export async function addEmailJob(data: EmailJobData): Promise<void> {
  if (!emailQueue) {
    console.warn('[EmailQueue] Queue not available, sending email directly')
    if (data.template === 'forgot_password' && data.forgotPasswordToken) {
      await emailService.sendForgotPasswordEmail(data.to, data.forgotPasswordToken)
    } else if (data.emailVerifyToken) {
      await emailService.sendVerifyRegisterEmail(data.to, data.emailVerifyToken)
    }
    return
  }

  const jobName = data.template === 'forgot_password'
    ? 'forgot-password'
    : data.template === 'verify'
      ? 'verify-email'
      : 'resend-verify'

  await emailQueue.add(jobName, data)
}

export function getEmailQueue(): Queue<EmailJobData> | null {
  return emailQueue
}

export function getEmailWorker(): Worker<EmailJobData> | null {
  return emailWorker
}
