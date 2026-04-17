import { ObjectId } from 'mongodb'
import { faker } from '@faker-js/faker'
import { RegisterReqBody } from '~/models/requests/User.requests'
import { TweetReqBody } from '~/models/requests/Tweet.requests'
import { TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enums'
import databaseService from '~/services/database.services'
import User from '~/models/schemas/User.schemas'
import { hashPassword } from './bcrypt'
import Follower from '~/models/schemas/Follower.schemas'
import tweetsService from '~/services/tweets.services'

// Mật khẩu cho các fake user
const PASSWORD = 'User123@'
// ID tài khoản của mình, dùng để follow người khác
const MYID = new ObjectId('69ce0d8b86bc1e960f58a5eb')
// Số lượng user được tạo, mỗi user sẽ mặc định tweet 2 cái
const USER_COUNT = 100

const createRandomUser = () => {
  const user: RegisterReqBody = {
    name: faker.internet.displayName(),
    email: faker.internet.email(),
    password: PASSWORD,
    confirm_password: PASSWORD,
    date_of_birth: faker.date.birthdate().toISOString()
  }
  return user
}

const createRandomTweet = () => {
  const tweet: TweetReqBody = {
    type: TweetType.Tweet,
    audience: TweetAudience.Everyone,
    content: faker.lorem.paragraph({ min: 10, max: 150 }),
    parent_id: null,
    hashtags: [],
    mentions: [],
    medias: []
  }
  return tweet
}

const users: RegisterReqBody[] = faker.helpers.multiple(createRandomUser, { count: USER_COUNT })

const insertMultipleUsers = async (users: RegisterReqBody[]) => {
  console.log('Inserting multiple users...')
  const result = await Promise.all(
    users.map(async (user) => {
      const user_id = new ObjectId()
      await databaseService.users.insertOne(
        new User({
          ...user,
          username: `user${user_id.toString()}`,
          password: await hashPassword(user.password),
          date_of_birth: new Date(user.date_of_birth),
          verify: UserVerifyStatus.Verified
        })
      )
      return user_id
    })
  )
  console.log(`Created ${result.length} users`)
  return result
}

const followMultipleUsers = async (user_id: ObjectId, followed_user_ids: ObjectId[]) => {
  console.log('Start following multiple users...')
  const result = await Promise.all(
    followed_user_ids.map(async (followed_user_id) => {
      databaseService.followers.insertOne(
        new Follower({
          user_id,
          followed_user_id: new ObjectId(followed_user_id)
        })
      )
    })
  )
  console.log(`Followed ${result.length} users`)
}

const insertMultipleTweets = async (user_ids: ObjectId[]) => {
  console.log('Creating tweets...')
  console.log('Counting...')
  let count = 0
  const result = await Promise.all(
    user_ids.map(async (id, index) => {
      await Promise.all([
        tweetsService.createTweet(id.toString(), createRandomTweet()),
        tweetsService.createTweet(id.toString(), createRandomTweet())
      ])
      count += 2
      console.log(`Created ${count} tweets`)
    })
  )
  return result
}

insertMultipleUsers(users).then((user_ids) => {
  followMultipleUsers(new ObjectId(MYID), user_ids)
  insertMultipleTweets(user_ids)
})
