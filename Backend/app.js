import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import connectDB from './Config/dbconnect.js'
import userRoute from './Routes/UserCraete.route.js'
import loginRoute from './Routes/Login.route.js'
import profileRoute from './Routes/UserProfile.route.js'
import projectRoute from './Routes/Project.route.js'
import applicationRoutes from "./Routes/Application.route.js";
import notificationRoutes from "./Routes/Notification.route.js";


const app = express()

connectDB();
app.use(express.json())
app.use('/api/auth', userRoute)
app.use('/api/login', loginRoute)
app.use('/api/profile', profileRoute)
app.use('/api/projects', projectRoute)
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app
