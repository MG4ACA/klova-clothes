<template>
  <div id="app" class="min-h-screen bg-white">
    <Navbar />
    <!-- On home, no padding needed (hero fills screen behind transparent navbar).
         On all other pages, add pt-14 to clear the fixed navbar. -->
    <main class="min-h-screen" :class="route.path !== '/' ? 'pt-14' : ''">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useCartStore } from './stores/cart'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'

const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()

onMounted(() => {
  if (authStore.isAuthenticated) {
    cartStore.fetchCart()
  }
})
</script>
