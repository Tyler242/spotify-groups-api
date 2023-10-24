import { type NextFunction, type Request, type Response } from 'express'

export default async function validateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization!
  const refreh_token = req.headers.refresh_token

  const token = authHeader.split('Bearer ')[1]
  if (!token) {
    next(Error('Invalid Token'))
  }

  if (token !== req.session.token) {
    if (refreh_token !== req.session.refresh_token) {
      next(Error('Invalid Token'))
    }
  }
}
