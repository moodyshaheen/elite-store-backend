import User from '../model/User.js'

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json({
      success: true,
      count: users.length,
      users
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({
      success: true,
      user
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      success: true,
      user
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await user.deleteOne()
    res.json({
      success: true,
      message: 'User deleted'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Toggle user active status
// @route   PATCH /api/users/:id/toggle
// @access  Private/Admin
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.isActive = !user.isActive
    await user.save()

    res.json({
      success: true,
      user
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

