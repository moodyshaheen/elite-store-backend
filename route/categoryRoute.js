import express from 'express'
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controls/categoryController.js'
import { protect, admin } from '../midelwhere/auth.js'
import { uploadSingle } from '../midelwhere/upload.js'

const router = express.Router()

router.get('/', getCategories)
router.get('/:id', getCategory)
router.post('/', protect, admin, uploadSingle, createCategory)
router.put('/:id', protect, admin, uploadSingle, updateCategory)
router.delete('/:id', protect, admin, deleteCategory)

export default router

