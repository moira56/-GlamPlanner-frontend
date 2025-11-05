<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const token = ref(localStorage.getItem("token"));
const isAuthed = computed(() => !!token.value);

function handleStorage(e) {
  if (e.key === "token") token.value = e.newValue;
}
onMounted(() => window.addEventListener("storage", handleStorage));
onUnmounted(() => window.removeEventListener("storage", handleStorage));

function go(path) {
  if (route.path !== path) router.push(path);
}
function logout() {
  localStorage.removeItem("token");
  token.value = null;
  router.push("/login");
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
        <button class="link" @click="go('/gallery')">Galerija</button>
        <button class="link active">Savjeti</button>
        <button class="link" @click="go('/about')">O aplikaciji</button>
      </nav>

      <div class="nav-right">
        <template v-if="isAuthed">
          <button class="btn cta" @click="go('/events/new')">
            + Novi događaj
          </button>
          <div class="divider"></div>
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
      <section class="tips-hero">
        <h1>💄 Make-up savjeti za svaku priliku</h1>
        <p>
          Otkrij profesionalne trikove i preporuke za savršen izgled — bez
          obzira na događaj.
        </p>
      </section>

      <section class="tips-grid">
        <div class="tip-card">
          <h2>Dnevni look</h2>
          <p>
            Koristi laganu podlogu, svijetle tonove sjenila i sjajilo za svjež,
            prirodan izgled.
          </p>
        </div>

        <div class="tip-card">
          <h2>Večernji glam</h2>
          <p>
            Tamna sjenila i highlighter uz ruž boje vina stvaraju elegantan
            večernji dojam.
          </p>
        </div>

        <div class="tip-card">
          <h2>Make-up za posao</h2>
          <p>
            Neutralne boje i mat teksture savršene su za profesionalan, uredan
            izgled tijekom dana.
          </p>
        </div>

        <div class="tip-card">
          <h2>Dugotrajnost</h2>
          <p>
            Koristi primer i fiksator u spreju — tvoj make-up će ostati postojan
            cijeli dan.
          </p>
        </div>

        <div class="tip-card">
          <h2>Za posebne prigode</h2>
          <p>
            Dodaj umjetne trepavice, naglasi jagodice i ne zaboravi sjaj —
            kamera će te voljeti!
          </p>
        </div>

        <div class="tip-card">
          <h2>Njega kože prije šminke</h2>
          <p>
            Očisti lice, nanesi hidratantnu kremu i primer prije šminkanja —
            dobra priprema kože ključna je za besprijekoran rezultat.
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

.tips {
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
  margin-top: calc(var(--nav-h) + 140px);
  padding: 350px 40px 80px;
  text-align: center;
}

.tips-hero h1 {
  font-size: 2.6rem;
  background: linear-gradient(90deg, var(--brand-accent), var(--brand-primary));
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 10px;
}

.tips-hero p {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 700px;
  margin: 0 auto 40px;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 22px;
  max-width: 1100px;
  margin: 0 auto;
}

.tip-card {
  background: rgba(34, 36, 40, 0.6);
  border-radius: 20px;
  padding: 24px 18px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
  transition: transform 0.2s ease, box-shadow 0.3s ease;
}

.tip-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.55);
  border-color: rgba(37, 150, 190, 0.5);
}

.tip-card h2 {
  margin-bottom: 10px;
  font-size: 1.3rem;
  color: #fff;
}

.tip-card p {
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
  .tips-hero h1 {
    font-size: 2rem;
  }
}
</style>
