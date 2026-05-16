import { Queue, Worker } from 'bullmq'
import Redis from 'ioredis'
import path from 'path'
import fs from 'fs'
import mime from 'mime'
import { ObjectId } from 'mongodb'
import {
  QUEUE_NAMES,
  VIDEO_QUEUE_CONFIG,
  VIDEO_WORKER_CONFIG
} from '~/constants/queue'
import { UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { EncodingStatus } from '~/constants/enums'
import { BULLMQ_REDIS_CONFIG } from '~/constants/redis'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import { uploadFileToS3 } from '~/utils/s3'
import databaseService from '~/services/database.services'
import { queueLogger as logger } from '~/utils/logger'

export interface VideoEncodeJobData {
  videoId: string
  videoStatusId: string
  filepath: string
  idName: string
  userId: string
}

let videoQueue: Queue<VideoEncodeJobData> | null = null
let videoWorker: Worker<VideoEncodeJobData> | null = null

function isBullMQCompatible(): boolean {
  const redisVersion = parseInt(process.env.REDIS_VERSION || '5')
  return redisVersion >= 5
}

function createBullMQConnection(): Redis {
  return new Redis(BULLMQ_REDIS_CONFIG)
}

export function initVideoQueue(): { queue: Queue<VideoEncodeJobData> | null; worker: Worker<VideoEncodeJobData> | null } {
  if (!isBullMQCompatible()) {
    logger.warn('BullMQ requires Redis >= 5.0.0. Video queue disabled.')
    return { queue: null, worker: null }
  }

  try {
    const connection = createBullMQConnection()

    videoQueue = new Queue<VideoEncodeJobData>(QUEUE_NAMES.videoEncode, {
      ...VIDEO_QUEUE_CONFIG,
      connection
    })

    videoWorker = new Worker<VideoEncodeJobData>(
      QUEUE_NAMES.videoEncode,
      async (job) => {
        const { videoId, videoStatusId, filepath, idName } = job.data
        const videoStatusObjectId = new ObjectId(videoStatusId)

        logger.info('Video encoding started', {
          jobId: job.id,
          videoId,
          filepath
        })

        await databaseService.videoStatus.updateOne(
          { _id: videoStatusObjectId },
          {
            $set: { status: EncodingStatus.Processing, message: 'Processing' },
            $currentDate: { updated_at: true }
          }
        )

        try {
          await encodeHLSWithMultipleVideoStreams(filepath)

          const files = getFiles(path.resolve(UPLOAD_VIDEO_DIR, idName))
          const basePath = path.resolve(UPLOAD_VIDEO_DIR, idName).replace(/\\/g, '/')

          logger.info('Uploading video files to S3', {
            jobId: job.id,
            videoId,
            fileCount: files.length
          })

          await Promise.all(
            files.map((filePath) => {
              const normalizedFilepath = filePath.replace(/\\/g, '/')
              const filename = normalizedFilepath.replace(basePath, 'videos-hls/' + idName)
              return uploadFileToS3({
                filename,
                filepath: filePath,
                contentType: mime.getType(filePath) as string
              })
            })
          )

          const localFolder = path.resolve(UPLOAD_VIDEO_DIR, idName)
          if (fs.existsSync(localFolder)) {
            fs.rmSync(localFolder, { recursive: true })
          }

          await databaseService.videoStatus.updateOne(
            { _id: videoStatusObjectId },
            {
              $set: { status: EncodingStatus.Success, message: 'Success' },
              $currentDate: { updated_at: true }
            }
          )

          logger.info('Video encoding completed', {
            jobId: job.id,
            videoId
          })
        } catch (error) {
          await databaseService.videoStatus.updateOne(
            { _id: videoStatusObjectId },
            {
              $set: {
                status: EncodingStatus.Failed,
                message: error instanceof Error ? error.message : 'Unknown error'
              },
              $currentDate: { updated_at: true }
            }
          )

          logger.error('Video encoding failed', {
            jobId: job.id,
            videoId,
            error: error instanceof Error ? error.message : String(error)
          })
          throw error
        }
      },
      {
        ...VIDEO_WORKER_CONFIG,
        connection
      }
    )

    videoWorker.on('completed', (job) => {
      logger.info('Video job completed', {
        jobId: job.id,
        videoId: job.data.videoId
      })
    })

    videoWorker.on('failed', (job, err) => {
      logger.error('Video job failed permanently', {
        jobId: job?.id,
        videoId: job?.data.videoId,
        error: err.message,
        attempts: job?.attemptsMade
      })
    })

    videoWorker.on('error', (err) => {
      logger.error('Video worker error', { error: err.message })
    })

    logger.info('Video queue initialized successfully')
    return { queue: videoQueue, worker: videoWorker }
  } catch (error) {
    logger.error('Video queue initialization failed', {
      error: error instanceof Error ? error.message : String(error)
    })
    return { queue: null, worker: null }
  }
}

export async function addVideoJob(data: VideoEncodeJobData): Promise<void> {
  if (!videoQueue) {
    logger.warn('Video queue not available. Video encoding will be skipped.', {
      videoId: data.videoId
    })
    await databaseService.videoStatus.updateOne(
      { _id: new ObjectId(data.videoStatusId) },
      {
        $set: { status: EncodingStatus.Failed, message: 'Queue not available' },
        $currentDate: { updated_at: true }
      }
    )
    return
  }

  await videoQueue.add('encode-video', data)
  logger.debug('Video encoding job queued', { videoId: data.videoId })
}

export function getVideoQueue(): Queue<VideoEncodeJobData> | null {
  return videoQueue
}

function getFiles(dir: string): string[] {
  const results: string[] = []
  if (!fs.existsSync(dir)) {
    return results
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...getFiles(fullPath))
    } else {
      results.push(fullPath)
    }
  }
  return results
}
