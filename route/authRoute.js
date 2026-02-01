import express from 'express'
import { register, login, logout, getMe } from '../controls/authController.js'
import { protect } from '../midelwhere/auth.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', protect, getMe)

export default router

