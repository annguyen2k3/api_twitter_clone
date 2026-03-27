import User from '~/models/schemas/User.schemas'
import databaseService from './database.services'
import { LoginReqBody, RegisterReqBody } from '~/models/requests/User.requests'
import { comparePassword, hashPassword } from '~/utils/bcrypt'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
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

  private signAccessToken({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id: userId,
        type: TokenType.AccessToken,
        verify: verify
      },
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as
          | `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}`
          | number
      }
    })
  }

  private signRefreshToken({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id: userId,
        type: TokenType.RefreshToken,
        verify: verify
      },
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as
          | `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}`
          | number
      }
    })
  }

  private signAccessAndRefreshToken({
    userId,
    verify
  }: {
    userId: string
    verify: UserVerifyStatus
  }) {
    return Promise.all([
      this.signAccessToken({ userId, verify }),
      this.signRefreshToken({ userId, verify })
    ])
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
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      userId: user_id,
      verify: UserVerifyStatus.Unverified
    })
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

  async login({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ userId, verify })
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

  async logout(refreshToken: string) {
    await databaseService.refreshTokens.deleteOne({
      token: refreshToken
    })
    return true
  }

  async refreshToken({
    userId,
    verify,
    refreshToken
  }: {
    userId: string
    verify: UserVerifyStatus
    refreshToken: string
  }) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({ userId, verify }),
      this.signRefreshToken({ userId, verify }),
      databaseService.refreshTokens.deleteOne({
        token: refreshToken
      })
    ])
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: new_refresh_token,
        user_id: new ObjectId(userId)
      })
    )
    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token
    }
  }
}

const usersService = new UsersService()
export default usersService
