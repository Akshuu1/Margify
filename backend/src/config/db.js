const moongose = require('mongoose')

const connectDB = async () => {
    try {
        await moongose.connect(process.env.MONGO_URL)
        console.log('Database Conected')
    } catch (error) {
        console.error('Database Connection Error:', error)
    }
}
module.exports = { connectDB }