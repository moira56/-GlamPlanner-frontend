<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../api/api.js";

const router = useRouter();

const title = ref("");
const description = ref("");
const imageFile = ref(null);
const imagePreview = ref("");

const saving = ref(false);
const errorMsg = ref("");
const successMsg = ref("");

function onFileChange(e) {
  const file = e.target.files[0];
  if (!file) {
    imageFile.value = null;
    imagePreview.value = "";
    return;
  }
  imageFile.value = file;

  const reader = new FileReader();
  reader.onload = (event) => {
    imagePreview.value = event.target.result;
  };
  reader.readAsDataURL(file);
}

async function createEvent() {
  if (!title.value || !description.value || !imageFile.value) {
    errorMsg.value = "Sva polja su obavezna.";
    return;
  }

  saving.value = true;
  errorMsg.value = "";
  successMsg.value = "";

  try {
    const formData = new FormData();
    formData.append("file", imageFile.value);

    const uploadRes = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const imageUrl = uploadRes.data.secure_url;

    const eventPayload = {
      title: title.value,
      description: description.value,
      imageUrl: imageUrl,
    };

    await api.post("/events", eventPayload);

    successMsg.value = "Događaj je uspješno kreiran!";
    setTimeout(() => {
      router.push("/events");
    }, 1500);
  } catch (err) {
    console.error(err);
    errorMsg.value =
      err.response?.data?.message || "Greška pri kreiranju događaja.";
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="form-page">
    <div class="card">
      <h1>+ Novi događaj</h1>
      <p class="subtitle">
        Dodaj novi događaj koji će biti vidljiv svim korisnicima.
      </p>

      <form @submit.prevent="createEvent">
        <div class="form-group">
          <label>Naslov događaja</label>
          <input type="text" v-model="title" placeholder="Npr. Vjenčanje" />
        </div>

        <div class="form-group">
          <label>Kratki opis</label>
          <textarea
            v-model="description"
            rows="3"
            placeholder="Npr. Elegantan i dugotrajan make-up..."
          ></textarea>
        </div>

        <div class="form-group">
          <label>Slika događaja</label>
          <input type="file" accept="image/*" @change="onFileChange" />
          <img
            v-if="imagePreview"
            :src="imagePreview"
            alt="Pregled slike"
            class="image-preview"
          />
        </div>

        <button type="submit" class="btn" :disabled="saving">
          {{ saving ? "Spremam..." : "Spremi događaj" }}
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
  padding: 24px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)),
    url("https://res.cloudinary.com/ditd1epqb/image/upload/v1761920929/pexels-pablo-gomez-2151419725-33614966_zhx1mo.jpg")
      center/cover no-repeat fixed;
}
.card {
  max-width: 600px;
  width: 100%;
  padding: 32px 40px;
  background: rgba(24, 26, 30, 0.85);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.5);
  color: #fff;
}
h1 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 8px;
}
.subtitle {
  text-align: center;
  margin-bottom: 24px;
  opacity: 0.9;
}
.form-group {
  margin-bottom: 20px;
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
  max-width: 150px;
  border-radius: 8px;
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
