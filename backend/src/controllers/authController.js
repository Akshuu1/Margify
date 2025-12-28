const User = require("../models/User");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const signup = async (req,res) =>{
    const {name,email,password} = req.body
    if (!name){
        return res.status(400).json("Enter Name")
    }
    if (!email || !email.includes('@') || !email.endsWith('.com')) {
        return res.status(400).json("Enter Email")
    }
    if (!password){
        return res.status(400).json("Enter Password")
    }
    const user = await User.findOne({email})
    if(user){
        return res.status(400).json("User already Exists")
    }

    const hashedPass = await bcrypt.hash(password,10)

    const newUser = await User.create({
        name,email,password:hashedPass
    })
    res.status(201).json("User created successfully")
}


const login = async (req,res) =>{
    const {email,password} = req.body
    if (!name){
        return res.status(400).json("Enter Name")
    }
    if (!email || !email.includes('@') || !email.endsWith('.com')) {
        return res.status(400).json("Enter Email")
    }
    if (!password){
        return res.status(400).json("Enter Password")
    }

    const user = await User.findOne({email})
    if(!user){
        return res.status(400).json("User not found")
    }
    const pass = await bcrypt.compare(user.password,password)

    if (!pass){
        return res.status(400).json('Enter Valid Password')
    }
    const token = jwt.sign(
        {id:user._id},
        process.env.JWT_SECRET,
        {expiresIn:'1d'}
    )
    res.json({
        token,user:{
            id:user._id,
            name:user.name,
            email:user.email
        }
    })
}

module.exports = {signup,login}