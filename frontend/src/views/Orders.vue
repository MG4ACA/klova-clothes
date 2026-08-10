<template>
  <div class="min-h-screen bg-background py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-primary mb-8">My Orders</h1>

      <!-- Not Logged In -->
      <div v-if="!authStore.isAuthenticated" class="bg-white rounded-2xl shadow-sm p-12 text-center">
        <p class="text-5xl mb-4">🔒</p>
        <h2 class="text-xl font-bold text-primary mb-2">Sign in to view your orders</h2>
        <router-link to="/login?redirect=/orders" class="bg-primary text-background px-6 py-3 rounded-lg font-semibold hover:bg-secondary transition-colors">Sign In</router-link>
      </div>

      <!-- Loading -->
      <div v-else-if="loading" class="flex justify-center py-20">
        <svg class="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- No Orders -->
      <div v-else-if="orders.length === 0" class="bg-white rounded-2xl shadow-sm p-12 text-center">
        <p class="text-6xl mb-4">📦</p>
        <h2 class="text-2xl font-bold text-primary mb-2">No orders yet</h2>
        <p class="text-secondary mb-6">You haven't placed any orders. Start shopping!</p>
        <router-link to="/products" class="bg-primary text-background px-6 py-3 rounded-lg font-semibold hover:bg-secondary transition-colors">Browse Products</router-link>
      </div>

      <!-- Orders List -->
      <div v-else class="space-y-5">
        <div
          v-for="order in orders"
          :key="order.id"
          class="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <!-- Order Header -->
          <div class="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-gray-50 border-b border-light">
            <div>
              <p class="text-xs text-secondary">Order Number</p>
              <p class="font-bold text-primary">{{ order.order_number }}</p>
            </div>
            <div>
              <p class="text-xs text-secondary">Date</p>
              <p class="font-medium text-primary text-sm">{{ formatDate(order.created_at) }}</p>
            </div>
            <div>
              <p class="text-xs text-secondary">Total</p>
              <p class="font-bold text-secondary">Rs. {{ order.total_amount.toLocaleString() }}</p>
            </div>
            <div>
              <span :class="statusClass(order.status)" class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                {{ order.status }}
              </span>
            </div>
          </div>

          <!-- Items -->
          <div class="divide-y divide-gray-50">
            <div v-for="item in order.items" :key="item.product_slug + item.size" class="flex gap-4 px-6 py-4 items-center">
              <img
                :src="imageUrl(item.primary_image) || placeholderImg('64x64')"
                :alt="item.product_name"
                class="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                @error.once="$event.target.src = placeholderImg('64x64')"
              />
              <div class="flex-1 min-w-0">
                <router-link :to="`/product/${item.product_slug}`" class="font-medium text-primary hover:text-secondary line-clamp-1 transition-colors">
                  {{ item.product_name }}
                </router-link>
                <div class="text-xs text-secondary mt-0.5 flex gap-3 flex-wrap">
                  <span v-if="item.size">Size: <strong>{{ item.size }}</strong></span>
                  <span v-if="item.color">Color: <strong>{{ item.color }}</strong></span>
                  <span>Qty: <strong>{{ item.quantity }}</strong></span>
                </div>
              </div>
              <div class="text-right">
                <p class="font-bold text-secondary text-sm">Rs. {{ item.total_price.toLocaleString() }}</p>
                <p class="text-xs text-gray-400">Rs. {{ item.unit_price.toLocaleString() }} each</p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-3 bg-gray-50 flex items-center justify-between flex-wrap gap-2">
            <span class="text-xs text-secondary">Payment: <strong class="text-primary capitalize">{{ order.payment_method?.replace('_', ' ') }}</strong></span>
            <span class="text-xs text-secondary">Status: <strong :class="paymentStatusColor(order.payment_status)" class="capitalize">{{ order.payment_status }}</strong></span>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="flex justify-center gap-2 pt-4">
          <button
            v-for="page in pagination.totalPages"
            :key="page"
            @click="fetchOrders(page)"
            class="w-9 h-9 rounded-lg font-medium text-sm transition-all"
            :class="page === pagination.currentPage ? 'bg-primary text-background' : 'bg-white text-secondary hover:bg-light'"
          >{{ page }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../utils/api'
import { imageUrl, placeholderImg } from '../utils/images'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const orders = ref([])
const loading = ref(true)
const pagination = ref({ currentPage: 1, totalPages: 1, totalItems: 0 })

const fetchOrders = async (page = 1) => {
  loading.value = true
  try {
    const res = await api.get(`/orders/my-orders?page=${page}&limit=10`)
    orders.value = res.data.data.orders
    pagination.value = res.data.data.pagination
  } catch (err) {
    orders.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) fetchOrders()
  else loading.value = false
})

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const statusClass = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-indigo-100 text-indigo-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  }
  return map[status] || 'bg-gray-100 text-gray-600'
}

const paymentStatusColor = (status) => {
  const map = { paid: 'text-green-600', pending: 'text-yellow-600', failed: 'text-red-600' }
  return map[status] || 'text-gray-600'
}
</script>
