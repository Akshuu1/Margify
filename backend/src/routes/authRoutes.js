const express = require('express')
const router = express.Router()
const { signup,login } = require('../controllers/authController')
const { secure } = require('../middleware/middleware')

router.post('/signup',signup)
router.post('/login',login)
router.get('/profile',secure,(req,res) =>{
    res.json(req.user)
})
module.exports = router