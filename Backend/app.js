import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from './Config/dbconnect.js'
import userRoute from './Routes/UserCraete.route.js'
import loginRoute from './Routes/Login.route.js'
import profileRoute from './Routes/UserProfile.route.js'
import projectRoute from './Routes/Project.route.js'
import applicationRoutes from "./Routes/Application.route.js";
import notificationRoutes from "./Routes/Notification.route.js";
import chatRoute from "./Routes/Chat.route.js";


const app = express()

connectDB();
app.use(express.json())
app.use(cors(
  {
    origin: "http://localhost:5173",
    credentials: true
  }
));
app.use(cookieParser())
app.use('/api/auth', userRoute)
app.use('/api/login', loginRoute)
app.use('/api/profile', profileRoute)
app.use('/api/projects', projectRoute)
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoute);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app
