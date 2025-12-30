const moongose = require('mongoose')

const connectDB = async () =>{
    try{
        await moongose.connect(process.env.MONGO_URL)
        console.log('Database Conected')
    } catch(error){
        return error
    }
}
module.exports = {connectDB}