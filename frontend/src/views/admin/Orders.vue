<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Admin Topbar -->
    <div class="bg-primary text-background shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <router-link to="/admin" class="text-xl font-bold hover:text-light transition-colors">Klova</router-link>
          <span class="text-accent text-sm font-medium">Admin</span>
        </div>
        <div class="flex items-center gap-4 text-sm">
          <router-link to="/admin" class="text-light hover:text-background transition-colors">Dashboard</router-link>
          <router-link to="/admin/products" class="text-light hover:text-background transition-colors">Products</router-link>
          <router-link to="/" class="text-light hover:text-background transition-colors">← Store</router-link>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 class="text-2xl font-bold text-gray-800">Orders</h1>
        <!-- Status Filter -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="s in statusFilters"
            :key="s.value"
            @click="setFilter(s.value)"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
            :class="currentFilter === s.value ? 'bg-primary text-background border-primary' : 'bg-white text-secondary border-light hover:border-accent'"
          >{{ s.label }}</button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <svg class="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Orders Table -->
      <div v-else class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
              <tr>
                <th class="px-6 py-3 text-left">Order #</th>
                <th class="px-6 py-3 text-left">Customer</th>
                <th class="px-6 py-3 text-left">Amount</th>
                <th class="px-6 py-3 text-left">Payment</th>
                <th class="px-6 py-3 text-left">Status</th>
                <th class="px-6 py-3 text-left">Date</th>
                <th class="px-6 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-mono font-medium text-gray-800 text-xs">{{ order.order_number }}</td>
                <td class="px-6 py-4">
                  <p class="font-medium text-gray-800">{{ order.customer_name }}</p>
                  <p class="text-xs text-gray-400">{{ order.customer_email }}</p>
                </td>
                <td class="px-6 py-4 font-bold text-gray-800">Rs. {{ order.total_amount?.toLocaleString() }}</td>
                <td class="px-6 py-4">
                  <span class="text-xs text-gray-500 capitalize">{{ order.payment_method?.replace('_', ' ') }}</span>
                </td>
                <td class="px-6 py-4">
                  <!-- Inline status dropdown -->
                  <select
                    :value="order.status"
                    @change="updateStatus(order.id, $event.target.value)"
                    class="text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer focus:ring-2 focus:ring-accent outline-none"
                    :class="statusBg(order.status)"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td class="px-6 py-4 text-gray-400 text-xs">{{ formatDate(order.created_at) }}</td>
                <td class="px-6 py-4">
                  <button
                    @click="openWhatsApp(order)"
                    title="Contact customer via WhatsApp"
                    class="text-green-500 hover:text-green-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.116 1.523 5.847L0 24l6.324-1.5A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.899 0-3.677-.499-5.214-1.375l-.374-.224-3.755.891.942-3.677-.244-.387A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                  </button>
                </td>
              </tr>
              <tr v-if="orders.length === 0">
                <td colspan="7" class="text-center py-16 text-gray-400">No orders found</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <span class="text-xs text-gray-400">{{ pagination.totalItems }} orders total</span>
          <div class="flex gap-1">
            <button
              v-for="page in pagination.totalPages"
              :key="page"
              @click="fetchOrders(page)"
              class="w-8 h-8 rounded text-xs font-medium transition-all"
              :class="page === pagination.currentPage ? 'bg-primary text-background' : 'text-gray-500 hover:bg-gray-100'"
            >{{ page }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../utils/api'

const orders = ref([])
const loading = ref(true)
const currentFilter = ref('all')
const pagination = ref({ currentPage: 1, totalPages: 1, totalItems: 0 })

const statusFilters = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' }
]

const fetchOrders = async (page = 1) => {
  loading.value = true
  try {
    const params = new URLSearchParams({ page, limit: 20, status: currentFilter.value })
    const res = await api.get(`/admin/orders?${params}`)
    orders.value = res.data.data.orders
    pagination.value = res.data.data.pagination
  } catch (e) {
    orders.value = []
  } finally {
    loading.value = false
  }
}

const setFilter = (status) => {
  currentFilter.value = status
  fetchOrders(1)
}

const updateStatus = async (orderId, newStatus) => {
  try {
    await api.put(`/admin/orders/${orderId}/status`, { status: newStatus })
    const order = orders.value.find(o => o.id === orderId)
    if (order) order.status = newStatus
  } catch (e) {
    alert('Failed to update order status')
  }
}

const openWhatsApp = (order) => {
  const phone = order.customer_phone?.replace(/[^0-9]/g, '') || ''
  if (!phone) { alert('No phone number for this customer'); return }
  const msg = `Hello ${order.customer_name}, regarding your Klova order *${order.order_number}*...`
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
}

const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const statusBg = (s) => ({
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
}[s] || 'bg-gray-100 text-gray-600')

onMounted(() => fetchOrders())
</script>
