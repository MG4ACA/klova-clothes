<template>
  <div id="app" class="min-h-screen bg-background">
    <!-- Navigation Header -->
    <Navbar />
    
    <!-- Main Content -->
    <main class="min-h-screen">
      <router-view />
    </main>
    
    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useCartStore } from './stores/cart'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'

const authStore = useAuthStore()
const cartStore = useCartStore()

onMounted(() => {
  // Initialize cart if user is authenticated
  if (authStore.isAuthenticated) {
    cartStore.fetchCart()
  }
})
</script>
