import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../utils/api'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const loading = ref(false)

  const itemCount = computed(() => items.value.length)
  const totalQuantity = computed(() => 
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )
  const subtotal = computed(() => 
    items.value.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
  )

  const fetchCart = async () => {
    loading.value = true
    try {
      const response = await api.get('/cart')
      items.value = response.data.data.items
    } catch (error) {
      console.error('Failed to fetch cart:', error)
      items.value = []
    } finally {
      loading.value = false
    }
  }

  const addToCart = async (productData) => {
    loading.value = true
    try {
      await api.post('/cart/add', productData)
      await fetchCart() // Refresh cart
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add item to cart'
      }
    } finally {
      loading.value = false
    }
  }

  const updateCartItem = async (itemId, quantity) => {
    loading.value = true
    try {
      await api.put(`/cart/${itemId}`, { quantity })
      await fetchCart() // Refresh cart
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update cart item'
      }
    } finally {
      loading.value = false
    }
  }

  const removeFromCart = async (itemId) => {
    loading.value = true
    try {
      await api.delete(`/cart/${itemId}`)
      await fetchCart() // Refresh cart
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove item from cart'
      }
    } finally {
      loading.value = false
    }
  }

  const clearCart = async () => {
    loading.value = true
    try {
      await api.delete('/cart')
      items.value = []
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to clear cart'
      }
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    loading,
    itemCount,
    totalQuantity,
    subtotal,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
  }
})
