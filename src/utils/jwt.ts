import { config } from 'dotenv'
config()
import jwt, { PrivateKey, Secret, SignOptions } from 'jsonwebtoken'

export const signToken = ({
  payload,
  privateKey = process.env.JWT_SECRET as string,
  options = { algorithm: 'HS256' }
}: {
  payload: string | Buffer | object
  privateKey?: Secret | PrivateKey
  options?: SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) {
        return reject(err)
      }
      resolve(token as string)
    })
  })
}

// export const verifyToken = ({
//   token,
//   secretOrPublicKey
// }: {
//   token: string
//   secretOrPublicKey: string
// }) => {
//   return new Promise<TokenPayload>((resolve, reject) => {
//     jwt.verify(token, secretOrPublicKey, (err, decoded) => {
//       if (err) {
//         return reject(err)
//       }
//       resolve(decoded as TokenPayload)
//     })
//   })
// }
