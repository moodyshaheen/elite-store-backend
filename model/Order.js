import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  shippingAddress: {
    street: String,
    city: String,
    country: String,
    zipCode: String,
    phone: String
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'stripe'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentIntentId: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shipping: {
    type: Number,
    default: 20,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
})

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isNew) {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    this.total = this.subtotal + this.shipping + this.tax
  }
  next()
})

export default mongoose.model('Order', orderSchema)

