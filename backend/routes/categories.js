const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get all categories
router.get('/', async (req, res, next) => {
  try {
    const [categories] = await pool.execute(
      `SELECT id, name, slug, description, image_url, sort_order 
       FROM categories 
       WHERE is_active = true 
       ORDER BY sort_order ASC, name ASC`
    );

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

    const [categories] = await pool.execute(
      `SELECT id, name, slug, description, image_url 
       FROM categories 
       WHERE slug = ? AND is_active = true`,
      [slug]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        error: 'CATEGORY_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: 'Category retrieved successfully',
      data: categories[0],
      error: null
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
