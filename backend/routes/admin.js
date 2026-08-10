const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Joi = require('joi');
const { pool } = require('../config/database');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/products');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Dashboard statistics
router.get('/dashboard', async (req, res, next) => {
  try {
    // Get various statistics
    const [orderStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_orders,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
        SUM(total_amount) as total_revenue
      FROM orders
    `);

    const [productStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_products,
        SUM(CASE WHEN stock_quantity <= min_stock_level THEN 1 ELSE 0 END) as low_stock_products,
        SUM(CASE WHEN is_featured = true THEN 1 ELSE 0 END) as featured_products
      FROM products WHERE is_active = true
    `);

    const [userStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_customers
      FROM users WHERE role = 'customer' AND is_active = true
    `);

    // Recent orders
    const [recentOrders] = await pool.execute(`
      SELECT 
        o.id, o.order_number, o.total_amount, o.status, o.created_at,
        CONCAT(u.first_name, ' ', u.last_name) as customer_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    // Low stock products
    const [lowStockProducts] = await pool.execute(`
      SELECT 
        id, name, product_code, stock_quantity, min_stock_level
      FROM products 
      WHERE stock_quantity <= min_stock_level AND is_active = true
      ORDER BY stock_quantity ASC
      LIMIT 5
    `);

    res.json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: {
        stats: {
          orders: orderStats[0],
          products: productStats[0],
          users: userStats[0]
        },
        recentOrders,
        lowStockProducts
      },
      error: null
    });

  } catch (error) {
    next(error);
  }
});

// Get all orders for admin
router.get('/orders', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;

    let whereClause = '';
    let queryParams = [];

    if (status && status !== 'all') {
      whereClause = 'WHERE o.status = ?';
      queryParams.push(status);
    }

    const [orders] = await pool.execute(`
      SELECT 
        o.id, o.order_number, o.total_amount, o.status, o.payment_method, o.payment_status,
        o.created_at, o.updated_at,
        CONCAT(u.first_name, ' ', u.last_name) as customer_name,
        u.email as customer_email, u.phone as customer_phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;

    res.json({
      success: true,
      message: 'Orders retrieved successfully',
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      },
      error: null
    });

  } catch (error) {
    next(error);
  }
});

// Get single order details for admin
router.get('/orders/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const [orders] = await pool.execute(`
      SELECT 
        o.*, 
        CONCAT(u.first_name, ' ', u.last_name) as customer_name,
        u.email as customer_email, u.phone as customer_phone, u.address as customer_address
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [orderId]);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        error: 'ORDER_NOT_FOUND'
      });
    }

    const order = orders[0];

    // Get order items
    const [items] = await pool.execute(`
      SELECT 
        oi.*, p.name as product_name, p.product_code,
        pi.image_url as primary_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE oi.order_id = ?
    `, [orderId]);

    order.items = items;

    res.json({
      success: true,
      message: 'Order retrieved successfully',
      data: order,
      error: null
    });

  } catch (error) {
    next(error);
  }
});

// Update order status
router.put('/orders/:orderId/status', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const schema = Joi.object({
      status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled').required(),
      adminNotes: Joi.string().optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        error: 'VALIDATION_ERROR'
      });
    }

    const { status, adminNotes } = value;

    await pool.execute(
      'UPDATE orders SET status = ?, admin_notes = ? WHERE id = ?',
      [status, adminNotes || null, orderId]
    );

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: null,
      error: null
    });

  } catch (error) {
    next(error);
  }
});

// Get all products for admin
router.get('/products', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;

    let whereClause = '';
    let queryParams = [];

    if (category) {
      whereClause += (whereClause ? ' AND ' : 'WHERE ') + 'c.slug = ?';
      queryParams.push(category);
    }

    if (search) {
      whereClause += (whereClause ? ' AND ' : 'WHERE ') + '(p.name LIKE ? OR p.product_code LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const [products] = await pool.execute(`
      SELECT 
        p.*, c.name as category_name,
        pi.image_url as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);

    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      },
      error: null
    });

  } catch (error) {
    next(error);
  }
});

// Create new product
router.post('/products', upload.array('images', 5), async (req, res, next) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const schema = Joi.object({
      productCode: Joi.string().required(),
      name: Joi.string().required(),
      description: Joi.string().optional(),
      categoryId: Joi.number().integer().positive().required(),
      price: Joi.number().positive().required(),
      discountPrice: Joi.number().positive().optional(),
      stockQuantity: Joi.number().integer().min(0).default(0),
      minStockLevel: Joi.number().integer().min(0).default(5),
      isFeatured: Joi.boolean().default(false),
      sizes: Joi.array().items(Joi.string()).optional(),
      colors: Joi.array().items(Joi.string()).optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        error: 'VALIDATION_ERROR'
      });
    }

    const { 
      productCode, name, description, categoryId, price, discountPrice, 
      stockQuantity, minStockLevel, isFeatured, sizes, colors 
    } = value;

    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Create product
    const [productResult] = await connection.execute(`
      INSERT INTO products (
        product_code, name, slug, description, category_id, price, discount_price,
        stock_quantity, min_stock_level, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      productCode, name, slug, description, categoryId, price, 
      discountPrice || null, stockQuantity, minStockLevel, isFeatured
    ]);

    const productId = productResult.insertId;

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageUrl = `/uploads/products/${file.filename}`;
        const isPrimary = i === 0; // First image is primary

        await connection.execute(`
          INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
          VALUES (?, ?, ?, ?)
        `, [productId, imageUrl, isPrimary, i]);
      }
    }

    // Add size variants
    if (sizes && sizes.length > 0) {
      for (const size of sizes) {
        await connection.execute(`
          INSERT INTO product_variants (product_id, variant_type, variant_value, stock_quantity)
          VALUES (?, 'size', ?, ?)
        `, [productId, size, Math.floor(stockQuantity / sizes.length)]);
      }
    }

    // Add color variants
    if (colors && colors.length > 0) {
      for (const color of colors) {
        await connection.execute(`
          INSERT INTO product_variants (product_id, variant_type, variant_value, stock_quantity)
          VALUES (?, 'color', ?, ?)
        `, [productId, color, Math.floor(stockQuantity / colors.length)]);
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { productId, slug },
      error: null
    });

  } catch (error) {
    await connection.rollback();
    
    // Clean up uploaded files on error
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }
    }
    
    next(error);
  } finally {
    connection.release();
  }
});

// Update product
router.put('/products/:productId', upload.array('images', 5), async (req, res, next) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { productId } = req.params;
    
    // Check if product exists
    const [existingProducts] = await connection.execute(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    );

    if (existingProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'PRODUCT_NOT_FOUND'
      });
    }

    const schema = Joi.object({
      name: Joi.string().optional(),
      description: Joi.string().optional(),
      categoryId: Joi.number().integer().positive().optional(),
      price: Joi.number().positive().optional(),
      discountPrice: Joi.number().positive().optional(),
      stockQuantity: Joi.number().integer().min(0).optional(),
      minStockLevel: Joi.number().integer().min(0).optional(),
      isFeatured: Joi.boolean().optional(),
      isActive: Joi.boolean().optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        error: 'VALIDATION_ERROR'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    Object.keys(value).forEach(key => {
      const dbField = {
        name: 'name',
        description: 'description', 
        categoryId: 'category_id',
        price: 'price',
        discountPrice: 'discount_price',
        stockQuantity: 'stock_quantity',
        minStockLevel: 'min_stock_level',
        isFeatured: 'is_featured',
        isActive: 'is_active'
      }[key];

      if (dbField) {
        updateFields.push(`${dbField} = ?`);
        updateValues.push(value[key]);
      }
    });

    if (updateFields.length > 0) {
      updateValues.push(productId);
      await connection.execute(
        `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      // Get current max sort order
      const [maxSortResult] = await connection.execute(
        'SELECT COALESCE(MAX(sort_order), -1) as max_sort FROM product_images WHERE product_id = ?',
        [productId]
      );
      let nextSortOrder = maxSortResult[0].max_sort + 1;

      for (const file of req.files) {
        const imageUrl = `/uploads/products/${file.filename}`;
        await connection.execute(`
          INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
          VALUES (?, ?, false, ?)
        `, [productId, imageUrl, nextSortOrder++]);
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: null,
      error: null
    });

  } catch (error) {
    await connection.rollback();
    
    // Clean up uploaded files on error
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }
    }
    
    next(error);
  } finally {
    connection.release();
  }
});

// Delete product
router.delete('/products/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;

    const [result] = await pool.execute(
      'UPDATE products SET is_active = false WHERE id = ?',
      [productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'PRODUCT_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: null,
      error: null
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
