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

const admins = ref([]);
const loadingAdmins = ref(false);
const selectedAdminId = ref("");
const userMessage = ref("");
const sendingUserMessage = ref(false);

const userPlans = ref([]);
const loadingUserPlans = ref(false);

const errorMsg = ref("");
const successMsg = ref("");

async function fetchAdmins() {
  if (!isAuthed.value || isAdmin.value) return;

  loadingAdmins.value = true;
  errorMsg.value = "";

  try {
    const res = await fetch(`${API_BASE}/auth/admins`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || "Neuspjelo dohvaćanje admina.");

    admins.value = data;
    if (data.length && !selectedAdminId.value) {
      selectedAdminId.value = data[0]._id || data[0].id;
    }
  } catch (err) {
    console.error(err);
    errorMsg.value = err.message || "Greška pri dohvaćanju admina.";
  } finally {
    loadingAdmins.value = false;
  }
}

async function fetchUserPlans() {
  if (!isAuthed.value || isAdmin.value) return;

  loadingUserPlans.value = true;
  try {
    const res = await fetch(`${API_BASE}/plans/user`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || "Neuspjelo dohvaćanje tvojih upita.");

    userPlans.value = data;
  } catch (err) {
    console.error(err);
    errorMsg.value = err.message || "Greška pri dohvaćanju tvojih upita.";
  } finally {
    loadingUserPlans.value = false;
  }
}

async function sendPlanRequest() {
  if (!isAuthed.value) {
    errorMsg.value = "Moraš biti prijavljena/prijavljen.";
    return;
  }
  if (!selectedAdminId.value) {
    errorMsg.value = "Odaberi admina.";
    return;
  }
  if (!userMessage.value.trim()) {
    errorMsg.value = "Upiši poruku za admina.";
    return;
  }

  sendingUserMessage.value = true;
  errorMsg.value = "";
  successMsg.value = "";

  try {
    const res = await fetch(`${API_BASE}/plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify({
        adminId: selectedAdminId.value,
        message: userMessage.value.trim(),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Neuspješno slanje upita.");

    userMessage.value = "";
    successMsg.value = "Upit je poslan odabranom adminu. 💄";

    fetchUserPlans();
  } catch (err) {
    console.error(err);
    errorMsg.value = err.message || "Greška pri slanju upita.";
  } finally {
    sendingUserMessage.value = false;
  }
}

const adminPlans = ref([]);
const loadingPlans = ref(false);

const replyText = ref({});
const replyFiles = ref({});
const sendingReply = ref({});

function getPlanId(plan) {
  return plan._id?.toString() || plan.id;
}

async function fetchAdminPlans() {
  if (!isAuthed.value || !isAdmin.value) return;

  loadingPlans.value = true;
  errorMsg.value = "";
  successMsg.value = "";

  try {
    const res = await fetch(`${API_BASE}/plans/admin`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Neuspjelo dohvaćanje upita.");

    adminPlans.value = data;
  } catch (err) {
    console.error(err);
    errorMsg.value = err.message || "Greška pri dohvaćanju upita.";
  } finally {
    loadingPlans.value = false;
  }
}

function onReplyFileChange(planId, e) {
  const files = Array.from(e.target.files || []);
  replyFiles.value = { ...replyFiles.value, [planId]: files };
}

async function sendReply(plan) {
  const planId = getPlanId(plan);
  if (!planId) return;

  const text = replyText.value[planId]?.trim() || "";
  if (!text) {
    errorMsg.value = "Upiši poruku za korisnika.";
    return;
  }

  sendingReply.value = { ...sendingReply.value, [planId]: true };
  errorMsg.value = "";
  successMsg.value = "";

  try {
    const files = replyFiles.value[planId] || [];
    const imageUrls = [];

    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);

      const uploadRes = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: fd,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok)
        throw new Error(uploadData.message || "Upload slike nije uspio");

      imageUrls.push(uploadData.secure_url);
    }

    const res = await fetch(`${API_BASE}/plans/${planId}/replies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify({
        message: text,
        imageUrls,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Neuspješno slanje odgovora.");

    adminPlans.value = adminPlans.value.map((p) =>
      getPlanId(p) === planId ? data : p
    );

    replyText.value = { ...replyText.value, [planId]: "" };
    replyFiles.value = { ...replyFiles.value, [planId]: [] };
    successMsg.value = "Odgovor je poslan korisniku. 💌";
  } catch (err) {
    console.error(err);
    errorMsg.value = err.message || "Greška pri slanju odgovora.";
  } finally {
    sendingReply.value = { ...sendingReply.value, [planId]: false };
  }
}

async function deleteReply(plan, reply, isUserView) {
  const planId = getPlanId(plan);
  const replyId = reply._id?.toString?.() || reply._id;
  if (!planId || !replyId) return;

  if (!confirm("Sigurno želiš obrisati ovaj odgovor?")) return;

  errorMsg.value = "";
  successMsg.value = "";

  try {
    const res = await fetch(`${API_BASE}/plans/${planId}/replies/${replyId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token.value}` },
    });
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || "Brisanje odgovora nije uspjelo.");

    if (isUserView) {
      userPlans.value = userPlans.value.map((p) =>
        getPlanId(p) === planId ? data : p
      );
    } else {
      adminPlans.value = adminPlans.value.map((p) =>
        getPlanId(p) === planId ? data : p
      );
    }
  } catch (err) {
    console.error(err);
    errorMsg.value = err.message || "Greška pri brisanju odgovora.";
  }
}

async function deletePlan(plan) {
  const planId = getPlanId(plan);
  if (!planId) return;

  if (!confirm("Sigurno želiš obrisati ovaj upit i sve odgovore?")) return;

  errorMsg.value = "";
  successMsg.value = "";

  try {
    const res = await fetch(`${API_BASE}/plans/${planId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token.value}` },
    });
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || "Brisanje upita nije uspjelo.");

    adminPlans.value = adminPlans.value.filter((p) => getPlanId(p) !== planId);
  } catch (err) {
    console.error(err);
    errorMsg.value = err.message || "Greška pri brisanju upita.";
  }
}

const fullscreenImg = ref(null);
function openImage(url) {
  fullscreenImg.value = url;
}
function closeImage() {
  fullscreenImg.value = null;
}

onMounted(() => {
  if (!isAuthed.value) return;
  if (isAdmin.value) {
    fetchAdminPlans();
  } else {
    fetchAdmins();
    fetchUserPlans();
  }
});
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
        <button class="link active">Planovi šminkanja</button>
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
      <section class="hero">
        <h1>💄 Planovi šminkanja</h1>
        <p>
          {{
            isAdmin
              ? "Ovdje vidiš upite korisnika i možeš im odgovoriti, uz tekst i slike."
              : "Odaberi admina, pošalji upit – i ispod prati odgovore."
          }}
        </p>
      </section>

      <section v-if="isAuthed && !isAdmin" class="layout user-layout">
        <div class="card admins-card">
          <h2>✨ Dostupni admini</h2>

          <div v-if="loadingAdmins" class="note">Učitavanje admina…</div>

          <div v-else-if="!admins.length" class="note">
            Trenutno nema dostupnih admina.
          </div>

          <div v-else class="admin-list">
            <label
              v-for="admin in admins"
              :key="admin._id || admin.id"
              class="admin-item"
            >
              <input
                type="radio"
                name="selectedAdmin"
                :value="admin._id || admin.id"
                v-model="selectedAdminId"
              />
              <div class="admin-info">
                <div class="avatar">
                  <span>
                    {{
                      (admin.firstName ||
                        admin.username ||
                        "?")[0].toUpperCase()
                    }}
                  </span>
                </div>
                <div class="admin-text">
                  <p class="admin-name">
                    {{ admin.firstName || admin.username }}
                    <span v-if="admin.lastName"> {{ admin.lastName }}</span>
                  </p>
                  <p v-if="admin.email" class="admin-email">
                    {{ admin.email }}
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div class="card message-card">
          <h2>📨 Pošalji upit</h2>
          <p class="hint">
            Opiši kakav look želiš (događaj, datum, naglasci, proizvodi…)
          </p>

          <textarea
            v-model="userMessage"
            rows="7"
            placeholder="Primjer: Želim glam šminku za svadbu 15.6., naglasak na oči, mat ten..."
          ></textarea>

          <button
            class="btn send"
            :disabled="sendingUserMessage || !admins.length"
            @click="sendPlanRequest"
          >
            {{ sendingUserMessage ? "Šaljem..." : "Pošalji upit" }}
          </button>
        </div>

        <div class="card my-plans-card full-span">
          <h2>📬 Moji upiti i odgovori</h2>

          <div v-if="loadingUserPlans" class="note">
            Učitavanje tvojih upita…
          </div>

          <div v-else-if="!userPlans.length" class="note">
            Još nemaš nijedan upit. Pošalji prvi iznad. 💌
          </div>

          <div v-else class="plan-list">
            <div
              v-for="plan in userPlans"
              :key="getPlanId(plan)"
              class="plan-item"
            >
              <p class="from">
                Admin:
                <strong>
                  {{ plan.adminName || plan.adminUsername || "odabrani admin" }}
                </strong>
              </p>
              <p class="msg"><strong>Tvoj upit:</strong> {{ plan.message }}</p>
              <p class="time">
                {{ new Date(plan.createdAt).toLocaleString("hr-HR") }}
              </p>

              <div v-if="plan.replies?.length" class="replies">
                <p class="replies-title">Odgovori admina:</p>
                <div
                  v-for="rep in plan.replies"
                  :key="rep._id"
                  class="reply-item"
                >
                  <p class="reply-text">{{ rep.message }}</p>

                  <div v-if="rep.imageUrls?.length" class="reply-images">
                    <img
                      v-for="url in rep.imageUrls"
                      :key="url"
                      :src="url"
                      alt="Slika uz odgovor"
                      @click="openImage(url)"
                    />
                  </div>

                  <img
                    v-else-if="rep.imageUrl"
                    :src="rep.imageUrl"
                    alt="Slika uz odgovor"
                    class="single-reply-img"
                    @click="openImage(rep.imageUrl)"
                  />

                  <p class="reply-time">
                    {{ new Date(rep.createdAt).toLocaleString("hr-HR") }}
                  </p>

                  <button
                    class="small-btn delete"
                    @click="deleteReply(plan, rep, true)"
                  >
                    Obriši odgovor
                  </button>
                </div>
              </div>

              <div v-else class="note">
                Admin još nije odgovorio na ovaj upit.
              </div>
            </div>
          </div>

          <div v-if="successMsg" class="success">{{ successMsg }}</div>
          <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
        </div>
      </section>

      <section v-else-if="isAuthed && isAdmin" class="layout admin-layout">
        <div class="card admins-card full-span">
          <h2>📥 Upiti korisnika</h2>

          <div v-if="loadingPlans" class="note">Učitavanje upita…</div>

          <div v-else-if="!adminPlans.length" class="note">
            Još nema upita od korisnika.
          </div>

          <div v-else class="plan-list">
            <div
              v-for="plan in adminPlans"
              :key="getPlanId(plan)"
              class="plan-item"
            >
              <div class="plan-header-row">
                <p class="from">
                  Od:
                  <strong>{{
                    plan.fromUsername || "Nepoznat korisnik"
                  }}</strong>
                </p>

                <button class="small-btn delete" @click="deletePlan(plan)">
                  Obriši upit
                </button>
              </div>

              <p class="msg">{{ plan.message }}</p>
              <p class="time">
                {{ new Date(plan.createdAt).toLocaleString("hr-HR") }}
              </p>

              <div v-if="plan.replies?.length" class="replies">
                <p class="replies-title">Tvoji odgovori:</p>
                <div
                  v-for="rep in plan.replies"
                  :key="rep._id"
                  class="reply-item"
                >
                  <p class="reply-text">{{ rep.message }}</p>

                  <div v-if="rep.imageUrls?.length" class="reply-images">
                    <img
                      v-for="url in rep.imageUrls"
                      :key="url"
                      :src="url"
                      alt="Slika uz odgovor"
                      @click="openImage(url)"
                    />
                  </div>

                  <img
                    v-else-if="rep.imageUrl"
                    :src="rep.imageUrl"
                    alt="Slika uz odgovor"
                    class="single-reply-img"
                    @click="openImage(rep.imageUrl)"
                  />

                  <p class="reply-time">
                    {{ new Date(rep.createdAt).toLocaleString("hr-HR") }}
                  </p>

                  <button
                    class="small-btn delete"
                    @click="deleteReply(plan, rep, false)"
                  >
                    Obriši odgovor
                  </button>
                </div>
              </div>

              <div class="reply-form">
                <textarea
                  :placeholder="
                    'Odgovor za ' + (plan.fromUsername || 'korisnika')
                  "
                  v-model="replyText[getPlanId(plan)]"
                  rows="3"
                ></textarea>

                <label class="upload-label">
                  Dodaj slike (opcionalno, može više)
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    @change="onReplyFileChange(getPlanId(plan), $event)"
                  />
                </label>

                <button
                  class="btn send"
                  :disabled="sendingReply[getPlanId(plan)]"
                  @click="sendReply(plan)"
                >
                  {{
                    sendingReply[getPlanId(plan)]
                      ? "Šaljem..."
                      : "Pošalji odgovor"
                  }}
                </button>
              </div>
            </div>
          </div>

          <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
          <div v-if="successMsg" class="success">{{ successMsg }}</div>
        </div>
      </section>

      <section v-else class="layout">
        <div class="card message-card full-span">
          <h2>💄 Planovi šminkanja</h2>
          <p class="hint">
            Za slanje upita ili pregled upita moraš biti prijavljena/prijavljen.
          </p>
          <button class="btn accent" @click="go('/login')">Prijava</button>
        </div>
      </section>

      <transition name="fade">
        <div v-if="fullscreenImg" class="fullscreen" @click="closeImage">
          <img :src="fullscreenImg" alt="Povećana slika" />
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

.page-wrapper {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.6)),
    url("https://res.cloudinary.com/ditd1epqb/image/upload/v1761920929/pexels-pablo-gomez-2151419725-33614966_zhx1mo.jpg")
      center/cover no-repeat fixed;
  color: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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
  background: rgba(20, 22, 24, 0.55);
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
.btn.send {
  margin-top: 8px;
  background: linear-gradient(
    135deg,
    var(--brand-primary),
    var(--brand-accent)
  );
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  width: 1px;
  height: 26px;
  background: rgba(255, 255, 255, 0.25);
  margin: 0 6px;
}

.content {
  margin-top: calc(var(--nav-h) + 160px);
  padding: 80px 24px 160px;
  flex: 1;
}

.hero {
  text-align: center;
  margin-bottom: 36px;
}
.hero h1 {
  font-size: 2.6rem;
  background: linear-gradient(90deg, var(--brand-accent), var(--brand-primary));
  -webkit-background-clip: text;
  color: transparent;
}
.hero p {
  max-width: 720px;
  margin: 14px auto 0;
  color: #ffffff;
}

.layout {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 22px;
}

.user-layout {
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1.1fr);
}

.admin-layout {
  grid-template-columns: minmax(0, 1fr);
}

@media (max-width: 900px) {
  .user-layout,
  .admin-layout {
    grid-template-columns: 1fr;
  }
}

.full-span {
  grid-column: 1 / -1;
}

.card {
  background: rgba(24, 26, 30, 0.82);
  border-radius: 22px;
  padding: 20px 22px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.5);
  color: #ffffff;
}
.card h2 {
  font-size: 1.4rem;
  margin-bottom: 12px;
}

.small-btn {
  border: none;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.8rem;
  cursor: pointer;
  font-weight: 700;
}
.small-btn.delete {
  background: rgba(255, 120, 120, 0.18);
  color: #ffd0d0;
}

.note,
.hint {
  font-size: 0.95rem;
  color: #f4f4f4;
}
.admin-email,
.time,
.reply-time {
  color: #e0e0e0;
}

.admin-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}
.admin-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.35);
  cursor: pointer;
}
.admin-item input {
  margin-right: 4px;
}
.admin-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  display: grid;
  place-items: center;
  font-weight: 800;
}
.admin-name {
  font-weight: 700;
}

textarea {
  width: 100%;
  border-radius: 14px;
  border: none;
  outline: none;
  padding: 10px 12px;
  resize: vertical;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
}

.plan-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
}
.plan-item {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.45);
}
.plan-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.from {
  font-size: 0.95rem;
  margin-bottom: 4px;
}
.msg {
  margin: 4px 0;
}
.time {
  font-size: 0.8rem;
}

.replies {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}
.replies-title {
  font-size: 0.9rem;
  margin-bottom: 6px;
}
.reply-item {
  padding: 6px 0;
}
.reply-text {
  font-size: 0.95rem;
}
.reply-images {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}
.reply-images img,
.single-reply-img {
  max-width: 90px;
  border-radius: 8px;
  cursor: zoom-in;
}
.reply-time {
  font-size: 0.75rem;
  margin-top: 2px;
}

.reply-form {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.upload-label {
  font-size: 0.9rem;
  cursor: pointer;
  color: #f4f4f4;
}
.upload-label input {
  display: block;
  margin-top: 4px;
}

.error {
  margin-top: 10px;
  color: #ff9d9d;
  font-weight: 700;
}
.success {
  margin-top: 10px;
  color: #b2ffb2;
  font-weight: 700;
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
</style>
