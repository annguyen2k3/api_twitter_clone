import { Queue, Worker } from 'bullmq'
import Redis from 'ioredis'
import {
  QUEUE_NAMES,
  EMAIL_QUEUE_CONFIG,
  EMAIL_WORKER_CONFIG
} from '~/constants/queue'
import { BULLMQ_REDIS_CONFIG } from '~/constants/redis'
import emailService from '~/services/email.services'
import { queueLogger as logger } from '~/utils/logger'

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
    logger.warn('BullMQ requires Redis >= 5.0.0. Email queue disabled.')
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

        logger.info('Processing email job', {
          jobId: job.id,
          to,
          template,
          attempt: job.attemptsMade + 1
        })

        try {
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

          logger.info('Email sent successfully', {
            jobId: job.id,
            to,
            template
          })
        } catch (error) {
          logger.error('Email send failed', {
            jobId: job.id,
            to,
            template,
            error: error instanceof Error ? error.message : String(error),
            attempt: job.attemptsMade + 1
          })
          throw error
        }
      },
      {
        ...EMAIL_WORKER_CONFIG,
        connection
      }
    )

    emailWorker.on('completed', (job) => {
      logger.info('Email job completed', { jobId: job.id })
    })

    emailWorker.on('failed', (job, err) => {
      logger.error('Email job failed permanently', {
        jobId: job?.id,
        error: err.message,
        attempts: job?.attemptsMade
      })
    })

    emailWorker.on('error', (err) => {
      logger.error('Email worker error', { error: err.message })
    })

    logger.info('Email queue initialized successfully')
    return { queue: emailQueue, worker: emailWorker }
  } catch (error) {
    logger.error('Email queue initialization failed', {
      error: error instanceof Error ? error.message : String(error)
    })
    return { queue: null, worker: null }
  }
}

export async function addEmailJob(data: EmailJobData): Promise<void> {
  if (!emailQueue) {
    logger.warn('Email queue not available, sending email directly', {
      template: data.template,
      to: data.to
    })
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
  logger.debug('Email job queued', { template: data.template, to: data.to })
}

export function getEmailQueue(): Queue<EmailJobData> | null {
  return emailQueue
}

export function getEmailWorker(): Worker<EmailJobData> | null {
  return emailWorker
}
