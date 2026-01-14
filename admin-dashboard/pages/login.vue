<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>Super Admin Login</h1>
          <p>Enter your credentials to access the admin panel</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">Username</label>
            <InputText
              id="username"
              v-model="form.username"
              placeholder="Enter username"
              class="w-full"
              :class="{ 'p-invalid': errors.username }"
              autocomplete="username"
            />
            <small v-if="errors.username" class="p-error">{{ errors.username }}</small>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <Password
              id="password"
              v-model="form.password"
              placeholder="Enter password"
              class="w-full"
              :class="{ 'p-invalid': errors.password }"
              :feedback="false"
              toggle-mask
              autocomplete="current-password"
            />
            <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
          </div>

          <div v-if="errorMessage" class="error-message">
            <Message severity="error">{{ errorMessage }}</Message>
          </div>

          <Button
            type="submit"
            label="Login"
            :loading="loading"
            class="w-full"
            size="large"
          />
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'
import { onMounted, reactive, ref } from 'vue'
import { useSuperAdminAuth } from '~/composables/useSuperAdminAuth'

definePageMeta({
  layout: false,
})

const auth = useSuperAdminAuth()
const loading = ref(false)
const errorMessage = ref('')
const errors = reactive({
  username: '',
  password: '',
})

const form = reactive({
  username: '',
  password: '',
})

function validate() {
  errors.username = ''
  errors.password = ''
  let valid = true

  if (!form.username) {
    errors.username = 'Username is required'
    valid = false
  }

  if (!form.password) {
    errors.password = 'Password is required'
    valid = false
  }

  return valid
}

async function handleLogin() {
  errorMessage.value = ''

  if (!validate()) {
    return
  }

  loading.value = true

  try {
    const result = await auth.login(form.username, form.password)

    if (result.success) {
      // Redirect to content page
      await navigateTo('/content')
    } else {
      errorMessage.value = result.error || 'Login failed'
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'An error occurred during login'
  } finally {
    loading.value = false
  }
}

// Redirect if already authenticated
onMounted(async () => {
  if (auth.isAuthenticated.value) {
    const isValid = await auth.verifyToken()
    if (isValid) {
      await navigateTo('/content')
    }
  }
})
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
  font-size: 1.75rem;
}

.login-header p {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--text-color);
}

.error-message {
  margin-top: -0.5rem;
}
</style>
