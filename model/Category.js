import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

// Generate slug from name
categorySchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-')
  }
  next()
})

export default mongoose.model('Category', categorySchema)

