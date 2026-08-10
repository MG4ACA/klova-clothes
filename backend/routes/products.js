const express = require('express');
const { prisma } = require('../config/prisma');
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
    const sortOrder = req.query.sortOrder || 'desc';

    const whereClause = { is_active: true };

    if (category) {
      whereClause.categories = { slug: category };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { product_code: { contains: search } }
      ];
    }

    const validSortColumns = ['name', 'price', 'created_at'];
    const finalSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: whereClause,
        orderBy: { [finalSortBy]: finalSortOrder },
        take: limit,
        skip: offset,
        include: {
          categories: true,
          product_images: {
            where: { is_primary: true },
            take: 1
          },
          product_variants: {
            where: { is_available: true },
            orderBy: [{ variant_type: 'asc' }, { variant_value: 'asc' }]
          }
        }
      }),
      prisma.products.count({ where: whereClause })
    ]);

    const formattedProducts = products.map(p => {
      const sizes = p.product_variants.filter(v => v.variant_type === 'size');
      const colors = p.product_variants.filter(v => v.variant_type === 'color');
      
      return {
        id: p.id,
        product_code: p.product_code,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: Number(p.price),
        discount_price: p.discount_price ? Number(p.discount_price) : null,
        stock_quantity: p.stock_quantity,
        is_featured: p.is_featured,
        created_at: p.created_at,
        category_name: p.categories?.name,
        category_slug: p.categories?.slug,
        primary_image: p.product_images.length > 0 ? p.product_images[0].image_url : null,
        variants: { sizes, colors }
      };
    });

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products: formattedProducts,
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

    const products = await prisma.products.findMany({
      where: { is_active: true, is_featured: true },
      orderBy: { created_at: 'desc' },
      take: limit,
      include: {
        categories: true,
        product_images: {
          where: { is_primary: true },
          take: 1
        }
      }
    });

    const formattedProducts = products.map(p => ({
      id: p.id,
      product_code: p.product_code,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: Number(p.price),
      discount_price: p.discount_price ? Number(p.discount_price) : null,
      stock_quantity: p.stock_quantity,
      created_at: p.created_at,
      category_name: p.categories?.name,
      category_slug: p.categories?.slug,
      primary_image: p.product_images.length > 0 ? p.product_images[0].image_url : null
    }));

    res.json({
      success: true,
      message: 'Featured products retrieved successfully',
      data: formattedProducts,
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

    const product = await prisma.products.findFirst({
      where: { slug, is_active: true },
      include: {
        categories: true,
        product_variants: {
          where: { is_available: true },
          orderBy: [{ variant_type: 'asc' }, { variant_value: 'asc' }]
        },
        product_images: {
          orderBy: [{ is_primary: 'desc' }, { sort_order: 'asc' }]
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'PRODUCT_NOT_FOUND'
      });
    }

    const sizes = product.product_variants.filter(v => v.variant_type === 'size');
    const colors = product.product_variants.filter(v => v.variant_type === 'color');

    // Get related products
    const relatedProducts = await prisma.products.findMany({
      where: {
        category_id: product.category_id,
        slug: { not: slug },
        is_active: true
      },
      take: 4,
      include: {
        product_images: {
          where: { is_primary: true },
          take: 1
        }
      }
    });

    // In a real application, you might want a raw query to order by RAND()
    // For prisma without raw queries, we fetch a small subset and shuffle them in memory.
    const shuffledRelated = relatedProducts.sort(() => 0.5 - Math.random());

    const formattedRelated = shuffledRelated.map(p => ({
      id: p.id,
      product_code: p.product_code,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      discount_price: p.discount_price ? Number(p.discount_price) : null,
      primary_image: p.product_images.length > 0 ? p.product_images[0].image_url : null
    }));

    const formattedProduct = {
      id: product.id,
      product_code: product.product_code,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      discount_price: product.discount_price ? Number(product.discount_price) : null,
      stock_quantity: product.stock_quantity,
      is_featured: product.is_featured,
      created_at: product.created_at,
      meta_title: product.meta_title,
      meta_description: product.meta_description,
      category_name: product.categories?.name,
      category_slug: product.categories?.slug,
      variants: { sizes, colors },
      images: product.product_images,
      relatedProducts: formattedRelated
    };

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: formattedProduct,
      error: null
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
