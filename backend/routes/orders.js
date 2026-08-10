const express = require('express');
const Joi = require('joi');
const { prisma } = require('../config/prisma');

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

// Generate WhatsApp message
const generateWhatsAppMessage = async (orderId) => {
  const order = await prisma.orders.findUnique({
    where: { id: orderId },
    include: {
      users: true,
      order_items: {
        include: { products: true }
      }
    }
  });

  if (!order) return '';

  let message = `🛍️ *New Order from Klova Store*\n\n`;
  message += `📝 *Order Details:*\n`;
  message += `Order #: ${order.order_number}\n`;
  message += `Date: ${new Date(order.created_at).toLocaleDateString()}\n\n`;

  message += `👤 *Customer Information:*\n`;
  message += `Name: ${order.users.first_name} ${order.users.last_name}\n`;
  message += `Email: ${order.users.email}\n`;
  if (order.users.phone) message += `Phone: ${order.users.phone}\n`;
  message += `\n`;

  message += `📦 *Items Ordered:*\n`;
  order.order_items.forEach((item, index) => {
    message += `${index + 1}. ${item.products.name} (${item.products.product_code})\n`;
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

// Create new order
router.post('/', async (req, res, next) => {
  try {
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
      const product = await prisma.products.findFirst({
        where: { id: item.productId, is_active: true }
      });

      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      
      if (product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      const unitPrice = Number(product.discount_price || product.price);
      const totalPrice = unitPrice * item.quantity;
      totalAmount += totalPrice;

      validatedItems.push({
        ...item,
        unitPrice,
        totalPrice
      });
    }

    const orderNumber = generateOrderNumber();

    const orderResult = await prisma.$transaction(async (tx) => {
      const order = await tx.orders.create({
        data: {
          order_number: orderNumber,
          user_id: req.user.id,
          total_amount: totalAmount,
          status: 'pending',
          payment_method: paymentMethod,
          payment_status: 'pending',
          shipping_address: shippingAddress,
          shipping_city: shippingCity,
          shipping_postal_code: shippingPostalCode || null,
          customer_notes: customerNotes || null,
          order_items: {
            create: validatedItems.map(item => ({
              product_id: item.productId,
              quantity: item.quantity,
              unit_price: item.unitPrice,
              size: item.size || null,
              color: item.color || null,
              total_price: item.totalPrice
            }))
          }
        }
      });

      for (const item of validatedItems) {
        await tx.products.update({
          where: { id: item.productId },
          data: { stock_quantity: { decrement: item.quantity } }
        });
      }

      await tx.cart_items.deleteMany({
        where: { user_id: req.user.id }
      });

      return order;
    });

    const whatsappMessage = await generateWhatsAppMessage(orderResult.id);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        orderId: orderResult.id,
        orderNumber,
        totalAmount,
        whatsappMessage,
        whatsappUrl: `${process.env.WHATSAPP_API_URL}${process.env.WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`
      },
      error: null
    });

  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('stock')) {
      return res.status(400).json({
        success: false,
        message: error.message,
        error: 'ORDER_VALIDATION_ERROR'
      });
    }
    next(error);
  }
});

// Get user's orders
router.get('/my-orders', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where: { user_id: req.user.id },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
        include: {
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
      }),
      prisma.orders.count({ where: { user_id: req.user.id } })
    ]);

    const formattedOrders = orders.map(order => ({
      id: order.id,
      order_number: order.order_number,
      total_amount: Number(order.total_amount),
      status: order.status,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      created_at: order.created_at,
      items: order.order_items.map(item => ({
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        size: item.size,
        color: item.color,
        total_price: Number(item.total_price),
        product_name: item.products.name,
        product_slug: item.products.slug,
        primary_image: item.products.product_images.length > 0 ? item.products.product_images[0].image_url : null
      }))
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

// Get single order
router.get('/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.orders.findFirst({
      where: { id: parseInt(orderId), user_id: req.user.id },
      include: {
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
      id: order.id,
      order_number: order.order_number,
      total_amount: Number(order.total_amount),
      status: order.status,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      shipping_address: order.shipping_address,
      shipping_city: order.shipping_city,
      shipping_postal_code: order.shipping_postal_code,
      customer_notes: order.customer_notes,
      admin_notes: order.admin_notes,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: order.order_items.map(item => ({
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        size: item.size,
        color: item.color,
        total_price: Number(item.total_price),
        product_id: item.products.id,
        product_name: item.products.name,
        product_slug: item.products.slug,
        product_code: item.products.product_code,
        primary_image: item.products.product_images.length > 0 ? item.products.product_images[0].image_url : null
      }))
    };

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

module.exports = router;
