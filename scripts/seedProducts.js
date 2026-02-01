import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from '../model/Product.js'
import Category from '../model/Category.js'

dotenv.config()

// Sample products data (from assets.js structure)
const productsData = [
  { id: 1, title: 'Throw Pillow Set', category: 'Home', price: 1500, discount: 5, stock: 10, description: 'Comfortable and durable pillows for your home.' },
  { id: 2, title: 'Designer Leather Handbag', category: 'fashion', price: 900, discount: 30, stock: 52, description: 'Elegant handbag made of high-quality leather.' },
  { id: 3, title: 'Decorative Vase', category: 'Home', price: 1200, discount: 8, stock: 3, description: 'Beautiful decorative vase for your home.' },
  { id: 4, title: 'Silver Bracelet', category: 'Jewelry', price: 300, discount: 20, stock: 15, description: 'Elegant silver bracelet.' },
  { id: 5, title: 'Diamond Ring', category: 'Jewelry', price: 450, discount: 10, stock: 25, description: 'Beautiful diamond ring.' },
  { id: 6, title: 'Gaming Mouse', category: 'Electronics', price: 2200, discount: 9, stock: 22, description: 'High-performance gaming mouse.' },
  { id: 7, title: 'Diamond Earrings Set', category: 'Electronics', price: 1600, discount: 16, stock: 31, description: 'Beautiful diamond earrings.' },
  { id: 8, title: 'Casual Denim Jeans', category: 'fashion', price: 1400, discount: 3, stock: 40, description: 'Comfortable denim jeans.' },
  { id: 9, title: 'Smart Watch Pro', category: 'Electronics', price: 1100, discount: 5, stock: 50, description: 'Advanced smart watch.' },
  { id: 10, title: 'Wall Art Canvas', category: 'Home', price: 700, discount: 10, stock: 20, description: 'Beautiful wall art canvas.' },
  { id: 11, title: 'Designer Silk Dress', category: 'fashion', price: 1200, discount: 15, stock: 18, description: 'Elegant silk dress.' },
  { id: 12, title: 'Premium Leather Jacket', category: 'fashion', price: 2500, discount: 12, stock: 14, description: 'Premium quality leather jacket.' },
  { id: 13, title: 'Pearl Earrings', category: 'Jewelry', price: 1300, discount: 7, stock: 12, description: 'Elegant pearl earrings.' },
  { id: 14, title: 'Modern Table Lamp', category: 'Home', price: 1800, discount: 6, stock: 28, description: 'Modern table lamp.' },
  { id: 15, title: 'Wireless Headphones', category: 'Electronics', price: 2000, discount: 14, stock: 16, description: 'High-quality wireless headphones.' },
  { id: 16, title: 'Gold Necklace', category: 'Jewelry', price: 900, discount: 9, stock: 10, description: 'Beautiful gold necklace.' }
]

const categoriesData = [
  { name: 'Fashion', slug: 'fashion' },
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Jewelry', slug: 'jewelry' },
  { name: 'Home', slug: 'home' }
]

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/elitestore')
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    await Product.deleteMany({})
    await Category.deleteMany({})
    console.log('✅ Cleared existing data')

    // Create categories
    const categories = await Category.insertMany(categoriesData)
    console.log(`✅ Created ${categories.length} categories`)

    // Create category map
    const categoryMap = {}
    categories.forEach(cat => {
      categoryMap[cat.slug.toLowerCase()] = cat._id
      categoryMap[cat.name.toLowerCase()] = cat._id
    })

    // Add products with category references
    const products = productsData.map(product => ({
      ...product,
      category: categoryMap[product.category.toLowerCase()] || categories[0]._id,
      images: [`/placeholder-${product.id}.jpg`], // Placeholder images
      status: product.stock > 0 ? 'active' : 'out_of_stock'
    }))

    await Product.insertMany(products)
    console.log(`✅ Created ${products.length} products`)

    console.log('✅ Database seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()

