import fs from 'fs'
import path from 'path'
import { sendMail } from '~/utils/nodemailer'

const verifyEmailTemplate = fs.readFileSync(path.resolve('src/templates/verify-email.html'), 'utf8')

class EmailService {
  async sendVerifyRegisterEmail(
    toAddress: string,
    emailVerifyToken: string,
    template: string = verifyEmailTemplate
  ) {
    const html = template
      .replaceAll('{{title}}', 'Verify your email')
      .replaceAll('{{content}}', 'Click the button below to verify your email:')
      .replaceAll('{{buttonText}}', 'Verify')
      .replaceAll(
        '{{buttonLink}}',
        `${process.env.CLIENT_URL}/verify-email?token=${emailVerifyToken}`
      )

    return sendMail(toAddress, 'Verify your email', html)
  }

  async sendForgotPasswordEmail(
    toAddress: string,
    forgotPasswordToken: string,
    template: string = verifyEmailTemplate
  ) {
    const html = template
      .replaceAll(
        '{{title}}',
        'You are receiving this email because you (or someone else) have requested a password reset for your account.'
      )
      .replaceAll('{{content}}', 'Click the button below to reset your password:')
      .replaceAll('{{buttonText}}', 'Reset password')
      .replaceAll(
        '{{buttonLink}}',
        `${process.env.CLIENT_URL}/reset-password?token=${forgotPasswordToken}`
      )

    return sendMail(toAddress, 'Forgot your password', html)
  }
}

const emailService = new EmailService()
export default emailService
