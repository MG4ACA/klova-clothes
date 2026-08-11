const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const rootDir = path.join(__dirname, '..');
const uploadDir = path.join(__dirname, 'uploads', 'products');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Map the WhatsApp files in root to new products
const newProducts = [
  {
    fileName: 'WhatsApp Image 2026-08-11 at 16.19.24.jpeg',
    destName: 'offwire_tee_1.jpeg',
    name: 'OFFWIRE Vintage Graphic Tee',
    code: 'OFF-TEE-001',
    categorySlug: 'graphic-tees',
    price: 4500,
    discountPrice: 3900,
    desc: 'Premium oversized black graphic t-shirt crafted from 240gsm heavy cotton with signature OFFWIRE vintage print.'
  },
  {
    fileName: 'WhatsApp Image 2026-08-11 at 16.19.25.jpeg',
    destName: 'offwire_tee_2.jpeg',
    name: 'OFFWIRE Disconnected Oversized Tee',
    code: 'OFF-TEE-002',
    categorySlug: 'graphic-tees',
    price: 4800,
    discountPrice: null,
    desc: 'Signature Disconnected By Connection graphic print on heavy stone-washed cotton. Boxy streetwear fit.'
  },
  {
    fileName: 'WhatsApp Image 2026-08-11 at 16.19.26.jpeg',
    destName: 'offwire_tee_3.jpeg',
    name: 'OFFWIRE Cyber Anime Tee',
    code: 'OFF-TEE-003',
    categorySlug: 'anime-tees',
    price: 4950,
    discountPrice: 4200,
    desc: 'Limited edition anime graphic t-shirt with detailed line art and custom Japanese typography.'
  },
  {
    fileName: 'WhatsApp Image 2026-08-11 at 16.19.27.jpeg',
    destName: 'offwire_tee_4.jpeg',
    name: 'OFFWIRE Acid Wash Streetwear Tee',
    code: 'OFF-TEE-004',
    categorySlug: 'vintage-wash',
    price: 4600,
    discountPrice: null,
    desc: 'Mineral-dyed and acid-washed for a distressed vintage look. Drop shoulder oversized cut.'
  },
  {
    fileName: 'WhatsApp Image 2026-08-11 at 16.19.28.jpeg',
    destName: 'offwire_tee_5.jpeg',
    name: 'OFFWIRE Heavy Cotton Boxy Tee',
    code: 'OFF-TEE-005',
    categorySlug: 'oversized-heavy-cotton',
    price: 4200,
    discountPrice: null,
    desc: '280gsm ultra-heavyweight cotton. High neck ribbed collar and relaxed silhouette.'
  },
  {
    fileName: 'WhatsApp Image 2026-08-11 at 16.19.28 (1).jpeg',
    destName: 'offwire_tee_6.jpeg',
    name: 'OFFWIRE Statement Graphic Tee',
    code: 'OFF-TEE-006',
    categorySlug: 'graphic-tees',
    price: 4750,
    discountPrice: 4100,
    desc: 'Bold rear graphic print with minimal chest logo. Crafted for daily streetwear style.'
  }
];

async function main() {
  const categories = await prisma.categories.findMany();
  const categoryMap = {};
  categories.forEach(c => { categoryMap[c.slug] = c.id; });

  for (const item of newProducts) {
    const srcPath = path.join(rootDir, item.fileName);
    const destPath = path.join(uploadDir, item.destName);

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${item.fileName} -> ${item.destName}`);
    } else {
      console.error(`File not found: ${srcPath}`);
      continue;
    }

    const imageUrl = `/uploads/products/${item.destName}`;
    const categoryId = categoryMap[item.categorySlug] || categories[0].id;
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const product = await prisma.products.create({
      data: {
        product_code: item.code,
        name: item.name,
        slug: slug,
        description: item.desc,
        category_id: categoryId,
        price: item.price,
        discount_price: item.discountPrice,
        stock_quantity: 40,
        min_stock_level: 5,
        is_featured: true,
        is_active: true
      }
    });

    await prisma.product_images.create({
      data: {
        product_id: product.id,
        image_url: imageUrl,
        is_primary: true,
        sort_order: 0
      }
    });

    console.log(`Created product: ${product.name} (id: ${product.id})`);
  }

  console.log('✅ Successfully seeded all 6 new user t-shirts!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
