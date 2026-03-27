import User from '~/models/schemas/User.schemas'
import databaseService from './database.services'
import { LoginReqBody, RegisterReqBody } from '~/models/requests/User.requests'
import { comparePassword, hashPassword } from '~/utils/bcrypt'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'
import RefreshToken from '~/models/schemas/RefreshToken.schemas'
import { ObjectId } from 'mongodb'

class UsersService {
  async checkEmailExists(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }

  async getUserByEmail(email: string) {
    return await databaseService.users.findOne({ email })
  }

  async checkInfoLogin(email: string, password: string) {
    const user = await this.getUserByEmail(email)
    if (user === null) {
      return null
    }
    const isMatch = await comparePassword(password, user.password)
    if (!isMatch) {
      return null
    }
    return user ?? null
  }

  private signAccessToken(userId: string) {
    return signToken({
      payload: {
        user_id: userId,
        type: TokenType.AccessToken
      },
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}` | number
      }
    })
  }

  private signRefreshToken(userId: string) {
    return signToken({
      payload: {
        user_id: userId,
        type: TokenType.RefreshToken
      },
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}` | number
      }
    })
  }

  private signAccessAndRefreshToken(userId: string) {
    return Promise.all([this.signAccessToken(userId), this.signRefreshToken(userId)])
  }

  async register(payload: RegisterReqBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        password: await hashPassword(payload.password),
        date_of_birth: new Date(payload.date_of_birth)
      })
    )
    const user_id = result.insertedId.toString()
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id)
      })
    )
    return {
      access_token,
      refresh_token
    }
  }

  async login(userId: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(userId)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(userId)
      })
    )
    return {
      access_token,
      refresh_token
    }
  }
}

const usersService = new UsersService()
export default usersService
