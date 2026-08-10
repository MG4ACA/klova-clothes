<template>
  <div class="min-h-screen bg-background">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <svg class="animate-spin h-12 w-12 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-secondary">Loading product...</p>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else-if="!product" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <p class="text-6xl mb-4">🛍️</p>
        <h2 class="text-2xl font-bold text-primary mb-2">Product Not Found</h2>
        <p class="text-secondary mb-6">The product you're looking for doesn't exist.</p>
        <router-link to="/products" class="bg-primary text-background px-6 py-3 rounded-lg font-semibold hover:bg-secondary transition-colors">
          Browse Products
        </router-link>
      </div>
    </div>

    <!-- Product Detail -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-secondary mb-6">
        <router-link to="/" class="hover:text-primary transition-colors">Home</router-link>
        <span>/</span>
        <router-link to="/products" class="hover:text-primary transition-colors">Products</router-link>
        <span>/</span>
        <router-link v-if="product.category_slug" :to="`/products/${product.category_slug}`" class="hover:text-primary transition-colors">
          {{ product.category_name }}
        </router-link>
        <span v-if="product.category_slug">/</span>
        <span class="text-primary font-medium truncate">{{ product.name }}</span>
      </nav>

      <!-- Main Product Area -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Image Gallery -->
        <div>
          <!-- Main Image -->
          <div class="bg-white rounded-2xl overflow-hidden shadow-md mb-3 aspect-square flex items-center justify-center">
            <img
              :src="imageUrl(selectedImage) || placeholderImg('600x600')"
              :alt="product.name"
              class="w-full h-full object-cover"
              @error.once="$event.target.src = placeholderImg('600x600')"
            />
          </div>
          <!-- Thumbnail Row -->
          <div v-if="product.images && product.images.length > 1" class="flex gap-2 overflow-x-auto pb-1">
            <button
              v-for="img in product.images"
              :key="img.id"
              @click="selectedImage = img.image_url"
              class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all"
              :class="selectedImage === img.image_url ? 'border-primary' : 'border-transparent hover:border-light'"
            >
              <img :src="imageUrl(img.image_url)" :alt="product.name" class="w-full h-full object-cover" @error.once="$event.target.src = placeholderImg('80x80')" />
            </button>
          </div>
        </div>

        <!-- Product Info -->
        <div class="flex flex-col">
          <!-- Category Badge -->
          <span v-if="product.category_name" class="inline-block bg-light text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3 self-start">
            {{ product.category_name }}
          </span>

          <h1 class="text-3xl font-bold text-primary mb-3 leading-tight">{{ product.name }}</h1>

          <!-- Price -->
          <div class="flex items-center gap-4 mb-4">
            <span v-if="product.discount_price" class="text-3xl font-bold text-secondary">
              Rs. {{ product.discount_price.toLocaleString() }}
            </span>
            <span class="text-3xl font-bold" :class="product.discount_price ? 'text-gray-400 line-through text-xl' : 'text-secondary'">
              Rs. {{ product.price.toLocaleString() }}
            </span>
            <span v-if="product.discount_price" class="bg-red-100 text-red-600 text-sm font-bold px-2 py-1 rounded">
              {{ Math.round((1 - product.discount_price / product.price) * 100) }}% OFF
            </span>
          </div>

          <!-- Stock -->
          <div class="mb-5">
            <span v-if="product.stock_quantity > 5" class="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
              <span class="w-2 h-2 bg-green-500 rounded-full"></span> In Stock ({{ product.stock_quantity }} available)
            </span>
            <span v-else-if="product.stock_quantity > 0" class="inline-flex items-center gap-1 text-orange-600 text-sm font-medium">
              <span class="w-2 h-2 bg-orange-500 rounded-full"></span> Only {{ product.stock_quantity }} left!
            </span>
            <span v-else class="inline-flex items-center gap-1 text-red-600 text-sm font-medium">
              <span class="w-2 h-2 bg-red-500 rounded-full"></span> Out of Stock
            </span>
          </div>

          <!-- Size Selector -->
          <div v-if="product.variants?.sizes?.length" class="mb-5">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-semibold text-primary uppercase tracking-wide">Size</h3>
              <span v-if="!selectedSize && sizeError" class="text-red-500 text-xs">Please select a size</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="size in product.variants.sizes"
                :key="size.id"
                @click="selectedSize = size"
                class="px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all"
                :class="selectedSize?.id === size.id
                  ? 'border-primary bg-primary text-background'
                  : 'border-light text-secondary hover:border-accent hover:text-primary'"
              >
                {{ size.variant_value }}
              </button>
            </div>
          </div>

          <!-- Color Selector -->
          <div v-if="product.variants?.colors?.length" class="mb-5">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-semibold text-primary uppercase tracking-wide">
                Color <span v-if="selectedColor" class="font-normal text-secondary normal-case">— {{ selectedColor.variant_value }}</span>
              </h3>
              <span v-if="!selectedColor && colorError" class="text-red-500 text-xs">Please select a color</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="color in product.variants.colors"
                :key="color.id"
                @click="selectedColor = color"
                class="px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all"
                :class="selectedColor?.id === color.id
                  ? 'border-primary bg-primary text-background'
                  : 'border-light text-secondary hover:border-accent hover:text-primary'"
              >
                {{ color.variant_value }}
              </button>
            </div>
          </div>

          <!-- Quantity -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-primary uppercase tracking-wide mb-2">Quantity</h3>
            <div class="flex items-center gap-3">
              <button @click="decreaseQty" class="w-10 h-10 rounded-lg border-2 border-light text-primary font-bold hover:border-accent transition-all flex items-center justify-center text-xl">−</button>
              <span class="w-10 text-center font-bold text-primary text-lg">{{ quantity }}</span>
              <button @click="increaseQty" class="w-10 h-10 rounded-lg border-2 border-light text-primary font-bold hover:border-accent transition-all flex items-center justify-center text-xl">+</button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 mb-6">
            <!-- Add to Cart -->
            <button
              @click="handleAddToCart"
              :disabled="cartLoading || product.stock_quantity === 0"
              class="flex-1 bg-primary text-background py-3 px-6 rounded-xl font-semibold hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg v-if="cartLoading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {{ cartLoading ? 'Adding...' : 'Add to Cart' }}
            </button>

            <!-- Order via WhatsApp -->
            <button
              @click="orderViaWhatsApp"
              :disabled="product.stock_quantity === 0"
              class="flex-1 bg-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.116 1.523 5.847L0 24l6.324-1.5A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.899 0-3.677-.499-5.214-1.375l-.374-.224-3.755.891.942-3.677-.244-.387A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              Order via WhatsApp
            </button>
          </div>

          <!-- Cart success msg -->
          <div v-if="cartSuccess" class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
            <span>✅ Added to cart!</span>
            <router-link to="/cart" class="font-semibold underline hover:no-underline">View Cart →</router-link>
          </div>
          <div v-if="cartError" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{{ cartError }}</div>

          <!-- Description -->
          <div v-if="product.description" class="border-t border-light pt-5">
            <h3 class="text-sm font-semibold text-primary uppercase tracking-wide mb-2">Description</h3>
            <p class="text-secondary text-sm leading-relaxed">{{ product.description }}</p>
          </div>

          <!-- Product Code -->
          <div class="mt-4 text-xs text-gray-400">
            Product Code: {{ product.product_code }}
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div v-if="product.relatedProducts?.length" class="mt-16">
        <h2 class="text-2xl font-bold text-primary mb-6">You Might Also Like</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <router-link
            v-for="related in product.relatedProducts"
            :key="related.id"
            :to="`/product/${related.slug}`"
            class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
          >
            <div class="aspect-square bg-light overflow-hidden">
              <img
                :src="imageUrl(related.primary_image) || placeholderImg('300x300')"
                :alt="related.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                @error.once="$event.target.src = placeholderImg('300x300')"
              />
            </div>
            <div class="p-3">
              <p class="text-primary font-medium text-sm line-clamp-2">{{ related.name }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span v-if="related.discount_price" class="text-secondary font-bold text-sm">Rs. {{ related.discount_price.toLocaleString() }}</span>
                <span class="text-sm" :class="related.discount_price ? 'text-gray-400 line-through text-xs' : 'text-secondary font-bold'">
                  Rs. {{ related.price.toLocaleString() }}
                </span>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../utils/api'
import { imageUrl, placeholderImg } from '../utils/images'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const product = ref(null)
const loading = ref(true)
const selectedImage = ref(null)
const selectedSize = ref(null)
const selectedColor = ref(null)
const quantity = ref(1)
const cartLoading = ref(false)
const cartSuccess = ref(false)
const cartError = ref('')
const sizeError = ref(false)
const colorError = ref(false)

const fetchProduct = async (slug) => {
  loading.value = true
  product.value = null
  selectedImage.value = null
  selectedSize.value = null
  selectedColor.value = null
  quantity.value = 1
  cartSuccess.value = false
  cartError.value = ''

  try {
    const res = await api.get(`/products/${slug}`)
    product.value = res.data.data
    if (product.value.images?.length > 0) {
      selectedImage.value = product.value.images[0].image_url
    }
  } catch (err) {
    product.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchProduct(route.params.slug))
watch(() => route.params.slug, (newSlug) => {
  if (newSlug) fetchProduct(newSlug)
})

const decreaseQty = () => { if (quantity.value > 1) quantity.value-- }
const increaseQty = () => {
  if (quantity.value < product.value.stock_quantity) quantity.value++
}

const handleAddToCart = async () => {
  sizeError.value = false
  colorError.value = false

  if (product.value.variants?.sizes?.length && !selectedSize.value) {
    sizeError.value = true
    return
  }
  if (product.value.variants?.colors?.length && !selectedColor.value) {
    colorError.value = true
    return
  }

  if (!authStore.isAuthenticated) {
    router.push(`/login?redirect=/product/${route.params.slug}`)
    return
  }

  cartLoading.value = true
  cartError.value = ''
  cartSuccess.value = false

  const payload = {
    product_id: product.value.id,
    quantity: quantity.value,
    size: selectedSize.value?.variant_value || null,
    color: selectedColor.value?.variant_value || null
  }

  const result = await cartStore.addToCart(payload)
  cartLoading.value = false

  if (result.success) {
    cartSuccess.value = true
    setTimeout(() => { cartSuccess.value = false }, 4000)
  } else {
    cartError.value = result.message || 'Failed to add to cart'
  }
}

const orderViaWhatsApp = () => {
  sizeError.value = false
  colorError.value = false

  if (product.value.variants?.sizes?.length && !selectedSize.value) {
    sizeError.value = true
    return
  }
  if (product.value.variants?.colors?.length && !selectedColor.value) {
    colorError.value = true
    return
  }

  const price = product.value.discount_price || product.value.price
  const sizeText = selectedSize.value ? `\nSize: ${selectedSize.value.variant_value}` : ''
  const colorText = selectedColor.value ? `\nColor: ${selectedColor.value.variant_value}` : ''
  const productUrl = window.location.href

  const message = `Hello! I'd like to order:\n\n*${product.value.name}*${sizeText}${colorText}\nQty: ${quantity.value}\nPrice: Rs. ${(price * quantity.value).toLocaleString()}\n\n${productUrl}`

  const phone = import.meta.env.VITE_WHATSAPP_NUMBER
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  window.open(waUrl, '_blank')
}
</script>
