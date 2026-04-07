export enum UserVerifyStatus {
  Unverified, // chưa xác thực email, mặc định = 0
  Verified, // đã xác thực email
  Banned // bị khóa
}
interface Media {
  url: string
  type: MediaType // video, image
}
export enum MediaType {
  Image,
  Video,
  HLS
}
export enum TweetAudience {
  Everyone, // 0
  TwitterCircle // 1
}
export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}
