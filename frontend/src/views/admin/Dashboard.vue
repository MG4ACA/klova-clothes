<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Admin Topbar -->
    <div class="bg-primary text-background shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-xl font-bold">Klova</span>
          <span class="text-accent text-sm font-medium">Admin</span>
        </div>
        <div class="flex items-center gap-4 text-sm">
          <router-link to="/admin/products" class="text-light hover:text-background transition-colors">Products</router-link>
          <router-link to="/admin/orders" class="text-light hover:text-background transition-colors">Orders</router-link>
          <router-link to="/" class="text-light hover:text-background transition-colors">← Store</router-link>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p class="text-gray-500 text-sm mt-1">Welcome back, {{ authStore.user?.first_name }}! Here's what's happening.</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <svg class="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <div v-else>
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div class="bg-white rounded-2xl shadow-sm p-5 border-l-4 border-primary">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Revenue</p>
            <p class="text-2xl font-bold text-gray-800">Rs. {{ stats.total_revenue?.toLocaleString() }}</p>
            <p class="text-xs text-gray-400 mt-1">All time</p>
          </div>
          <div class="bg-white rounded-2xl shadow-sm p-5 border-l-4 border-yellow-400">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Pending Orders</p>
            <p class="text-2xl font-bold text-gray-800">{{ stats.pending_orders }}</p>
            <p class="text-xs text-gray-400 mt-1">of {{ stats.total_orders }} total</p>
          </div>
          <div class="bg-white rounded-2xl shadow-sm p-5 border-l-4 border-green-400">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Products</p>
            <p class="text-2xl font-bold text-gray-800">{{ stats.total_products }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ stats.low_stock_products }} low on stock</p>
          </div>
          <div class="bg-white rounded-2xl shadow-sm p-5 border-l-4 border-blue-400">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Customers</p>
            <p class="text-2xl font-bold text-gray-800">{{ stats.total_customers }}</p>
            <p class="text-xs text-gray-400 mt-1">Registered users</p>
          </div>
        </div>

        <!-- Order Status Row -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div v-for="s in orderStatuses" :key="s.label" class="bg-white rounded-xl shadow-sm p-4 text-center">
            <span :class="s.color" class="text-2xl font-bold block">{{ s.value }}</span>
            <span class="text-xs text-gray-400 mt-1 block">{{ s.label }}</span>
          </div>
        </div>

        <!-- Recent Orders Table -->
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="font-bold text-gray-800">Recent Orders</h2>
            <router-link to="/admin/orders" class="text-sm text-accent font-medium hover:text-primary transition-colors">View All →</router-link>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th class="px-6 py-3 text-left">Order #</th>
                  <th class="px-6 py-3 text-left">Customer</th>
                  <th class="px-6 py-3 text-left">Amount</th>
                  <th class="px-6 py-3 text-left">Status</th>
                  <th class="px-6 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 font-mono font-medium text-gray-800">{{ order.order_number }}</td>
                  <td class="px-6 py-4 text-gray-600">{{ order.customer_name }}</td>
                  <td class="px-6 py-4 font-semibold text-gray-800">Rs. {{ order.total_amount?.toLocaleString() }}</td>
                  <td class="px-6 py-4">
                    <span :class="statusClass(order.status)" class="px-2 py-1 rounded-full text-xs font-bold uppercase">{{ order.status }}</span>
                  </td>
                  <td class="px-6 py-4 text-gray-400">{{ formatDate(order.created_at) }}</td>
                </tr>
                <tr v-if="recentOrders.length === 0">
                  <td colspan="5" class="text-center py-10 text-gray-400">No orders yet</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
          <router-link to="/admin/products" class="bg-primary text-background rounded-2xl p-5 flex items-center gap-4 hover:bg-secondary transition-colors group">
            <span class="text-3xl">📦</span>
            <div>
              <p class="font-bold">Manage Products</p>
              <p class="text-light text-sm">Add, edit, delete</p>
            </div>
          </router-link>
          <router-link to="/admin/orders" class="bg-white border-2 border-primary text-primary rounded-2xl p-5 flex items-center gap-4 hover:bg-background transition-colors">
            <span class="text-3xl">📋</span>
            <div>
              <p class="font-bold">Manage Orders</p>
              <p class="text-secondary text-sm">Update status</p>
            </div>
          </router-link>
          <router-link to="/products" target="_blank" class="bg-white border-2 border-light text-secondary rounded-2xl p-5 flex items-center gap-4 hover:bg-background hover:border-accent transition-colors">
            <span class="text-3xl">🛍️</span>
            <div>
              <p class="font-bold">View Store</p>
              <p class="text-secondary text-sm">Customer view</p>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../utils/api'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const stats = ref({})
const recentOrders = ref([])
const loading = ref(true)

const orderStatuses = computed(() => [
  { label: 'Confirmed', value: stats.value.confirmed_orders ?? 0, color: 'text-blue-500' },
  { label: 'Processing', value: stats.value.processing_orders ?? 0, color: 'text-indigo-500' },
  { label: 'Delivered', value: stats.value.delivered_orders ?? 0, color: 'text-green-500' },
  { label: 'Cancelled', value: stats.value.cancelled_orders ?? 0, color: 'text-red-500' }
])

onMounted(async () => {
  try {
    const res = await api.get('/admin/dashboard')
    const data = res.data.data
    stats.value = data
    recentOrders.value = data.recent_orders || []
  } catch (e) {
    console.error('Failed to load dashboard', e)
  } finally {
    loading.value = false
  }
})

const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const statusClass = (s) => ({
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
}[s] || 'bg-gray-100 text-gray-600')
</script>
