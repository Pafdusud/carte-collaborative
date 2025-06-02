// script.js
// Note: ce fichier doit être chargé en <script type="module">

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// --- Config Firebase (remplace par ta config perso) ---
const firebaseConfig = {
  apiKey: "AIzaSyA_uaTMNnsxIMSBhmWYDGOWVcaSPs6OcNo",
  authDomain: "carte-paf-du-sud-9b81a.firebaseapp.com",
  projectId: "carte-paf-du-sud-9b81a",
  storageBucket: "carte-paf-du-sud-9b81a.appspot.com",
  messagingSenderId: "1057159482652",
  appId: "1:1057159482652:web:64cd2b0633e55a0ade7ed9",
};

// --- Initialise Firebase et Firestore ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Initialiser la carte Leaflet ---
const map = L.map("map").setView([48.8566, 2.3522], 5); // Centre Paris

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '© OpenStreetMap contributors',
}).addTo(map);

// --- Fonction pour charger les marqueurs depuis Firestore ---
async function loadMarkers() {
  const querySnapshot = await getDocs(collection(db, "markers"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    L.marker([data.lat, data.lng])
      .addTo(map)
      .bindPopup(`${data.name} — ${data.city}`);
  });
}

// --- Fonction pour ajouter un marqueur dans Firestore ---
async function addMarker(name, city, lat, lng) {
  try {
    await addDoc(collection(db, "markers"), {
      name,
      city,
      lat,
      lng,
      createdAt: new Date(),
    });
  } catch (e) {
    alert("Erreur ajout marqueur : " + e.message);
  }
}

// --- Géocoder la ville avec Nominatim (OpenStreetMap) ---
async function getCoordsFromCity(city) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      city
    )}`
  );
  const data = await response.json();
  if (data.length > 0) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } else {
    throw new Error("Ville non trouvée");
  }
}

// --- Gestion formulaire ---
const form = document.getElementById("form");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const city = document.getElementById("city").value.trim();

  if (!name || !city) {
    alert("Merci de remplir les champs nom et ville");
    return;
  }

  try {
    const coords = await getCoordsFromCity(city);

    // Ajouter le marqueur sur la carte
    L.marker([coords.lat, coords.lng])
      .addTo(map)
      .bindPopup(`${name} — ${city}`)
      .openPopup();

    // Ajouter dans Firestore
    await addMarker(name, city, coords.lat, coords.lng);

    // Reset formulaire
    form.reset();
  } catch (error) {
    alert(error.message);
  }
});

// --- Charger les marqueurs au chargement ---
loadMarkers();

