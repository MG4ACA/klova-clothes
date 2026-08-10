const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Joi = require('joi');
const { prisma } = require('../config/prisma');
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
    const total_orders = await prisma.orders.count();
    const pending_orders = await prisma.orders.count({ where: { status: 'pending' } });
    const confirmed_orders = await prisma.orders.count({ where: { status: 'confirmed' } });
    const delivered_orders = await prisma.orders.count({ where: { status: 'delivered' } });
    
    const revAggr = await prisma.orders.aggregate({ _sum: { total_amount: true } });
    const total_revenue = Number(revAggr._sum.total_amount || 0);

    const total_products = await prisma.products.count({ where: { is_active: true } });
    const featured_products = await prisma.products.count({ where: { is_active: true, is_featured: true } });
    
    // For comparing two columns we can use raw query
    const lowStockRaw = await prisma.$queryRaw`SELECT COUNT(*) as count FROM products WHERE stock_quantity <= min_stock_level AND is_active = true`;
    const low_stock_products = Number(lowStockRaw[0].count);

    const total_customers = await prisma.users.count({ where: { role: 'customer', is_active: true } });

    const recentOrders = await prisma.orders.findMany({
      orderBy: { created_at: 'desc' },
      take: 5,
      include: { users: true }
    });

    const formattedRecentOrders = recentOrders.map(o => ({
      id: o.id,
      order_number: o.order_number,
      total_amount: Number(o.total_amount),
      status: o.status,
      created_at: o.created_at,
      customer_name: `${o.users.first_name} ${o.users.last_name}`
    }));

    const lowStockProducts = await prisma.$queryRaw`
      SELECT id, name, product_code, stock_quantity, min_stock_level
      FROM products 
      WHERE stock_quantity <= min_stock_level AND is_active = true
      ORDER BY stock_quantity ASC
      LIMIT 5
    `;

    res.json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: {
        stats: {
          orders: { total_orders, pending_orders, confirmed_orders, delivered_orders, total_revenue },
          products: { total_products, low_stock_products, featured_products },
          users: { total_customers }
        },
        recentOrders: formattedRecentOrders,
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

    const whereClause = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
        include: { users: true }
      }),
      prisma.orders.count({ where: whereClause })
    ]);

    const formattedOrders = orders.map(o => ({
      id: o.id,
      order_number: o.order_number,
      total_amount: Number(o.total_amount),
      status: o.status,
      payment_method: o.payment_method,
      payment_status: o.payment_status,
      created_at: o.created_at,
      updated_at: o.updated_at,
      customer_name: `${o.users.first_name} ${o.users.last_name}`,
      customer_email: o.users.email,
      customer_phone: o.users.phone
    }));

    res.json({
      success: true,
      message: 'Orders retrieved successfully',
      data: {
        orders: formattedOrders,
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

    const order = await prisma.orders.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        users: true,
        order_items: {
          include: {
            products: {
              include: {
                product_images: {
                  where: { is_primary: true },
                  take: 1
                }
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        error: 'ORDER_NOT_FOUND'
      });
    }

    const formattedOrder = {
      ...order,
      total_amount: Number(order.total_amount),
      customer_name: `${order.users.first_name} ${order.users.last_name}`,
      customer_email: order.users.email,
      customer_phone: order.users.phone,
      customer_address: order.users.address,
      items: order.order_items.map(item => ({
        ...item,
        unit_price: Number(item.unit_price),
        total_price: Number(item.total_price),
        product_name: item.products.name,
        product_code: item.products.product_code,
        primary_image: item.products.product_images.length > 0 ? item.products.product_images[0].image_url : null
      }))
    };
    
    delete formattedOrder.users;
    delete formattedOrder.order_items;

    res.json({
      success: true,
      message: 'Order retrieved successfully',
      data: formattedOrder,
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
      adminNotes: Joi.string().optional().allow('')
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

    await prisma.orders.update({
      where: { id: parseInt(orderId) },
      data: {
        status,
        admin_notes: adminNotes || null
      }
    });

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

    const whereClause = {};

    if (category) {
      whereClause.categories = { slug: category };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { product_code: { contains: search } }
      ];
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
        include: {
          categories: true,
          product_images: {
            where: { is_primary: true },
            take: 1
          }
        }
      }),
      prisma.products.count({ where: whereClause })
    ]);

    const formattedProducts = products.map(p => ({
      ...p,
      price: Number(p.price),
      discount_price: p.discount_price ? Number(p.discount_price) : null,
      category_name: p.categories?.name,
      primary_image: p.product_images.length > 0 ? p.product_images[0].image_url : null
    }));

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products: formattedProducts,
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
  try {
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

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const productResult = await prisma.$transaction(async (tx) => {
      const p = await tx.products.create({
        data: {
          product_code: productCode,
          name,
          slug,
          description: description || null,
          category_id: categoryId,
          price,
          discount_price: discountPrice || null,
          stock_quantity: stockQuantity,
          min_stock_level: minStockLevel,
          is_featured: isFeatured
        }
      });

      if (req.files && req.files.length > 0) {
        await tx.product_images.createMany({
          data: req.files.map((file, i) => ({
            product_id: p.id,
            image_url: `/uploads/products/${file.filename}`,
            is_primary: i === 0,
            sort_order: i
          }))
        });
      }

      if (sizes && sizes.length > 0) {
        await tx.product_variants.createMany({
          data: sizes.map(size => ({
            product_id: p.id,
            variant_type: 'size',
            variant_value: size,
            stock_quantity: Math.floor(stockQuantity / sizes.length)
          }))
        });
      }

      if (colors && colors.length > 0) {
        await tx.product_variants.createMany({
          data: colors.map(color => ({
            product_id: p.id,
            variant_type: 'color',
            variant_value: color,
            stock_quantity: Math.floor(stockQuantity / colors.length)
          }))
        });
      }

      return p;
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { productId: productResult.id, slug: productResult.slug },
      error: null
    });

  } catch (error) {
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {}
      }
    }
    next(error);
  }
});

// Update product
router.put('/products/:productId', upload.array('images', 5), async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    const existingProduct = await prisma.products.findUnique({ where: { id: parseInt(productId) } });

    if (!existingProduct) {
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

    const updateData = {};
    if (value.name !== undefined) updateData.name = value.name;
    if (value.description !== undefined) updateData.description = value.description;
    if (value.categoryId !== undefined) updateData.category_id = value.categoryId;
    if (value.price !== undefined) updateData.price = value.price;
    if (value.discountPrice !== undefined) updateData.discount_price = value.discountPrice;
    if (value.stockQuantity !== undefined) updateData.stock_quantity = value.stockQuantity;
    if (value.minStockLevel !== undefined) updateData.min_stock_level = value.minStockLevel;
    if (value.isFeatured !== undefined) updateData.is_featured = value.isFeatured;
    if (value.isActive !== undefined) updateData.is_active = value.isActive;

    await prisma.$transaction(async (tx) => {
      if (Object.keys(updateData).length > 0) {
        await tx.products.update({
          where: { id: parseInt(productId) },
          data: updateData
        });
      }

      if (req.files && req.files.length > 0) {
        const images = await tx.product_images.findMany({
          where: { product_id: parseInt(productId) },
          orderBy: { sort_order: 'desc' },
          take: 1
        });
        
        let nextSortOrder = images.length > 0 ? images[0].sort_order + 1 : 0;

        await tx.product_images.createMany({
          data: req.files.map(file => ({
            product_id: parseInt(productId),
            image_url: `/uploads/products/${file.filename}`,
            is_primary: false,
            sort_order: nextSortOrder++
          }))
        });
      }
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: null,
      error: null
    });

  } catch (error) {
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {}
      }
    }
    next(error);
  }
});

// Delete product
router.delete('/products/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;

    const result = await prisma.products.updateMany({
      where: { id: parseInt(productId) },
      data: { is_active: false }
    });

    if (result.count === 0) {
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
