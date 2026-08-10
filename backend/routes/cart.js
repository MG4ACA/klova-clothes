const express = require('express');
const Joi = require('joi');
const { prisma } = require('../config/prisma');

const router = express.Router();

// Get user's cart items
router.get('/', async (req, res, next) => {
  try {
    const cartItems = await prisma.cart_items.findMany({
      where: {
        user_id: req.user.id,
        products: { is_active: true }
      },
      orderBy: { created_at: 'desc' },
      include: {
        products: {
          include: {
            product_images: {
              where: { is_primary: true },
              take: 1
            },
            categories: true
          }
        }
      }
    });

    // Calculate totals
    let subtotal = 0;
    const processedItems = cartItems.map(item => {
      const p = item.products;
      const price = Number(p.discount_price || p.price);
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      return {
        id: item.id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        product_id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        discount_price: p.discount_price ? Number(p.discount_price) : null,
        stock_quantity: p.stock_quantity,
        primary_image: p.product_images.length > 0 ? p.product_images[0].image_url : null,
        category_name: p.categories ? p.categories.name : null,
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
    const product = await prisma.products.findFirst({
      where: { id: productId, is_active: true },
      select: { id: true, name: true, stock_quantity: true }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'PRODUCT_NOT_FOUND'
      });
    }

    // Check stock availability
    if (product.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available',
        error: 'INSUFFICIENT_STOCK'
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cart_items.findFirst({
      where: {
        user_id: req.user.id,
        product_id: productId,
        size: size || null,
        color: color || null
      }
    });

    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + quantity;

      if (product.stock_quantity < newQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock available',
          error: 'INSUFFICIENT_STOCK'
        });
      }

      await prisma.cart_items.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity }
      });

      res.json({
        success: true,
        message: 'Cart item updated successfully',
        data: null,
        error: null
      });
    } else {
      // Add new item
      await prisma.cart_items.create({
        data: {
          user_id: req.user.id,
          product_id: productId,
          quantity,
          size: size || null,
          color: color || null
        }
      });

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
    const cartItem = await prisma.cart_items.findFirst({
      where: { id: parseInt(itemId), user_id: req.user.id },
      include: { products: true }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
        error: 'CART_ITEM_NOT_FOUND'
      });
    }

    // Check stock availability
    if (cartItem.products.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available',
        error: 'INSUFFICIENT_STOCK'
      });
    }

    // Update quantity
    await prisma.cart_items.update({
      where: { id: parseInt(itemId) },
      data: { quantity }
    });

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

    const result = await prisma.cart_items.deleteMany({
      where: { id: parseInt(itemId), user_id: req.user.id }
    });

    if (result.count === 0) {
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
    await prisma.cart_items.deleteMany({
      where: { user_id: req.user.id }
    });

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
