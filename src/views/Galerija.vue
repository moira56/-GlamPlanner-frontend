<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const API_BASE = "http://localhost:3000/api";

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

const CATEGORIES = [
  { id: "oci", label: "Oči" },
  { id: "usne", label: "Usne" },
  { id: "ten", label: "Ten" },
  { id: "obrve", label: "Obrve" },
  { id: "alat", label: "Alati" },
  { id: "setovi", label: "Setovi" },
];

const selected = ref(new Set());
const gallery = ref([]);
const nextCursor = ref(null);
const errorMsg = ref("");
const loading = ref(false);
const fullscreenImg = ref(null);

const newImageDesc = ref("");
const uploadTags = ref(new Set());
const selectedFile = ref(null);

const queryTags = computed(() => Array.from(selected.value).join(","));

async function fetchGallery({ append = false } = {}) {
  loading.value = true;
  errorMsg.value = "";
  try {
    const params = new URLSearchParams();
    if (queryTags.value) params.set("tags", queryTags.value);
    if (append && nextCursor.value) params.set("cursor", nextCursor.value);

    const res = await fetch(`${API_BASE}/gallery?${params.toString()}`, {
      headers: { Accept: "application/json" },
    });
    const data = await res.json();

    const items = Array.isArray(data) ? data : data.items || [];
    const cursor = Array.isArray(data) ? null : data.nextCursor || null;

    if (!append) gallery.value = [];
    gallery.value = append ? [...gallery.value, ...items] : items;
    nextCursor.value = cursor;
  } catch (e) {
    errorMsg.value = e.message || "Greška pri dohvaćanju galerije";
  } finally {
    loading.value = false;
  }
}

function toggleFilterTag(id) {
  if (selected.value.has(id)) selected.value.delete(id);
  else selected.value.add(id);
  fetchGallery({ append: false });
}

function clearFilters() {
  selected.value.clear();
  fetchGallery({ append: false });
}

function toggleUploadTag(id) {
  if (uploadTags.value.has(id)) uploadTags.value.delete(id);
  else uploadTags.value.add(id);
}

function onFileChange(e) {
  const file = e.target.files?.[0] || null;
  selectedFile.value = file;
}

function toggleFullscreen(image) {
  fullscreenImg.value = fullscreenImg.value === image ? null : image;
}

async function publishImage() {
  if (!selectedFile.value) {
    alert("Odaberi sliku prije objave.");
    return;
  }
  loading.value = true;
  errorMsg.value = "";

  try {
    const formData = new FormData();
    formData.append("file", selectedFile.value);
    formData.append("tags", JSON.stringify(Array.from(uploadTags.value)));

    const uploadRes = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: formData,
    });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok)
      throw new Error(uploadData.message || "Upload nije uspio");

    const saveRes = await fetch(`${API_BASE}/gallery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify({
        url: uploadData.secure_url,
        publicId: uploadData.public_id,
        desc: newImageDesc.value,
        tags: Array.from(uploadTags.value),
      }),
    });
    if (!saveRes.ok) throw new Error("Spremanje slike nije uspjelo");

    await fetchGallery({ append: false });

    newImageDesc.value = "";
    uploadTags.value.clear();
    selectedFile.value = null;
    const fileInput = document.querySelector("#fileInput");
    if (fileInput) fileInput.value = "";
  } catch (err) {
    alert("Greška: " + err.message);
  } finally {
    loading.value = false;
  }
}

async function removeImage(id) {
  if (!confirm("Sigurno želiš obrisati ovu sliku?")) return;
  try {
    const res = await fetch(`${API_BASE}/gallery/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token.value}` },
    });
    if (!res.ok) throw new Error("Brisanje nije uspjelo");
    await fetchGallery({ append: false });
  } catch (err) {
    alert("Greška: " + err.message);
  }
}

onMounted(() => fetchGallery());
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
        <h1>📸 Galerija</h1>
      </section>

      <section class="filters">
        <button
          v-for="c in CATEGORIES"
          :key="c.id"
          class="chip"
          :class="{ active: selected.has(c.id) }"
          @click="toggleFilterTag(c.id)"
        >
          {{ c.label }}
        </button>

        <button
          v-if="selected.size"
          class="chip clear"
          @click="clearFilters"
          title="Očisti sve filtre"
        >
          Očisti filtre
        </button>
      </section>

      <section class="add-section" v-if="isAuthed">
        <div class="upload-grid">
          <div class="upload-col">
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              @change="onFileChange"
            />
            <textarea
              v-model="newImageDesc"
              placeholder="Dodaj opis, savjet ili preporuku proizvoda..."
            ></textarea>
          </div>

          <div class="upload-col">
            <div class="subheading">Tagovi (kategorije)</div>
            <div class="tag-pick">
              <label v-for="c in CATEGORIES" :key="c.id" class="tag-option">
                <input
                  type="checkbox"
                  :value="c.id"
                  :checked="uploadTags.has(c.id)"
                  @change="toggleUploadTag(c.id)"
                />
                <span>{{ c.label }}</span>
              </label>
            </div>

            <div class="actions">
              <button
                class="btn publish"
                :disabled="loading || !selectedFile"
                @click="publishImage"
                title="Objavi sliku"
              >
                {{ loading ? "Objavljujem..." : "Objavi" }}
              </button>
              <span class="file-note" v-if="!selectedFile"
                >Odaberi sliku za objavu</span
              >
            </div>
          </div>
        </div>

        <div v-if="loading" class="uploading">📤 Uploadam sliku...</div>
      </section>

      <section class="results">
        <div v-if="errorMsg" class="error">{{ errorMsg }}</div>

        <div v-if="!loading && gallery.length === 0" class="empty">
          Nema slika za odabrani filter.
        </div>

        <div class="gallery-grid">
          <div
            v-for="img in gallery"
            :key="img.id || img._id"
            class="gallery-item"
          >
            <div class="thumb-wrap" @click="toggleFullscreen(img)">
              <img :src="img.thumb || img.url" alt="" />
            </div>
            <div class="overlay">
              <button
                v-if="isAdmin"
                class="delete-btn"
                @click.stop="removeImage(img._id)"
                title="Obriši"
              >
                ✕
              </button>
            </div>
            <p class="desc">
              <span v-if="img.desc">{{ img.desc }}</span>
            </p>
            <div class="tags" v-if="img.tags?.length">
              <span v-for="t in img.tags" :key="t" class="tag">#{{ t }}</span>
            </div>
          </div>
        </div>

        <div class="loadmore" v-if="nextCursor && !loading">
          <button class="btn" @click="fetchGallery({ append: true })">
            Učitaj još
          </button>
        </div>

        <div v-if="loading" class="loading">Učitavanje…</div>
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
  margin-top: calc(var(--nav-h) + 120px);
  padding: 80px 40px 220px;
  text-align: center;
  flex: 1;
}
.gallery-hero h1 {
  font-size: 2.2rem;
  background: linear-gradient(90deg, var(--brand-accent), var(--brand-primary));
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 10px;
}

.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  margin: 0 0 18px;
}
.chip {
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  padding: 8px 18px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.25s ease;
}
.chip:hover {
  background: rgba(255, 255, 255, 0.25);
}
.chip.active {
  background: linear-gradient(
    135deg,
    var(--brand-accent),
    var(--brand-primary)
  );
  border-color: transparent;
}
.chip.clear {
  background: rgba(255, 255, 255, 0.2);
}

.add-section {
  background: rgba(34, 36, 40, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 20px;
  max-width: 1100px;
  margin: 0 auto 24px;
  padding: 16px;
}
.upload-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
@media (max-width: 860px) {
  .upload-grid {
    grid-template-columns: 1fr;
  }
}
.upload-col textarea,
.upload-col input[type="text"],
.upload-col input[type="file"] {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: none;
  outline: none;
  font-size: 1rem;
  background: rgba(34, 36, 40, 0.6);
  color: #fff !important;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.6);
}
.upload-col textarea::placeholder,
.upload-col input[type="text"]::placeholder {
  color: rgba(255, 255, 255, 0.95) !important;
}
.upload-col input[type="file"]::file-selector-button {
  background: linear-gradient(
    135deg,
    var(--brand-accent),
    var(--brand-primary)
  );
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 10px;
  padding: 8px 12px;
  font-weight: 700;
  cursor: pointer;
}
.subheading {
  text-align: left;
  opacity: 1;
  font-weight: 700;
  margin-top: 4px;
  color: #fff !important;
}
.tag-pick {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 6px 0 10px;
}
.tag-option {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  color: #fff !important;
}
.tag-option input[type="checkbox"] {
  accent-color: var(--brand-accent);
}
.actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}
.btn.publish {
  background: linear-gradient(
    135deg,
    var(--brand-primary),
    var(--brand-accent)
  );
}
.btn.publish:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.file-note {
  opacity: 0.9;
  font-size: 0.95rem;
}

.results {
  max-width: 1100px;
  margin: 0 auto;
}
.gallery-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
@media (max-width: 980px) {
  .gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 520px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }
}

.gallery-item {
  background: rgba(34, 36, 40, 0.6);
  border-radius: 16px;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);
  transition: transform 0.18s ease;
}
.gallery-item:hover {
  transform: translateY(-2px);
}

.thumb-wrap {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 4 / 5;
  background: rgba(255, 255, 255, 0.06);
}
.thumb-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.overlay {
  display: flex;
  justify-content: flex-end;
  padding-top: 6px;
}
.delete-btn {
  background: rgba(0, 0, 0, 0.8);
  border: none;
  color: #fff;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-weight: 900;
}
.desc {
  font-size: 0.92rem;
  opacity: 0.9;
  margin-top: 8px;
  text-align: left;
  color: #fff;
}
.tags {
  margin-top: 6px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.tag {
  font-size: 0.78rem;
  opacity: 0.85;
}

.loadmore {
  text-align: center;
  margin-top: 14px;
}
.loading {
  opacity: 0.9;
  margin-top: 10px;
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
