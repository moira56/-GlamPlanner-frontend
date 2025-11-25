<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import api from "../api/api.js";

const router = useRouter();
const route = useRoute();
const eventId = computed(() => route.params.id || null);
const isEditing = computed(() => !!eventId.value);

const event = ref({
  title: "",
  description: "",
  imageUrl: "",
  contentImageUrls: [],
});

const mainImageFile = ref(null);
const mainImagePreview = ref("");
const contentImageFiles = ref([]);
const contentImagePreviews = ref([]);

const loading = ref(false);
const saving = ref(false);
const errorMsg = ref("");
const successMsg = ref("");

async function fetchEventDetails() {
  if (!isEditing.value) return;
  loading.value = true;
  try {
    const { data } = await api.get(`/events/${eventId.value}`);
    event.value = data;
    mainImagePreview.value = data.imageUrl;
  } catch (err) {
    errorMsg.value = "Nije moguće učitati detalje događaja.";
    console.error(err);
  } finally {
    loading.value = false;
  }
}

function onMainFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  mainImageFile.value = file;
  const reader = new FileReader();
  reader.onload = (event) => (mainImagePreview.value = event.target.result);
  reader.readAsDataURL(file);
}

function onContentFilesChange(e) {
  const files = Array.from(e.target.files);
  contentImageFiles.value = files;

  const previewPromises = files.map((file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.readAsDataURL(file);
    });
  });

  Promise.all(previewPromises).then((previews) => {
    contentImagePreviews.value = previews;
  });
}

async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/upload", formData);
  return data.secure_url;
}

async function saveEvent() {
  saving.value = true;
  errorMsg.value = "";
  successMsg.value = "";

  try {
    let finalImageUrl = event.value.imageUrl;
    if (mainImageFile.value) {
      finalImageUrl = await uploadFile(mainImageFile.value);
    }

    if (!isEditing.value && !finalImageUrl) {
      errorMsg.value = "Glavna slika je obavezna.";
      return;
    }

    const newContentImageUrls = [];
    for (const file of contentImageFiles.value) {
      const url = await uploadFile(file);
      newContentImageUrls.push(url);
    }

    if (isEditing.value) {
      const payload = {
        title: event.value.title,
        description: event.value.description,
        imageUrl: finalImageUrl,
        newContentImages: newContentImageUrls,
      };
      await api.put(`/events/${eventId.value}`, payload);
      successMsg.value = "Događaj je uspješno ažuriran!";
    } else {
      const payload = {
        title: event.value.title,
        description: event.value.description,
        imageUrl: finalImageUrl,
        contentImageUrls: newContentImageUrls,
      };
      await api.post("/events", payload);
      successMsg.value = "Događaj je uspješno kreiran!";
    }

    setTimeout(() => router.push("/events"), 1500);
  } catch (err) {
    errorMsg.value = err.response?.data?.message || "Došlo je do greške.";
    console.error(err);
  } finally {
    saving.value = false;
  }
}

async function deleteImage(imageUrl) {
  if (!confirm("Jeste li sigurni da želite obrisati ovu sliku?")) return;
  try {
    await api.delete(`/events/${eventId.value}/images`, { data: { imageUrl } });
    event.value.contentImageUrls = event.value.contentImageUrls.filter(
      (url) => url !== imageUrl
    );
  } catch (err) {
    errorMsg.value = "Greška pri brisanju slike.";
    console.error(err);
  }
}

onMounted(fetchEventDetails);
</script>

<template>
  <div class="form-page">
    <div class="card">
      <button class="back-button" @click="router.push('/events')">
        &#x2190; Natrag na događaje
      </button>

      <h1>{{ isEditing ? "Uredi događaj" : "+ Novi događaj" }}</h1>
      <p class="subtitle">
        {{
          isEditing
            ? "Ažuriraj detalje događaja."
            : "Dodaj novi događaj koji će biti vidljiv svim korisnicima."
        }}
      </p>

      <div v-if="loading">Učitavanje...</div>
      <form v-else @submit.prevent="saveEvent">
        <div class="form-group">
          <label>Naslov događaja</label>
          <input type="text" v-model="event.title" required />
        </div>

        <div class="form-group">
          <label>Kratki opis</label>
          <textarea v-model="event.description" rows="3" required></textarea>
        </div>

        <div class="form-group">
          <label>Glavna slika događaja</label>
          <input type="file" accept="image/*" @change="onMainFileChange" />
          <img
            v-if="mainImagePreview"
            :src="mainImagePreview"
            class="image-preview"
          />
        </div>

        <div class="form-group">
          <label>{{
            isEditing ? "Dodaj još slika" : "Dodaj slike sadržaja (opcionalno)"
          }}</label>
          <input
            type="file"
            accept="image/*"
            multiple
            @change="onContentFilesChange"
          />
          <div v-if="contentImagePreviews.length > 0" class="image-previews">
            <img v-for="(p, i) in contentImagePreviews" :key="i" :src="p" />
          </div>
        </div>

        <div
          v-if="isEditing && event.contentImageUrls.length > 0"
          class="form-group"
        >
          <label>Postojeće slike</label>
          <div class="image-previews existing">
            <div
              v-for="url in event.contentImageUrls"
              :key="url"
              class="img-container"
            >
              <img :src="url" />
              <button
                type="button"
                class="delete-btn"
                @click="deleteImage(url)"
              >
                X
              </button>
            </div>
          </div>
        </div>

        <button type="submit" class="btn" :disabled="saving">
          {{
            saving
              ? "Spremam..."
              : isEditing
              ? "Spremi promjene"
              : "Spremi događaj"
          }}
        </button>

        <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
        <div v-if="successMsg" class="success">{{ successMsg }}</div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 48px 24px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)),
    url("https://res.cloudinary.com/ditd1epqb/image/upload/v1761920929/pexels-pablo-gomez-2151419725-33614966_zhx1mo.jpg")
      center/cover no-repeat fixed;
}
.card {
  position: relative;
  max-width: 800px;
  width: 100%;
  padding: 32px 40px;
  background: rgba(24, 26, 30, 0.9);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.5);
  color: #fff;
}

.back-button {
  position: absolute;
  top: 32px;
  left: 40px;
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 99px;
  cursor: pointer;
  transition: background 0.2s;
}
.back-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

h1 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 8px;
  padding-top: 48px;
}
.subtitle {
  text-align: center;
  margin-bottom: 32px;
  opacity: 0.9;
}
.form-group {
  margin-bottom: 24px;
}
label {
  display: block;
  margin-bottom: 8px;
  font-weight: 700;
}
input[type="text"],
textarea {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  font-size: 1rem;
}
.image-preview {
  margin-top: 12px;
  max-width: 200px;
  border-radius: 8px;
}
.image-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}
.image-previews img {
  height: 90px;
  width: 90px;
  object-fit: cover;
  border-radius: 8px;
}
.existing .img-container {
  position: relative;
}
.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(255, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #a65077, #2596be);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.error,
.success {
  text-align: center;
  margin-top: 16px;
  font-weight: 700;
}
.error {
  color: #ff9d9d;
}
.success {
  color: #b2ffb2;
}
</style>
