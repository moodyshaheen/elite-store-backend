import express from 'express'
import {
  createOrder,
  getMyOrders,
  getOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder
} from '../controls/orderController.js'
import { protect, admin } from '../midelwhere/auth.js'

const router = express.Router()

router.post('/', protect, createOrder)
router.get('/myorders', protect, getMyOrders)
router.get('/', protect, admin, getOrders) // Must be before /:id
router.get('/:id', protect, getOrder)
router.put('/:id/status', protect, admin, updateOrderStatus)
router.delete('/:id', protect, admin, deleteOrder)

export default router

