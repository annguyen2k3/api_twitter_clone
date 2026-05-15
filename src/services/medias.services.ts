import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import fs from 'fs'
import mime from 'mime'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { getNameFromFullname, handleUploadImage, handleUploadVideo, handleUploadVideoHLS } from '~/utils/file'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { Media } from '~/constants/Other'
import { MediaType } from '~/constants/enums'
import databaseService from './database.services'
import VideoStatus from '~/models/schemas/VideoStatus.schemas'
import { uploadFileToS3 } from '~/utils/s3'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'
import { addVideoJob } from './videoQueue.service'

config()

class MediasService {
  async uploadImages(req: Request) {
    const file = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      file.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
        await sharp(file.filepath).jpeg().toFile(newPath)
        const s3Result = await uploadFileToS3({
          filename: 'images/' + newName,
          filepath: newPath,
          contentType: mime.getType(newPath) as string
        })
        await Promise.all([fs.promises.unlink(file.filepath), fs.promises.unlink(newPath)])
        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Image
        }
      })
    )
    return result
  }

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const s3Result = await uploadFileToS3({
          filename: 'videos/' + file.newFilename,
          contentType: mime.getType(file.filepath) as string,
          filepath: file.filepath
        })
        await Promise.all([fs.promises.unlink(file.filepath)])
        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Video
        }
      })
    )
    return result
  }

  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideoHLS(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        const videoStatus = await databaseService.videoStatus.insertOne(
          new VideoStatus({
            name: newName,
            status: 0,
            message: 'Pending'
          })
        )

        await addVideoJob({
          videoId: newName,
          videoStatusId: videoStatus.insertedId.toString(),
          filepath: file.filepath,
          idName: newName,
          userId: ''
        })

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
