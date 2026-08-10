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
          <router-link to="/admin/orders" class="text-light hover:text-background transition-colors">Orders</router-link>
          <router-link to="/" class="text-light hover:text-background transition-colors">← Store</router-link>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Products</h1>
          <p class="text-gray-400 text-sm">{{ pagination.totalItems }} products total</p>
        </div>
        <button
          @click="openAddModal"
          class="bg-primary text-background px-4 py-2 rounded-xl font-semibold hover:bg-secondary transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Add Product
        </button>
      </div>

      <!-- Search -->
      <div class="mb-5 relative max-w-sm">
        <input
          v-model="searchQuery"
          @input="debouncedSearch"
          type="text"
          placeholder="Search products..."
          class="w-full pl-10 pr-4 py-2.5 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-primary bg-white"
        />
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
      </div>

      <!-- Alert -->
      <div v-if="alertMsg" class="mb-4 px-4 py-3 rounded-lg text-sm font-medium" :class="alertType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'">
        {{ alertMsg }}
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <svg class="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Products Table -->
      <div v-else class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
              <tr>
                <th class="px-4 py-3 text-left w-14">Image</th>
                <th class="px-4 py-3 text-left">Product</th>
                <th class="px-4 py-3 text-left">Category</th>
                <th class="px-4 py-3 text-left">Price</th>
                <th class="px-4 py-3 text-left">Stock</th>
                <th class="px-4 py-3 text-left">Featured</th>
                <th class="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3">
                  <img
                    :src="imageUrl(product.primary_image) || placeholderImg('48x48')"
                    :alt="product.name"
                    class="w-12 h-12 object-cover rounded-lg"
                    @error.once="$event.target.src = placeholderImg('48x48')"
                  />
                </td>
                <td class="px-4 py-3">
                  <p class="font-medium text-gray-800 line-clamp-1">{{ product.name }}</p>
                  <p class="text-xs text-gray-400 font-mono">{{ product.product_code }}</p>
                </td>
                <td class="px-4 py-3 text-gray-500">{{ product.category_name || '—' }}</td>
                <td class="px-4 py-3">
                  <p class="font-bold text-gray-800">Rs. {{ Number(product.price).toLocaleString() }}</p>
                  <p v-if="product.discount_price" class="text-xs text-green-600">Sale: Rs. {{ Number(product.discount_price).toLocaleString() }}</p>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="font-bold text-sm"
                    :class="product.stock_quantity <= 5 ? 'text-red-500' : product.stock_quantity <= 10 ? 'text-orange-500' : 'text-green-600'"
                  >{{ product.stock_quantity }}</span>
                </td>
                <td class="px-4 py-3">
                  <span v-if="product.is_featured" class="text-yellow-500 text-lg" title="Featured">⭐</span>
                  <span v-else class="text-gray-300 text-lg">☆</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <button @click="openEditModal(product)" class="text-blue-500 hover:text-blue-700 transition-colors text-xs font-semibold">Edit</button>
                    <button @click="deleteProduct(product)" class="text-red-400 hover:text-red-600 transition-colors text-xs font-semibold">Delete</button>
                  </div>
                </td>
              </tr>
              <tr v-if="products.length === 0">
                <td colspan="7" class="text-center py-16 text-gray-400">No products found</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <span class="text-xs text-gray-400">Showing {{ products.length }} of {{ pagination.totalItems }}</span>
          <div class="flex gap-1">
            <button
              v-for="page in pagination.totalPages"
              :key="page"
              @click="fetchProducts(page)"
              class="w-8 h-8 rounded text-xs font-medium transition-all"
              :class="page === pagination.currentPage ? 'bg-primary text-background' : 'text-gray-500 hover:bg-gray-100'"
            >{{ page }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" @click.self="closeModal">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
          <h2 class="text-lg font-bold text-gray-800">{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <!-- Form error -->
          <div v-if="formError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{{ formError }}</div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Product Code *</label>
              <input v-model="form.productCode" required class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm" placeholder="KLV-001" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input v-model="form.name" required class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm" placeholder="Floral Crop Top" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select v-model="form.categoryId" required class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm">
              <option value="">Select category</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea v-model="form.description" rows="3" class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm resize-none" placeholder="Product description..."></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Price (Rs.) *</label>
              <input v-model.number="form.price" type="number" required min="0" step="0.01" class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm" placeholder="1500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sale Price (Rs.)</label>
              <input v-model.number="form.discountPrice" type="number" min="0" step="0.01" class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm" placeholder="1200 (optional)" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Stock Qty *</label>
              <input v-model.number="form.stockQuantity" type="number" required min="0" class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm" placeholder="50" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sizes (comma separated)</label>
              <input v-model="form.sizesInput" type="text" class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm" placeholder="S, M, L, XL" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Colors (comma separated)</label>
              <input v-model="form.colorsInput" type="text" class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm" placeholder="Red, Blue, Black" />
            </div>
          </div>

          <!-- Images -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Product Images (max 5)</label>
            <div
              class="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-accent transition-colors cursor-pointer"
              @click="$refs.fileInput.click()"
              @dragover.prevent
              @drop.prevent="onFileDrop"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-gray-400 text-sm">Click or drag images here (JPEG, PNG, WEBP)</p>
              <input ref="fileInput" type="file" multiple accept="image/*" class="hidden" @change="onFileChange" />
            </div>
            <!-- Preview -->
            <div v-if="imagePreviewUrls.length > 0" class="flex gap-2 mt-3 flex-wrap">
              <div v-for="(url, i) in imagePreviewUrls" :key="i" class="relative">
                <img :src="url" class="w-16 h-16 object-cover rounded-lg" />
                <button type="button" @click="removePreviewImage(i)" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600">×</button>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <input id="featured" v-model="form.isFeatured" type="checkbox" class="w-4 h-4 rounded accent-primary" />
            <label for="featured" class="text-sm font-medium text-gray-700">Mark as Featured Product ⭐</label>
          </div>

          <div class="flex gap-3 pt-2">
            <button type="button" @click="closeModal" class="flex-1 border-2 border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold hover:border-gray-300 transition-colors">Cancel</button>
            <button
              type="submit"
              :disabled="formSaving"
              class="flex-1 bg-primary text-background py-2.5 rounded-xl font-semibold hover:bg-secondary transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <svg v-if="formSaving" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ formSaving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../../utils/api'
import { imageUrl, placeholderImg } from '../../utils/images'

const products = ref([])
const categories = ref([])
const loading = ref(true)
const searchQuery = ref('')
const pagination = ref({ currentPage: 1, totalPages: 1, totalItems: 0 })
const alertMsg = ref('')
const alertType = ref('success')
const showModal = ref(false)
const editingProduct = ref(null)
const formSaving = ref(false)
const formError = ref('')
const imageFiles = ref([])
const imagePreviewUrls = ref([])
const fileInput = ref(null)

const form = reactive({
  productCode: '',
  name: '',
  description: '',
  categoryId: '',
  price: '',
  discountPrice: '',
  stockQuantity: 0,
  isFeatured: false,
  sizesInput: '',
  colorsInput: ''
})

const fetchProducts = async (page = 1) => {
  loading.value = true
  try {
    const params = new URLSearchParams({ page, limit: 15, search: searchQuery.value })
    const res = await api.get(`/admin/products?${params}`)
    products.value = res.data.data.products
    pagination.value = res.data.data.pagination
  } catch (e) {
    products.value = []
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const res = await api.get('/categories')
    categories.value = res.data.data || []
  } catch (e) {}
}

let searchTimer = null
const debouncedSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchProducts(1), 400)
}

const showAlert = (msg, type = 'success') => {
  alertMsg.value = msg
  alertType.value = type
  setTimeout(() => { alertMsg.value = '' }, 4000)
}

const resetForm = () => {
  Object.assign(form, { productCode: '', name: '', description: '', categoryId: '', price: '', discountPrice: '', stockQuantity: 0, isFeatured: false, sizesInput: '', colorsInput: '' })
  imageFiles.value = []
  imagePreviewUrls.value = []
  formError.value = ''
}

const openAddModal = () => {
  editingProduct.value = null
  resetForm()
  showModal.value = true
}

const openEditModal = (product) => {
  editingProduct.value = product
  form.productCode = product.product_code
  form.name = product.name
  form.description = product.description || ''
  form.categoryId = product.category_id
  form.price = product.price
  form.discountPrice = product.discount_price || ''
  form.stockQuantity = product.stock_quantity
  form.isFeatured = product.is_featured
  form.sizesInput = ''
  form.colorsInput = ''
  imageFiles.value = []
  imagePreviewUrls.value = []
  formError.value = ''
  showModal.value = true
}

const closeModal = () => { showModal.value = false; editingProduct.value = null }

const onFileChange = (e) => {
  const files = Array.from(e.target.files).slice(0, 5)
  imageFiles.value = files
  imagePreviewUrls.value = files.map(f => URL.createObjectURL(f))
}

const onFileDrop = (e) => {
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')).slice(0, 5)
  imageFiles.value = files
  imagePreviewUrls.value = files.map(f => URL.createObjectURL(f))
}

const removePreviewImage = (i) => {
  imageFiles.value.splice(i, 1)
  imagePreviewUrls.value.splice(i, 1)
}

const handleSubmit = async () => {
  formSaving.value = true
  formError.value = ''

  const sizes = form.sizesInput ? form.sizesInput.split(',').map(s => s.trim()).filter(Boolean) : []
  const colors = form.colorsInput ? form.colorsInput.split(',').map(c => c.trim()).filter(Boolean) : []

  const fd = new FormData()
  fd.append('productCode', form.productCode)
  fd.append('name', form.name)
  fd.append('description', form.description)
  fd.append('categoryId', form.categoryId)
  fd.append('price', form.price)
  if (form.discountPrice) fd.append('discountPrice', form.discountPrice)
  fd.append('stockQuantity', form.stockQuantity)
  fd.append('isFeatured', form.isFeatured)
  sizes.forEach(s => fd.append('sizes[]', s))
  colors.forEach(c => fd.append('colors[]', c))
  imageFiles.value.forEach(f => fd.append('images', f))

  try {
    if (editingProduct.value) {
      await api.put(`/admin/products/${editingProduct.value.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      showAlert('Product updated successfully!')
    } else {
      await api.post('/admin/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      showAlert('Product created successfully!')
    }
    closeModal()
    fetchProducts(pagination.value.currentPage)
  } catch (e) {
    formError.value = e.response?.data?.message || 'Something went wrong'
  } finally {
    formSaving.value = false
  }
}

const deleteProduct = async (product) => {
  if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
  try {
    await api.delete(`/admin/products/${product.id}`)
    showAlert('Product deleted')
    fetchProducts(pagination.value.currentPage)
  } catch (e) {
    showAlert(e.response?.data?.message || 'Failed to delete product', 'error')
  }
}

onMounted(() => {
  fetchProducts()
  fetchCategories()
})
</script>
