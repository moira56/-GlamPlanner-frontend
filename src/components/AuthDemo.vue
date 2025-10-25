<script setup>
import { ref } from "vue";
import api from "../api";

const username = ref("");
const password = ref("");
const message = ref("");
const token = ref(localStorage.getItem("token") || "");

async function registerUser() {
  message.value = "";
  try {
    const { data } = await api.post("/register", {
      username: username.value,
      password: password.value,
    });
    if (data.token) {
      localStorage.setItem("token", data.token);
      token.value = data.token;
    }
    message.value = `Registriran korisnik: ${data.username}`;
  } catch (err) {
    message.value = err?.response?.data?.message || "Greška pri registraciji";
  }
}

async function loginUser() {
  message.value = "";
  try {
    const { data } = await api.post("/login", {
      username: username.value,
      password: password.value,
    });
    localStorage.setItem("token", data.token);
    token.value = data.token;
    message.value = "Prijava uspješna ✔";
  } catch (err) {
    message.value = err?.response?.data?.message || "Greška pri prijavi";
  }
}

async function callProtected() {
  message.value = "";
  try {
    const { data } = await api.get("/protected");
    message.value = data.message;
  } catch (err) {
    message.value =
      err?.response?.data?.message || "Greška pri protected pozivu";
  }
}

function logout() {
  localStorage.removeItem("token");
  token.value = "";
  message.value = "Odjavljeno.";
}
</script>

<template>
  <main style="max-width: 600px; margin: 2rem auto; font-family: system-ui">
    <h1>Auth demo (Vue ↔ Express + JWT)</h1>

    <div style="display: flex; gap: 0.5rem; margin: 0.75rem 0">
      <input v-model="username" placeholder="username" />
      <input v-model="password" placeholder="password" type="password" />
    </div>

    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem">
      <button @click="registerUser">Register</button>
      <button @click="loginUser">Login</button>
      <button @click="callProtected" :disabled="!token">
        Call /api/protected
      </button>
      <button @click="logout" :disabled="!token">Logout</button>
    </div>

    <p><strong>Status:</strong> {{ message }}</p>
    <p>
      <strong>Token:</strong>
      <span style="word-break: break-all">{{ token || "(nema)" }}</span>
    </p>
  </main>
</template>
