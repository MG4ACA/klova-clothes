<template>
  <nav
    class="sticky top-0 z-50 transition-all duration-300"
    :class="scrolled ? 'bg-white border-b border-border shadow-sm' : 'bg-transparent'"
  >
    <div class="max-w-7xl mx-auto px-6 lg:px-12">
      <div class="flex justify-between items-center h-16">

        <!-- Logo -->
        <router-link to="/" class="flex items-center">
          <span
            class="text-2xl font-black tracking-tighter transition-colors"
            :class="scrolled || !isHomePage ? 'text-primary' : 'text-white'"
          >KLOVA</span>
        </router-link>

        <!-- Desktop Nav -->
        <div class="hidden md:flex items-center gap-8">
          <router-link
            to="/"
            class="text-xs font-semibold tracking-widest uppercase transition-colors"
            :class="scrolled || !isHomePage ? 'text-primary hover:text-light' : 'text-white/80 hover:text-white'"
          >Home</router-link>

          <router-link
            to="/products"
            class="text-xs font-semibold tracking-widest uppercase transition-colors"
            :class="scrolled || !isHomePage ? 'text-primary hover:text-light' : 'text-white/80 hover:text-white'"
          >Shop</router-link>

          <!-- Category Dropdown -->
          <div class="relative group">
            <button
              class="text-xs font-semibold tracking-widest uppercase transition-colors flex items-center gap-1"
              :class="scrolled || !isHomePage ? 'text-primary hover:text-light' : 'text-white/80 hover:text-white'"
            >
              Categories
              <ChevronDownIcon class="h-3 w-3" />
            </button>
            <div class="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div class="bg-white border border-border shadow-xl py-2 min-w-[160px]">
                <router-link
                  v-for="category in categories"
                  :key="category.id"
                  :to="`/products/${category.slug}`"
                  class="block px-5 py-2.5 text-xs font-semibold tracking-widest uppercase text-primary hover:bg-muted transition-colors"
                >{{ category.name }}</router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side -->
        <div class="flex items-center gap-5">
          <!-- Cart -->
          <router-link to="/cart" class="relative transition-colors" :class="scrolled || !isHomePage ? 'text-primary hover:text-light' : 'text-white hover:text-white/70'">
            <ShoppingCartIcon class="h-5 w-5" />
            <span
              v-if="cartStore.totalQuantity > 0"
              class="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold text-[10px]"
              :class="scrolled || !isHomePage ? '' : 'bg-white !text-primary'"
            >
              {{ cartStore.totalQuantity }}
            </span>
          </router-link>

          <!-- Auth -->
          <div v-if="!authStore.isAuthenticated" class="hidden md:flex items-center gap-3">
            <router-link
              to="/login"
              class="text-xs font-semibold tracking-widest uppercase transition-colors"
              :class="scrolled || !isHomePage ? 'text-primary hover:text-light' : 'text-white/80 hover:text-white'"
            >Login</router-link>
            <router-link
              to="/register"
              class="text-xs font-bold tracking-widest uppercase px-4 py-2 transition-all"
              :class="scrolled || !isHomePage ? 'bg-primary text-white hover:bg-secondary' : 'bg-white text-primary hover:bg-gray-100'"
            >Register</router-link>
          </div>

          <!-- User Menu -->
          <div v-else class="relative group hidden md:block">
            <button
              class="flex items-center gap-1 text-xs font-semibold tracking-widest uppercase transition-colors"
              :class="scrolled || !isHomePage ? 'text-primary hover:text-light' : 'text-white/80 hover:text-white'"
            >
              <UserIcon class="h-4 w-4" />
              <span>{{ authStore.user?.firstName || 'Account' }}</span>
              <ChevronDownIcon class="h-3 w-3" />
            </button>
            <div class="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div class="bg-white border border-border shadow-xl py-2 min-w-[160px]">
                <router-link to="/profile" class="block px-5 py-2.5 text-xs font-semibold tracking-widest uppercase text-primary hover:bg-muted transition-colors">Profile</router-link>
                <router-link to="/orders" class="block px-5 py-2.5 text-xs font-semibold tracking-widest uppercase text-primary hover:bg-muted transition-colors">My Orders</router-link>
                <router-link v-if="authStore.isAdmin" to="/admin" class="block px-5 py-2.5 text-xs font-semibold tracking-widest uppercase text-primary hover:bg-muted transition-colors">Admin Panel</router-link>
                <div class="border-t border-border my-1"></div>
                <button @click="logout" class="block w-full text-left px-5 py-2.5 text-xs font-semibold tracking-widest uppercase text-primary hover:bg-muted transition-colors">Logout</button>
              </div>
            </div>
          </div>

          <!-- Mobile burger -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden transition-colors"
            :class="scrolled || !isHomePage ? 'text-primary' : 'text-white'"
          >
            <Bars3Icon v-if="!mobileMenuOpen" class="h-6 w-6" />
            <XMarkIcon v-else class="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="mobileMenuOpen" class="md:hidden bg-white border-t border-border">
      <div class="px-6 py-6 space-y-1">
        <router-link to="/" @click="mobileMenuOpen = false" class="block py-3 text-xs font-semibold tracking-widest uppercase text-primary border-b border-border">Home</router-link>
        <router-link to="/products" @click="mobileMenuOpen = false" class="block py-3 text-xs font-semibold tracking-widest uppercase text-primary border-b border-border">Shop All</router-link>
        <router-link
          v-for="cat in categories" :key="cat.id"
          :to="`/products/${cat.slug}`"
          @click="mobileMenuOpen = false"
          class="block py-3 text-xs font-semibold tracking-widest uppercase text-light border-b border-border pl-3"
        >{{ cat.name }}</router-link>

        <template v-if="!authStore.isAuthenticated">
          <router-link to="/login" @click="mobileMenuOpen = false" class="block py-3 text-xs font-semibold tracking-widest uppercase text-primary border-b border-border">Login</router-link>
          <router-link to="/register" @click="mobileMenuOpen = false" class="block py-3 text-xs font-semibold tracking-widest uppercase text-primary border-b border-border">Register</router-link>
        </template>
        <template v-else>
          <router-link to="/profile" @click="mobileMenuOpen = false" class="block py-3 text-xs font-semibold tracking-widest uppercase text-primary border-b border-border">Profile</router-link>
          <router-link to="/orders" @click="mobileMenuOpen = false" class="block py-3 text-xs font-semibold tracking-widest uppercase text-primary border-b border-border">My Orders</router-link>
          <router-link v-if="authStore.isAdmin" to="/admin" @click="mobileMenuOpen = false" class="block py-3 text-xs font-semibold tracking-widest uppercase text-primary border-b border-border">Admin Panel</router-link>
          <button @click="logout" class="block w-full text-left py-3 text-xs font-semibold tracking-widest uppercase text-primary">Logout</button>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import api from '../utils/api'
import {
  ShoppingCartIcon, UserIcon, ChevronDownIcon, Bars3Icon, XMarkIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()

const mobileMenuOpen = ref(false)
const categories = ref([])
const scrolled = ref(false)

const isHomePage = computed(() => route.path === '/')

const handleScroll = () => {
  scrolled.value = window.scrollY > 60
}

const fetchCategories = async () => {
  try {
    const response = await api.get('/categories')
    categories.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

const logout = () => {
  authStore.logout()
  cartStore.items = []
  mobileMenuOpen.value = false
  router.push('/')
}

onMounted(() => {
  fetchCategories()
  window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
