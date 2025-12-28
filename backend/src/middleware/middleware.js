const jwt = require('jsonwebtoken')
const User = require('../models/User')

const secure = async (req,res,next) =>{
    try{
    const authHeader= req.headers.authorization

    if (!authHeader){
        return res.status(401).json('No authorization header provided')
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    req.User = await User.findById(decoded.id)
    // req.User = await User.findById(decoded.id).select('-password')
    next()
} catch(err){
    return err
}
}
module.exports = {secure}