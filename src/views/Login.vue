<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../api/api.js";

const router = useRouter();
const username = ref("");

const password = ref("");
const loading = ref(false);
const errorMsg = ref("");

async function login() {
  errorMsg.value = "";
  loading.value = true;
  try {
    const { data } = await api.post("/login", {
      username: username.value,
      password: password.value,
    });
    localStorage.setItem("token", data.token);
    router.push("/register");
  } catch (err) {
    errorMsg.value = err?.response?.data?.message || "Greška pri prijavi";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-bg">
    <div class="auth-card shadow">
      <h2 class="text-center title mb-3">Prijava</h2>

      <div v-if="errorMsg" class="alert alert-danger py-2">{{ errorMsg }}</div>

      <form @submit.prevent="login" class="d-grid gap-3">
        <div>
          <label class="form-label">Korisničko ime</label>
          <input v-model="username" class="form-control" required />
        </div>

        <div>
          <label class="form-label">Lozinka</label>
          <input
            v-model="password"
            type="password"
            class="form-control"
            required
          />
        </div>

        <button class="btn btn-primary w-100" :disabled="loading">
          {{ loading ? "Prijava…" : "Prijavi se" }}
        </button>

        <p class="text-center small mb-0">
          Nemaš račun?
          <router-link to="/register" class="link">Registriraj se</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: url("https://res.cloudinary.com/ditd1epqb/image/upload/v1761679654/background_make_up_cf3ayv.jpg")
    center center / cover no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  overflow: hidden;
}
.auth-card {
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(65, 53, 93, 0.15);
}
.title {
  color: var(--brand-dark);
}
.btn-primary {
  background: var(--brand-dark);
  border-color: var(--brand-dark);
}
.btn-primary:hover {
  background: #2f2544;
  border-color: #2f2544;
}
.form-label {
  color: var(--brand-dark);
  font-weight: 600;
}
.link {
  color: var(--brand-light);
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
}
</style>
