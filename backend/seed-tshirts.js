const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const uploadDir = path.join(__dirname, 'uploads', 'products');
if (!fs.existsSync(uploadDir)){
  fs.mkdirSync(uploadDir, { recursive: true });
}

const items = [
  {
    name: 'Jujutsu Kaisen Graphic Tee',
    desc: 'Oversized black acid-wash t-shirt featuring a cool anime-style white line-art graphic of Gojo Satoru with Japanese text.',
    srcPath: 'C:\\Users\\Tequila 2\\.gemini\\antigravity-ide\\brain\\dd73c06c-08b5-4bd3-b2b5-0bd0085dd586\\tshirt_anime_1786395685820.png',
    destName: 'tshirt_anime.png',
    price: '4500'
  },
  {
    name: 'Fresh Oranges Vintage Tee',
    desc: 'Oversized black t-shirt featuring a vibrant vintage graphic design of fresh oranges with leaves and retro typography.',
    srcPath: 'C:\\Users\\Tequila 2\\.gemini\\antigravity-ide\\brain\\dd73c06c-08b5-4bd3-b2b5-0bd0085dd586\\tshirt_vintage_fruit_1786395710998.png',
    destName: 'tshirt_vintage_fruit.png',
    price: '4000'
  },
  {
    name: 'Cyberpunk Samurai Tee',
    desc: 'Oversized black heavy cotton t-shirt featuring a vibrant neon cyberpunk graphic design with futuristic text and a robot samurai.',
    srcPath: 'C:\\Users\\Tequila 2\\.gemini\\antigravity-ide\\brain\\dd73c06c-08b5-4bd3-b2b5-0bd0085dd586\\tshirt_cyberpunk_1786395826430.png',
    destName: 'tshirt_cyberpunk.png',
    price: '5000'
  }
];

async function main() {
  // Assuming Category 1 is for Men's clothing or general T-shirts
  const categoryId = 1;

  for (const item of items) {
    // 1. Copy image
    const destPath = path.join(uploadDir, item.destName);
    fs.copyFileSync(item.srcPath, destPath);
    console.log(`Copied ${item.destName}`);

    const imageUrl = `/uploads/products/${item.destName}`;

    // 2. Create product
    const product = await prisma.products.create({
      data: {
        product_code: `KLV-GRAPHIC-${Math.floor(Math.random() * 1000)}`,
        name: item.name,
        slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: item.desc,
        category_id: categoryId,
        price: item.price,
        stock_quantity: 50,
        min_stock_level: 5,
        is_featured: true,
        is_active: true
      }
    });

    // 3. Create product image
    await prisma.product_images.create({
      data: {
        product_id: product.id,
        image_url: imageUrl,
        is_primary: true,
        sort_order: 0
      }
    });

    console.log(`Created product: ${product.name}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
