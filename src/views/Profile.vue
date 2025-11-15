<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const API_BASE = "http://localhost:3000/api";

const router = useRouter();
const route = useRoute();

const token = ref(localStorage.getItem("token"));
const role = ref(localStorage.getItem("role"));
const isAuthed = computed(() => !!token.value);
const isAdmin = computed(() => role.value === "admin");

function handleStorage(e) {
  if (e.key === "token") token.value = e.newValue;
  if (e.key === "role") role.value = e.newValue;
}
onMounted(() => window.addEventListener("storage", handleStorage));
onUnmounted(() => window.removeEventListener("storage", handleStorage));

function go(path) {
  if (route.path !== path) router.push(path);
}
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  token.value = null;
  role.value = null;
  router.push("/login");
}

const loading = ref(false);
const saving = ref(false);
const errorMsg = ref("");

const username = ref("");
const firstName = ref("");
const lastName = ref("");
const avatarUrl = ref("");
const newAvatarFile = ref(null);
const newAvatarPreview = ref("");

async function fetchMe() {
  if (!isAuthed.value) return;
  loading.value = true;
  errorMsg.value = "";
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || "Neuspjelo dohvaćanje profila.");

    username.value = data.username || "";
    firstName.value = data.firstName || "";
    lastName.value = data.lastName || "";
    avatarUrl.value = data.avatarUrl || "";
  } catch (e) {
    errorMsg.value = e.message || "Greška pri dohvaćanju profila.";
  } finally {
    loading.value = false;
  }
}

function onAvatarChange(e) {
  const file = e.target.files?.[0];
  if (!file) {
    newAvatarFile.value = null;
    newAvatarPreview.value = "";
    return;
  }
  newAvatarFile.value = file;
  const reader = new FileReader();
  reader.onload = () => (newAvatarPreview.value = reader.result);
  reader.readAsDataURL(file);
}

async function saveProfile() {
  if (!isAuthed.value) {
    alert("Moraš biti prijavljena/prijavljen.");
    return;
  }

  saving.value = true;
  errorMsg.value = "";

  try {
    let finalAvatarUrl = avatarUrl.value;

    if (newAvatarFile.value) {
      const fd = new FormData();
      fd.append("file", newAvatarFile.value);

      const upRes = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: fd,
      });
      const upData = await upRes.json();
      if (!upRes.ok)
        throw new Error(upData.message || "Neuspješan upload slike.");
      finalAvatarUrl = upData.secure_url;
    }

    const patchRes = await fetch(`${API_BASE}/auth/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify({
        firstName: firstName.value || "",
        lastName: lastName.value || "",
        avatarUrl: finalAvatarUrl || "",
      }),
    });
    const patchData = await patchRes.json();
    if (!patchRes.ok)
      throw new Error(patchData.message || "Neuspjela izmjena profila.");

    avatarUrl.value = patchData.avatarUrl || finalAvatarUrl;
    firstName.value = patchData.firstName ?? firstName.value;
    lastName.value = patchData.lastName ?? lastName.value;

    newAvatarFile.value = null;
    newAvatarPreview.value = "";

    alert("Profil je ažuriran");
  } catch (e) {
    errorMsg.value = e.message || "Greška pri spremanju profila.";
  } finally {
    saving.value = false;
  }
}

onMounted(fetchMe);
</script>

<template>
  <div class="page-wrapper">
    <header class="nav">
      <div class="nav-left" @click="go('/')">
        <img
          class="logo"
          alt="GlamPlanner logo"
          src="https://res.cloudinary.com/ditd1epqb/image/upload/v1761924973/ChatGPT_Image_Oct_31_2025_04_34_28_PM_lvuud6.png"
        />
      </div>

      <nav class="nav-center">
        <button class="link" @click="go('/')">Početna</button>
        <button class="link" @click="go('/events')">Događaji</button>
        <button class="link" @click="go('/plans')">Planovi šminkanja</button>
        <button class="link" @click="go('/gallery')">Galerija</button>
        <button class="link" @click="go('/tips')">Savjeti</button>
        <button class="link" @click="go('/about')">O aplikaciji</button>
      </nav>

      <div class="nav-right">
        <template v-if="isAuthed">
          <template v-if="isAdmin">
            <button class="btn cta" @click="go('/events/new')">
              + Novi događaj
            </button>
            <div class="divider"></div>
          </template>
          <button class="link active" @click="go('/profile')">Profil</button>
          <button class="link" @click="logout">Odjava</button>
        </template>
        <template v-else>
          <button class="link" @click="go('/login')">Prijava</button>
          <button class="btn accent" @click="go('/register')">
            Registracija
          </button>
        </template>
      </div>
    </header>

    <main class="content">
      <section class="hero">
        <h1>👤 Moj profil</h1>
      </section>

      <section class="profile-card">
        <div class="left">
          <div class="avatar-wrap">
            <img
              v-if="newAvatarPreview || avatarUrl"
              :src="newAvatarPreview || avatarUrl"
              alt="Avatar"
            />
            <div v-else class="avatar-fallback">
              {{ username?.[0]?.toUpperCase() || "U" }}
            </div>
          </div>

          <label class="upload-btn">
            <input type="file" accept="image/*" @change="onAvatarChange" />
            Promijeni sliku
          </label>
        </div>

        <div class="right">
          <div class="row">
            <label>Korisničko ime</label>
            <input type="text" :value="username" disabled />
          </div>

          <div class="grid">
            <div class="row">
              <label>Ime</label>
              <input v-model="firstName" type="text" placeholder="Unesi ime" />
            </div>
            <div class="row">
              <label>Prezime</label>
              <input
                v-model="lastName"
                type="text"
                placeholder="Unesi prezime"
              />
            </div>
          </div>

          <div v-if="loading" class="note">Učitavanje profila…</div>
          <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
        </div>
      </section>
    </main>
  </div>
</template>

<style>
html,
body,
#app {
  min-height: 100vh !important;
  height: auto !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
}
*,
*::before,
*::after {
  box-sizing: border-box;
}
body {
  -webkit-overflow-scrolling: touch;
}
</style>

<style scoped>
:root {
  --brand-primary: #2596be;
  --brand-accent: #a65077;
  --nav-h: 90px;
}

.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--nav-h);
  z-index: 100;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 18px;
  padding: 0 24px;
  backdrop-filter: blur(10px);
  background: rgba(20, 22, 24, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
}
.logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 14px;
  cursor: pointer;
}
.nav-center {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}
.nav-right {
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: flex-end;
}
.link {
  background: none;
  border: none;
  color: #fff;
  font-weight: 800;
  cursor: pointer;
  padding: 12px 8px;
  border-bottom: 2px solid transparent;
}
.link.active {
  border-bottom: 2px solid var(--brand-accent);
}
.link:hover {
  border-bottom-color: var(--brand-primary);
}
.btn {
  border: none;
  cursor: pointer;
  color: #fff;
  font-weight: 800;
  padding: 10px 16px;
  border-radius: 999px;
}
.btn.accent {
  background: linear-gradient(
    135deg,
    var(--brand-accent),
    var(--brand-primary)
  );
}
.btn.cta {
  background: linear-gradient(
    135deg,
    var(--brand-primary),
    var(--brand-accent)
  );
}
.divider {
  width: 1px;
  height: 26px;
  background: rgba(255, 255, 255, 0.25);
  margin: 0 6px;
}

.content {
  margin-top: calc(var(--nav-h) + 110px);
  padding: 350px 24px 180px;
  text-align: center;
}
.hero h1 {
  font-size: 2.2rem;
  background: linear-gradient(90deg, var(--brand-accent), var(--brand-primary));
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 16px;
}

.profile-card {
  max-width: 1000px;
  margin: 0 auto;
  background: rgba(34, 36, 40, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 22px;
  padding: 26px;
  color: #fff;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
}
@media (max-width: 900px) {
  .profile-card {
    grid-template-columns: 1fr;
    text-align: left;
  }
}

.left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.avatar-wrap {
  width: 160px;
  height: 160px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5);
}
.avatar-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.avatar-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-weight: 900;
  font-size: 3rem;
  color: #fff;
  opacity: 0.9;
}

.upload-btn {
  display: inline-block;
  cursor: pointer;
  padding: 10px 14px;
  border-radius: 999px;
  background: linear-gradient(
    135deg,
    var(--brand-accent),
    var(--brand-primary)
  );
  color: #fff;
  font-weight: 800;
  border: 1px solid rgba(255, 255, 255, 0.25);
}
.upload-btn input {
  display: none;
}
.help {
  opacity: 0.9;
  font-size: 0.95rem;
}

.right {
  text-align: left;
}
.row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 32px;
  row-gap: 16px;
}

@media (max-width: 600px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

label {
  font-weight: 700;
  opacity: 0.95;
}
input[type="text"] {
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  border: none;
  outline: none;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.actions {
  margin-top: 10px;
}
.btn.save {
  background: linear-gradient(
    135deg,
    var(--brand-primary),
    var(--brand-accent)
  );
}
.btn.save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.note {
  margin-top: 10px;
  opacity: 0.9;
}
.error {
  margin-top: 10px;
  color: #ff9d9d;
  font-weight: 700;
}
</style>
