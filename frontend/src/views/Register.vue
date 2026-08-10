<template>
  <div class="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <!-- Top banner -->
        <div class="bg-gradient-to-r from-primary to-secondary px-8 py-8 text-center">
          <router-link to="/" class="inline-block">
            <span class="text-3xl font-bold text-background tracking-wide">Klova</span>
          </router-link>
          <p class="text-light mt-2 text-sm">Premium Fashion Store</p>
        </div>

        <!-- Form -->
        <div class="px-8 py-8">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-primary">Create Account</h2>
            <p class="text-secondary text-sm mt-1">Join the Klova family today</p>
          </div>

          <!-- Error Alert -->
          <div v-if="errorMsg" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            {{ errorMsg }}
          </div>

          <!-- Success Alert -->
          <div v-if="successMsg" class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            {{ successMsg }}
          </div>

          <form @submit.prevent="handleRegister" class="space-y-4">
            <!-- Name -->
            <div>
              <label for="name" class="block text-sm font-medium text-primary mb-1">Full Name</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                autocomplete="name"
                required
                placeholder="Gimhana Mithuranga"
                class="w-full px-4 py-3 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-primary placeholder-gray-400 transition-all"
                :class="{ 'border-red-400': errors.name }"
              />
              <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-primary mb-1">Email Address</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                required
                placeholder="you@example.com"
                class="w-full px-4 py-3 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-primary placeholder-gray-400 transition-all"
                :class="{ 'border-red-400': errors.email }"
              />
              <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
            </div>

            <!-- Phone (optional) -->
            <div>
              <label for="phone" class="block text-sm font-medium text-primary mb-1">Phone Number <span class="text-gray-400 text-xs">(optional)</span></label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                autocomplete="tel"
                placeholder="+94 71 234 5678"
                class="w-full px-4 py-3 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-primary placeholder-gray-400 transition-all"
              />
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-primary mb-1">Password</label>
              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  placeholder="At least 6 characters"
                  class="w-full px-4 py-3 pr-10 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-primary placeholder-gray-400 transition-all"
                  :class="{ 'border-red-400': errors.password }"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-secondary"
                >
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                </button>
              </div>
              <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-primary mb-1">Confirm Password</label>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                placeholder="Repeat your password"
                class="w-full px-4 py-3 border border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-primary placeholder-gray-400 transition-all"
                :class="{ 'border-red-400': errors.confirmPassword }"
              />
              <p v-if="errors.confirmPassword" class="text-red-500 text-xs mt-1">{{ errors.confirmPassword }}</p>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-primary text-background py-3 px-4 rounded-lg font-semibold hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              <svg v-if="loading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Creating Account...' : 'Create Account' }}
            </button>
          </form>

          <!-- Divider -->
          <div class="mt-6 text-center">
            <p class="text-secondary text-sm">
              Already have an account?
              <router-link to="/login" class="text-accent font-semibold hover:text-secondary transition-colors">
                Sign in
              </router-link>
            </p>
          </div>
        </div>
      </div>

      <!-- Back to shop -->
      <div class="text-center mt-4">
        <router-link to="/" class="text-secondary text-sm hover:text-primary transition-colors inline-flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Back to Shop
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const showPassword = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validate = () => {
  errors.name = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  let valid = true

  if (!form.name.trim()) {
    errors.name = 'Full name is required'
    valid = false
  }

  if (!form.email) {
    errors.email = 'Email is required'
    valid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Enter a valid email address'
    valid = false
  }

  if (!form.password) {
    errors.password = 'Password is required'
    valid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    valid = false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    valid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    valid = false
  }

  return valid
}

const handleRegister = async () => {
  if (!validate()) return

  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  const nameParts = form.name.trim().split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ') || ' '

  const result = await authStore.register({
    firstName,
    lastName,
    email: form.email,
    phone: form.phone || undefined,
    password: form.password
  })

  loading.value = false

  if (result.success) {
    router.push('/')
  } else {
    errorMsg.value = result.message || 'Registration failed. Please try again.'
  }
}
</script>
