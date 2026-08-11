const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Log existing categories
  const existing = await prisma.categories.findMany();
  console.log('Existing categories:', JSON.stringify(existing, null, 2));

  // Delete old categories (this will also unlink products)
  // First, set all products category_id to null
  await prisma.products.updateMany({ data: { category_id: null } });
  console.log('Unlinked all products from categories');

  // Delete all old categories
  await prisma.categories.deleteMany();
  console.log('Deleted all old categories');

  // Create new t-shirt focused categories
  const newCategories = [
    {
      name: 'Graphic Tees',
      slug: 'graphic-tees',
      description: 'Bold prints, anime art, and statement graphics on premium cotton.',
      sort_order: 1,
      is_active: true
    },
    {
      name: 'Anime Tees',
      slug: 'anime-tees',
      description: 'Your favourite anime characters and art on oversized acid-wash tees.',
      sort_order: 2,
      is_active: true
    },
    {
      name: 'Vintage Wash',
      slug: 'vintage-wash',
      description: 'Distressed acid-wash and mineral-dyed tees for a worn-in look.',
      sort_order: 3,
      is_active: true
    },
    {
      name: 'Oversized Heavy Cotton',
      slug: 'oversized-heavy-cotton',
      description: '240–280gsm heavyweight tees with a boxy, relaxed oversized fit.',
      sort_order: 4,
      is_active: true
    },
    {
      name: 'Tie-Dye & Dip-Dye',
      slug: 'tie-dye',
      description: 'Hand-dyed unique patterns — no two pieces are exactly the same.',
      sort_order: 5,
      is_active: true
    },
    {
      name: 'Plain Essentials',
      slug: 'plain-essentials',
      description: 'Clean, no-fuss heavyweight essentials in every shade.',
      sort_order: 6,
      is_active: true
    }
  ];

  const created = [];
  for (const cat of newCategories) {
    const c = await prisma.categories.create({ data: cat });
    created.push(c);
    console.log(`Created category: ${c.name} (id: ${c.id})`);
  }

  // Re-assign existing products (by name heuristic)
  const graphicId = created.find(c => c.slug === 'graphic-tees').id;
  const animeId = created.find(c => c.slug === 'anime-tees').id;

  const products = await prisma.products.findMany();
  for (const p of products) {
    let catId = graphicId; // default
    const nameLower = p.name.toLowerCase();
    if (nameLower.includes('anime') || nameLower.includes('jujutsu') || nameLower.includes('kaisen')) {
      catId = animeId;
    }
    await prisma.products.update({
      where: { id: p.id },
      data: { category_id: catId }
    });
    console.log(`Assigned "${p.name}" → category id ${catId}`);
  }

  console.log('\n✅ All done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
