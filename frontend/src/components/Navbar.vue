<template>
  <!-- Navbar wrapper: transparent on hero, solid black on scroll or inner pages -->
  <nav
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="navBg"
  >
    <div class="max-w-[1440px] mx-auto px-6 flex items-center justify-between h-14">

      <!-- Logo -->
      <router-link to="/" class="flex-shrink-0">
        <img
          src="/logo-white.png"
          alt="Offwire"
          class="h-7 w-auto object-contain"
        />
      </router-link>

      <!-- Center nav links (desktop) -->
      <div class="hidden md:flex items-center gap-8">
        <div
          v-for="cat in navCategories"
          :key="cat.slug"
          class="relative group"
          @mouseenter="activeMenu = cat.slug"
          @mouseleave="activeMenu = null"
        >
          <router-link
            :to="`/products/${cat.slug}`"
            class="text-white/80 hover:text-white text-xs font-bold tracking-[0.15em] uppercase py-4 block transition-colors"
          >{{ cat.name }}</router-link>

          <!-- Mega dropdown -->
          <div
            v-if="activeMenu === cat.slug"
            class="fixed left-0 right-0 top-14 bg-white shadow-2xl border-t border-gray-100 z-40"
            @mouseenter="activeMenu = cat.slug"
            @mouseleave="activeMenu = null"
          >
            <div class="max-w-[1440px] mx-auto px-6 py-8 grid grid-cols-[200px_1fr] gap-8">
              <!-- Links column -->
              <div>
                <p class="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-4">Explore</p>
                <ul class="space-y-2">
                  <li v-for="sub in allCategories" :key="sub.id">
                    <router-link
                      :to="`/products/${sub.slug}`"
                      class="text-sm text-gray-700 hover:text-black transition-colors block py-1"
                      @click="activeMenu = null"
                    >{{ sub.name }}</router-link>
                  </li>
                  <li>
                    <router-link to="/products" class="text-sm font-bold text-black hover:underline block py-1 mt-2" @click="activeMenu = null">
                      Shop All →
                    </router-link>
                  </li>
                </ul>
              </div>
              <!-- Image tiles -->
              <div class="grid grid-cols-3 gap-3">
                <router-link
                  v-for="tile in megaTiles"
                  :key="tile.label"
                  :to="tile.link"
                  class="relative overflow-hidden aspect-[4/3] group/tile block"
                  @click="activeMenu = null"
                >
                  <img :src="tile.img" :alt="tile.label" class="w-full h-full object-cover transition-transform duration-500 group-hover/tile:scale-105" @error.once="$event.target.style.display='none'" />
                  <div class="absolute inset-0 bg-black/30 group-hover/tile:bg-black/40 transition-colors"></div>
                  <span class="absolute bottom-4 left-4 text-white text-xs font-bold tracking-[0.15em] uppercase">{{ tile.label }}</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right icons -->
      <div class="flex items-center gap-5">
        <!-- Search -->
        <button class="text-white/80 hover:text-white transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
          </svg>
        </button>

        <!-- Account -->
        <div class="relative group/acc hidden md:block">
          <button class="text-white/80 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
          <div class="absolute right-0 top-full pt-2 opacity-0 invisible group-hover/acc:opacity-100 group-hover/acc:visible transition-all duration-200 z-50">
            <div class="bg-white border border-gray-100 shadow-xl py-2 min-w-[160px]">
              <template v-if="!authStore.isAuthenticated">
                <router-link to="/login" class="block px-4 py-2.5 text-xs font-semibold tracking-widest uppercase text-gray-800 hover:bg-gray-50">Login</router-link>
                <router-link to="/register" class="block px-4 py-2.5 text-xs font-semibold tracking-widest uppercase text-gray-800 hover:bg-gray-50">Register</router-link>
              </template>
              <template v-else>
                <router-link to="/profile" class="block px-4 py-2.5 text-xs font-semibold tracking-widest uppercase text-gray-800 hover:bg-gray-50">Profile</router-link>
                <router-link to="/orders" class="block px-4 py-2.5 text-xs font-semibold tracking-widest uppercase text-gray-800 hover:bg-gray-50">My Orders</router-link>
                <router-link v-if="authStore.isAdmin" to="/admin" class="block px-4 py-2.5 text-xs font-semibold tracking-widest uppercase text-gray-800 hover:bg-gray-50">Admin</router-link>
                <div class="border-t border-gray-100 my-1"></div>
                <button @click="logout" class="block w-full text-left px-4 py-2.5 text-xs font-semibold tracking-widest uppercase text-gray-800 hover:bg-gray-50">Logout</button>
              </template>
            </div>
          </div>
        </div>

        <!-- Cart -->
        <router-link to="/cart" class="relative text-white/80 hover:text-white transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <span v-if="cartStore.totalQuantity > 0" class="absolute -top-2 -right-2 bg-white text-black text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center">
            {{ cartStore.totalQuantity }}
          </span>
        </router-link>

        <!-- Mobile burger -->
        <button @click="mobileOpen = !mobileOpen" class="md:hidden text-white/80 hover:text-white">
          <svg v-if="!mobileOpen" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
          <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-if="mobileOpen" class="md:hidden bg-black border-t border-white/10">
      <div class="px-6 py-6 space-y-1">
        <router-link to="/" @click="mobileOpen=false" class="block py-3 text-xs font-bold tracking-widest uppercase text-white border-b border-white/10">Home</router-link>
        <router-link to="/products" @click="mobileOpen=false" class="block py-3 text-xs font-bold tracking-widest uppercase text-white border-b border-white/10">Shop All</router-link>
        <router-link
          v-for="cat in allCategories" :key="cat.id"
          :to="`/products/${cat.slug}`"
          @click="mobileOpen=false"
          class="block py-3 text-xs font-semibold tracking-widest uppercase text-white/60 border-b border-white/10 pl-3"
        >{{ cat.name }}</router-link>
        <template v-if="!authStore.isAuthenticated">
          <router-link to="/login" @click="mobileOpen=false" class="block py-3 text-xs font-bold tracking-widest uppercase text-white border-b border-white/10">Login</router-link>
          <router-link to="/register" @click="mobileOpen=false" class="block py-3 text-xs font-bold tracking-widest uppercase text-white">Register</router-link>
        </template>
        <template v-else>
          <router-link to="/profile" @click="mobileOpen=false" class="block py-3 text-xs font-bold tracking-widest uppercase text-white border-b border-white/10">Profile</router-link>
          <router-link to="/orders" @click="mobileOpen=false" class="block py-3 text-xs font-bold tracking-widest uppercase text-white border-b border-white/10">My Orders</router-link>
          <button @click="logout" class="block w-full text-left py-3 text-xs font-bold tracking-widest uppercase text-white">Logout</button>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import api from '../utils/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()

const mobileOpen = ref(false)
const activeMenu = ref(null)
const allCategories = ref([])
const scrolled = ref(false)

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Show 3 main categories in top nav
const navCategories = computed(() => allCategories.value.slice(0, 3))

const megaTiles = computed(() => [
  { label: 'Graphic Tees', link: '/products/graphic-tees', img: `${apiBase}/uploads/products/offwire_tee_1.jpeg` },
  { label: 'Anime Tees',   link: '/products/anime-tees',   img: `${apiBase}/uploads/products/offwire_tee_3.jpeg` },
  { label: 'Vintage Wash', link: '/products/vintage-wash', img: `${apiBase}/uploads/products/offwire_tee_4.jpeg` },
])

// Transparent over hero, black once scrolled or on inner pages
const isHero = computed(() => route.path === '/')
const navBg = computed(() => {
  if (!isHero.value || scrolled.value) return 'bg-black'
  return 'bg-transparent'
})

const handleScroll = () => { scrolled.value = window.scrollY > 80 }

const fetchCategories = async () => {
  try {
    const res = await api.get('/categories')
    allCategories.value = res.data.data
  } catch {}
}

const logout = () => {
  authStore.logout()
  cartStore.items = []
  mobileOpen.value = false
  router.push('/')
}

onMounted(() => {
  fetchCategories()
  window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>
