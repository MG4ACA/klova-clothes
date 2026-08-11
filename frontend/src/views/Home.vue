<template>
  <div class="min-h-screen bg-white">

    <!-- ━━━━━━━━━━ HERO ━━━━━━━━━━ -->
    <section class="relative min-h-screen flex items-center overflow-hidden bg-primary">

      <!-- Background image -->
      <div class="absolute inset-0">
        <img
          :src="heroImg"
          alt="Klova hero"
          class="w-full h-full object-cover opacity-40"
        />
        <!-- Dark gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent"></div>
      </div>

      <!-- Hero content -->
      <div class="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-28">
        <div class="max-w-2xl">
          <!-- Tag line -->
          <div class="flex items-center gap-3 mb-8">
            <span class="block w-12 h-px bg-white"></span>
            <span class="text-white/60 text-xs tracking-[0.3em] uppercase font-medium">New Collection</span>
          </div>

          <!-- Main headline -->
          <h1 class="text-white font-black leading-none tracking-tight mb-6" style="font-size: clamp(3rem, 8vw, 6rem);">
            DISCONNECTED<br/>
            <span class="text-transparent" style="-webkit-text-stroke: 2px white;">BY</span><br/>
            CONNECTION
          </h1>

          <p class="text-white/60 text-lg mb-10 max-w-md leading-relaxed">
            Graphic tees that speak louder than words. Premium oversized fits for the bold.
          </p>

          <!-- CTA buttons -->
          <div class="flex flex-wrap gap-4">
            <router-link
              to="/products"
              class="group inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-4 text-sm tracking-widest uppercase hover:bg-gray-100 transition-all duration-300"
            >
              Shop Now
              <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
            </router-link>
            <a
              href="#featured"
              class="inline-flex items-center gap-2 border border-white/40 text-white font-bold px-8 py-4 text-sm tracking-widest uppercase hover:bg-white/10 transition-all duration-300"
            >
              Featured Items
            </a>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
        <span class="text-xs tracking-widest uppercase">Scroll</span>
        <div class="w-px h-12 bg-white/20 animate-pulse"></div>
      </div>
    </section>

    <!-- ━━━━━━━━━━ MARQUEE ━━━━━━━━━━ -->
    <div class="bg-primary border-y border-white/10 py-4 overflow-hidden">
      <div class="flex gap-16 animate-marquee whitespace-nowrap">
        <span v-for="n in 8" :key="n" class="flex items-center gap-8 text-white/40 text-xs tracking-[0.4em] uppercase">
          Premium Quality <span class="text-white">✦</span>
          Oversized Fits <span class="text-white">✦</span>
          Graphic Tees <span class="text-white">✦</span>
          Free Delivery <span class="text-white">✦</span>
        </span>
      </div>
    </div>

    <!-- ━━━━━━━━━━ CATEGORIES ━━━━━━━━━━ -->
    <section class="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
      <div class="flex items-end justify-between mb-12">
        <div>
          <p class="text-xs tracking-[0.3em] uppercase text-light mb-3">Collections</p>
          <h2 class="text-4xl font-black tracking-tight text-primary">Shop by Category</h2>
        </div>
        <router-link to="/products" class="text-sm font-semibold tracking-widest uppercase text-primary underline underline-offset-4 hover:text-light transition-colors hidden md:block">
          View All
        </router-link>
      </div>

      <div v-if="loadingCats" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="n in 3" :key="n" class="h-96 bg-gray-100 animate-pulse rounded-none"></div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <router-link
          v-for="(cat, i) in categories"
          :key="cat.id"
          :to="`/products/${cat.slug}`"
          class="group relative overflow-hidden block"
          :class="i === 0 ? 'md:col-span-2 md:row-span-1' : ''"
          :style="i === 0 ? 'aspect-ratio: 16/9' : 'aspect-ratio: 4/5'"
        >
          <!-- Image -->
          <img
            :src="catImages[i % catImages.length]"
            :alt="cat.name"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <!-- Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent group-hover:via-primary/50 transition-all duration-500"></div>
          <!-- Text -->
          <div class="absolute bottom-0 left-0 p-8">
            <span class="text-white/50 text-xs tracking-[0.3em] uppercase block mb-2">Collection</span>
            <h3 class="text-white text-3xl font-black tracking-tight leading-none mb-3">{{ cat.name }}</h3>
            <p class="text-white/60 text-sm">{{ cat.description }}</p>
            <div class="mt-4 flex items-center gap-2 text-white text-xs tracking-widest uppercase font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Shop now
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
            </div>
          </div>
        </router-link>
      </div>
    </section>

    <!-- ━━━━━━━━━━ FEATURED PRODUCTS ━━━━━━━━━━ -->
    <section id="featured" class="py-24 bg-muted">
      <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="flex items-end justify-between mb-12">
          <div>
            <p class="text-xs tracking-[0.3em] uppercase text-light mb-3">Handpicked</p>
            <h2 class="text-4xl font-black tracking-tight text-primary">Featured Items</h2>
          </div>
          <router-link to="/products" class="text-sm font-semibold tracking-widest uppercase text-primary underline underline-offset-4 hover:text-light transition-colors hidden md:block">
            View All
          </router-link>
        </div>

        <div v-if="loadingProducts" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="n in 4" :key="n" class="animate-pulse">
            <div class="bg-gray-200 aspect-[3/4] mb-3"></div>
            <div class="h-4 bg-gray-200 mb-2 w-3/4"></div>
            <div class="h-4 bg-gray-200 w-1/2"></div>
          </div>
        </div>

        <div v-else-if="featuredProducts.length === 0" class="text-center py-16">
          <p class="text-light text-lg">No featured products yet.</p>
        </div>

        <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="product in featuredProducts"
            :key="product.id"
            class="group cursor-pointer"
            @click="$router.push(`/product/${product.slug}`)"
          >
            <!-- Image container -->
            <div class="relative aspect-[3/4] overflow-hidden bg-white mb-4">
              <img
                :src="imageUrl(product.primary_image) || placeholderImg('400x530')"
                :alt="product.name"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                @error.once="$event.target.src = placeholderImg('400x530')"
              />
              <!-- Sale badge -->
              <div v-if="product.discount_price" class="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 tracking-widest uppercase">
                Sale
              </div>
              <!-- Quick add overlay -->
              <div class="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <button
                  @click.stop="addToCart(product)"
                  :disabled="cartLoading || product.stock_quantity === 0"
                  class="w-full bg-primary text-white text-xs font-bold py-4 tracking-widest uppercase hover:bg-secondary transition-colors disabled:opacity-50"
                >
                  {{ product.stock_quantity === 0 ? 'Out of Stock' : 'Quick Add' }}
                </button>
              </div>
            </div>

            <!-- Info -->
            <div>
              <p class="text-xs text-light tracking-widest uppercase mb-1">{{ product.category_name }}</p>
              <h3 class="text-primary font-bold text-sm leading-snug mb-2 line-clamp-2">{{ product.name }}</h3>
              <div class="flex items-center gap-3">
                <span v-if="product.discount_price" class="font-black text-primary">
                  Rs. {{ Number(product.discount_price).toLocaleString() }}
                </span>
                <span :class="product.discount_price ? 'line-through text-light text-sm' : 'font-black text-primary'">
                  Rs. {{ Number(product.price).toLocaleString() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ━━━━━━━━━━ WHY KLOVA ━━━━━━━━━━ -->
    <section class="py-24 px-6 lg:px-12 max-w-7xl mx-auto border-t border-border">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div v-for="feat in brandFeatures" :key="feat.title" class="flex flex-col gap-4">
          <div class="text-3xl">{{ feat.icon }}</div>
          <h3 class="text-primary font-black text-lg tracking-tight">{{ feat.title }}</h3>
          <p class="text-light text-sm leading-relaxed">{{ feat.desc }}</p>
        </div>
      </div>
    </section>

    <!-- ━━━━━━━━━━ CTA BANNER ━━━━━━━━━━ -->
    <section class="bg-primary py-24 px-6 text-center">
      <p class="text-white/40 text-xs tracking-[0.4em] uppercase mb-6">Limited Stock — Shop Now</p>
      <h2 class="text-white font-black text-5xl md:text-7xl tracking-tight leading-none mb-10">
        YOUR FIT.<br/>YOUR STATEMENT.
      </h2>
      <router-link
        to="/products"
        class="inline-flex items-center gap-3 bg-white text-primary font-bold px-10 py-5 text-sm tracking-widest uppercase hover:bg-gray-100 transition-all duration-300 group"
      >
        Explore the Collection
        <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
      </router-link>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCartStore } from '../stores/cart'
import { imageUrl, placeholderImg } from '../utils/images'
import api from '../utils/api'

const cartStore = useCartStore()

const featuredProducts = ref([])
const categories = ref([])
const loadingProducts = ref(true)
const loadingCats = ref(true)
const cartLoading = ref(false)

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const heroImg = `${apiBase}/uploads/products/klova_hero.png`

const catImages = [
  `${apiBase}/uploads/products/cat_tshirts.png`,
  `${apiBase}/uploads/products/cat_hoodies.png`,
  `${apiBase}/uploads/products/tshirt_anime.png`,
]

const brandFeatures = [
  {
    icon: '🪡',
    title: 'Premium Cotton',
    desc: 'Every tee is crafted from 100% heavyweight cotton for a premium feel that lasts.'
  },
  {
    icon: '📦',
    title: 'Fast Delivery',
    desc: 'Orders dispatched within 24 hours. WhatsApp us to track your order anytime.'
  },
  {
    icon: '🔄',
    title: 'Easy Returns',
    desc: 'Not happy? We offer hassle-free exchanges within 7 days of delivery.'
  }
]

const fetchFeatured = async () => {
  loadingProducts.value = true
  try {
    const response = await api.get('/products/featured?limit=4')
    featuredProducts.value = response.data.data
  } catch (err) {
    console.error('Failed to fetch featured products:', err)
  } finally {
    loadingProducts.value = false
  }
}

const fetchCategories = async () => {
  loadingCats.value = true
  try {
    const response = await api.get('/categories')
    categories.value = response.data.data
  } catch (err) {
    console.error('Failed to fetch categories:', err)
  } finally {
    loadingCats.value = false
  }
}

const addToCart = async (product) => {
  cartLoading.value = true
  await cartStore.addToCart({ productId: product.id, quantity: 1 })
  cartLoading.value = false
}

onMounted(() => {
  fetchFeatured()
  fetchCategories()
})
</script>

<style scoped>
@keyframes marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-marquee {
  animation: marquee 20s linear infinite;
}
</style>
