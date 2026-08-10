const express = require('express');
const { prisma } = require('../config/prisma');

const router = express.Router();

// Get all categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.categories.findMany({
      where: { is_active: true },
      orderBy: [
        { sort_order: 'asc' },
        { name: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image_url: true,
        sort_order: true
      }
    });

    res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories,
      error: null
    });

  } catch (error) {
    next(error);
  }
});

// Get category by slug
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const category = await prisma.categories.findFirst({
      where: { slug, is_active: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image_url: true
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        error: 'CATEGORY_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: 'Category retrieved successfully',
      data: category,
      error: null
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
