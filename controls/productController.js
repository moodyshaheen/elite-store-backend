import Product from '../model/Product.js'
import Category from '../model/Category.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      featured,
      status,
      page = 1,
      limit = 12,
      sort = '-createdAt'
    } = req.query

    // Build query
    const query = {}

    if (category) {
      const categoryDoc = await Category.findOne({ slug: category })
      if (categoryDoc) {
        query.category = categoryDoc._id
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    if (featured === 'true') {
      query.featured = true
    }

    if (status) {
      query.status = status
    } else {
      // For public access (no auth), only show active products
      // Admin can see all products by passing status parameter
      if (!req.user || req.user.role !== 'admin') {
        query.status = 'active'
      }
    }

    // Execute query
    const skip = (page - 1) * limit
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))

    const total = await Product.countDocuments(query)

    res.json({
      success: true,
      count: products.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      products
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug')
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.json({
      success: true,
      product
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    console.log('=== CREATE PRODUCT REQUEST ===')
    console.log('Request body:', req.body)
    console.log('Request files:', req.files)
    console.log('User:', req.user)
    
    // Parse FormData fields - multer puts text fields in req.body
    const productData = {
      title: req.body.title?.trim(),
      description: req.body.description?.trim(),
      price: parseFloat(req.body.price) || 0,
      discount: parseFloat(req.body.discount) || 0,
      category: req.body.category,
      stock: parseInt(req.body.stock) || 0,
      status: req.body.status || 'active',
      featured: req.body.featured === 'true' || req.body.featured === true || req.body.featured === 'on'
    }
    
    console.log('Parsed product data:', productData)
    
    // Validate required fields
    if (!productData.title || !productData.description || !productData.category) {
      console.error('Validation failed - missing required fields')
      return res.status(400).json({ 
        message: 'Title, description, and category are required',
        received: {
          title: productData.title,
          description: productData.description,
          category: productData.category
        }
      })
    }

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => `/upload/${file.filename}`)
    } else {
      // If no images, use empty array (model allows this now)
      productData.images = []
    }

    console.log('Creating product with data:', {
      ...productData,
      imagesCount: productData.images.length
    })

    const product = await Product.create(productData)
    await product.populate('category', 'name slug')

    res.status(201).json({
      success: true,
      product
    })
  } catch (error) {
    console.error('Error creating product:', error)
    res.status(500).json({ 
      message: error.message || 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const productData = { ...req.body }
    
    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => `/upload/${file.filename}`)
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug')

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.json({
      success: true,
      product
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    // حذف الصور من مجلد upload
    if (product.images && product.images.length > 0) {
      for (const imagePath of product.images) {
        try {
          // استخراج اسم الملف من المسار
          const filename = imagePath.replace('/upload/', '')
          const filePath = path.join(__dirname, '../upload', filename)
          
          // التحقق من وجود الملف ثم حذفه
          try {
            await fs.access(filePath)
            await fs.unlink(filePath)
            console.log(`✅ Deleted image: ${filename}`)
          } catch (error) {
            // الملف غير موجود، تجاهل الخطأ
            console.log(`⚠️ Image not found: ${filename}`)
          }
        } catch (error) {
          console.error(`❌ Error deleting image ${imagePath}:`, error)
          // لا نوقف العملية إذا فشل حذف صورة واحدة
        }
      }
    }

    await product.deleteOne()
    res.json({
      success: true,
      message: 'Product deleted'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

