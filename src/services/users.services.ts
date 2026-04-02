import User from '~/models/schemas/User.schemas'
import databaseService from './database.services'
import { LoginReqBody, RegisterReqBody, UpdateMeReqBody } from '~/models/requests/User.requests'
import { comparePassword, hashPassword } from '~/utils/bcrypt'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import RefreshToken from '~/models/schemas/RefreshToken.schemas'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'
import { USER_MESSAGES } from '~/constants/messages'
import Follower from '~/models/schemas/Follower.schemas'

config()

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
        token_type: TokenType.AccessToken,
        verify: verify
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
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
        token_type: TokenType.RefreshToken,
        verify: verify
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
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

  private signEmailVerifyToken({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id: userId,
        token_type: TokenType.EmailVerifyToken,
        verify: verify
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as
          | `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}`
          | number
      }
    })
  }

  private signForgotPasswordToken({
    userId,
    verify
  }: {
    userId: string
    verify: UserVerifyStatus
  }) {
    return signToken({
      payload: {
        user_id: userId,
        token_type: TokenType.ForgotPasswordToken,
        verify: verify
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as
          | `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}`
          | number
      }
    })
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      userId: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token: email_verify_token,
        password: await hashPassword(payload.password),
        date_of_birth: new Date(payload.date_of_birth)
      })
    )
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      userId: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id)
      })
    )
    console.log('Verify email token:', email_verify_token)
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

  async verifyEmail(userId: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken({ userId, verify: UserVerifyStatus.Verified }),
      databaseService.users.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
    ])
    const [access_token, refresh_token] = token
    return {
      access_token,
      refresh_token
    }
  }

  async resendVerifyEmail(userId: string) {
    const email_verify_token = await this.signEmailVerifyToken({
      userId,
      verify: UserVerifyStatus.Unverified
    })
    console.log('Resend verify email token:', email_verify_token)
    await databaseService.users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { email_verify_token: email_verify_token }, $currentDate: { updated_at: true } }
    )
    return {
      message: USER_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }

  async forgotPassword({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({ userId, verify })
    await databaseService.users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { forgot_password_token: forgot_password_token }, $currentDate: { updated_at: true } }
    )

    // Gửi mail đến user để reset password
    console.log('Forgot password token:', forgot_password_token)
    return {
      message: USER_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }

  async resetPassword(userId: string, newPassword: string) {
    const hashedNewPassword = await hashPassword(newPassword)
    await databaseService.users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedNewPassword }, $currentDate: { updated_at: true } }
    )
    return {
      message: USER_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }

  async getMe(userId: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } }
    )
    return user ?? null
  }

  async updateMe(userId: string, payload: UpdateMeReqBody) {
    const _payload = payload.date_of_birth
      ? { ...payload, date_of_birth: new Date(payload.date_of_birth) }
      : payload
    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $set: { ...(_payload as UpdateMeReqBody & { date_of_birth?: Date }) },
        $currentDate: { updated_at: true }
      },
      {
        returnDocument: 'after',
        projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 }
      }
    )
    return user ?? null
  }

  async followUser(userId: string, followedUserId: string) {
    const followered = await databaseService.followers.findOne({
      user_id: new ObjectId(userId),
      followed_user_id: new ObjectId(followedUserId)
    })
    if (followered === null) {
      const follower = new Follower({
        user_id: new ObjectId(userId),
        followed_user_id: new ObjectId(followedUserId)
      })
      await databaseService.followers.insertOne(follower)
      return {
        message: USER_MESSAGES.FOLLOW_USER_SUCCESS
      }
    }
    return {
      message: USER_MESSAGES.FOLLOWED
    }
  }

  async unfollowUser(userId: string, followedUserId: string) {
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(userId),
      followed_user_id: new ObjectId(followedUserId)
    })
    if (follower === null) {
      return {
        message: USER_MESSAGES.ALREADY_UNFOLLOWED
      }
    }
    await databaseService.followers.deleteOne({
      _id: follower._id
    })
    return {
      message: USER_MESSAGES.UNFOLLOW_USER_SUCCESS
    }
  }
}

const usersService = new UsersService()
export default usersService
