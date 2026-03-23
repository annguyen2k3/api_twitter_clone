import express from 'express'
import dotenv from 'dotenv'
import databaseService from './services/database.services'

dotenv.config()

const app = express()

databaseService.connect()

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})
