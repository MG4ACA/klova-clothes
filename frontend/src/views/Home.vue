<template>
  <div class="bg-white min-h-screen">

    <!-- ━━━ HERO ━━━ -->
    <section class="relative w-full" style="height: 100svh; min-height: 520px;">
      <!-- Background image -->
      <div class="absolute inset-0">
        <img
          src="/hero.jpg"
          alt="Offwire hero"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-black/50"></div>
      </div>

      <!-- Hero text — bottom-left like Carnage -->
      <div class="absolute bottom-0 left-0 px-6 lg:px-12 pb-12 max-w-3xl">
        <p class="text-white/70 text-sm mb-3 tracking-wide">Explore our Collection</p>
        <h1 class="text-white font-black uppercase leading-none mb-8" style="font-size: clamp(2.5rem, 7vw, 5.5rem); font-style: italic;">
          DISCONNECTED<br/>BY CONNECTION
        </h1>
        <div class="flex flex-wrap gap-3">
          <router-link
            to="/products/graphic-tees"
            class="inline-block bg-white text-black font-bold text-xs tracking-widest uppercase px-6 py-3 hover:bg-gray-100 transition-colors"
          >SHOP GRAPHIC TEES</router-link>
          <router-link
            to="/products/anime-tees"
            class="inline-block bg-black text-white font-bold text-xs tracking-widest uppercase px-6 py-3 border border-white hover:bg-white hover:text-black transition-colors"
          >SHOP ANIME TEES</router-link>
        </div>
      </div>
    </section>

    <!-- ━━━ LATEST STYLES — horizontal scroll ━━━ -->
    <section class="py-12 px-6 lg:px-12 max-w-[1440px] mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-black tracking-tight uppercase">SHOP THE LATEST STYLES</h2>
        <div class="flex items-center gap-3">
          <router-link to="/products" class="text-xs font-bold tracking-widest uppercase text-gray-500 hover:text-black transition-colors mr-2">SHOP ALL</router-link>
          <button
            @click="scrollLeft"
            class="w-8 h-8 border border-gray-300 flex items-center justify-center hover:border-black transition-colors"
            :class="{'opacity-30 cursor-default': scrollPos === 0}"
          >
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button
            @click="scrollRight"
            class="w-8 h-8 border border-gray-300 flex items-center justify-center hover:border-black transition-colors"
          >
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>

      <!-- Scrollable product row -->
      <div ref="scrollContainer" class="flex gap-4 overflow-x-auto pb-2 scroll-smooth" style="scrollbar-width: none;">
        <!-- Loading skeletons -->
        <template v-if="loadingProducts">
          <div v-for="n in 5" :key="n" class="flex-shrink-0 w-56 animate-pulse">
            <div class="bg-gray-100 aspect-[3/4] mb-3"></div>
            <div class="h-3 bg-gray-100 mb-2 w-3/4"></div>
            <div class="h-3 bg-gray-100 w-1/2"></div>
          </div>
        </template>

        <!-- Product cards -->
        <div
          v-for="product in latestProducts"
          :key="product.id"
          class="flex-shrink-0 w-56 cursor-pointer group"
          @click="$router.push(`/product/${product.slug}`)"
        >
          <div class="relative aspect-[3/4] bg-gray-50 overflow-hidden mb-3">
            <img
              :src="imageUrl(product.primary_image) || placeholderImg('400x530')"
              :alt="product.name"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              @error.once="$event.target.src = placeholderImg('400x530')"
            />
            <!-- NEW badge -->
            <div v-if="isNew(product)" class="absolute top-2 left-2 bg-black text-white text-[10px] font-black px-2 py-0.5 tracking-widest">NEW</div>
            <!-- Sale badge -->
            <div v-else-if="product.discount_price" class="absolute top-2 left-2 bg-black text-white text-[10px] font-black px-2 py-0.5 tracking-widest">SALE</div>
          </div>
          <p class="text-[10px] text-gray-400 tracking-widest uppercase mb-0.5">{{ product.category_name }}</p>
          <h3 class="text-sm font-semibold text-black mb-1 line-clamp-1">{{ product.name }}</h3>
          <div class="flex items-center gap-2">
            <span v-if="product.discount_price" class="text-sm font-black text-black">Rs. {{ Number(product.discount_price).toLocaleString() }}</span>
            <span class="text-sm" :class="product.discount_price ? 'line-through text-gray-400' : 'font-black text-black'">Rs. {{ Number(product.price).toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ━━━ CATEGORY MEGA TILES ━━━ -->
    <section class="py-12 px-6 lg:px-12 max-w-[1440px] mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <router-link
          v-for="tile in categoryTiles"
          :key="tile.label"
          :to="tile.link"
          class="relative overflow-hidden aspect-video group block"
        >
          <img
            :src="tile.img"
            :alt="tile.label"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            @error.once="$event.target.style.display='none'"
          />
          <div class="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
          <span class="absolute bottom-5 left-5 text-white text-sm font-black tracking-[0.15em] uppercase">{{ tile.label }}</span>
        </router-link>
      </div>
    </section>

    <!-- ━━━ SECOND HERO BANNER ━━━ -->
    <section class="relative w-full aspect-video max-h-96">
      <img
        src="/hero.jpg"
        alt="Collection"
        class="w-full h-full object-cover object-top"
      />
      <div class="absolute inset-0 bg-black/50"></div>
      <div class="absolute bottom-0 left-0 px-6 lg:px-12 pb-10 max-w-2xl">
        <p class="text-white/60 text-xs tracking-widest uppercase mb-2">Explore our Collection</p>
        <div class="flex flex-wrap gap-3">
          <router-link to="/products/graphic-tees" class="inline-block bg-white text-black font-bold text-xs tracking-widest uppercase px-6 py-3 hover:bg-gray-100 transition-colors">SHOP GRAPHIC TEES</router-link>
          <router-link to="/products/vintage-wash" class="inline-block bg-black text-white font-bold text-xs tracking-widest uppercase px-6 py-3 border border-white hover:bg-white hover:text-black transition-colors">SHOP VINTAGE WASH</router-link>
        </div>
      </div>
    </section>

    <!-- ━━━ FEATURED PRODUCTS ━━━ -->
    <section class="py-12 px-6 lg:px-12 max-w-[1440px] mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-black tracking-tight uppercase">FEATURED DROPS</h2>
        <router-link to="/products" class="text-xs font-bold tracking-widest uppercase text-gray-500 hover:text-black transition-colors">SHOP ALL</router-link>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          v-for="product in featuredProducts"
          :key="product.id"
          class="group cursor-pointer"
          @click="$router.push(`/product/${product.slug}`)"
        >
          <div class="relative aspect-[3/4] bg-gray-50 overflow-hidden mb-3">
            <img
              :src="imageUrl(product.primary_image) || placeholderImg('400x530')"
              :alt="product.name"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              @error.once="$event.target.src = placeholderImg('400x530')"
            />
            <div v-if="isNew(product)" class="absolute top-2 left-2 bg-black text-white text-[10px] font-black px-2 py-0.5 tracking-widest">NEW</div>
            <div v-else-if="product.discount_price" class="absolute top-2 left-2 bg-black text-white text-[10px] font-black px-2 py-0.5 tracking-widest">SALE</div>
            <!-- Quick-add on hover -->
            <div class="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                @click.stop="addToCart(product)"
                class="w-full bg-black text-white text-[10px] font-black py-3 tracking-widest uppercase hover:bg-gray-800 transition-colors"
                :disabled="product.stock_quantity === 0"
              >
                {{ product.stock_quantity === 0 ? 'OUT OF STOCK' : 'QUICK ADD' }}
              </button>
            </div>
          </div>
          <p class="text-[10px] text-gray-400 tracking-widest uppercase mb-0.5">{{ product.category_name }}</p>
          <h3 class="text-sm font-semibold text-black mb-1 line-clamp-1">{{ product.name }}</h3>
          <div class="flex items-center gap-2">
            <span v-if="product.discount_price" class="text-sm font-black text-black">Rs. {{ Number(product.discount_price).toLocaleString() }}</span>
            <span class="text-sm" :class="product.discount_price ? 'line-through text-gray-400' : 'font-black text-black'">Rs. {{ Number(product.price).toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '../stores/cart'
import { imageUrl, placeholderImg } from '../utils/images'
import api from '../utils/api'

const cartStore = useCartStore()
const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const latestProducts = ref([])
const featuredProducts = ref([])
const loadingProducts = ref(true)
const scrollContainer = ref(null)
const scrollPos = ref(0)

const categoryTiles = [
  { label: 'Graphic Tees',  link: '/products/graphic-tees',  img: `${apiBase}/uploads/products/cat_tshirts.png` },
  { label: 'Anime Tees',    link: '/products/anime-tees',    img: `${apiBase}/uploads/products/tshirt_anime.png` },
  { label: 'Vintage Wash',  link: '/products/vintage-wash',  img: `${apiBase}/uploads/products/tshirt_vintage_fruit.png` },
]

const isNew = (product) => {
  const created = new Date(product.created_at)
  const now = new Date()
  return (now - created) < 1000 * 60 * 60 * 24 * 30 // within 30 days
}

const scrollLeft = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: -480, behavior: 'smooth' })
    scrollPos.value = Math.max(0, scrollPos.value - 480)
  }
}
const scrollRight = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: 480, behavior: 'smooth' })
    scrollPos.value += 480
  }
}

const fetchProducts = async () => {
  loadingProducts.value = true
  try {
    const [latestRes, featuredRes] = await Promise.all([
      api.get('/products?limit=10&sortBy=created_at&sortOrder=DESC'),
      api.get('/products/featured?limit=4'),
    ])
    latestProducts.value = latestRes.data.data.products || []
    featuredProducts.value = featuredRes.data.data || []
  } catch (err) {
    console.error(err)
  } finally {
    loadingProducts.value = false
  }
}

const addToCart = async (product) => {
  await cartStore.addToCart({ productId: product.id, quantity: 1 })
}

onMounted(fetchProducts)
</script>

<style scoped>
/* Hide scrollbar on product row */
div[ref="scrollContainer"]::-webkit-scrollbar { display: none; }
</style>
