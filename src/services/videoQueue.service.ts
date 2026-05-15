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
    console.warn('[VideoQueue] BullMQ requires Redis >= 5.0.0. Video queue disabled.')
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

        console.log(`[VideoWorker] Updating status to Processing for videoId: ${videoId}`)
        const updateResult = await databaseService.videoStatus.updateOne(
          { _id: videoStatusObjectId },
          {
            $set: { status: EncodingStatus.Processing, message: 'Processing' },
            $currentDate: { updated_at: true }
          }
        )
        console.log(`[VideoWorker] Status update result: ${updateResult.modifiedCount} document(s) modified`)

        try {
          console.log(`[VideoWorker] Starting encode for videoId: ${videoId}`)
          await encodeHLSWithMultipleVideoStreams(filepath)

          const files = getFiles(path.resolve(UPLOAD_VIDEO_DIR, idName))
          const basePath = path.resolve(UPLOAD_VIDEO_DIR, idName).replace(/\\/g, '/')

          console.log(`[VideoWorker] Uploading ${files.length} files to S3`)
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
          console.log(`[VideoWorker] Status updated to Success for videoId: ${videoId}`)

          console.log(`[VideoWorker] Video ${videoId} encoded successfully`)
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
          throw error
        }
      },
      {
        ...VIDEO_WORKER_CONFIG,
        connection
      }
    )

    videoWorker.on('completed', (job) => {
      console.log(`[VideoWorker] Job ${job.id} completed for videoId: ${job.data.videoId}`)
    })

    videoWorker.on('failed', (job, err) => {
      console.error(`[VideoWorker] Job ${job?.id} failed:`, err.message)
    })

    videoWorker.on('error', (err) => {
      console.error('[VideoWorker] Error:', err.message)
    })

    console.log('[VideoQueue] Initialized successfully')
    return { queue: videoQueue, worker: videoWorker }
  } catch (error) {
    console.error('[VideoQueue] Failed to initialize:', error)
    return { queue: null, worker: null }
  }
}

export async function addVideoJob(data: VideoEncodeJobData): Promise<void> {
  if (!videoQueue) {
    console.warn('[VideoQueue] Queue not available. Video encoding will be skipped.')
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
