import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Config Firebase
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJET.firebaseapp.com",
  projectId: "VOTRE_PROJET",
  storageBucket: "VOTRE_PROJET.appspot.com",
  messagingSenderId: "XXX",
  appId: "XXX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Carte Leaflet
const map = L.map("map").setView([48.8566, 2.3522], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// Chargement des marqueurs
async function chargerPoints() {
  const snap = await getDocs(collection(db, "locations"));
  snap.forEach((doc) => {
    const data = doc.data();
    if (data.lat && data.lng && data.name) {
      L.marker([data.lat, data.lng])
        .addTo(map)
        .bindPopup(`<strong>${data.name}</strong><br>${data.city}`);
    }
  });
}
chargerPoints();

// Géocoder une ville
async function geocoder(ville) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${ville}`
  );
  const data = await response.json();
  if (data.length === 0) throw new Error("Ville introuvable");
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon)
  };
}

// Ajout
document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const city = document.getElementById("city").value;
  const adminCode = document.getElementById("admin-code").value;

  try {
    const coords = await geocoder(city);
    await addDoc(collection(db, "locations"), {
      name,
      city,
      lat: coords.lat,
      lng: coords.lng,
      admin: adminCode === "1234"
    });
    alert("Ajouté !");
    location.reload();
  } catch (err) {
    alert("Erreur : " + err.message);
  }
});
