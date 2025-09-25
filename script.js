
const restaurantFilters = [
  { label: 'Sit-Down Dining', type: 'restaurant' },
  { label: 'Fast Food', type: 'meal_takeaway' },
  { label: 'Bakeries', type: 'bakery' },
  { label: 'American', type: 'restaurant', keyword: 'american' },
  { label: 'Asian', type: 'restaurant', keyword: 'asian' },
  { label: 'BBQ', type: 'restaurant', keyword: 'bbq' },
  { label: 'Breakfast', type: 'restaurant', keyword: 'breakfast' },
  { label: 'Buffet', type: 'restaurant', keyword: 'buffet' },
  { label: 'European', type: 'restaurant', keyword: 'european' },
  { label: 'Halal', type: 'restaurant', keyword: 'halal' },
  { label: 'Latin American', type: 'restaurant', keyword: 'latin' },
  { label: 'Mediterranean', type: 'restaurant', keyword: 'mediterranean' },
  { label: 'Pizza', type: 'restaurant', keyword: 'pizza' },
  { label: 'Polynesian', type: 'restaurant', keyword: 'polynesian' },
  { label: 'Sandwiches', type: 'restaurant', keyword: 'sandwiches' },
  { label: 'Seafood', type: 'restaurant', keyword: 'seafood' },
  { label: 'Soups', type: 'restaurant', keyword: 'soup' },
  { label: 'Steakhouses', type: 'restaurant', keyword: 'steakhouse' }
];

let lat = parseFloat(new URLSearchParams(window.location.search).get('lat'));
let lng = parseFloat(new URLSearchParams(window.location.search).get('lng'));
let venue = new URLSearchParams(window.location.search).get('venue');
document.getElementById('venue-name').innerText = decodeURIComponent(venue).toUpperCase();

function showRestaurantFilters() {
  const filterBox = document.getElementById('restaurant-filters');
  filterBox.innerHTML = '';
  restaurantFilters.forEach(opt => {
    const option = document.createElement('option');
    option.value = JSON.stringify(opt);
    option.textContent = opt.label;
    filterBox.appendChild(option);
  });
  filterBox.style.display = 'block';
}

function loadCategory(type) {
  const filterBox = document.getElementById('restaurant-filters');
  filterBox.style.display = type === 'restaurant' ? 'block' : 'none';
  if (type === 'restaurant') {
    showRestaurantFilters();
    triggerFilteredSearch();
  } else {
    getPlaces({ type: type });
  }
}

function triggerFilteredSearch() {
  const selected = JSON.parse(document.getElementById('restaurant-filters').value);
  getPlaces(selected);
}

function getPlaces({ type, keyword = '' }) {
  const location = { lat, lng };
  const map = new google.maps.Map(document.createElement("div"));
  const service = new google.maps.places.PlacesService(map);

  const request = {
    location,
    radius: 40200,
    type,
    keyword
  };

  service.nearbySearch(request, displayResults);
}


function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Radius of Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function displayResults(results, status) {
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    results.forEach(place => {
      const placeLat = place.geometry.location.lat();
      const placeLng = place.geometry.location.lng();
      place.distance = calculateDistance(lat, lng, placeLat, placeLng);
    });

    results.sort((a, b) => a.distance - b.distance);

    results.forEach(place => {
      const card = document.createElement('a');
      const name = encodeURIComponent(place.name);
      const placeLat = place.geometry?.location?.lat();
      const placeLng = place.geometry?.location?.lng();
      const distance = (placeLat && placeLng) ? calculateDistance(lat, lng, placeLat, placeLng) : null;
      card.href = `https://www.google.com/maps/search/?api=1&query=${name}&query_place_id=${place.place_id}`;
      card.className = 'place-card';
      card.target = '_blank';
      card.innerHTML = `
        <h3>${place.name}</h3>
        <p>${place.vicinity || ''}</p>
        ${place.rating ? `<p>Rating: ${place.rating}</p>` : ''}
        ${distance ? `<p>${distance.toFixed(1)} miles from the venue</p>` : ''}
      `;
      resultsContainer.appendChild(card);
    });
  } else {
    resultsContainer.innerHTML = '<p>No results found.</p>';
  }
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 3958.8; // miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

function searchCustom() {
  const keyword = document.getElementById('customSearch').value.trim();
  if (!keyword) return;
  getPlaces({ type: 'restaurant', keyword });
}
