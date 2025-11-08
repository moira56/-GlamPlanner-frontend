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

const selectedLook = ref(null);

const looks = [
  {
    id: "natural",
    name: "Prirodni look 🌿",
    desc: "Lagani i prirodan izgled za svježinu tijekom dana.",
    products: [
      {
        img: "https://res.cloudinary.com/ditd1epqb/image/upload/v1762365688/rvob4mlfdt70_vvh2km.jpg",
        name: "Rumenilo",
      },
      {
        img: "https://res.cloudinary.com/ditd1epqb/image/upload/v1762365689/puow2hr6jttc_c7amga.jpg",
        name: "Maskara",
      },
      {
        img: "https://res.cloudinary.com/ditd1epqb/image/upload/v1762365685/melem-cold-cream-hranjivi-balzam-za-usne-_yyfocx.jpg",
        name: "Balzam za usne",
      },
      {
        img: "https://res.cloudinary.com/ditd1epqb/image/upload/v1762365685/Bionike-DEFENCE-Hydractive-SPF-15-BB-krema-40-ml_bhjyan.jpg",
        name: "BB krema",
      },
    ],
  },
  {
    id: "classic",
    name: "Klasični glam ✨",
    desc: "Elegantni i profinjeni make-up koji pristaje svakoj prigodi.",
    products: [
      {
        img: "https://res.cloudinary.com/ditd1epqb/image/upload/v1762000003/foundation_full.jpg",
        name: "Tečni puder s punom pokrivnošću",
      },
      {
        img: "https://res.cloudinary.com/ditd1epqb/image/upload/v1762000004/eyeshadow.jpg",
        name: "Zlatna sjenila",
      },
      {
        img: "https://res.cloudinary.com/ditd1epqb/image/upload/v1762000005/highlighter.jpg",
        name: "Highlighter",
      },
    ],
  },
  {
    id: "bold",
    name: "Intenzivni večernji look 💎",
    desc: "Smokey eyes, dramatične boje i dugotrajni završni sloj.",
    products: [
      {
        img: "https://res.cloudinary.com/ditd1epqb/image/upload/v1762000006/smokey.jpg",
        name: "Paleta tamnih sjenila",
      },
      {
        img: "https://res.cloudinary.com/ditd1epqb/image/upload/v1762000007/lipstick.jpg",
        name: "Mat ruž tamne boje",
      },
      {
        img: "https://res.cloudinary.com/ditd1epqb/image/upload/v1762000008/fixspray.jpg",
        name: "Fiksator šminke",
      },
    ],
  },
];
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
      <section class="details-hero">
        <h1>💋 Detalji događaja — {{ route.params.id.toUpperCase() }}</h1>
        <p>
          Ovdje možeš vidjeti preporučene stilove šminke za odabrani događaj i
          korake za savršen izgled.
        </p>
      </section>

      <div class="look-tabs">
        <div
          v-for="look in looks"
          :key="look.id"
          class="look-tab"
          :class="{ active: selectedLook === look.id }"
          @click="selectedLook = look.id"
        >
          {{ look.name }}
        </div>
      </div>

      <transition name="fade">
        <div
          v-if="
            selectedLook &&
            [
              'fotografiranje',
              'poslovni sastanak',
              'fotkanje',
              'posao',
            ].includes(route.params.id.toLowerCase())
          "
          class="detail-card"
        >
          <h2>{{ looks.find((l) => l.id === selectedLook)?.name }}</h2>
          <p class="look-desc">
            {{ looks.find((l) => l.id === selectedLook)?.desc }}
          </p>

          <div class="product-gallery">
            <div
              v-for="p in looks.find((l) => l.id === selectedLook)?.products"
              :key="p.name"
              class="product-card"
            >
              <img :src="p.img" :alt="p.name" />
              <span>{{ p.name }}</span>
            </div>
          </div>
        </div>

        <div v-else-if="selectedLook" class="detail-card">
          <h2>{{ looks.find((l) => l.id === selectedLook)?.name }}</h2>
          <p style="opacity: 0.85">
            Još nema preporučenih proizvoda za ovaj događaj. Bit će dodani
            uskoro. 💄
          </p>
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
.details-hero h1 {
  font-size: 2.6rem;
  background: linear-gradient(90deg, var(--brand-accent), var(--brand-primary));
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 10px;
}
.details-hero p {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 700px;
  margin: 0 auto 30px;
}

.look-tabs {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}
.look-tab {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 12px 22px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}
.look-tab:hover {
  border-color: var(--brand-primary);
  transform: translateY(-3px);
}
.look-tab.active {
  background: linear-gradient(
    135deg,
    var(--brand-accent),
    var(--brand-primary)
  );
  border-color: var(--brand-accent);
}

.detail-card {
  width: 100%;
  max-width: 1150px;
  margin: 0 auto;
  background: rgba(34, 36, 40, 0.8);
  border-radius: 24px;
  padding: 10px 60px 60px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.14);
  overflow-x: auto;
}
.look-desc {
  font-size: 1.1rem;
  margin-bottom: 24px;
  opacity: 0.95;
  text-align: left;
}

.product-gallery {
  display: flex;
  gap: 35px;
  justify-content: flex-start;
  align-items: flex-start;
  overflow-x: auto;
  padding-bottom: 20px;
}
.product-card {
  flex: 0 0 auto;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  padding: 16px;
  width: 340px;
  text-align: center;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.5);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.product-card:hover {
  transform: scale(1.06);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6);
}
.product-card img {
  width: 100%;
  height: 270px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 10px;
}
.product-card span {
  font-size: 1.1rem;
  font-weight: 700;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
