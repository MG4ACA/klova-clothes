<template>
  <nav class="bg-primary shadow-lg sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex-shrink-0">
          <router-link to="/" class="flex items-center">
            <span class="text-2xl font-bold text-background">Klova</span>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-4">
            <router-link 
              to="/" 
              class="text-background hover:text-light px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </router-link>
            <router-link 
              to="/products" 
              class="text-background hover:text-light px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Products
            </router-link>
            
            <!-- Category Dropdown -->
            <div class="relative group">
              <button class="text-background hover:text-light px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                Categories
                <ChevronDownIcon class="ml-1 h-4 w-4" />
              </button>
              <div class="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div class="py-1">
                  <router-link 
                    v-for="category in categories" 
                    :key="category.id"
                    :to="`/products/${category.slug}`"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-light hover:text-primary transition-colors"
                  >
                    {{ category.name }}
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right side - Cart, Auth -->
        <div class="flex items-center space-x-4">
          <!-- Cart -->
          <router-link 
            to="/cart" 
            class="relative text-background hover:text-light transition-colors"
          >
            <ShoppingCartIcon class="h-6 w-6" />
            <span 
              v-if="cartStore.totalQuantity > 0"
              class="absolute -top-2 -right-2 bg-accent text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
            >
              {{ cartStore.totalQuantity }}
            </span>
          </router-link>

          <!-- Auth Links -->
          <div v-if="!authStore.isAuthenticated" class="flex items-center space-x-2">
            <router-link 
              to="/login" 
              class="text-background hover:text-light px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Login
            </router-link>
            <router-link 
              to="/register" 
              class="bg-accent text-primary hover:bg-light px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Register
            </router-link>
          </div>

          <!-- User Menu -->
          <div v-else class="relative group">
            <button class="flex items-center text-background hover:text-light transition-colors">
              <UserIcon class="h-6 w-6 mr-1" />
              <span class="text-sm font-medium">{{ authStore.user?.firstName }}</span>
              <ChevronDownIcon class="ml-1 h-4 w-4" />
            </button>
            <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div class="py-1">
                <router-link 
                  to="/profile" 
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-light hover:text-primary transition-colors"
                >
                  Profile
                </router-link>
                <router-link 
                  to="/orders" 
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-light hover:text-primary transition-colors"
                >
                  My Orders
                </router-link>
                <router-link 
                  v-if="authStore.isAdmin"
                  to="/admin" 
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-light hover:text-primary transition-colors"
                >
                  Admin Panel
                </router-link>
                <button 
                  @click="logout"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-light hover:text-primary transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <!-- Mobile menu button -->
          <button 
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden text-background hover:text-light transition-colors"
          >
            <Bars3Icon v-if="!mobileMenuOpen" class="h-6 w-6" />
            <XMarkIcon v-else class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div v-if="mobileMenuOpen" class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-secondary rounded-b-lg">
          <router-link 
            to="/" 
            @click="mobileMenuOpen = false"
            class="text-background hover:text-light block px-3 py-2 rounded-md text-base font-medium transition-colors"
          >
            Home
          </router-link>
          <router-link 
            to="/products" 
            @click="mobileMenuOpen = false"
            class="text-background hover:text-light block px-3 py-2 rounded-md text-base font-medium transition-colors"
          >
            Products
          </router-link>
          
          <!-- Mobile Categories -->
          <div class="pl-4 space-y-1">
            <router-link 
              v-for="category in categories" 
              :key="category.id"
              :to="`/products/${category.slug}`"
              @click="mobileMenuOpen = false"
              class="text-light hover:text-background block px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {{ category.name }}
            </router-link>
          </div>

          <!-- Mobile Auth -->
          <div v-if="!authStore.isAuthenticated" class="pt-4 border-t border-accent">
            <router-link 
              to="/login" 
              @click="mobileMenuOpen = false"
              class="text-background hover:text-light block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Login
            </router-link>
            <router-link 
              to="/register" 
              @click="mobileMenuOpen = false"
              class="text-background hover:text-light block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Register
            </router-link>
          </div>
          
          <div v-else class="pt-4 border-t border-accent">
            <router-link 
              to="/profile" 
              @click="mobileMenuOpen = false"
              class="text-background hover:text-light block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Profile
            </router-link>
            <router-link 
              to="/orders" 
              @click="mobileMenuOpen = false"
              class="text-background hover:text-light block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              My Orders
            </router-link>
            <router-link 
              v-if="authStore.isAdmin"
              to="/admin" 
              @click="mobileMenuOpen = false"
              class="text-background hover:text-light block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Admin Panel
            </router-link>
            <button 
              @click="logout"
              class="text-background hover:text-light block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import api from '../utils/api'
import {
  ShoppingCartIcon,
  UserIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const mobileMenuOpen = ref(false)
const categories = ref([])

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
})
</script>
