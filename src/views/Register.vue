<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../api/api.js";

const router = useRouter();

const email = ref("");
const username = ref("");
const password = ref("");
const confirm = ref("");
const role = ref("user");

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
    const { data } = await api.post("/auth/register", {
      email: email.value.trim(),
      username: username.value.trim(),
      password: password.value,
      role: role.value,
    });

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.user?.role || "user");

    successMsg.value = "Registracija uspješna!";

    setTimeout(() => {
      router.push("/");
    }, 1000);
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
    <div class="stack">
      <router-link to="/" class="logo-link" aria-label="GlamPlanner početna">
        <img
          class="auth-logo"
          alt="GlamPlanner logo"
          src="https://res.cloudinary.com/ditd1epqb/image/upload/v1761924973/ChatGPT_Image_Oct_31_2025_04_34_28_PM_lvuud6.png"
        />
      </router-link>

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
              autocomplete="username"
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
              autocomplete="email"
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
              autocomplete="new-password"
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
              autocomplete="new-password"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Uloga</label>
            <select v-model="role" class="form-control">
              <option value="user">Korisnik</option>
              <option value="admin">Administrator</option>
            </select>
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
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)),
    url("https://res.cloudinary.com/ditd1epqb/image/upload/v1761920929/pexels-pablo-gomez-2151419725-33614966_zhx1mo.jpg")
      center/cover no-repeat;
}

.stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.logo-link {
  display: inline-block;
}

.auth-logo {
  width: clamp(200px, 16vw, 150px);
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 10px 22px rgba(0, 0, 0, 0.55));
  user-select: none;
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
  color: #fff;
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

.auth-card .form-control {
  height: 46px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.28) !important;
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
  caret-color: #ffffff;
  padding: 0 12px;
  transition: 0.2s ease;
  font-weight: 600;
}
.auth-card .form-control::placeholder {
  color: rgba(255, 255, 255, 0.9) !important;
}
.auth-card .form-control:focus {
  outline: none;
  border-color: rgba(166, 80, 119, 0.9) !important;
  box-shadow: 0 0 0 4px rgba(166, 80, 119, 0.28) !important;
  background: rgba(255, 255, 255, 0.18) !important;
}

select.form-control option {
  background-color: #222428;
  color: #fff;
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
