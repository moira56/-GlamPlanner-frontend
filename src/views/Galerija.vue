<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";

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

const newImageUrl = ref("");
const newImageDesc = ref("");
const fullscreenImg = ref(null);

const gallery = ref([
  {
    url: "https://res.cloudinary.com/ditd1epqb/image/upload/v1762368839/d5994ff8-8006-4523-ba75-d2c2f4e047e6_oecssj.png",
    desc: "Prirodni make-up sa sjajnim usnama i nježnim rumenilom — idealan za dnevne prilike.",
  },
  {
    url: "https://res.cloudinary.com/ditd1epqb/image/upload/v1762368837/c9eb81a5-b04e-4c64-8fbd-0042f456ba08_moxhrm.png",
    desc: "Lagani ten, maskara i nježna nijansa ruža — jednostavno i elegantno.",
  },
]);

function addImage() {
  if (!newImageUrl.value.trim()) return;
  gallery.value.push({
    url: newImageUrl.value,
    desc: newImageDesc.value || "Bez opisa.",
  });
  newImageUrl.value = "";
  newImageDesc.value = "";
}

function removeImage(index) {
  gallery.value.splice(index, 1);
}

function toggleFullscreen(image) {
  fullscreenImg.value = fullscreenImg.value === image ? null : image;
}
</script>

<template>
  <div class="tips">
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
        <button class="link active">Galerija</button>
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
      <section class="gallery-hero">
        <h1>📸 Galerija make-up lookova</h1>
        <p>
          Dodaj vlastite lookove, proizvode i savjete kako bi inspirirala druge
          korisnike.
        </p>
      </section>

      <section class="add-section" v-if="isAuthed">
        <input
          v-model="newImageUrl"
          type="text"
          placeholder="Zalijepi URL slike..."
        />
        <textarea
          v-model="newImageDesc"
          placeholder="Dodaj opis, savjet ili preporuku proizvoda..."
        ></textarea>
        <button class="btn accent" @click="addImage">Dodaj sliku</button>
      </section>

      <section class="gallery-grid">
        <div
          v-for="(image, index) in gallery"
          :key="index"
          class="gallery-item"
        >
          <img :src="image.url" alt="" @click="toggleFullscreen(image)" />
          <div class="overlay">
            <button
              v-if="isAdmin"
              class="delete-btn"
              @click.stop="removeImage(index)"
            >
              ✕
            </button>
          </div>
          <p class="desc">{{ image.desc }}</p>
        </div>
      </section>

      <transition name="fade">
        <div
          v-if="fullscreenImg"
          class="fullscreen"
          @click="toggleFullscreen(fullscreenImg)"
        >
          <img :src="fullscreenImg.url" alt="Fullscreen" />
        </div>
      </transition>
    </main>
  </div>
</template>

<style scoped>
:root {
  --brand-primary: #2596be;
  --brand-accent: #a65077;
  --nav-h: 90px;
}

.tips {
  width: 100%;
  min-height: 100vh;
  overflow-y: auto;
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
  margin-top: calc(var(--nav-h) + 140px);
  padding: 80px 40px 80px;
  text-align: center;
}

.gallery-hero h1 {
  font-size: 2.6rem;
  background: linear-gradient(90deg, var(--brand-accent), var(--brand-primary));
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 10px;
}
.gallery-hero p {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 700px;
  margin: 0 auto 40px;
}

.add-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
}
.add-section input,
.add-section textarea {
  width: 80%;
  max-width: 550px;
  padding: 10px 14px;
  border-radius: 10px;
  border: none;
  outline: none;
  font-size: 1rem;
}
.add-section textarea {
  resize: none;
  height: 80px;
}
.add-section .btn {
  padding: 10px 20px;
  font-weight: 700;
  border-radius: 999px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 22px;
  max-width: 1100px;
  margin: 0 auto;
}
.gallery-item {
  background: rgba(34, 36, 40, 0.6);
  border-radius: 20px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
  transition: transform 0.2s ease;
}
.gallery-item:hover {
  transform: scale(1.03);
}
.gallery-item img {
  width: 100%;
  height: 240px;
  object-fit: cover;
  border-radius: 16px;
  cursor: pointer;
}
.overlay {
  display: flex;
  justify-content: flex-end;
  padding-top: 6px;
}
.desc {
  font-size: 0.95rem;
  opacity: 0.9;
  margin-top: 8px;
  text-align: left;
}

.fullscreen {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 200;
}
.fullscreen img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 16px;
  cursor: zoom-out;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
