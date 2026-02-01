import express from 'express'
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controls/productController.js'
import { protect, admin } from '../midelwhere/auth.js'
import { uploadMultiple } from '../midelwhere/upload.js'

const router = express.Router()

// Middleware to handle optional file uploads
const handleUpload = (req, res, next) => {
  console.log('handleUpload middleware - Content-Type:', req.headers['content-type'])
  console.log('handleUpload middleware - Body before multer:', req.body)
  
  uploadMultiple(req, res, (err) => {
    console.log('Multer callback - Error:', err)
    console.log('Multer callback - Body after multer:', req.body)
    console.log('Multer callback - Files:', req.files)
    
    // If no files uploaded, that's okay - continue
    if (err) {
      // Check for specific multer errors that we can ignore
      if (err.code === 'LIMIT_UNEXPECTED_FILE' || 
          err.message?.includes('Unexpected field') ||
          err.message?.includes('No files were uploaded')) {
        req.files = []
        console.log('No files uploaded, continuing...')
        return next()
      }
      // Other errors should be reported
      console.error('Multer error:', err)
      return res.status(400).json({ message: err.message || 'File upload error' })
    }
    // If no files, set empty array
    if (!req.files) {
      req.files = []
    }
    next()
  })
}

router.get('/', getProducts)
router.get('/:id', getProduct)
router.post('/', protect, admin, handleUpload, createProduct)
router.put('/:id', protect, admin, handleUpload, updateProduct)
router.delete('/:id', protect, admin, deleteProduct)

export default router

