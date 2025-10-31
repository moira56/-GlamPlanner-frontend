<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../api/api.js";

const router = useRouter();
const identifier = ref("");
const password = ref("");
const loading = ref(false);
const errorMsg = ref("");

async function login() {
  errorMsg.value = "";
  loading.value = true;
  try {
    const isEmail = identifier.value.includes("@");
    const payload = isEmail
      ? { email: identifier.value, password: password.value }
      : { username: identifier.value, password: password.value };
    const { data } = await api.post("/login", payload);
    localStorage.setItem("token", data.token);
    router.push("/register");
  } catch (err) {
    errorMsg.value =
      err?.response?.data?.message ||
      err?.response?.data?.errors?.[0]?.msg ||
      "Greška pri prijavi";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-bg">
    <div class="auth-card">
      <h2 class="title">Prijava</h2>

      <p v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</p>

      <form @submit.prevent="login" class="auth-form">
        <div class="form-group">
          <label class="form-label">Email ili korisničko ime</label>
          <input
            v-model="identifier"
            type="text"
            class="form-control"
            required
            placeholder="Unesi email ili korisničko ime"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Lozinka</label>
          <input
            v-model="password"
            type="password"
            class="form-control"
            required
            placeholder="Lozinka"
          />
        </div>

        <button class="btn submit-btn" :disabled="loading">
          {{ loading ? "Prijava…" : "Prijavi se" }}
        </button>

        <p class="small note">
          Nemaš račun?
          <router-link to="/register" class="link">Registriraj se</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
:root {
  --brand-primary: #2596be;
  --brand-accent: #a65077;
  --glass: rgba(34, 36, 40, 0.42);
  --glass-deep: rgba(34, 36, 40, 0.52);
  --text: #ffffff;
}

.auth-bg {
  position: fixed;
  inset: 0;
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)),
    url("https://res.cloudinary.com/ditd1epqb/image/upload/v1761920929/pexels-pablo-gomez-2151419725-33614966_zhx1mo.jpg")
      center/cover no-repeat;
}

.auth-card {
  width: min(760px, 96vw);
  border-radius: 22px;
  padding: 28px 28px 22px;
  backdrop-filter: blur(14px);
  background: linear-gradient(180deg, var(--glass), var(--glass-deep));
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45);
  color: var(--text);
}

.title {
  margin: 0 0 14px 0;
  font-weight: 900;
  font-size: 28px;
  letter-spacing: 0.3px;
  text-align: center;
  color: #2596be;
}

.alert {
  text-align: center;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  font-size: 14px;
  margin-bottom: 10px;
  color: #fff;
}
.alert-danger {
  background: rgba(166, 80, 119, 0.22);
}

.auth-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  color: #ffffff;
  font-weight: 700;
  margin-bottom: 6px;
  font-size: 14px;
}

.form-control {
  height: 46px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  padding: 0 12px;
  transition: 0.2s ease;
}
.form-control::placeholder {
  color: rgba(255, 255, 255, 0.95);
}
.form-control:focus {
  outline: none;
  border-color: rgba(37, 150, 190, 0.9);
  box-shadow: 0 0 0 4px rgba(37, 150, 190, 0.28);
  background: rgba(255, 255, 255, 0.14);
}

.submit-btn {
  grid-column: 1 / -1;
  height: 48px;
  border-radius: 14px;
  border: none;
  font-weight: 800;
  letter-spacing: 0.2px;
  color: #ffffff;
  background: linear-gradient(
    135deg,
    var(--brand-accent),
    var(--brand-primary)
  );
  cursor: pointer;
  transition: transform 0.06s ease, filter 0.15s ease;
}
.submit-btn:hover {
  filter: brightness(1.03);
}
.submit-btn:active {
  transform: translateY(1px);
}
.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.note {
  grid-column: 1 / -1;
  text-align: right;
  margin: 6px 2px 0 0;
  color: #ffffff;
}
.link {
  color: #ffffff;
  text-decoration: none;
  font-weight: 800;
  padding-left: 6px;
  border-bottom: 2px solid var(--brand-primary);
}
.link:hover {
  opacity: 0.9;
}

@media (max-width: 760px) {
  .auth-bg {
    padding: 1.5rem;
  }
  .auth-card {
    padding: 22px 18px;
    border-radius: 18px;
  }
  .auth-form {
    grid-template-columns: 1fr;
  }
}
</style>
