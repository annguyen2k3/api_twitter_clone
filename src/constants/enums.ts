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
  Tweet, // 0
  Retweet, // 1
  Comment, // 2
  QuoteTweet // 3
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum EncodingStatus {
  Pending,
  Processing,
  Success,
  Failed
}
