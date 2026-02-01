import jwt from 'jsonwebtoken'
import User from '../model/User.js'

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  })
}

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    console.log('Register request body:', req.body)
    
    const { name, email, password, phone, role } = req.body

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Name, email, and password are required' 
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters' 
      })
    }

    // Check if user exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Create user - allow role to be set (for admin registration)
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    }
    
    // Add phone if provided
    if (phone && phone.trim()) {
      userData.phone = phone.trim()
    }
    
    // Only set role if provided and valid
    if (role && ['customer', 'admin'].includes(role)) {
      userData.role = role
    }

    console.log('Creating user with data:', { ...userData, password: '***' })

    const user = await User.create(userData)
    
    console.log('User created successfully:', { id: user._id, email: user.email, role: user.role })

    if (user) {
      const token = generateToken(user._id)
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      })

      // Remove password from user object before sending
      const userResponse = user.toObject()
      delete userResponse.password

      console.log('Sending response with user:', { ...userResponse, password: '***' })

      res.status(201).json({
        success: true,
        user: userResponse,
        token
      })
    } else {
      res.status(400).json({ message: 'Invalid user data' })
    }
  } catch (error) {
    console.error('Registration error:', error)
    // Handle validation errors from mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ')
      return res.status(400).json({ message: messages || 'Validation error' })
    }
    res.status(500).json({ 
      message: error.message || 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check for user email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is inactive' })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(user._id)

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    })

    // Remove password from user object before sending
    const userResponse = user.toObject()
    delete userResponse.password

    res.json({
      success: true,
      user: userResponse,
      token
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  })
  res.json({ message: 'Logged out successfully' })
}

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
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

