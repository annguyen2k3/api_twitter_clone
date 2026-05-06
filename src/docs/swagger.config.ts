import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Twitter Clone API',
      version: '1.0.0',
      description:
        'A RESTful API for Twitter Clone Application with features including user authentication, tweets, likes, bookmarks, search, and media uploads.',
      contact: {
        name: 'API Support',
        email: 'annguyen300243@gmail.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development Server'
      }
    ],
    tags: [
      { name: 'Users', description: 'User authentication and profile management' },
      { name: 'Tweets', description: 'Tweet creation, retrieval, and management' },
      { name: 'Likes', description: 'Like and unlike tweets' },
      { name: 'Bookmarks', description: 'Bookmark and unbookmark tweets' },
      { name: 'Search', description: 'Search tweets by content' },
      { name: 'Medias', description: 'Media upload and video status' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token obtained from login endpoint'
        }
      }
    }
  },
  apis: ['./src/docs/components/**/*.yaml', './src/docs/paths/**/*.yaml']
}

export const swaggerSpec = swaggerJsdoc(options)
