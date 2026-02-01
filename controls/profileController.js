import User from '../model/User.js'

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favorites')
      .select('-password')

    res.json({
      success: true,
      user
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body

    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase().trim() })
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' })
      }
      user.email = email.toLowerCase().trim()
    }

    // Update fields
    if (name) user.name = name.trim()
    if (phone) user.phone = phone.trim()
    if (address) {
      user.address = {
        street: address.street || user.address?.street || '',
        city: address.city || user.address?.city || '',
        country: address.country || user.address?.country || '',
        zipCode: address.zipCode || user.address?.zipCode || ''
      }
    }
    if (req.file) {
      user.avatar = `/upload/${req.file.filename}`
    }

    await user.save()

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password

    res.json({
      success: true,
      user: userResponse
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ 
      message: error.message || 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

// @desc    Change password
// @route   PUT /api/profile/password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({
      success: true,
      message: 'Password updated successfully'
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ 
      message: error.message || 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

// @desc    Add to favorites
// @route   POST /api/profile/favorites/:productId
// @access  Private
export const addToFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const { productId } = req.params

    if (user.favorites.includes(productId)) {
      return res.status(400).json({ message: 'Product already in favorites' })
    }

    user.favorites.push(productId)
    await user.save()

    await user.populate('favorites')
    res.json({
      success: true,
      favorites: user.favorites
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Remove from favorites
// @route   DELETE /api/profile/favorites/:productId
// @access  Private
export const removeFromFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const { productId } = req.params

    user.favorites = user.favorites.filter(
      fav => fav.toString() !== productId
    )
    await user.save()

    await user.populate('favorites')
    res.json({
      success: true,
      favorites: user.favorites
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get favorites
// @route   GET /api/profile/favorites
// @access  Private
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites')
    res.json({
      success: true,
      favorites: user.favorites
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

