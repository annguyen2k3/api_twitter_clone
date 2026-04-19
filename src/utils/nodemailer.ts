import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

export const sendMail = async (email: string, subject: string, html: string): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD
    }
  })

  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: email,
    subject,
    html
  }

  await transporter.sendMail(mailOptions)
}
