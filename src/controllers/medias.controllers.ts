import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { USER_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'

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
