<template>
  <footer class="bg-primary text-white">
    <!-- Main footer -->
    <div class="max-w-7xl mx-auto px-6 lg:px-12 py-20">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
        <!-- Brand -->
        <div class="md:col-span-2">
          <span class="text-3xl font-black tracking-tighter block mb-4">KLOVA</span>
          <p class="text-white/40 text-sm leading-relaxed max-w-xs">
            Premium oversized graphic tees for those who wear their identity. Disconnected by connection.
          </p>
          <div class="flex gap-4 mt-8">
            <a href="#" class="w-9 h-9 border border-white/20 flex items-center justify-center text-white/50 hover:border-white hover:text-white transition-all text-xs">f</a>
            <a href="#" class="w-9 h-9 border border-white/20 flex items-center justify-center text-white/50 hover:border-white hover:text-white transition-all text-xs">ig</a>
            <a href="#" class="w-9 h-9 border border-white/20 flex items-center justify-center text-white/50 hover:border-white hover:text-white transition-all text-xs">wa</a>
          </div>
        </div>

        <!-- Shop -->
        <div>
          <h4 class="text-xs font-bold tracking-[0.3em] uppercase text-white/40 mb-6">Shop</h4>
          <ul class="space-y-4">
            <li><router-link to="/products" class="text-sm text-white/70 hover:text-white transition-colors">All Products</router-link></li>
            <li v-for="cat in categories" :key="cat.id">
              <router-link :to="`/products/${cat.slug}`" class="text-sm text-white/70 hover:text-white transition-colors">{{ cat.name }}</router-link>
            </li>
          </ul>
        </div>

        <!-- Account -->
        <div>
          <h4 class="text-xs font-bold tracking-[0.3em] uppercase text-white/40 mb-6">Account</h4>
          <ul class="space-y-4">
            <li><router-link to="/login" class="text-sm text-white/70 hover:text-white transition-colors">Login</router-link></li>
            <li><router-link to="/register" class="text-sm text-white/70 hover:text-white transition-colors">Register</router-link></li>
            <li><router-link to="/orders" class="text-sm text-white/70 hover:text-white transition-colors">My Orders</router-link></li>
            <li><router-link to="/cart" class="text-sm text-white/70 hover:text-white transition-colors">Cart</router-link></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="border-t border-white/10">
      <div class="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-white/30 text-xs tracking-widest">© {{ new Date().getFullYear() }} KLOVA. All rights reserved.</p>
        <p class="text-white/20 text-xs">Made with ♥ in Sri Lanka</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../utils/api'

const categories = ref([])

onMounted(async () => {
  try {
    const res = await api.get('/categories')
    categories.value = res.data.data
  } catch {}
})
</script>
