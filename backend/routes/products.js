const express = require('express');
const { pool } = require('../config/database');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all products with pagination and filters
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder || 'DESC';

    let whereClause = 'WHERE p.is_active = true';
    let queryParams = [];

    // Category filter
    if (category) {
      whereClause += ' AND c.slug = ?';
      queryParams.push(category);
    }

    // Search filter
    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.product_code LIKE ?)';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Valid sort columns
    const validSortColumns = ['name', 'price', 'created_at'];
    const validSortOrder = ['ASC', 'DESC'];
    const finalSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = validSortOrder.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Get products with pagination
    const query = `
      SELECT 
        p.id, p.product_code, p.name, p.slug, p.description, p.price, p.discount_price,
        p.stock_quantity, p.is_featured, p.created_at,
        c.name as category_name, c.slug as category_slug,
        pi.image_url as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      ${whereClause}
      ORDER BY p.${finalSortBy} ${finalSortOrder}
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, offset);
    const [products] = await pool.execute(query, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const countParams = queryParams.slice(0, -2); // Remove limit and offset
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    // Get product variants for each product
    for (let product of products) {
      const [variants] = await pool.execute(
        `SELECT variant_type, variant_value, additional_price, stock_quantity, is_available
         FROM product_variants 
         WHERE product_id = ? AND is_available = true
         ORDER BY variant_type, variant_value`,
        [product.id]
      );

      product.variants = {
        sizes: variants.filter(v => v.variant_type === 'size'),
        colors: variants.filter(v => v.variant_type === 'color')
      };

      // Get all images
      const [images] = await pool.execute(
        `SELECT image_url, alt_text, is_primary, sort_order
         FROM product_images 
         WHERE product_id = ?
         ORDER BY is_primary DESC, sort_order ASC`,
        [product.id]
      );
      product.images = images;
    }

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      },
      error: null
    });

  } catch (error) {
    next(error);
  }
});

// Get featured products
router.get('/featured', optionalAuth, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const [products] = await pool.execute(
      `SELECT 
        p.id, p.product_code, p.name, p.slug, p.description, p.price, p.discount_price,
        p.stock_quantity, p.created_at,
        c.name as category_name, c.slug as category_slug,
        pi.image_url as primary_image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
       WHERE p.is_active = true AND p.is_featured = true
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [limit]
    );

    res.json({
      success: true,
      message: 'Featured products retrieved successfully',
      data: products,
      error: null
    });

  } catch (error) {
    next(error);
  }
});

// Get single product by slug
router.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    const { slug } = req.params;

    const [products] = await pool.execute(
      `SELECT 
        p.id, p.product_code, p.name, p.slug, p.description, p.price, p.discount_price,
        p.stock_quantity, p.is_featured, p.created_at, p.meta_title, p.meta_description,
        c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? AND p.is_active = true`,
      [slug]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'PRODUCT_NOT_FOUND'
      });
    }

    const product = products[0];

    // Get product variants
    const [variants] = await pool.execute(
      `SELECT variant_type, variant_value, additional_price, stock_quantity, is_available
       FROM product_variants 
       WHERE product_id = ? AND is_available = true
       ORDER BY variant_type, variant_value`,
      [product.id]
    );

    product.variants = {
      sizes: variants.filter(v => v.variant_type === 'size'),
      colors: variants.filter(v => v.variant_type === 'color')
    };

    // Get product images
    const [images] = await pool.execute(
      `SELECT image_url, alt_text, is_primary, sort_order
       FROM product_images 
       WHERE product_id = ?
       ORDER BY is_primary DESC, sort_order ASC`,
      [product.id]
    );
    product.images = images;

    // Get related products (same category, exclude current product)
    const [relatedProducts] = await pool.execute(
      `SELECT 
        p.id, p.product_code, p.name, p.slug, p.price, p.discount_price,
        pi.image_url as primary_image
       FROM products p
       LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
       WHERE p.category_id = (SELECT category_id FROM products WHERE slug = ?) 
         AND p.slug != ? AND p.is_active = true
       ORDER BY RAND()
       LIMIT 4`,
      [slug, slug]
    );
    product.relatedProducts = relatedProducts;

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: product,
      error: null
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
