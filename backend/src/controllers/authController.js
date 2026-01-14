const User = require("../models/User");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!name) {
            return res.status(400).json({ message: "Enter Name" })
        }
        if (!email || !email.includes('@') || !email.endsWith('.com')) {
            return res.status(400).json({ message: "Enter Email" })
        }
        if (!password) {
            return res.status(400).json({ message: "Enter Password" })
        }
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: "User already Exists" })
        }

        const hashedPass = await bcrypt.hash(password, 10)

        const newUser = await User.create({
            name, email, password: hashedPass
        })
        res.status(201).json({ message: "User created successfully" })
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server Error" })
    }
}


const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !email.includes('@') || !email.endsWith('.com')) {
            return res.status(400).json({ message: "Enter Email" })
        }
        if (!password) {
            return res.status(400).json({ message: "Enter Password" })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }
        const pass = await bcrypt.compare(password, user.password)

        if (!pass) {
            return res.status(400).json({ message: 'Enter Valid Password' })
        }
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        )
        res.json({
            token, user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server Error" })
    }
}

module.exports = { signup, login }