const fs = require('fs');
const https = require('https');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
      }
      const stream = fs.createWriteStream(filepath);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
};

async function main() {
  const dir = path.join(__dirname, 'uploads', 'products');
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  const products = await prisma.products.findMany();

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const filename = `seed_${p.id}.jpg`;
    const filepath = path.join(dir, filename);
    
    console.log(`Downloading image for product ${p.name}...`);
    // Download random clothing-related image
    const url = `https://picsum.photos/400/500?random=${p.id}`;
    try {
      await downloadImage(url, filepath);
      
      const imageUrl = `/uploads/products/${filename}`;
      
      // Update DB
      await prisma.product_images.create({
        data: {
          product_id: p.id,
          image_url: imageUrl,
          is_primary: true,
          sort_order: 0
        }
      });
      console.log(`Successfully added image for ${p.name}`);
    } catch (e) {
      console.error(`Failed to download/save for ${p.name}:`, e.message);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
