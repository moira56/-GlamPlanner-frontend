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
  <div class="home">
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
            <div class="divider" aria-hidden="true"></div>
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
      <section class="hero">
        <div class="glass">
          <h1 class="h-title">Dobrodošli u <span>GlamPlanner</span></h1>
          <p class="h-sub">
            Tvoj osobni planer šminkanja — isplaniraj korake, odaberi proizvode,
            spremi look i blistaj bez stresa.
          </p>
          <div class="cta-row">
            <button v-if="isAuthed" class="btn primary" @click="go('/events')">
              Pregledaj događaje
            </button>

            <button v-else class="btn primary" @click="go('/register')">
              Registriraj se besplatno
            </button>

            <button class="btn ghost" @click="go('/about')">
              Pogledaj kako radi
            </button>
          </div>
        </div>
      </section>

      <section class="features">
        <div class="f-grid">
          <article class="f-card" @click="go('/plans')">
            <h3>Brzi plan</h3>
            <p>
              Predloženi koraci šminkanja (bazni ten, oči, usne) – prilagodi ih
              svom događaju u par klikova.
            </p>
            <span class="f-link">Otvori planove →</span>
          </article>

          <article class="f-card" @click="go('/events')">
            <h3>Predlošci događaja</h3>
            <p>
              Vjenčanje, matura, poslovni sastanak… svaki predložak nosi primjer
              stila i vremensku liniju.
            </p>
            <span class="f-link">Pregled događaja →</span>
          </article>

          <article class="f-card" @click="go('/gallery')">
            <h3>Galerija lookova</h3>
            <p>
              Spremi fotografije nakon šminkanja, dodaj proizvode i zabilješke
              za savršenu reprizu.
            </p>
            <span class="f-link">Otvori galeriju →</span>
          </article>

          <article class="f-card" @click="go('/tips')">
            <h3>Savjeti po tipu događaja</h3>
            <p>
              Mat vs. dewy ten, dugotrajnost ruža, raspon nijansi – preporuke
              prema prigodi i trajanju.
            </p>
            <span class="f-link">Pročitaj savjete →</span>
          </article>
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
  --hero-h: 52vh;
}

.home {
  width: 100%;
  min-height: 100vh;
  color: #fff;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)),
    url("https://res.cloudinary.com/ditd1epqb/image/upload/v1761920929/pexels-pablo-gomez-2151419725-33614966_zhx1mo.jpg")
      center/cover no-repeat fixed;
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
  padding-top: calc(var(--nav-h) + 900px);
}

.hero {
  min-height: var(--hero-h);
  padding: 350px 18px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.glass {
  width: min(900px, 96vw);
  padding: 20px 22px 18px;
  border-radius: 20px;
  backdrop-filter: blur(14px);
  background: linear-gradient(
    180deg,
    rgba(34, 36, 40, 0.42),
    rgba(34, 36, 40, 0.52)
  );
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
  text-align: center;
}

.h-title {
  margin: 0 0 6px 0;
  font-size: clamp(26px, 3.8vw, 40px);
  font-weight: 900;
  color: #fff;
}
.h-title span {
  background: linear-gradient(90deg, var(--brand-accent), var(--brand-primary));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.h-sub {
  margin: 0 auto 12px;
  max-width: 720px;
  opacity: 0.95;
}
.cta-row {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}
.btn.primary {
  background: linear-gradient(
    135deg,
    var(--brand-accent),
    var(--brand-primary)
  );
}
.btn.ghost {
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.6);
}
.btn:hover {
  filter: brightness(1.05);
}

.features {
  margin-top: 20px;
  padding: 0 18px 36px;
}
.f-grid {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(4, 1fr);
}
.f-card {
  border-radius: 16px;
  padding: 16px 16px 14px;
  background: rgba(30, 32, 36, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.35);
  transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  cursor: pointer;
}
.f-card:hover {
  transform: translateY(-2px);
  border-color: rgba(37, 150, 190, 0.55);
  box-shadow: 0 20px 44px rgba(0, 0, 0, 0.45);
}
.f-card h3 {
  margin: 0 0 6px 0;
  font-size: 1.02rem;
  font-weight: 900;
}
.f-card p {
  margin: 0 0 10px 0;
  opacity: 0.95;
  font-size: 0.95rem;
}
.f-link {
  font-weight: 800;
  font-size: 0.92rem;
  background: linear-gradient(90deg, var(--brand-accent), var(--brand-primary));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

@media (max-width: 1180px) {
  .f-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 820px) {
  :root {
    --nav-h: 72px;
  }
  .logo {
    width: 58px;
    height: 58px;
  }
  .nav-center {
    display: none;
  }
  .f-grid {
    grid-template-columns: 1fr;
  }
}
</style>
