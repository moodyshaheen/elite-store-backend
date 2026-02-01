import Order from '../model/Order.js'
import Product from '../model/Product.js'

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' })
    }

    // Calculate subtotal and validate products
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      // Try to find product by _id (MongoDB) or id (local)
      let product = null
      
      // Check if it's a valid MongoDB ObjectId
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(item.product)
      
      if (isObjectId) {
        product = await Product.findById(item.product)
      } else {
        // Try to find by id field (for local products from assets.js)
        product = await Product.findOne({ id: Number(item.product) })
      }
      
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` })
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.title}` 
        })
      }

      const price = product.finalPrice || product.price
      subtotal += price * item.quantity

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price
      })

      // Update stock
      product.stock -= item.quantity
      await product.save()
    }

    const shipping = 20 // Default shipping cost
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + shipping + tax

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shipping,
      tax,
      total
    })

    await order.populate('items.product', 'title images')
    await order.populate('user', 'name email')

    res.status(201).json({
      success: true,
      order
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'title images')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      count: orders.length,
      orders
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'title images')
      .populate('user', 'name email')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }

    res.json({
      success: true,
      order
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, includeCancelled = 'false' } = req.query
    const query = status ? { status } : {}
    
    // إذا لم يطلب المستخدم الطلبات الملغاة، استبعدها
    if (includeCancelled === 'false') {
      query.status = { ...query.status, $ne: 'cancelled' }
    }

    const skip = (page - 1) * limit
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'title images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    const total = await Order.countDocuments(query)

    res.json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      orders
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body
    const order = await Order.findById(req.params.id)
      .populate('items.product')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const previousStatus = order.status

    // إذا تم إلغاء الطلب، أعد المخزون للمنتجات
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.product._id || item.product)
        if (product) {
          product.stock += item.quantity
          await product.save()
        }
      }
    }

    // إذا تم استئناف طلب ملغى، قلل المخزون مرة أخرى
    if (previousStatus === 'cancelled' && status !== 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.product._id || item.product)
        if (product) {
          if (product.stock < item.quantity) {
            return res.status(400).json({ 
              message: `Insufficient stock for ${product.title}` 
            })
          }
          product.stock -= item.quantity
          await product.save()
        }
      }
    }

    order.status = status
    await order.save()

    await order.populate('user', 'name email')
    await order.populate('items.product', 'title images')

    res.json({
      success: true,
      order
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // إذا لم يكن الطلب ملغى، أعد المخزون قبل الحذف
    if (order.status !== 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.product._id || item.product)
        if (product) {
          product.stock += item.quantity
          await product.save()
        }
      }
    }

    await order.deleteOne()
    res.json({
      success: true,
      message: 'Order deleted'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

