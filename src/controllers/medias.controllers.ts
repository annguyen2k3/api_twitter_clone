import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'
import fs from 'fs'
import mime from 'mime'

// POST: /medias/upload-images
export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.uploadImages(req)
  return res.json({ message: USER_MESSAGES.UPLOAD_SUCCESS, result: url })
}

// GET: /static/image/:filename
export const serveImageController = async (req: Request, res: Response, next: NextFunction) => {
  const { filename } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, filename as string), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

// POST: /medias/upload-video
export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.uploadVideo(req)
  return res.json({ message: USER_MESSAGES.UPLOAD_SUCCESS, result: url })
}

// GET: /static/video/:filename
export const serveVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const { filename } = req.params
  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, filename as string), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

// GET: /static/video-stream/:filename
export const serveVideoStreamController = (req: Request, res: Response, next: NextFunction) => {
  const range = req.headers.range

  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send('Requires Range header')
  }

  const name = req.params.filename as string

  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)

  // 1MB = 10^6 bytes
  // Nếu tính theo hệ nhị phân thì 1MB = 2^20 bytes (1024 * 1024)

  // Dung lượng video (bytes)
  const videoSize = fs.statSync(videoPath).size

  // Dung lượng video cho mỗi phần đoạn stream
  const chunkSize = 10 ** 6 // 1MB

  // Lấy giá trị byte bắt đầu từ header Range (vd: bytes=1048576-)
  const start = Number(range.replace(/\D/g, ''))

  // Lấy giá trị byte kết thúc
  const end = Math.min(start + chunkSize, videoSize - 1)

  // Dung lượng thực tế cho mỗi đoạn video stream
  const contentLength = end - start + 1

  const contentType = mime.getType(videoPath) || 'video/*'

  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }

  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)

  const videoStream = fs.createReadStream(videoPath, { start, end })

  videoStream.pipe(res)
}

// POST: /medias/upload-video-hls
export const uploadVideoHLSController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.uploadVideoHLS(req)
  return res.json({ message: USER_MESSAGES.UPLOAD_SUCCESS, result: url })
}

// GET: /static/video-hls/:id/master.m3u8
export const serveM3u8Controller = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, id as string, 'master.m3u8')
  return res.sendFile(videoPath, (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

// GET: /static/video-hls/:id/:v/:segment
export const serveSegmentController = async (req: Request, res: Response, next: NextFunction) => {
  const { id, v, segment } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, id as string, v as string, `${segment}`)
  return res.sendFile(videoPath, (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

// GET: /medias/video-status/:id
export const getVideoStatusController = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  const videoStatus = await mediasService.getVideoStatus(id as string)
  return res.json({ message: USER_MESSAGES.GET_VIDEO_STATUS_SUCCESS, result: videoStatus })
}
