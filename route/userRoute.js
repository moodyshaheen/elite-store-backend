import express from 'express'
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus
} from '../controls/userController.js'
import { protect, admin } from '../midelwhere/auth.js'

const router = express.Router()

router.use(protect, admin) // All routes require admin

router.get('/', getUsers)
router.get('/:id', getUserById)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)
router.patch('/:id/toggle', toggleUserStatus)

export default router

