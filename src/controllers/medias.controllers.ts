import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { UPLOAD_DIR } from '~/constants/dir'
import { USER_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'

export const uploadSingleImageController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const url = await mediasService.handleUploadSingleImage(req)
  return res.json({ message: USER_MESSAGES.UPLOAD_SUCCESS, result: url })
}

export const serveImageController = async (req: Request, res: Response, next: NextFunction) => {
  const { filename } = req.params
  return res.sendFile(path.resolve(UPLOAD_DIR, filename as string), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}
