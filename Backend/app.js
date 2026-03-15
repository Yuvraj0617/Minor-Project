import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
const app = express()
import connectDB from './Config/dbconnect.js'

connectDB();

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app
