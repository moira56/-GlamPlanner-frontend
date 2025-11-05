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
</script>

<template>
  <div class="about">
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
        <button class="link active">O aplikaciji</button>
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

    <main class="main">
      <section class="intro">
        <div class="about-box">
          <h1>O aplikaciji <span>GlamPlanner</span></h1>

          <img
            class="about-image"
            src="https://res.cloudinary.com/ditd1epqb/image/upload/v1761988449/b43b13aa-91c6-4e65-8158-13816199e3d6_uiob8t.png"
            alt="Makeup look"
          />

          <p>
            <strong>GlamPlanner</strong> je tvoj digitalni beauty planer koji
            olakšava organizaciju i planiranje šminkanja za sve prigode — od
            svakodnevnih lookova do glamuroznih događaja.
          </p>
          <p>
            Aplikacija ti omogućuje da izgradiš vlastite planove, odabereš
            proizvode, spremiš slike svojih lookova i dobiješ inspiraciju kroz
            predloške i savjete.
          </p>

          <div class="features">
            <h2>Što sve možeš raditi?</h2>
            <ul>
              <li>Kreirati korake šminkanja prema tipu događaja</li>
              <li>Spremati i uspoređivati svoje lookove</li>
              <li>Koristiti predloške za različite prilike</li>
              <li>Dobivati savjete za stil i dugotrajnost make-upa</li>
            </ul>
          </div>

          <p class="end">
            GlamPlanner je tvoj beauty partner — jer svaka prilika zaslužuje
            planiran sjaj.
          </p>
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

.about {
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
.link:hover {
  border-bottom-color: var(--brand-primary);
  filter: brightness(1.08);
}
.link.active {
  border-bottom: 2px solid var(--brand-accent);
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

.main {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 60px 18px 10px;
}

.intro {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 1000px;
}

.about-box {
  width: 90%;
  padding: 40px 30px 45px;
  border-radius: 22px;
  backdrop-filter: blur(14px);
  background: linear-gradient(
    180deg,
    rgba(34, 36, 40, 0.45),
    rgba(34, 36, 40, 0.6)
  );
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 14px 50px rgba(0, 0, 0, 0.45);
  text-align: center;
  margin-left: -110px;
}
.about-image {
  width: 440px;
  max-width: 85%;
  margin: 0 auto 25px;
  display: block;
  border-radius: 20px;
  object-fit: cover;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
}

h1 {
  font-size: 2.4rem;
  margin-bottom: 24px;
  background: linear-gradient(90deg, var(--brand-accent), var(--brand-primary));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
h2 {
  margin-top: 18px;
  font-size: 1.4rem;
}
ul {
  list-style: none;
  padding: 0;
  margin-top: 8px;
}
li {
  margin: 6px 0;
  font-weight: 600;
}
.end {
  margin-top: 20px;
  font-style: italic;
  opacity: 0.9;
}

@media (max-width: 1000px) {
  .about-box {
    width: 90%;
    padding: 40px 24px 60px;
    margin-left: 0;
  }
  .about-image {
    width: 100%;
    max-width: 400px;
  }
}
</style>
