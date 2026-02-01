import mongoose from 'mongoose'
import User from '../model/User.js'
import { connectDb } from '../config/db.js'
import 'dotenv/config'

const makeAdmin = async () => {
  try {
    await connectDb()
    
    // Get email from command line argument or use default
    const email = process.argv[2] || 'mo@gmail.com'
    
    console.log(`Looking for user with email: ${email}`)
    
    const user = await User.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      console.log(`❌ User with email ${email} not found`)
      console.log('\nAvailable users:')
      const allUsers = await User.find().select('name email role')
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.name}) - Role: ${u.role}`)
      })
      process.exit(1)
    }
    
    if (user.role === 'admin') {
      console.log(`✅ User ${email} is already an admin`)
      process.exit(0)
    }
    
    // Update user role to admin
    user.role = 'admin'
    await user.save()
    
    console.log(`✅ Successfully updated ${email} to admin role`)
    console.log(`\nUser details:`)
    console.log(`  Name: ${user.name}`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Role: ${user.role}`)
    console.log(`  Active: ${user.isActive}`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

makeAdmin()

