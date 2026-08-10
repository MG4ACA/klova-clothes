<template>
  <div class="min-h-screen py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-primary mb-4">
          {{ categoryName || 'All Products' }}
        </h1>
        <p class="text-secondary">
          Discover our collection of premium clothing
        </p>
      </div>

      <!-- Filters and Search -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Search -->
          <div class="relative">
            <input
              v-model="searchQuery"
              @input="debouncedSearch"
              type="text"
              placeholder="Search products..."
              class="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <MagnifyingGlassIcon class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <!-- Category Filter -->
          <select
            v-model="selectedCategory"
            @change="handleCategoryChange"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option 
              v-for="category in categories" 
              :key="category.id" 
              :value="category.slug"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <!-- Sort -->
        <div class="flex items-center gap-4">
          <span class="text-sm text-secondary">Sort by:</span>
          <select
            v-model="sortBy"
            @change="fetchProducts"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="created_at-DESC">Newest First</option>
            <option value="created_at-ASC">Oldest First</option>
            <option value="name-ASC">Name A-Z</option>
            <option value="name-DESC">Name Z-A</option>
            <option value="price-ASC">Price: Low to High</option>
            <option value="price-DESC">Price: High to Low</option>
          </select>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="n in 8" :key="n" class="animate-pulse">
          <div class="bg-gray-200 h-64 rounded-lg mb-4"></div>
          <div class="h-4 bg-gray-200 rounded mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>

      <div v-else-if="products.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-xl font-semibold text-primary mb-2">No products found</h3>
        <p class="text-secondary mb-4">Try adjusting your search or filter criteria</p>
        <button 
          @click="clearFilters"
          class="bg-primary text-background hover:bg-secondary px-6 py-2 rounded-lg transition-colors"
        >
          Clear Filters
        </button>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="product in products" 
          :key="product.id"
          class="group cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          @click="$router.push(`/product/${product.slug}`)"
        >
          <div class="aspect-w-1 aspect-h-1 h-64 overflow-hidden">
            <img 
              :src="product.primary_image || '/placeholder-product.jpg'" 
              :alt="product.name"
              class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div v-if="product.discount_price" class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              SALE
            </div>
          </div>
          <div class="p-4">
            <h3 class="text-lg font-semibold text-primary mb-1 line-clamp-2">{{ product.name }}</h3>
            <p class="text-sm text-secondary mb-2">{{ product.category_name }}</p>
            <div class="flex items-center justify-between mb-3">
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
              <div class="text-xs text-secondary">
                Stock: {{ product.stock_quantity }}
              </div>
            </div>
            <button 
              @click.stop="addToCart(product)"
              :disabled="cartLoading || product.stock_quantity === 0"
              class="w-full bg-primary text-background hover:bg-secondary px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination && pagination.totalPages > 1" class="mt-12 flex justify-center">
        <nav class="flex items-center space-x-2">
          <button
            @click="goToPage(pagination.currentPage - 1)"
            :disabled="!pagination.hasPrevPage"
            class="px-3 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <template v-for="page in getPageNumbers()" :key="page">
            <button
              v-if="page === '...'"
              disabled
              class="px-3 py-2 text-sm font-medium text-gray-500 cursor-default"
            >
              ...
            </button>
            <button
              v-else
              @click="goToPage(page)"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium',
                page === pagination.currentPage
                  ? 'bg-primary text-background'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
          </template>
          
          <button
            @click="goToPage(pagination.currentPage + 1)"
            :disabled="!pagination.hasNextPage"
            class="px-3 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import api from '../utils/api'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const products = ref([])
const categories = ref([])
const loading = ref(true)
const cartLoading = ref(false)
const pagination = ref(null)

const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('created_at-DESC')
const currentPage = ref(1)

const categoryName = computed(() => {
  if (!selectedCategory.value) return ''
  const category = categories.value.find(c => c.slug === selectedCategory.value)
  return category?.name || ''
})

// Debounced search
let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchProducts()
  }, 500)
}

const fetchCategories = async () => {
  try {
    const response = await api.get('/categories')
    categories.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

const fetchProducts = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: currentPage.value,
      limit: 12
    })

    if (searchQuery.value) {
      params.append('search', searchQuery.value)
    }

    if (selectedCategory.value) {
      params.append('category', selectedCategory.value)
    }

    if (sortBy.value) {
      const [sortField, sortOrder] = sortBy.value.split('-')
      params.append('sortBy', sortField)
      params.append('sortOrder', sortOrder)
    }

    const response = await api.get(`/products?${params}`)
    products.value = response.data.data.products
    pagination.value = response.data.data.pagination
  } catch (error) {
    console.error('Failed to fetch products:', error)
    products.value = []
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
    console.log('Product added to cart successfully')
  } else {
    console.error('Failed to add product to cart:', result.message)
  }
  cartLoading.value = false
}

const handleCategoryChange = () => {
  currentPage.value = 1
  if (selectedCategory.value) {
    router.push(`/products/${selectedCategory.value}`)
  } else {
    router.push('/products')
  }
  fetchProducts()
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  sortBy.value = 'created_at-DESC'
  currentPage.value = 1
  router.push('/products')
  fetchProducts()
}

const goToPage = (page) => {
  currentPage.value = page
  fetchProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const getPageNumbers = () => {
  const { currentPage: current, totalPages } = pagination.value
  const pages = []
  
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(totalPages)
    } else if (current >= totalPages - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(totalPages)
    }
  }
  
  return pages
}

// Watch route changes
watch(() => route.params.category, (newCategory) => {
  selectedCategory.value = newCategory || ''
  currentPage.value = 1
  fetchProducts()
})

onMounted(() => {
  selectedCategory.value = route.params.category || ''
  fetchCategories()
  fetchProducts()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
