<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import api from "../api/api.js";

const router = useRouter();
const route = useRoute();
const eventId = computed(() => route.params.id);

const token = ref(localStorage.getItem("token"));
const role = ref(localStorage.getItem("role"));
const isAuthed = computed(() => !!token.value);
const isAdmin = computed(() => role.value === "admin");

const event = ref(null);
const loading = ref(true);
const errorMsg = ref("");

const fullscreenImg = ref(null);

async function fetchEventDetails() {
  loading.value = true;
  try {
    const { data } = await api.get(`/events/${eventId.value}`);
    event.value = data;
  } catch (err) {
    errorMsg.value = "Događaj nije pronađen.";
    console.error(err);
  } finally {
    loading.value = false;
  }
}

function handleStorage(e) {
  if (e.key === "token") token.value = e.newValue;
  if (e.key === "role") role.value = e.newValue;
}

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

async function deleteEvent() {
  if (
    !confirm(
      "Jeste li sigurni da želite TRAJNO obrisati ovaj događaj i sve njegove slike? Ova akcija se ne može poništiti."
    )
  ) {
    return;
  }
  try {
    await api.delete(`/events/${eventId.value}`);
    router.push("/events");
  } catch (err) {
    errorMsg.value = "Greška pri brisanju događaja.";
    console.error(err);
  }
}

function openImage(url) {
  fullscreenImg.value = url;
}
function closeImage() {
  fullscreenImg.value = null;
}

onMounted(() => {
  fetchEventDetails();
  window.addEventListener("storage", handleStorage);
});

onUnmounted(() => {
  window.removeEventListener("storage", handleStorage);
});
</script>

<template>
  <div class="details">
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
        <button class="link active" @click="go('/events')">Događaji</button>
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
          <button class="link" @click="go('/profile')">Profil</button>
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
      <div v-if="loading" class="state-info">Učitavanje...</div>
      <div v-else-if="errorMsg" class="state-info error">{{ errorMsg }}</div>
      <template v-else-if="event">
        <section class="details-hero">
          <h1>{{ event.title }}</h1>
          <p>{{ event.description }}</p>
          <div v-if="isAdmin" class="admin-actions">
            <button class="btn cta" @click="go(`/events/edit/${event._id}`)">
              Uredi Događaj
            </button>
            <button class="btn delete" @click="deleteEvent">
              Obriši Događaj
            </button>
          </div>
        </section>

        <div class="detail-card">
          <h2>Preporučeni proizvodi</h2>
          <div
            v-if="event.contentImageUrls && event.contentImageUrls.length > 0"
            class="image-gallery"
          >
            <div
              v-for="url in event.contentImageUrls"
              :key="url"
              class="image-card"
              @click="openImage(url)"
            >
              <img :src="url" :alt="event.title" />
            </div>
          </div>
          <p v-else class="empty-gallery">
            Nema dodatnih slika za ovaj događaj.
          </p>
        </div>
      </template>
    </main>

    <transition name="fade">
      <div v-if="fullscreenImg" class="fullscreen" @click="closeImage">
        <img :src="fullscreenImg" alt="Povećana slika" />
      </div>
    </transition>
  </div>
</template>

<style scoped>
:root {
  --brand-primary: #2596be;
  --brand-accent: #a65077;
  --nav-h: 90px;
}

.details {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)),
    url("https://res.cloudinary.com/ditd1epqb/image/upload/v1761920929/pexels-pablo-gomez-2151419725-33614966_zhx1mo.jpg")
      center/cover no-repeat fixed;
  color: #fff;
  overflow-x: hidden;
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
  color: #fff;
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
  margin-top: calc(var(--nav-h) + 80px);
  padding: 100px 40px 80px;
  text-align: center;
}

.details-hero {
  margin-bottom: 60px;
}
.details-hero h1 {
  font-size: 2.8rem;
  background: linear-gradient(90deg, var(--brand-accent), var(--brand-primary));
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 16px;
}
.details-hero p {
  max-width: 700px;
  margin: 0 auto 24px;
  font-size: 1.1rem;
  opacity: 0.9;
}

.admin-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}
.btn.delete {
  background: #a83232;
}

.detail-card {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  background: rgba(34, 36, 40, 0.8);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.14);
}
.detail-card h2 {
  margin-bottom: 30px;
  font-size: 1.8rem;
  text-align: center;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.image-card {
  cursor: zoom-in;
}
.image-card img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 16px;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
.image-card:hover img {
  transform: scale(1.03);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.state-info {
  font-size: 1.2rem;
}
.state-info.error {
  color: #ff9d9d;
}
.empty-gallery {
  opacity: 0.8;
}

.fullscreen {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 250;
}
.fullscreen img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 16px;
  cursor: zoom-out;
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

@media (max-width: 1200px) {
  .image-gallery {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 800px) {
  .image-gallery {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 500px) {
  .image-gallery {
    grid-template-columns: 1fr;
  }
}
</style>
