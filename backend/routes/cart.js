const express = require('express');
const Joi = require('joi');
const { pool } = require('../config/database');

const router = express.Router();

// Get user's cart items
router.get('/', async (req, res, next) => {
  try {
    const [cartItems] = await pool.execute(
      `SELECT 
        ci.id, ci.quantity, ci.size, ci.color,
        p.id as product_id, p.name, p.slug, p.price, p.discount_price, p.stock_quantity,
        pi.image_url as primary_image,
        c.name as category_name
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE ci.user_id = ? AND p.is_active = true
       ORDER BY ci.created_at DESC`,
      [req.user.id]
    );

    // Calculate totals
    let subtotal = 0;
    const processedItems = cartItems.map(item => {
      const price = item.discount_price || item.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      return {
        ...item,
        unit_price: price,
        total_price: itemTotal
      };
    });

    res.json({
      success: true,
      message: 'Cart retrieved successfully',
      data: {
        items: processedItems,
        summary: {
          subtotal: subtotal,
          itemCount: processedItems.length,
          totalQuantity: processedItems.reduce((sum, item) => sum + item.quantity, 0)
        }
      },
      error: null
    });

  } catch (error) {
    next(error);
  }
});

// Add item to cart
router.post('/add', async (req, res, next) => {
  try {
    const schema = Joi.object({
      productId: Joi.number().integer().positive().required(),
      quantity: Joi.number().integer().positive().default(1),
      size: Joi.string().optional(),
      color: Joi.string().optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        error: 'VALIDATION_ERROR'
      });
    }

    const { productId, quantity, size, color } = value;

    // Check if product exists and is active
    const [products] = await pool.execute(
      'SELECT id, name, stock_quantity FROM products WHERE id = ? AND is_active = true',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'PRODUCT_NOT_FOUND'
      });
    }

    const product = products[0];

    // Check stock availability
    if (product.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available',
        error: 'INSUFFICIENT_STOCK'
      });
    }

    // Check if item already exists in cart
    const [existingItems] = await pool.execute(
      `SELECT id, quantity FROM cart_items 
       WHERE user_id = ? AND product_id = ? AND size = ? AND color = ?`,
      [req.user.id, productId, size || null, color || null]
    );

    if (existingItems.length > 0) {
      // Update existing item
      const existingItem = existingItems[0];
      const newQuantity = existingItem.quantity + quantity;

      if (product.stock_quantity < newQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock available',
          error: 'INSUFFICIENT_STOCK'
        });
      }

      await pool.execute(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQuantity, existingItem.id]
      );

      res.json({
        success: true,
        message: 'Cart item updated successfully',
        data: null,
        error: null
      });
    } else {
      // Add new item
      await pool.execute(
        `INSERT INTO cart_items (user_id, product_id, quantity, size, color) 
         VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, productId, quantity, size || null, color || null]
      );

      res.status(201).json({
        success: true,
        message: 'Item added to cart successfully',
        data: null,
        error: null
      });
    }

  } catch (error) {
    next(error);
  }
});

// Update cart item quantity
router.put('/:itemId', async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const schema = Joi.object({
      quantity: Joi.number().integer().positive().required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        error: 'VALIDATION_ERROR'
      });
    }

    const { quantity } = value;

    // Check if cart item exists and belongs to user
    const [cartItems] = await pool.execute(
      `SELECT ci.id, ci.product_id, p.stock_quantity
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.id = ? AND ci.user_id = ?`,
      [itemId, req.user.id]
    );

    if (cartItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
        error: 'CART_ITEM_NOT_FOUND'
      });
    }

    const cartItem = cartItems[0];

    // Check stock availability
    if (cartItem.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available',
        error: 'INSUFFICIENT_STOCK'
      });
    }

    // Update quantity
    await pool.execute(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [quantity, itemId]
    );

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: null,
      error: null
    });

  } catch (error) {
    next(error);
  }
});

// Remove item from cart
router.delete('/:itemId', async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [itemId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
        error: 'CART_ITEM_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: null,
      error: null
    });

  } catch (error) {
    next(error);
  }
});

// Clear entire cart
router.delete('/', async (req, res, next) => {
  try {
    await pool.execute(
      'DELETE FROM cart_items WHERE user_id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: null,
      error: null
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
