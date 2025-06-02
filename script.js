const map = L.map('map').setView([48.8566, 2.3522], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const form = document.getElementById('form');
const nameInput = document.getElementById('name');
const cityInput = document.getElementById('city');
const adminInput = document.getElementById('admin-code');

const markers = [];

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const city = cityInput.value.trim();
  const admin = adminInput.value.trim();
  const isAdmin = admin === 'secret123';

  if (!city) {
    alert("Merci d'entrer une ville.");
    return;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);

      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(`<b>${name}</b><br>${city}<br>${isAdmin ? '(Admin)' : ''}`).openPopup();

      markers.push({ name, city, lat, lng, admin: isAdmin });

      map.setView([lat, lng], 10);
      form.reset();
    } else {
      alert("Ville introuvable. Essaie une autre formulation.");
    }
  } catch (err) {
    alert("Erreur lors de la recherche de la ville.");
    console.error(err);
  }
});
