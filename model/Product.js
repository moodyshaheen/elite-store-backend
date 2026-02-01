import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    sparse: true
  },
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price must be positive']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  images: [{
    type: String,
    default: []
  }],
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
})

// Calculate final price
productSchema.virtual('finalPrice').get(function() {
  return this.price * (1 - this.discount / 100)
})

// Update status based on stock
productSchema.pre('save', function(next) {
  if (this.stock === 0) {
    this.status = 'out_of_stock'
  } else if (this.status === 'out_of_stock' && this.stock > 0) {
    this.status = 'active'
  }
  next()
})

export default mongoose.model('Product', productSchema)

