<template>
  <div class="min-h-screen bg-background py-8">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-primary mb-8">My Profile</h1>

      <!-- Not Logged In -->
      <div v-if="!authStore.isAuthenticated" class="bg-white rounded-2xl shadow-sm p-12 text-center">
        <p class="text-5xl mb-4">🔒</p>
        <h2 class="text-xl font-bold text-primary mb-2">Please sign in</h2>
        <router-link to="/login?redirect=/profile" class="bg-primary text-background px-6 py-3 rounded-lg font-semibold hover:bg-secondary transition-colors">Sign In</router-link>
      </div>

      <div v-else class="space-y-6">
        <!-- Profile Card -->
        <div class="bg-white rounded-2xl shadow-sm p-6">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-background text-2xl font-bold flex-shrink-0">
              {{ initials }}
            </div>
            <div>
              <h2 class="text-lg font-bold text-primary">{{ authStore.user?.first_name }} {{ authStore.user?.last_name }}</h2>
              <p class="text-secondary text-sm">{{ authStore.user?.email }}</p>
              <span class="inline-block mt-1 bg-light text-primary text-xs font-semibold px-2 py-0.5 rounded-full capitalize">{{ authStore.user?.role || 'Customer' }}</span>
            </div>
          </div>

          <!-- Success/Error Alerts -->
          <div v-if="successMsg" class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            ✅ {{ successMsg }}
          </div>
          <div v-if="errorMsg" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            ❌ {{ errorMsg }}
          </div>

          <!-- Edit Form -->
          <form @submit.prevent="handleSave" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-primary mb-1">First Name</label>
                <input
                  v-model="form.first_name"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-primary"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-primary mb-1">Last Name</label>
                <input
                  v-model="form.last_name"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-primary"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-primary mb-1">Email Address</label>
              <input
                :value="authStore.user?.email"
                type="email"
                disabled
                class="w-full px-4 py-3 border border-light rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <p class="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-primary mb-1">Phone Number</label>
              <input
                v-model="form.phone"
                type="tel"
                placeholder="+94 71 234 5678"
                class="w-full px-4 py-3 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-primary mb-1">Address</label>
              <textarea
                v-model="form.address"
                rows="2"
                placeholder="Your delivery address"
                class="w-full px-4 py-3 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-primary resize-none"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-primary mb-1">City</label>
                <input
                  v-model="form.city"
                  type="text"
                  placeholder="Colombo"
                  class="w-full px-4 py-3 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-primary"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-primary mb-1">Postal Code</label>
                <input
                  v-model="form.postal_code"
                  type="text"
                  placeholder="00100"
                  class="w-full px-4 py-3 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-primary"
                />
              </div>
            </div>

            <div class="pt-2">
              <button
                type="submit"
                :disabled="saving"
                class="w-full bg-primary text-background py-3 px-4 rounded-lg font-semibold hover:bg-secondary transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg v-if="saving" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Quick Links -->
        <div class="bg-white rounded-2xl shadow-sm p-6">
          <h3 class="font-bold text-primary mb-4">Quick Links</h3>
          <div class="space-y-3">
            <router-link to="/orders" class="flex items-center gap-3 text-secondary hover:text-primary transition-colors group">
              <span class="w-9 h-9 bg-background rounded-lg flex items-center justify-center group-hover:bg-light transition-colors">📦</span>
              <span class="font-medium">My Orders</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-auto" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </router-link>
            <router-link to="/cart" class="flex items-center gap-3 text-secondary hover:text-primary transition-colors group">
              <span class="w-9 h-9 bg-background rounded-lg flex items-center justify-center group-hover:bg-light transition-colors">🛒</span>
              <span class="font-medium">My Cart</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-auto" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </router-link>
          </div>

          <div class="border-t border-light mt-4 pt-4">
            <button
              @click="handleLogout"
              class="flex items-center gap-3 text-red-500 hover:text-red-700 transition-colors w-full group"
            >
              <span class="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">🚪</span>
              <span class="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const form = reactive({
  first_name: '',
  last_name: '',
  phone: '',
  address: '',
  city: '',
  postal_code: ''
})

const initials = computed(() => {
  const u = authStore.user
  if (!u) return '?'
  return ((u.first_name?.[0] || '') + (u.last_name?.[0] || '')).toUpperCase() || u.email?.[0]?.toUpperCase() || '?'
})

const populateForm = () => {
  const u = authStore.user
  if (!u) return
  form.first_name = u.first_name || ''
  form.last_name = u.last_name || ''
  form.phone = u.phone || ''
  form.address = u.address || ''
  form.city = u.city || ''
  form.postal_code = u.postal_code || ''
}

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await authStore.fetchProfile()
    populateForm()
  }
})

const handleSave = async () => {
  saving.value = true
  errorMsg.value = ''
  successMsg.value = ''

  const result = await authStore.updateProfile(form)
  saving.value = false

  if (result.success) {
    successMsg.value = 'Profile updated successfully!'
    setTimeout(() => { successMsg.value = '' }, 3000)
  } else {
    errorMsg.value = result.message || 'Failed to update profile'
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>
