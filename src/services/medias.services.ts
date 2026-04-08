import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import fs from 'fs'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import {
  getNameFromFullname,
  handleUploadImage,
  handleUploadVideo,
  handleUploadVideoHLS
} from '~/utils/file'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { Media } from '~/constants/Other'
import { EncodingStatus, MediaType } from '~/constants/enums'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import console from 'console'
import databaseService from './database.services'
import VideoStatus from '~/models/schemas/VideoStatus.schemas'

config()

class Queue {
  items: string[]
  encoding: boolean
  constructor() {
    this.items = []
    this.encoding = false
  }
  async enqueue(item: string) {
    this.items.push(item)
    const idName = getNameFromFullname(item.split('\\').pop() as string)
    await databaseService.videoStatus.insertOne(
      new VideoStatus({
        name: idName,
        status: EncodingStatus.Pending,
        message: 'Pending'
      })
    )
    this.processEncode()
  }
  async processEncode() {
    if (this.encoding) return
    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0]
      const idName = getNameFromFullname(videoPath.split('\\').pop() as string)
      await databaseService.videoStatus.updateOne(
        { name: idName },
        {
          $set: { status: EncodingStatus.Processing, message: 'Processing' },
          $currentDate: { updated_at: true }
        }
      )
      try {
        console.log('--------------------------------')
        console.log('Start encoding video: ', videoPath)
        await encodeHLSWithMultipleVideoStreams(videoPath)
        this.items.shift()
        fs.unlinkSync(videoPath)
        await databaseService.videoStatus.updateOne(
          { name: idName },
          {
            $set: { status: EncodingStatus.Success, message: 'Success' },
            $currentDate: { updated_at: true }
          }
        )
        console.log(`Encoded video success: ${videoPath}`)
        console.log('--------------------------------')
      } catch (error) {
        await databaseService.videoStatus
          .updateOne(
            { name: idName },
            {
              $set: { status: EncodingStatus.Failed, message: 'Failed' },
              $currentDate: { updated_at: true }
            }
          )
          .catch((error) => {
            console.log('Error updating video status: ', error)
          })
        console.log(`Encoded video failed: ${videoPath}`)
        console.log('--------------------------------')
      } finally {
        this.encoding = false
        this.processEncode()
      }
    } else {
      console.log('Encode video queue is empty')
    }
  }
}

const queue = new Queue()

class MediasService {
  async uploadImages(req: Request) {
    const file = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      file.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
        await sharp(file.filepath).jpeg().toFile(newPath)
        fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newName}.jpg`
            : `http://localhost:${process.env.PORT}/static/image/${newName}.jpg`,
          type: MediaType.Image
        }
      })
    )
    return result
  }

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = files.map((file) => {
      return {
        url: isProduction
          ? `${process.env.HOST}/static/video-stream/${file.newFilename}`
          : `http://localhost:${process.env.PORT}/static/video-stream/${file.newFilename}`,
        type: MediaType.Video
      }
    })
    return result
  }

  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideoHLS(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        queue.enqueue(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/video-hls/${newName}/master.m3u8`
            : `http://localhost:${process.env.PORT}/static/video-hls/${newName}/master.m3u8`,
          type: MediaType.HLS
        }
      })
    )
    return result
  }

  async getVideoStatus(id: string) {
    const videoStatus = await databaseService.videoStatus.findOne({ name: id })
    return videoStatus
  }
}

const mediasService = new MediasService()
export default mediasService
