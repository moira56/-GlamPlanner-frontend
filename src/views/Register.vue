<script setup>
import { ref } from "vue";
import api from "../api/api.js";

const email = ref("");
const username = ref("");
const password = ref("");
const confirm = ref("");
const loading = ref(false);
const errorMsg = ref("");
const successMsg = ref("");

function resetMessages() {
  errorMsg.value = "";
  successMsg.value = "";
}

async function register() {
  resetMessages();
  if (password.value !== confirm.value) {
    errorMsg.value = "Lozinke se ne podudaraju.";
    return;
  }
  if (password.value.length < 8) {
    errorMsg.value = "Lozinka mora imati najmanje 8 znakova.";
    return;
  }
  loading.value = true;
  try {
    const { data } = await api.post("/register", {
      email: email.value,
      username: username.value,
      password: password.value,
    });
    localStorage.setItem("token", data.token);
    successMsg.value = "Registracija uspješna!";
  } catch (err) {
    errorMsg.value =
      err?.response?.data?.message ||
      err?.response?.data?.errors?.[0]?.msg ||
      "Greška pri registraciji.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-bg">
    <div class="auth-card">
      <h2 class="title">Registracija</h2>

      <p v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</p>
      <p v-if="successMsg" class="alert alert-success">{{ successMsg }}</p>

      <form class="auth-form" @submit.prevent="register">
        <div class="form-group">
          <label class="form-label">Korisničko ime</label>
          <input
            v-model="username"
            placeholder="Username"
            required
            minlength="3"
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            required
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Lozinka</label>
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            required
            minlength="8"
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Potvrdi lozinku</label>
          <input
            v-model="confirm"
            type="password"
            placeholder="Confirm password"
            required
            minlength="8"
            class="form-control"
          />
        </div>

        <button class="btn submit-btn" :disabled="loading">
          {{ loading ? "Registriram…" : "Registriraj se" }}
        </button>

        <p class="small note">
          Već imaš račun?
          <router-link to="/login" class="link">Prijava</router-link>
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
  color: #a65077;
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
.alert-success {
  background: rgba(37, 150, 190, 0.22);
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
  border-color: rgba(166, 80, 119, 0.9);
  box-shadow: 0 0 0 4px rgba(166, 80, 119, 0.28);
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
  border-bottom: 2px solid var(--brand-accent);
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
