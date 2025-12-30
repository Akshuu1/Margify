const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const { db } = require('./models/User')
const { connectDB } = require('./config/db')
const app = express()

dotenv.config()
connectDB()

app.use(cors({
    origin: ['http://localhost:5173', 'https://margify.onrender.com'],
    credentials: true
}))
// app.use(cors())
app.use(express.json())

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/routes',require('./routes/routePlannerRoutes'))
app.get('/', (req, res) => {
    res.send('Server Working')
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log('Server Started')
})