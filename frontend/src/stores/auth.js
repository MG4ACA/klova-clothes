import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../utils/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Set token in axios headers if it exists
  if (token.value) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  const login = async (credentials) => {
    loading.value = true
    try {
      const response = await api.post('/auth/login', credentials)
      const { user: userData, token: userToken } = response.data.data

      user.value = userData
      token.value = userToken
      
      localStorage.setItem('token', userToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      }
    } finally {
      loading.value = false
    }
  }

  const register = async (userData) => {
    loading.value = true
    try {
      const response = await api.post('/auth/register', userData)
      const { user: newUser, token: userToken } = response.data.data

      user.value = newUser
      token.value = userToken
      
      localStorage.setItem('token', userToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }

  const fetchProfile = async () => {
    if (!token.value) return

    try {
      const response = await api.get('/auth/profile')
      user.value = response.data.data
    } catch (error) {
      if (error.response?.status === 401) {
        logout()
      }
    }
  }

  const updateProfile = async (profileData) => {
    loading.value = true
    try {
      await api.put('/auth/profile', profileData)
      // Refresh profile data
      await fetchProfile()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed'
      }
    } finally {
      loading.value = false
    }
  }

  // Initialize user data if token exists
  if (token.value && !user.value) {
    fetchProfile()
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchProfile,
    updateProfile
  }
})
