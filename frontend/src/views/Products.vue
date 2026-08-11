<template>
  <div class="min-h-screen bg-white py-12 px-6 lg:px-12 max-w-[1440px] mx-auto">
    <!-- Header -->
    <div class="mb-10">
      <p class="text-xs font-bold tracking-[0.3em] uppercase text-gray-400 mb-2">Collection</p>
      <h1 class="text-3xl md:text-5xl font-black tracking-tight uppercase text-black">
        {{ currentCategoryObj?.name || 'All Products' }}
      </h1>
      <p class="text-gray-500 text-sm mt-2 max-w-xl">
        {{ currentCategoryObj?.description || 'Discover our full collection of premium oversized graphic tees and apparel.' }}
      </p>
    </div>

    <!-- Filters & Search Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
      <!-- Search & Category Selector -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Search input -->
        <div class="relative min-w-[240px]">
          <input
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text"
            placeholder="Search products..."
            class="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-300 text-xs font-semibold tracking-wider text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
          />
          <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
          </svg>
        </div>

        <!-- Category Dropdown -->
        <div class="relative">
          <select
            v-model="selectedCategory"
            @change="handleCategoryChange"
            class="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-300 text-xs font-bold tracking-wider uppercase text-black focus:outline-none focus:border-black cursor-pointer transition-colors"
          >
            <option value="">All Categories</option>
            <option
              v-for="cat in categories"
              :key="cat.id"
              :value="cat.slug"
            >
              {{ cat.name }}
            </option>
          </select>
          <svg class="w-4 h-4 text-black absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>

      <!-- Sort By -->
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold tracking-wider uppercase text-gray-400">Sort:</span>
        <div class="relative">
          <select
            v-model="sortBy"
            @change="fetchProducts"
            class="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-300 text-xs font-bold tracking-wider uppercase text-black focus:outline-none focus:border-black cursor-pointer transition-colors"
          >
            <option value="created_at-DESC">Newest First</option>
            <option value="created_at-ASC">Oldest First</option>
            <option value="name-ASC">Name: A-Z</option>
            <option value="name-DESC">Name: Z-A</option>
            <option value="price-ASC">Price: Low to High</option>
            <option value="price-DESC">Price: High to Low</option>
          </select>
          <svg class="w-4 h-4 text-black absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="n in 8" :key="n" class="animate-pulse">
        <div class="bg-gray-100 aspect-[3/4] mb-3"></div>
        <div class="h-3 bg-gray-100 mb-2 w-3/4"></div>
        <div class="h-3 bg-gray-100 w-1/2"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="products.length === 0" class="text-center py-20 bg-gray-50 my-4 border border-gray-200">
      <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
      </svg>
      <h3 class="text-lg font-black uppercase text-black mb-1">No products found</h3>
      <p class="text-gray-500 text-xs tracking-wider uppercase mb-6">Try clearing filters or selecting another category.</p>
      <button
        @click="clearFilters"
        class="bg-black text-white px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors"
      >
        Clear Filters
      </button>
    </div>

    <!-- Products Grid -->
    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        v-for="product in products"
        :key="product.id"
        class="group cursor-pointer"
        @click="$router.push(`/product/${product.slug}`)"
      >
        <!-- Product Image -->
        <div class="relative aspect-[3/4] bg-gray-50 overflow-hidden mb-3">
          <img
            :src="imageUrl(product.primary_image) || placeholderImg('400x530')"
            :alt="product.name"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            @error.once="$event.target.src = placeholderImg('400x530')"
          />
          <!-- NEW Badge -->
          <div v-if="isNew(product)" class="absolute top-2 left-2 bg-black text-white text-[10px] font-black px-2 py-0.5 tracking-widest">
            NEW
          </div>
          <!-- SALE Badge -->
          <div v-else-if="product.discount_price" class="absolute top-2 left-2 bg-black text-white text-[10px] font-black px-2 py-0.5 tracking-widest">
            SALE
          </div>
          <!-- Quick Add Button -->
          <div class="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              @click.stop="addToCart(product)"
              :disabled="cartLoading || product.stock_quantity === 0"
              class="w-full bg-black text-white text-[10px] font-black py-3 tracking-widest uppercase hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {{ product.stock_quantity === 0 ? 'OUT OF STOCK' : 'QUICK ADD' }}
            </button>
          </div>
        </div>

        <!-- Product Info -->
        <p class="text-[10px] text-gray-400 tracking-widest uppercase mb-0.5">{{ product.category_name }}</p>
        <h3 class="text-sm font-semibold text-black mb-1 line-clamp-1">{{ product.name }}</h3>
        <div class="flex items-center gap-2">
          <span v-if="product.discount_price" class="text-sm font-black text-black">
            Rs. {{ Number(product.discount_price).toLocaleString() }}
          </span>
          <span :class="product.discount_price ? 'text-sm line-through text-gray-400' : 'text-sm font-black text-black'">
            Rs. {{ Number(product.price).toLocaleString() }}
          </span>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && pagination.totalPages > 1" class="mt-16 flex justify-center">
      <nav class="flex items-center gap-2">
        <button
          @click="goToPage(pagination.currentPage - 1)"
          :disabled="!pagination.hasPrevPage"
          class="px-4 py-2 border border-gray-300 text-xs font-bold tracking-wider uppercase text-black hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Prev
        </button>

        <template v-for="page in getPageNumbers()" :key="page">
          <span
            v-if="page === '...'"
            class="px-3 py-2 text-xs font-bold text-gray-400"
          >...</span>
          <button
            v-else
            @click="goToPage(page)"
            :class="[
              'px-4 py-2 border text-xs font-bold tracking-wider transition-colors',
              page === pagination.currentPage
                ? 'bg-black border-black text-white'
                : 'border-gray-300 text-black hover:border-black'
            ]"
          >
            {{ page }}
          </button>
        </template>

        <button
          @click="goToPage(pagination.currentPage + 1)"
          :disabled="!pagination.hasNextPage"
          class="px-4 py-2 border border-gray-300 text-xs font-bold tracking-wider uppercase text-black hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { imageUrl, placeholderImg } from '../utils/images'
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

const currentCategoryObj = computed(() => {
  if (!selectedCategory.value) return null
  return categories.value.find(c => c.slug === selectedCategory.value) || null
})

const isNew = (product) => {
  if (!product.created_at) return false
  const created = new Date(product.created_at)
  const now = new Date()
  return (now - created) < 1000 * 60 * 60 * 24 * 30
}

// Debounced search
let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchProducts()
  }, 400)
}

const fetchCategories = async () => {
  try {
    const response = await api.get('/categories')
    categories.value = response.data.data || []
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
    products.value = response.data.data.products || []
    pagination.value = response.data.data.pagination || null
  } catch (error) {
    console.error('Failed to fetch products:', error)
    products.value = []
  } finally {
    loading.value = false
  }
}

const addToCart = async (product) => {
  cartLoading.value = true
  await cartStore.addToCart({
    productId: product.id,
    quantity: 1
  })
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
  if (!pagination.value) return []
  const { currentPage: current, totalPages } = pagination.value
  const pages = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
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

watch(() => route.params.category, (newCategory) => {
  selectedCategory.value = newCategory || ''
  currentPage.value = 1
  fetchProducts()
})

onMounted(async () => {
  selectedCategory.value = route.params.category || ''
  await fetchCategories()
  fetchProducts()
})
</script>
