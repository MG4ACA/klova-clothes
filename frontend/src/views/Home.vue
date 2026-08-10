<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-r from-primary to-secondary py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-background mb-6">
            Welcome to Klova
          </h1>
          <p class="text-xl text-light mb-8 max-w-2xl mx-auto">
            Discover your perfect style with our curated collection of premium clothing 
            for men, women, and children. Quality fashion that fits your lifestyle.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link 
              to="/products" 
              class="bg-accent text-primary hover:bg-light px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
            >
              Shop Now
            </router-link>
            <router-link 
              to="/products/featured" 
              class="border-2 border-background text-background hover:bg-background hover:text-primary px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
            >
              Featured Items
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Categories -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-primary mb-4">Shop by Category</h2>
          <p class="text-secondary max-w-2xl mx-auto">
            Browse our carefully curated collections designed for every style and occasion
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8" v-if="categories.length > 0">
          <div 
            v-for="category in categories.slice(0, 3)" 
            :key="category.id"
            class="group cursor-pointer"
            @click="$router.push(`/products/${category.slug}`)"
          >
            <div class="bg-white rounded-lg shadow-md overflow-hidden group-hover:shadow-lg transition-shadow">
              <div class="h-48 bg-light flex items-center justify-center">
                <img 
                  :src="category.image_url || '/placeholder-category.jpg'" 
                  :alt="category.name"
                  class="h-32 w-32 object-cover rounded-lg"
                />
              </div>
              <div class="p-6">
                <h3 class="text-xl font-semibold text-primary mb-2">{{ category.name }}</h3>
                <p class="text-secondary">{{ category.description }}</p>
                <div class="mt-4">
                  <span class="text-accent font-medium group-hover:text-primary transition-colors">
                    Explore Collection →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-primary mb-4">Featured Products</h2>
          <p class="text-secondary max-w-2xl mx-auto">
            Handpicked items that represent the best of our collection
          </p>
        </div>

        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="n in 4" :key="n" class="animate-pulse">
            <div class="bg-gray-200 h-64 rounded-lg mb-4"></div>
            <div class="h-4 bg-gray-200 rounded mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            v-for="product in featuredProducts" 
            :key="product.id"
            class="group cursor-pointer"
            @click="$router.push(`/product/${product.slug}`)"
          >
            <div class="bg-white rounded-lg shadow-md overflow-hidden group-hover:shadow-lg transition-shadow">
              <div class="aspect-w-1 aspect-h-1 h-64 overflow-hidden">
                <img 
                  :src="product.primary_image || '/placeholder-product.jpg'" 
                  :alt="product.name"
                  class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div class="p-4">
                <h3 class="text-lg font-semibold text-primary mb-1">{{ product.name }}</h3>
                <p class="text-sm text-secondary mb-2">{{ product.category_name }}</p>
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <span 
                      v-if="product.discount_price" 
                      class="text-lg font-bold text-accent"
                    >
                      Rs. {{ product.discount_price }}
                    </span>
                    <span 
                      :class="product.discount_price ? 'text-sm line-through text-gray-400' : 'text-lg font-bold text-accent'"
                    >
                      Rs. {{ product.price }}
                    </span>
                  </div>
                  <button 
                    @click.stop="addToCart(product)"
                    :disabled="cartLoading"
                    class="bg-primary text-background hover:bg-secondary px-3 py-1 rounded text-sm transition-colors disabled:opacity-50"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-12">
          <router-link 
            to="/products" 
            class="bg-primary text-background hover:bg-secondary px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
          >
            View All Products
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-light">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="h-8 w-8 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h8a2 2 0 002-2V8m-9 4h4"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-primary mb-2">Free Shipping</h3>
            <p class="text-secondary">Free shipping on orders over Rs. 5,000</p>
          </div>
          
          <div class="text-center">
            <div class="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="h-8 w-8 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-primary mb-2">Quality Guarantee</h3>
            <p class="text-secondary">100% satisfaction guarantee on all products</p>
          </div>
          
          <div class="text-center">
            <div class="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="h-8 w-8 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 110 19.5 9.75 9.75 0 010-19.5z"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-primary mb-2">24/7 Support</h3>
            <p class="text-secondary">Round-the-clock customer support via WhatsApp</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCartStore } from '../stores/cart'
import api from '../utils/api'

const cartStore = useCartStore()

const categories = ref([])
const featuredProducts = ref([])
const loading = ref(true)
const cartLoading = ref(false)

const fetchCategories = async () => {
  try {
    const response = await api.get('/categories')
    categories.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

const fetchFeaturedProducts = async () => {
  try {
    const response = await api.get('/products/featured?limit=4')
    featuredProducts.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch featured products:', error)
  } finally {
    loading.value = false
  }
}

const addToCart = async (product) => {
  cartLoading.value = true
  const result = await cartStore.addToCart({
    productId: product.id,
    quantity: 1
  })
  
  if (result.success) {
    // Could show a success message here
    console.log('Product added to cart successfully')
  } else {
    // Could show an error message here
    console.error('Failed to add product to cart:', result.message)
  }
  cartLoading.value = false
}

onMounted(() => {
  fetchCategories()
  fetchFeaturedProducts()
})
</script>
