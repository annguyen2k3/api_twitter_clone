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
import { MediaType } from '~/constants/enums'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import console from 'console'

config()

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
        await encodeHLSWithMultipleVideoStreams(file.filepath)
        const newName = file.newFilename
        fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/video-hls/${newName}`
            : `http://localhost:${process.env.PORT}/static/video-hls/${newName}`,
          type: MediaType.HLS
        }
      })
    )
    return result
  }
}

const mediasService = new MediasService()
export default mediasService
