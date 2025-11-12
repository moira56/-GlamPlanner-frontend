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

const events = [
  {
    id: "vjenčanje",
    title: "Vjenčanje",
    desc: "Elegantan i dugotrajan make-up za tvoj poseban dan.",
    image:
      "https://res.cloudinary.com/ditd1epqb/image/upload/v1762361809/istockphoto-1190043570-612x612_cwqvey.jpg",
  },
  {
    id: "matura",
    title: "Matura",
    desc: "Sjaj i mladenački glam za nezaboravnu večer.",
    image:
      "https://res.cloudinary.com/ditd1epqb/image/upload/v1762361809/foto47599_cjyprf.jpg",
  },
  {
    id: "posao",
    title: "Poslovni sastanak",
    desc: "Diskretan i uredan make-up koji odiše profesionalnošću.",
    image:
      "https://res.cloudinary.com/ditd1epqb/image/upload/v1762361809/Board-meeting-image_dwcwbu.jpg",
  },
  {
    id: "rođendan",
    title: "Proslava rođendana",
    desc: "Veseli tonovi i blistav sjaj za slavlje do kasno u noć.",
    image:
      "https://res.cloudinary.com/ditd1epqb/image/upload/v1762361809/2021_09_shutterstock_1323618038-scaled_r82pzz.jpg",
  },
  {
    id: "večernji-izlazak",
    title: "Večernji izlazak",
    desc: "Smokey eyes i ruž boje vina — klasika koja nikad ne izlazi iz mode.",
    image:
      "https://res.cloudinary.com/ditd1epqb/image/upload/v1762361810/premium_photo-1661315452408-ab1839e8d468_e2lxag.jpg",
  },
  {
    id: "fotografiranje",
    title: "Fotografiranje",
    desc: "Besprijekoran ten i naglašene crte lica za kameru.",
    image:
      "https://res.cloudinary.com/ditd1epqb/image/upload/v1762361808/2-challenges-of-photo-shooting_pb95rb.jpg",
  },
];

function openEvent(event) {
  router.push(`/events/${event.id}`);
}
</script>

<template>
  <div class="events">
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
        <button class="link active">Događaji</button>
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
      <section class="events-hero">
        <h1>Odaberi događaj</h1>
        <p>
          Svaka prigoda zaslužuje poseban make-up plan — od romantičnih
          vjenčanja do poslovnih dana.
        </p>
      </section>

      <section class="events-grid">
        <div
          v-for="event in events"
          :key="event.id"
          class="event-card"
          @click="openEvent(event)"
        >
          <img :src="event.image" alt="" class="event-image" />
          <h2>{{ event.title }}</h2>
          <p>{{ event.desc }}</p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
:root {
  --brand-primary: #2596be;
  --brand-accent: #a65077;
  --nav-h: 90px;
}

.events {
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
  margin-top: calc(var(--nav-h) + 40px);
  padding: 60px 40px 80px;
  text-align: center;
}

.events-hero h1 {
  font-size: 2.6rem;
  background: linear-gradient(90deg, var(--brand-accent), var(--brand-primary));
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 10px;
}

.events-hero p {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 700px;
  margin: 0 auto 40px;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 22px;
  max-width: 1100px;
  margin: 0 auto;
}

.event-card {
  background: rgba(34, 36, 40, 0.6);
  border-radius: 20px;
  padding: 24px 18px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
  transition: transform 0.2s ease, box-shadow 0.3s ease;
  cursor: pointer;
}
.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.55);
  border-color: rgba(37, 150, 190, 0.5);
}
.event-card img {
  width: 100%;
  height: 160px;
  border-radius: 14px;
  object-fit: cover;
  margin-bottom: 10px;
}
.event-card h2 {
  margin-bottom: 6px;
  font-size: 1.3rem;
  color: #fff;
}
.event-card p {
  font-size: 1rem;
  opacity: 0.9;
}

@media (max-width: 820px) {
  .logo {
    width: 58px;
    height: 58px;
  }
  .nav-center {
    display: none;
  }
  .events-hero h1 {
    font-size: 2rem;
  }
}
</style>
