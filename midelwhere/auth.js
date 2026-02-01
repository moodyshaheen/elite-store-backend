import jwt from 'jsonwebtoken'
import User from '../model/User.js'

export const protect = async (req, res, next) => {
  try {
    let token

    // Check for token in cookies or headers
    if (req.cookies.token) {
      token = req.cookies.token
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
      req.user = await User.findById(decoded.id).select('-password')
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' })
      }

      if (!req.user.isActive) {
        return res.status(401).json({ message: 'User account is inactive' })
      }

      next()
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' })
  }
}

