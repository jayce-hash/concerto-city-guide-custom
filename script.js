// ========== FILTERS + VENUE SETUP ==========
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

// ========== GOOGLE MAPS FILTER FUNCTIONS ==========
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
  const filterContainer = document.getElementById('filter-container');

  if (type === 'restaurant') {
    filterBox.style.display = 'block';
    filterContainer.style.display = 'flex'; // Make sure the wrapper is also visible
    showRestaurantFilters();
    triggerFilteredSearch();
  } else {
    filterBox.style.display = 'none';
    filterContainer.style.display = 'none'; // Hide the wrapper
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

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
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

function displayResults(results, status) {
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';

const instruction = document.createElement('p');
instruction.textContent = 'Select a place below to learn more';
instruction.style.fontSize = '14px';
instruction.style.color = '#5e6b86';
instruction.style.marginTop = '0px';
instruction.style.marginBottom = '16px';
instruction.style.textAlign = 'center';
resultsContainer.appendChild(instruction);

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

function searchCustom() {
  const keyword = document.getElementById('customSearch').value.trim();
  if (!keyword) return;
  getPlaces({ type: 'restaurant', keyword });
}

// ========== APPLE MAPS TOP PICKS ==========
const topPicksData = {
  "Kia Forum": [
    { name: "Cork & Batter", link: "https://maps.apple/p/G~Wcuuge~5__.j", description: "Rooftop bar with American fare & cocktails near the Forum." },
    { name: "Coni’Seafood", link: "https://maps.apple.com/place?address=3544%20W%20Imperial%20Hwy,%20Inglewood,%20CA%20%2090303,%20United%20States&coordinate=33.930767,-118.334890&name=Coni'Seafood&place-id=I3DFBAF4BC6FA9193&map=explore", description: "Traditional Nayarit-style seafood & Mexican eats." },
    { name: "Dulan’s Soul Food Kitchen", link: "https://maps.apple/p/t0RwbR5XPKSR0e", description: "Comforting Southern soul food served in a casual spot." },
    { name: "Sunday Gravy", link: "https://maps.apple/p/9T256TaTrfC3uR", description: "Italian & Mediterranean comfort food with local charm." },
    { name: "Stuff I Eat", link: "https://maps.apple/p/-61WLERdW7nmM1", description: "Wholesome vegan soul food in downtown Inglewood." }
  ],
  "Sphere Las Vegas": [
    { name: "Via Via Food Hall at The Venetian", link: "https://maps.apple/p/6kA-kqku59dAhN", description: "Trendy indoor food court with global bites & drinks." },
    { name: "Estiatorio Milos", link: "https://maps.apple/p/dYDRqQUT.bbLvS", description: "Elegant Mediterranean seafood spot inside The Venetian." },
    { name: "Yardbird", link: "https://maps.apple.com/place?address=3355%20S%20Las%20Vegas%20Blvd,%20Las%20Vegas,%20NV%20%2089109,%20United%20States&coordinate=36.122465,-115.169064&name=Yardbird%20Table%20%26%20Bar&place-id=I6CD6F71ED0195A69&map=explore", description: "Southern comfort classics & craft cocktails." },
    { name: "SUSHISAMBA", link: "https://maps.apple.com/place?address=3327%20S%20Las%20Vegas%20Blvd,%20Las%20Vegas,%20NV%20%2089109,%20United%20States&coordinate=36.124533,-115.167752&name=SUSHISAMBA&place-id=IF4D59BEAF61684A7&map=explore", description: "Lively spot for Japanese-Brazilian-Peruvian fusion sushi." },
    { name: "CHICA", link: "https://maps.apple.com/place?address=3355%20S%20Las%20Vegas%20Blvd,%20Unit%20106,%20Las%20Vegas,%20NV%2089109,%20United%20States&coordinate=36.122475,-115.169252&name=CHICA&place-id=ICD92A203ECBBFC90&map=explore", description: "Upscale Latin American flavors with Vegas flair." }
  ],
  "Madison Square Garden": [
    { name: "Bar Primi", link: "https://maps.apple.com/place?address=349%20W%2033rd%20St,%20New%20York,%20NY%20%2010001,%20United%20States&coordinate=40.752609,-73.996211&name=Bar%20Primi&place-id=I88A1A0B80763F65B&map=explore", description: "Modern Italian pastas & wines in a stylish corner spot." },
    { name: "Roberta’s", link: "https://maps.apple.com/place?address=234%20W%2034th%20St,%20New%20York,%20NY%20%2010119,%20United%20States&coordinate=40.751139,-73.991500&name=Roberta's&place-id=IFEE5ADD8C999FFF2&map=explore", description: "Brooklyn-famous wood-fired pizza near the Garden." },
    { name: "Los Tacos No. 1", link: "https://maps.apple.com/place?address=201%20W%2033rd%20St%0ANew%20York,%20NY%2010001%0AUnited%20States&coordinate=40.750606,-73.991386&name=Los%20Tacos%20No.%201&place-id=IB263E6B78B0D112E&map=explore", description: "Top-tier Tijuana-style tacos made fresh to order." },
    { name: "Sea", link: "https://maps.apple.com/place?address=151%20W%2030th%20St,%20New%20York,%20NY%20%2010001,%20United%20States&coordinate=40.748449,-73.991809&name=SEA&place-id=IBBE05296D10383D9&map=explore", description: "Trendy Thai eatery with modern interiors & full bar." },
    { name: "The Dynamo Room", link: "https://maps.apple.com/place?address=2%20Penn%20Plaza,%20New%20York,%20NY%20%2010121,%20United%20States&coordinate=40.749973,-73.992193&name=The%20Dynamo%20Room&place-id=I5679ADC317A53F59&map=explore", description: "Buzzy Penn District hangout with burgers & cocktails." }
  ]
};

function loadTopPicks() {
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';

  // Hide restaurant filters if showing
  const filterBox = document.getElementById('restaurant-filters');
  filterBox.style.display = 'none';

  const picks = topPicksData[decodeURIComponent(venue)];
  if (!picks) {
    resultsContainer.innerHTML = '<p>No top picks for this venue yet.</p>';
    return;
  }

  picks.forEach(place => {
    const card = document.createElement('a');
    card.href = place.link;
    card.className = 'place-card';
    card.target = '_blank';

    // Try to parse Apple Maps coordinate from the link
    const match = place.link.match(/coordinate=([\d.-]+),([\d.-]+)/);
    const placeLat = match ? parseFloat(match[1]) : null;
    const placeLng = match ? parseFloat(match[2]) : null;
    const distance = (placeLat && placeLng) ? calculateDistance(lat, lng, placeLat, placeLng) : null;

    card.innerHTML = `
      <h3>${place.name}</h3>
      <p>${place.description}</p>
      ${distance ? `<p>${distance.toFixed(1)} miles from the venue</p>` : ''}
      <p style="font-size:13px; color:#5e6b86;">Tap to open in Apple Maps</p>
    `;
    resultsContainer.appendChild(card);
  });
}
