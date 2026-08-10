<template>
  <div class="min-h-screen bg-background py-8">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-primary mb-8">Shopping Cart</h1>

      <!-- Not Logged In -->
      <div v-if="!authStore.isAuthenticated" class="bg-white rounded-2xl shadow-sm p-12 text-center">
        <p class="text-5xl mb-4">🔒</p>
        <h2 class="text-xl font-bold text-primary mb-2">Sign in to view your cart</h2>
        <p class="text-secondary mb-6">Please log in to access your shopping cart.</p>
        <router-link to="/login?redirect=/cart" class="bg-primary text-background px-6 py-3 rounded-lg font-semibold hover:bg-secondary transition-colors">
          Sign In
        </router-link>
      </div>

      <!-- Loading -->
      <div v-else-if="cartStore.loading && cartStore.items.length === 0" class="bg-white rounded-2xl shadow-sm p-12 text-center">
        <svg class="animate-spin h-10 w-10 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-secondary">Loading your cart...</p>
      </div>

      <!-- Empty Cart -->
      <div v-else-if="cartStore.items.length === 0" class="bg-white rounded-2xl shadow-sm p-12 text-center">
        <p class="text-6xl mb-4">🛒</p>
        <h2 class="text-2xl font-bold text-primary mb-2">Your cart is empty</h2>
        <p class="text-secondary mb-6">Looks like you haven't added anything yet.</p>
        <router-link to="/products" class="bg-primary text-background px-6 py-3 rounded-lg font-semibold hover:bg-secondary transition-colors">
          Browse Products
        </router-link>
      </div>

      <!-- Cart with Items -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Items List -->
        <div class="lg:col-span-2 space-y-4">
          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="bg-white rounded-2xl shadow-sm p-4 flex gap-4 items-start"
          >
            <!-- Product Image -->
            <router-link :to="`/product/${item.slug}`" class="flex-shrink-0">
              <img
                :src="imageUrl(item.primary_image) || placeholderImg('100x100')"
                :alt="item.name"
                class="w-24 h-24 object-cover rounded-xl"
                @error.once="$event.target.src = placeholderImg('100x100')"
              />
            </router-link>

            <!-- Details -->
            <div class="flex-1 min-w-0">
              <router-link :to="`/product/${item.slug}`" class="font-semibold text-primary hover:text-secondary transition-colors line-clamp-2 leading-snug">
                {{ item.name }}
              </router-link>
              <div class="flex gap-3 text-xs text-secondary mt-1">
                <span v-if="item.size">Size: <strong>{{ item.size }}</strong></span>
                <span v-if="item.color">Color: <strong>{{ item.color }}</strong></span>
              </div>
              <div class="flex items-center justify-between mt-3 flex-wrap gap-2">
                <!-- Quantity Controls -->
                <div class="flex items-center gap-2">
                  <button
                    @click="updateQty(item, item.quantity - 1)"
                    :disabled="item.quantity <= 1 || updating === item.id"
                    class="w-8 h-8 rounded-lg border border-light text-primary hover:border-accent transition-all flex items-center justify-center font-bold disabled:opacity-40"
                  >−</button>
                  <span class="w-6 text-center font-bold text-primary">
                    <svg v-if="updating === item.id" class="animate-spin h-4 w-4 mx-auto text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span v-else>{{ item.quantity }}</span>
                  </span>
                  <button
                    @click="updateQty(item, item.quantity + 1)"
                    :disabled="item.quantity >= item.stock_quantity || updating === item.id"
                    class="w-8 h-8 rounded-lg border border-light text-primary hover:border-accent transition-all flex items-center justify-center font-bold disabled:opacity-40"
                  >+</button>
                </div>

                <!-- Price -->
                <span class="font-bold text-secondary">Rs. {{ (item.unit_price * item.quantity).toLocaleString() }}</span>
              </div>
            </div>

            <!-- Remove Button -->
            <button
              @click="removeItem(item.id)"
              :disabled="removing === item.id"
              class="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
              title="Remove item"
            >
              <svg v-if="removing === item.id" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Clear Cart -->
          <div class="text-right">
            <button @click="clearAll" class="text-sm text-gray-400 hover:text-red-500 transition-colors underline">
              Clear entire cart
            </button>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
            <h2 class="text-lg font-bold text-primary mb-4">Order Summary</h2>
            
            <div class="space-y-3 mb-4">
              <div class="flex justify-between text-sm text-secondary">
                <span>Items ({{ cartStore.totalQuantity }})</span>
                <span>Rs. {{ cartStore.subtotal.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-sm text-secondary">
                <span>Delivery</span>
                <span class="text-green-600 font-medium">COD (discuss via WhatsApp)</span>
              </div>
              <div class="border-t border-light pt-3 flex justify-between font-bold text-primary">
                <span>Total</span>
                <span>Rs. {{ cartStore.subtotal.toLocaleString() }}</span>
              </div>
            </div>

            <!-- WhatsApp Order Button -->
            <button
              @click="checkoutViaWhatsApp"
              class="w-full bg-green-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 mb-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.116 1.523 5.847L0 24l6.324-1.5A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.899 0-3.677-.499-5.214-1.375l-.374-.224-3.755.891.942-3.677-.244-.387A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              Order via WhatsApp
            </button>

            <router-link
              to="/products"
              class="w-full block text-center border-2 border-light text-secondary py-2.5 px-4 rounded-xl font-medium hover:border-primary hover:text-primary transition-colors text-sm"
            >
              Continue Shopping
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import { imageUrl, placeholderImg } from '../utils/images'

const cartStore = useCartStore()
const authStore = useAuthStore()

const updating = ref(null)
const removing = ref(null)

onMounted(() => {
  if (authStore.isAuthenticated) {
    cartStore.fetchCart()
  }
})

const updateQty = async (item, newQty) => {
  if (newQty < 1 || newQty > item.stock_quantity) return
  updating.value = item.id
  await cartStore.updateCartItem(item.id, newQty)
  updating.value = null
}

const removeItem = async (itemId) => {
  removing.value = itemId
  await cartStore.removeFromCart(itemId)
  removing.value = null
}

const clearAll = async () => {
  if (confirm('Remove all items from your cart?')) {
    await cartStore.clearCart()
  }
}

const checkoutViaWhatsApp = () => {
  const itemLines = cartStore.items.map(item => {
    const sizeText = item.size ? ` | Size: ${item.size}` : ''
    const colorText = item.color ? ` | Color: ${item.color}` : ''
    return `• ${item.name}${sizeText}${colorText} x${item.quantity} — Rs. ${(item.unit_price * item.quantity).toLocaleString()}`
  }).join('\n')

  const message = `Hello! I'd like to place an order:\n\n${itemLines}\n\n*Total: Rs. ${cartStore.subtotal.toLocaleString()}*\n\nPlease confirm availability and delivery details. Thank you!`

  const phone = import.meta.env.VITE_WHATSAPP_NUMBER
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
}
</script>
