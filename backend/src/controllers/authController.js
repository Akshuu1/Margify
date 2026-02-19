const User = require("../models/User");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!name) return res.status(400).json({ message: "Enter Name" })
        if (!email || !email.includes('@') || !email.endsWith('.com')) return res.status(400).json({ message: "Enter Email" })
        if (!password) return res.status(400).json({ message: "Enter Password" })
        const user = await User.findOne({ email })
        if (user) return res.status(400).json({ message: "User already Exists" })
        const hashedPass = await bcrypt.hash(password, 10)
        await User.create({ name, email, password: hashedPass })
        res.status(201).json({ message: "User created successfully" })
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server Error" })
    }
}
const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !email.includes('@') || !email.endsWith('.com')) return res.status(400).json({ message: "Enter Email" })
        if (!password) return res.status(400).json({ message: "Enter Password" })
        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({ message: "User not found" })
        const pass = await bcrypt.compare(password, user.password)
        if (!pass) return res.status(400).json({ message: 'Enter Valid Password' })
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } })
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server Error" })
    }
}
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordToken = otp;
        user.resetPasswordExpires = Date.now() + 600000;
        await user.save();
        const { sendOTPEmail } = require("../utils/mockEmailService");
        await sendOTPEmail(email, otp);

        console.log("\n" + "=".repeat(30));
        console.log("🔑 RESET CODE FOR:", email);
        console.log("👉 CODE:", otp);
        console.log("=".repeat(30) + "\n");

        res.json({
            message: "Reset code sent! Check console or below.",
            otp: process.env.NODE_ENV === 'production' ? undefined : otp // Only for easier testing
        });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
}
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) return res.status(400).json({ message: "Missing required fields" });
        const user = await User.findOne({ email, resetPasswordToken: otp, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: "Invalid or expired reset code" });
        const hashedPass = await bcrypt.hash(newPassword, 10);
        user.password = hashedPass;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({ message: "Password reset successful" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
}
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });
        const hashedPass = await bcrypt.hash(newPassword, 10);
        user.password = hashedPass;
        await user.save();
        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
}
module.exports = { signup, login, forgotPassword, resetPassword, changePassword }