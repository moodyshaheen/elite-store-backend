import express from 'express'
import {
  getProfile,
  updateProfile,
  changePassword,
  addToFavorites,
  removeFromFavorites,
  getFavorites
} from '../controls/profileController.js'
import { protect } from '../midelwhere/auth.js'
import { uploadSingle } from '../midelwhere/upload.js'

const router = express.Router()

router.use(protect) // All routes require authentication

router.get('/', getProfile)
router.put('/', uploadSingle, updateProfile)
router.put('/password', changePassword)
router.get('/favorites', getFavorites)
router.post('/favorites/:productId', addToFavorites)
router.delete('/favorites/:productId', removeFromFavorites)

export default router

