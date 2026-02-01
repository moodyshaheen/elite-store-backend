import Category from '../model/Category.js'

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 })
    res.json({
      success: true,
      count: categories.length,
      categories
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    res.json({
      success: true,
      category
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const categoryData = { ...req.body }
    
    if (req.file) {
      categoryData.image = `/upload/${req.file.filename}`
    }

    const category = await Category.create(categoryData)
    res.status(201).json({
      success: true,
      category
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const categoryData = { ...req.body }
    
    if (req.file) {
      categoryData.image = `/upload/${req.file.filename}`
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      categoryData,
      { new: true, runValidators: true }
    )

    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    res.json({
      success: true,
      category
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    await category.deleteOne()
    res.json({
      success: true,
      message: 'Category deleted'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

