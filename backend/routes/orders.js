const express = require('express');
const Joi = require('joi');
const { pool } = require('../config/database');

const router = express.Router();

// Generate order number
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `KLV${year}${month}${day}${random}`;
};

// Create new order
router.post('/', async (req, res, next) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const schema = Joi.object({
      items: Joi.array().items(
        Joi.object({
          productId: Joi.number().integer().positive().required(),
          quantity: Joi.number().integer().positive().required(),
          size: Joi.string().optional(),
          color: Joi.string().optional()
        })
      ).min(1).required(),
      paymentMethod: Joi.string().valid('bank_transfer', 'cash_on_delivery').required(),
      shippingAddress: Joi.string().required(),
      shippingCity: Joi.string().required(),
      shippingPostalCode: Joi.string().optional(),
      customerNotes: Joi.string().optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        error: 'VALIDATION_ERROR'
      });
    }

    const { items, paymentMethod, shippingAddress, shippingCity, shippingPostalCode, customerNotes } = value;

    // Validate all products and calculate total
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const [products] = await connection.execute(
        'SELECT id, name, price, discount_price, stock_quantity FROM products WHERE id = ? AND is_active = true',
        [item.productId]
      );

      if (products.length === 0) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      const product = products[0];
      
      if (product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      const unitPrice = product.discount_price || product.price;
      const totalPrice = unitPrice * item.quantity;
      totalAmount += totalPrice;

      validatedItems.push({
        ...item,
        product,
        unitPrice,
        totalPrice
      });
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (
        order_number, user_id, total_amount, status, payment_method, payment_status,
        shipping_address, shipping_city, shipping_postal_code, customer_notes
      ) VALUES (?, ?, ?, 'pending', ?, 'pending', ?, ?, ?, ?)`,
      [
        orderNumber, req.user.id, totalAmount, paymentMethod,
        shippingAddress, shippingCity, shippingPostalCode || null, customerNotes || null
      ]
    );

    const orderId = orderResult.insertId;

    // Create order items and update stock
    for (const item of validatedItems) {
      // Insert order item
      await connection.execute(
        `INSERT INTO order_items (
          order_id, product_id, quantity, unit_price, size, color, total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId, item.productId, item.quantity, item.unitPrice,
          item.size || null, item.color || null, item.totalPrice
        ]
      );

      // Update product stock
      await connection.execute(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    }

    // Clear user's cart
    await connection.execute(
      'DELETE FROM cart_items WHERE user_id = ?',
      [req.user.id]
    );

    await connection.commit();

    // Generate WhatsApp message
    const whatsappMessage = await generateWhatsAppMessage(connection, orderId);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        orderId,
        orderNumber,
        totalAmount,
        whatsappMessage,
        whatsappUrl: `${process.env.WHATSAPP_API_URL}${process.env.WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`
      },
      error: null
    });

  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

// Generate WhatsApp message
const generateWhatsAppMessage = async (connection, orderId) => {
  const [orders] = await connection.execute(
    `SELECT 
      o.order_number, o.total_amount, o.payment_method, o.shipping_address, o.shipping_city,
      o.customer_notes, o.created_at,
      u.first_name, u.last_name, u.phone, u.email
     FROM orders o
     JOIN users u ON o.user_id = u.id
     WHERE o.id = ?`,
    [orderId]
  );

  const order = orders[0];

  const [orderItems] = await connection.execute(
    `SELECT 
      oi.quantity, oi.unit_price, oi.size, oi.color, oi.total_price,
      p.name as product_name, p.product_code
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ?`,
    [orderId]
  );

  let message = `🛍️ *New Order from Klova Store*\n\n`;
  message += `📝 *Order Details:*\n`;
  message += `Order #: ${order.order_number}\n`;
  message += `Date: ${new Date(order.created_at).toLocaleDateString()}\n\n`;

  message += `👤 *Customer Information:*\n`;
  message += `Name: ${order.first_name} ${order.last_name}\n`;
  message += `Email: ${order.email}\n`;
  if (order.phone) message += `Phone: ${order.phone}\n`;
  message += `\n`;

  message += `📦 *Items Ordered:*\n`;
  orderItems.forEach((item, index) => {
    message += `${index + 1}. ${item.product_name} (${item.product_code})\n`;
    if (item.size) message += `   Size: ${item.size}\n`;
    if (item.color) message += `   Color: ${item.color}\n`;
    message += `   Qty: ${item.quantity} × Rs. ${item.unit_price} = Rs. ${item.total_price}\n\n`;
  });

  message += `💰 *Total Amount: Rs. ${order.total_amount}*\n\n`;

  message += `🚚 *Shipping Address:*\n`;
  message += `${order.shipping_address}\n`;
  message += `${order.shipping_city}\n\n`;

  message += `💳 *Payment Method:* ${order.payment_method === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery'}\n\n`;

  if (order.customer_notes) {
    message += `📝 *Customer Notes:* ${order.customer_notes}\n\n`;
  }

  message += `Please confirm this order. Thank you! 🙏`;

  return message;
};

// Get user's orders
router.get('/my-orders', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [orders] = await pool.execute(
      `SELECT 
        id, order_number, total_amount, status, payment_method, payment_status,
        created_at
       FROM orders 
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, limit, offset]
    );

    // Get order items for each order
    for (let order of orders) {
      const [items] = await pool.execute(
        `SELECT 
          oi.quantity, oi.unit_price, oi.size, oi.color, oi.total_price,
          p.name as product_name, p.slug as product_slug,
          pi.image_url as primary_image
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    // Get total count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
      [req.user.id]
    );
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

// Get single order
router.get('/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const [orders] = await pool.execute(
      `SELECT 
        o.id, o.order_number, o.total_amount, o.status, o.payment_method, o.payment_status,
        o.shipping_address, o.shipping_city, o.shipping_postal_code, o.customer_notes,
        o.admin_notes, o.created_at, o.updated_at
       FROM orders o
       WHERE o.id = ? AND o.user_id = ?`,
      [orderId, req.user.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        error: 'ORDER_NOT_FOUND'
      });
    }

    const order = orders[0];

    // Get order items
    const [items] = await pool.execute(
      `SELECT 
        oi.quantity, oi.unit_price, oi.size, oi.color, oi.total_price,
        p.id as product_id, p.name as product_name, p.slug as product_slug, p.product_code,
        pi.image_url as primary_image
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
       WHERE oi.order_id = ?`,
      [order.id]
    );
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

module.exports = router;
